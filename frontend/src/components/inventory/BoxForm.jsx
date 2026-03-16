import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/axios'
import { validateRequired, validateNumber } from '@/lib/helpers'

const BoxForm = ({ box, salesProducts, products, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    quantity: '',
    description: '',
    items: []
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (box) {
      setFormData({
        name: box.name || '',
        price: box.price || '',
        quantity: box.quantity || '',
        description: box.description || '',
        items: box.items || []
      })
    }
  }, [box])

  const handleChangeBasic = (e) => {
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
  }

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { productId: '', quantity: '' }]
    }))
  }

  const handleRemoveItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }))
  }

  const handleItemChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!validateRequired(formData.name)) {
      newErrors.name = 'Tên box không được để trống'
    }

    if (!validateRequired(formData.price.toString())) {
      newErrors.price = 'Giá box không được để trống'
    } else if (!validateNumber(formData.price)) {
      newErrors.price = 'Giá box phải là số'
    }

    if (!validateRequired(formData.quantity.toString())) {
      newErrors.quantity = 'Số lượng combo không được để trống'
    } else if (!validateNumber(formData.quantity)) {
      newErrors.quantity = 'Số lượng combo phải là số'
    }

    if (formData.items.length === 0) {
      newErrors.items = 'Box phải có ít nhất một sản phẩm'
    }

    formData.items.forEach((item, index) => {
      if (!validateRequired(item.productId.toString())) {
        newErrors[`item_${index}_product`] = 'Vui lòng chọn sản phẩm'
      }
      if (!validateRequired(item.quantity.toString())) {
        newErrors[`item_${index}_quantity`] = 'Số lượng không được để trống'
      } else if (!validateNumber(item.quantity) || item.quantity <= 0) {
        newErrors[`item_${index}_quantity`] = 'Số lượng phải > 0'
      }
    })

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
        ...formData,
        price: parseFloat(formData.price),
        quantity: parseFloat(formData.quantity),
        items: formData.items.map(item => ({
          productId: item.productId,
          quantity: parseFloat(item.quantity)
        }))
      }

      if (box) {
        const res = await api.put(`/boxes/${box._id || box.id}`, submitData)
        onSubmit(res.data)
        toast.success('Cập nhật combo thành công')
        onClose()
      } else {
        const res = await api.post('/boxes', submitData)
        onSubmit(res.data)
        toast.success('Tạo combo thành công')
        onClose()
      }
    } catch (error) {
      console.error('Lỗi:', error)
      const errorMsg = error.response?.data?.message || 'Lỗi khi lưu combo'
      toast.error(errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getProductInfo = (productId) => {
    if (!productId) return null
    return products.find(p => (p._id === productId || p.id === productId))
  }

  const formatCurrency = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
      {/* Basic Info */}
      <div className="space-y-2">
        <Label htmlFor="name">Tên box *</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChangeBasic}
          placeholder="VD: Box Café Sáng"
          className={errors.name ? 'border-destructive' : ''}
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="price">Giá box *</Label>
        <Input
          id="price"
          name="price"
          type="number"
          value={formData.price}
          onChange={handleChangeBasic}
          placeholder="0"
          min="0"
          step="0.01"
          className={errors.price ? 'border-destructive' : ''}
        />
        {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="quantity">Số lượng combo *</Label>
        <Input
          id="quantity"
          name="quantity"
          type="number"
          value={formData.quantity}
          onChange={handleChangeBasic}
          placeholder="0"
          min="0"
          step="1"
          className={errors.quantity ? 'border-destructive' : ''}
        />
        {errors.quantity && <p className="text-sm text-destructive">{errors.quantity}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Mô tả (tùy chọn)</Label>
        <Input
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChangeBasic}
          placeholder="Mô tả chi tiết về box"
        />
      </div>

      {/* Items */}
      <div className="space-y-3 pt-4 border-t">
        <div className="flex items-center justify-between">
          <Label>Sản phẩm trong box *</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddItem}
            className="gap-1"
          >
            <Plus size={16} />
            Thêm sản phẩm
          </Button>
        </div>

        {errors.items && <p className="text-sm text-destructive">{errors.items}</p>}

        {formData.items.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">Chưa có sản phẩm nào. Nhấn "Thêm sản phẩm" để bắt đầu.</p>
        ) : (
          <div className="space-y-3">
            {formData.items.map((item, index) => {
              const productInfo = getProductInfo(item.productId)
              return (
                <Card key={index} className="p-4 space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm">Sản phẩm {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(index)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>

                  {/* Product Select */}
                  <div className="space-y-1">
                    <Label htmlFor={`item_${index}_product`} className="text-xs">
                      Chọn sản phẩm *
                    </Label>
                    <select
                      id={`item_${index}_product`}
                      value={item.productId}
                      onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
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
                    {errors[`item_${index}_product`] && (
                      <p className="text-xs text-destructive">{errors[`item_${index}_product`]}</p>
                    )}
                  </div>

                  {/* Quantity */}
                  <div className="space-y-1">
                    <Label htmlFor={`item_${index}_quantity`} className="text-xs">
                      Số lượng trong box *
                    </Label>
                    <Input
                      id={`item_${index}_quantity`}
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      placeholder="1"
                      min="1"
                      step="1"
                      className={errors[`item_${index}_quantity`] ? 'border-destructive' : ''}
                    />
                    {errors[`item_${index}_quantity`] && (
                      <p className="text-xs text-destructive">{errors[`item_${index}_quantity`]}</p>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t sticky bottom-0 bg-white">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? 'Đang lưu...' : (box ? 'Cập nhật' : 'Tạo')}
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

export default BoxForm
