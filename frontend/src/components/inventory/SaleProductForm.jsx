import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/axios'
import { validateRequired, validateNumber } from '@/lib/helpers'

const SaleProductForm = ({
  saleProduct,
  saleType = 'retail',
  products = [],
  availableTags = [],
  onAddTag = () => {},
  onSubmit,
  onClose
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    saleType: saleType,
    price: '',
    quantity: '',
    tags: [],
    items: []
  })
  const [tagInput, setTagInput] = useState('')
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (saleProduct) {
      setFormData({
        name: saleProduct.name || '',
        description: saleProduct.description || '',
        saleType: saleProduct.saleType || saleType,
        price: saleProduct.price || '',
        quantity: saleProduct.quantity || '',
        tags: saleProduct.tags || saleProduct.tag || [],
        items: saleProduct.items?.map(item => ({
          productId: typeof item.productId === 'object' ? item.productId._id : item.productId,
          quantity: item.quantity
        })) || []
      })
    } else {
      // Reset form khi tạo mới
      setFormData({
        name: '',
        description: '',
        saleType: saleType,
        price: '',
        quantity: '',
        tags: [],
        items: saleType === 'retail' ? [{ productId: '', quantity: 1 }] : []
      })
    }
  }, [saleProduct, saleType])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  // Items handlers
  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { productId: '', quantity: 1 }]
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
    // Clear item errors
    if (errors[`item_${index}_${field}`]) {
      setErrors(prev => ({ ...prev, [`item_${index}_${field}`]: '' }))
    }
  }

  // Tags handlers
  const handleAddTag = () => {
    const trimmedTag = tagInput.trim()
    if (!trimmedTag) return
    if (formData.tags.includes(trimmedTag)) {
      toast.warning('Tag này đã tồn tại')
      return
    }
    setFormData(prev => ({ ...prev, tags: [...prev.tags, trimmedTag] }))
    onAddTag(trimmedTag)
    setTagInput('')
  }

  const handleRemoveTag = (index) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }))
  }

  const handleTagInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  // Validation
  const validateForm = () => {
    const newErrors = {}

    if (!validateRequired(formData.name)) {
      newErrors.name = 'Tên sản phẩm không được để trống'
    }

    if (!validateRequired(formData.price.toString())) {
      newErrors.price = 'Giá bán không được để trống'
    } else if (!validateNumber(formData.price)) {
      newErrors.price = 'Giá bán phải là số'
    }

    if (!validateRequired(formData.quantity.toString())) {
      newErrors.quantity = 'Số lượng không được để trống'
    } else if (!validateNumber(formData.quantity)) {
      newErrors.quantity = 'Số lượng phải là số'
    }

    // Items validation
    if (formData.items.length === 0) {
      newErrors.items = 'Phải có ít nhất 1 sản phẩm'
    }

    // Retail chỉ được 1 item
    if (formData.saleType === 'retail' && formData.items.length > 1) {
      newErrors.items = 'Sản phẩm bán lẻ chỉ được chọn 1 sản phẩm gốc'
    }

    formData.items.forEach((item, index) => {
      if (!validateRequired(item.productId?.toString())) {
        newErrors[`item_${index}_productId`] = 'Vui lòng chọn sản phẩm'
      }
      if (!validateRequired(item.quantity?.toString())) {
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
        name: formData.name,
        description: formData.description,
        saleType: formData.saleType,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        tags: formData.tags,
        items: formData.items.map(item => ({
          productId: item.productId,
          quantity: parseInt(item.quantity)
        }))
      }

      if (saleProduct) {
        const res = await api.put(`/sale-products/${saleProduct._id || saleProduct.id}`, submitData)
        onSubmit(res.data)
        toast.success('Cập nhật thành công')
      } else {
        const res = await api.post('/sale-products', submitData)
        onSubmit(res.data)
        toast.success('Thêm thành công')
      }
      onClose()
    } catch (error) {
      console.error('Lỗi:', error)
      const errorMsg = error.response?.data?.message || 'Lỗi khi lưu sản phẩm'
      toast.error(errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getProductInfo = (productId) => {
    if (!productId) return null
    return products.find(p => (p._id === productId || p.id === productId))
  }

  const isRetail = formData.saleType === 'retail'

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
      {/* Tên sản phẩm */}
      <div className="space-y-2">
        <Label htmlFor="name">Tên sản phẩm bán *</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder={isRetail ? 'VD: Đũa Muỗng' : 'VD: Combo Tết Nguyên Đán'}
          className={errors.name ? 'border-destructive' : ''}
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
      </div>

      {/* Giá và số lượng */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Giá bán (VND) *</Label>
          <Input
            id="price"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            placeholder="0"
            min="0"
            className={errors.price ? 'border-destructive' : ''}
          />
          {errors.price && <p className="text-sm text-destructive">{errors.price}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Số lượng *</Label>
          <Input
            id="quantity"
            name="quantity"
            type="number"
            value={formData.quantity}
            onChange={handleChange}
            placeholder="0"
            min="0"
            step="1"
            className={errors.quantity ? 'border-destructive' : ''}
          />
          {errors.quantity && <p className="text-sm text-destructive">{errors.quantity}</p>}
        </div>
      </div>

      {/* Sản phẩm gốc (Items) */}
      <div className="space-y-3 pt-4 border-t">
        <div className="flex items-center justify-between">
          <Label>
            {isRetail ? 'Sản phẩm gốc (chỉ 1 sản phẩm) *' : 'Sản phẩm trong combo *'}
          </Label>
          {!isRetail && (
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
          )}
        </div>

        {errors.items && <p className="text-sm text-destructive">{errors.items}</p>}

        {formData.items.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            Chưa có sản phẩm nào. {!isRetail && 'Nhấn "Thêm sản phẩm" để bắt đầu.'}
          </p>
        ) : (
          <div className="space-y-3">
            {formData.items.map((item, index) => {
              const productInfo = getProductInfo(item.productId)
              return (
                <Card key={index} className="p-4 space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-sm">Sản phẩm {index + 1}</h4>
                    {(!isRetail || formData.items.length > 1) && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(index)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>

                  {/* Chọn sản phẩm */}
                  <div className="space-y-1">
                    <Label className="text-xs">Chọn sản phẩm từ hàng hóa tổng *</Label>
                    <select
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
                    {errors[`item_${index}_productId`] && (
                      <p className="text-xs text-destructive">{errors[`item_${index}_productId`]}</p>
                    )}
                  </div>

                  {/* Số lượng trong 1 đơn vị bán */}
                  <div className="space-y-1">
                    <Label className="text-xs">
                      Số lượng {isRetail ? 'mỗi lần bán' : 'trong combo'} *
                    </Label>
                    <Input
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

                  {/* Thông tin sản phẩm */}
                  {productInfo && (
                    <div className="bg-muted/50 p-2 rounded text-xs text-muted-foreground">
                      <p>Giá nhập: {productInfo.importPrice?.toLocaleString('vi-VN')} VND</p>
                      <p>Tồn kho: {productInfo.quantity} {productInfo.unit || 'cái'}</p>
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        )}

        {/* Thêm item đầu tiên cho retail */}
        {isRetail && formData.items.length === 0 && (
          <Button
            type="button"
            variant="outline"
            onClick={() => handleAddItem()}
            className="w-full"
          >
            <Plus size={16} className="mr-2" />
            Chọn sản phẩm gốc
          </Button>
        )}
      </div>

      {/* Tags - Đợt bán */}
      <div className="space-y-2 pt-4 border-t">
        <Label>Đợt bán (tag)</Label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={handleTagInputKeyPress}
              placeholder="VD: Đợt 1, Hè 2024..."
              className="flex-1"
            />
            <Button type="button" variant="outline" onClick={handleAddTag}>
              +
            </Button>
          </div>

          {/* Available tags */}
          {availableTags.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Đợt bán đã dùng:</p>
              <div className="flex flex-wrap gap-1">
                {availableTags.map((tag, idx) => {
                  const isSelected = formData.tags.includes(tag)
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        if (!isSelected) {
                          setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }))
                        }
                      }}
                      disabled={isSelected}
                      className={`text-xs px-2 py-1 rounded border transition ${
                        isSelected
                          ? 'bg-primary text-primary-foreground border-primary cursor-not-allowed'
                          : 'bg-background border-input hover:bg-accent cursor-pointer'
                      }`}
                    >
                      {tag}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Selected tags */}
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(index)}
                    className="text-primary-foreground hover:opacity-70 font-bold cursor-pointer"
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mô tả */}
      <div className="space-y-2">
        <Label htmlFor="description">Mô tả (tùy chọn)</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Mô tả về sản phẩm bán..."
          rows={2}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t sticky bottom-0 bg-background">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? 'Đang lưu...' : (saleProduct ? 'Cập nhật' : 'Thêm')}
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

export default SaleProductForm
