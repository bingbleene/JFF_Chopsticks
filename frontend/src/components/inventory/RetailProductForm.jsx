import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import api from '@/lib/axios'
import { validateRequired, validateNumber } from '@/lib/helpers'

const RetailProductForm = ({ product, products, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    customPrice: ''
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)

  useEffect(() => {
    if (product) {
      setFormData({
        productId: product.productId || '',
        quantity: product.quantity || '',
        customPrice: product.customPrice || ''
      })
      const selected = products.find(p => (p._id === product.productId || p.id === product.productId))
      setSelectedProduct(selected)
    }
  }, [product, products])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Khi chọn sản phẩm, tự động cập nhật thông tin
    if (name === 'productId') {
      const selected = products.find(p => (p._id === value || p.id === value || p._id === parseInt(value) || p.id === parseInt(value)))
      if (selected) {
        setSelectedProduct(selected)
        // Xóa lỗi nếu có
        if (errors.productId) {
          setErrors(prev => ({
            ...prev,
            productId: ''
          }))
        }
      }
    }

    // Clear error for other fields
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!validateRequired(formData.productId.toString())) {
      newErrors.productId = 'Vui lòng chọn sản phẩm'
    }

    if (!validateRequired(formData.quantity.toString())) {
      newErrors.quantity = 'Số lượng bán lẻ không được để trống'
    } else if (!validateNumber(formData.quantity) || formData.quantity <= 0) {
      newErrors.quantity = 'Số lượng phải > 0'
    }

    if (formData.customPrice && !validateNumber(formData.customPrice)) {
      newErrors.customPrice = 'Giá phải là số'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra lại thông tin')
      return
    }

    try {
      setIsSubmitting(true)

      const submitData = {
        productId: formData.productId,
        name: selectedProduct.name,
        saleType: 'retail',
        originalPrice: selectedProduct.salePrice,
        customPrice: formData.customPrice ? parseFloat(formData.customPrice) : null,
        quantity: parseFloat(formData.quantity)
      }

      if (product) {
        // Update product
        try {
          const res = await api.put(`/sales-products/${product._id || product.id}`, submitData)
          onSubmit(res.data)
          toast.success('Cập nhật sản phẩm bán lẻ thành công')
          onClose()
        } catch (error) {
          const errorMsg = error.response?.data?.message || 'Lỗi khi cập nhật sản phẩm bán lẻ'
          toast.error(errorMsg)
          console.error('Lỗi cập nhật:', error.response?.data)
        }
      } else {
        // Add new product
        try {
          const res = await api.post('/sales-products', submitData)
          onSubmit(res.data)
          toast.success('Thêm sản phẩm bán lẻ thành công')
          onClose()
        } catch (error) {
          const errorMsg = error.response?.data?.message || 'Lỗi khi thêm sản phẩm bán lẻ'
          toast.error(errorMsg)
          console.error('Lỗi thêm:', error.response?.data)
        }
      }
    } catch (error) {
      console.error('Lỗi:', error)
      toast.error('Lỗi khi lưu sản phẩm bán lẻ')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Product Selection */}
      <div className="space-y-2">
        <Label htmlFor="productId">Chọn sản phẩm từ hàng hóa tổng *</Label>
        <select
          id="productId"
          name="productId"
          value={formData.productId}
          onChange={handleChange}
          className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-2 text-sm"
        >
          <option value="">-- Chọn sản phẩm --</option>
          {products.map(p => {
            const productId = p._id || p.id
            return (
              <option key={productId} value={productId}>
                {p.name} (Kho: {p.quantity} {p.unit || 'cái'})
              </option>
            )
          })}
        </select>
        {errors.productId && <p className="text-sm text-destructive">{errors.productId}</p>}
      </div>

      {/* Product Info (Display) */}
      {selectedProduct && (
        <div className="bg-muted/50 p-3 rounded-md space-y-2">
          <div>
            <p className="text-sm"><span className="font-semibold">Sản phẩm:</span> {selectedProduct.name}</p>
            <p className="text-sm"><span className="font-semibold">Kho hiện có:</span> {selectedProduct.quantity} {selectedProduct.unit || 'cái'}</p>
          </div>
          <div>
            <p className="text-sm"><span className="font-semibold">Giá bán mặc định:</span> {selectedProduct.salePrice.toLocaleString('vi-VN')} VND</p>
          </div>
        </div>
      )}

      {/* Quantity */}
      <div className="space-y-2">
        <Label htmlFor="quantity">Số lượng bán lẻ *</Label>
        <Input
          id="quantity"
          name="quantity"
          type="number"
          value={formData.quantity}
          onChange={handleChange}
          placeholder="Số lượng bán lẻ của sản phẩm"
          min="0"
          step="1"
          className={errors.quantity ? 'border-destructive' : ''}
        />
        {errors.quantity && <p className="text-sm text-destructive">{errors.quantity}</p>}
        {selectedProduct && (
          <p className="text-xs text-muted-foreground">
            Có thể bán tối đa: {selectedProduct.quantity} {selectedProduct.unit || 'cái'}
          </p>
        )}
      </div>

      {/* Custom Price */}
      <div className="space-y-2">
        <Label htmlFor="customPrice">Giá tuỳ chỉnh (VND) - Tùy chọn</Label>
        <Input
          id="customPrice"
          name="customPrice"
          type="number"
          value={formData.customPrice}
          onChange={handleChange}
          placeholder="Để trống để sử dụng giá bán mặc định"
          min="0"
          step="0.01"
          className={errors.customPrice ? 'border-destructive' : ''}
        />
        {errors.customPrice && <p className="text-sm text-destructive">{errors.customPrice}</p>}
        {selectedProduct && !formData.customPrice && (
          <p className="text-xs text-muted-foreground">
            Sẽ sử dụng giá bán mặc định: {selectedProduct.salePrice.toLocaleString('vi-VN')} VND
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? 'Đang lưu...' : (product ? 'Cập nhật' : 'Thêm')}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
          className="flex-1"
        >
          Hủy
        </Button>
      </div>
    </form>
  )
}

export default RetailProductForm
