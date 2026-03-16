import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import api from '@/lib/axios'
import { validateRequired, validateNumber } from '@/lib/helpers'

const SALE_TYPES = [
  { value: 'retail', label: 'Bán lẻ', color: 'bg-blue-100 text-blue-800' },
  { value: 'combo', label: 'Bán combo', color: 'bg-purple-100 text-purple-800' }
]

const SalesProductForm = ({ product, products, onSubmit, onClose, saleType = 'retail' }) => {
  const [formData, setFormData] = useState({
    productId: '',
    saleType: saleType,
    customPrice: ''
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)

  useEffect(() => {
    if (product) {
      setFormData({
        productId: product.productId || '',
        saleType: saleType,
        customPrice: product.customPrice || ''
      })
      const selected = products.find(p => p.id === product.productId)
      setSelectedProduct(selected)
    } else {
      setFormData(prev => ({
        ...prev,
        saleType: saleType
      }))
    }
  }, [product, products, saleType])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }

    // Update selected product when productId changes
    if (name === 'productId') {
      const selected = products.find(p => (p._id === value || p.id === value || p._id === parseInt(value) || p.id === parseInt(value)))
      setSelectedProduct(selected)
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!validateRequired(formData.productId.toString())) {
      newErrors.productId = 'Vui lòng chọn sản phẩm'
    }

    if (formData.customPrice && !validateNumber(formData.customPrice)) {
      newErrors.customPrice = 'Giá tuỳ chỉnh phải là số'
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
        name: selectedProduct?.name,
        saleType: formData.saleType,
        originalPrice: selectedProduct?.salePrice,
        customPrice: formData.customPrice ? parseFloat(formData.customPrice) : null
      }

      if (product) {
        try {
          const res = await api.put(`/sales-products/${product._id || product.id}`, submitData)
          onSubmit(res.data)
          toast.success('Cập nhật sản phẩm bán thành công')
          onClose()
        } catch (error) {
          const errorMsg = error.response?.data?.message || 'Lỗi khi cập nhật sản phẩm bán'
          toast.error(errorMsg)
          console.error('Lỗi cập nhật:', error.response?.data)
        }
      } else {
        try {
          const res = await api.post('/sales-products', submitData)
          onSubmit(res.data)
          toast.success('Thêm sản phẩm bán thành công')
          onClose()
        } catch (error) {
          const errorMsg = error.response?.data?.message || 'Lỗi khi thêm sản phẩm bán'
          toast.error(errorMsg)
          console.error('Lỗi thêm:', error.response?.data)
        }
      }
    } catch (error) {
      console.error('Lỗi:', error)
      toast.error('Lỗi khi lưu sản phẩm bán')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Product Selection */}
      <div className="space-y-2">
        <Label htmlFor="productId">Chọn sản phẩm *</Label>
        <select
          id="productId"
          name="productId"
          value={formData.productId}
          onChange={handleChange}
          className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-2 text-sm"
        >
          <option value="">-- Chọn sản phẩm --</option>
          {products.map(p => (
            <option key={p._id || p.id} value={p._id || p.id}>
              {p.name} (Kho: {p.quantity} {p.unit || 'cái'})
            </option>
          ))}
        </select>
        {errors.productId && <p className="text-sm text-destructive">{errors.productId}</p>}
      </div>

      {/* Product Info (Display) */}
      {selectedProduct && (
        <div className="bg-muted/50 p-3 rounded-md space-y-1">
          <p className="text-sm"><span className="font-semibold">Tên:</span> {selectedProduct.name}</p>
          <p className="text-sm"><span className="font-semibold">Kho:</span> {selectedProduct.quantity} {selectedProduct.unit || 'cái'}</p>
          <p className="text-sm"><span className="font-semibold">Giá bán mặc định:</span> {selectedProduct.salePrice.toLocaleString('vi-VN')} VND</p>
        </div>
      )}

      {/* Sale Type - Display only (not editable) */}
      <div className="space-y-2">
        <Label>Loại bán</Label>
        <div className="p-2 bg-muted rounded-md">
          <p className="text-sm font-semibold">
            {saleType === 'retail' ? '🔵 Bán lẻ' : saleType === 'combo' ? '🟣 Bán combo' : saleType}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {saleType === 'retail' ? 'Bán từng cái' : 'Kết hợp nhiều sản phẩm'}
          </p>
        </div>
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

export default SalesProductForm
