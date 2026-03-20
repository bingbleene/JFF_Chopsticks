import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Plus, Trash2 } from 'lucide-react'
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from '@/components/ui/combobox'
import { DialogFooter, DialogClose } from '@/components/ui/dialog'
import { toast } from 'sonner'
import api from '@/lib/axios'
import { validateRequired, validateNumber } from '@/lib/helpers'

const SaleProductForm = ({
  saleProduct,
  saleType = 'retail',
  products = [],
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
  const [allTags, setAllTags] = useState([])
  const [loadingTags, setLoadingTags] = useState(false)
  // Remove tagDropdownOpen, use combobox
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch all tags from API
  useEffect(() => {
    setLoadingTags(true)
    api.get('/tags')
        .then(res => setAllTags(res.data))
        .catch(() => toast.error('Không thể tải danh sách tag'))
      .finally(() => setLoadingTags(false))
  }, [])

  // Tag combobox handler (multi)
  const handleTagChange = (tagId) => {
    setFormData(prev => {
      const tags = prev.tags.includes(tagId)
        ? prev.tags.filter(t => t !== tagId)
        : [...prev.tags, tagId]
      return { ...prev, tags }
    })
  }

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
    setFormData(prev => {
      let newItems = prev.items.map((item, i) => {
        if (i !== index) return item
        return { ...item, [field]: value }
      })
      return {
        ...prev,
        items: newItems
      }
    })
    if (errors[`item_${index}_${field}`]) {
      setErrors(prev => ({ ...prev, [`item_${index}_${field}`]: '' }))
    }
  }

  // Tag selection handlers

  // Dropdown tag handlers
  const handleTagDropdownToggle = () => setTagDropdownOpen(open => !open)
  const handleTagDropdownSelect = (tagId) => {
    setFormData(prev => {
      const tags = prev.tags.includes(tagId)
        ? prev.tags.filter(t => t !== tagId)
        : [...prev.tags, tagId]
      return { ...prev, tags }
    })
  }

  const handleRemoveTag = (tagId) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tagId)
    }))
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

  // Get product info by id
  const getProductInfo = (productId) => {
    if (!productId) return null
    return products.find(p => (p._id === productId || p.id === productId))
  }


  const isRetail = formData.saleType === 'retail';


  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Tên sản phẩm & Giá/Số lượng cùng hàng */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Tên sản phẩm bên trái */}
        <div className="flex-1 space-y-2">
          <Label htmlFor="name">Tên sản phẩm bán *</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder={isRetail ? 'VD: Sticker BL' : 'VD: Combo Dây đeo & Bao thẻ'}
            className={errors.name ? 'border-destructive' : ''}
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>
        {/* Giá bán */}
        <div className="flex-1 space-y-2">
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
          {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
        </div>
        {/* Số lượng */}
        <div className="flex-1 space-y-2">
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
          {errors.quantity && <p className="text-xs text-destructive">{errors.quantity}</p>}
        </div>
      </div>

      {/* Sản phẩm gốc (Items) */}
      <div className="space-y-2">
        <Label>{isRetail ? 'Sản phẩm gốc (chỉ 1 sản phẩm) *' : 'Sản phẩm trong combo *'}</Label>
        {errors.items && <p className="text-xs text-destructive">{errors.items}</p>}
        {isRetail ? (
          <Combobox
            items={products}
            value={products.find(p => (p._id === formData.items[0]?.productId || p.id === formData.items[0]?.productId)) || null}
            onValueChange={val => setFormData(prev => ({ ...prev, items: [{ productId: val ? (val._id || val.id) : '', quantity: 1 }] }))}
            getOptionValue={p => p._id || p.id}
            getOptionLabel={p => p.name}
          >
            <ComboboxInput placeholder="Chọn sản phẩm gốc..." />
            <ComboboxContent className="w-[--radix-popover-trigger-width] max-h-60 overflow-y-auto">
              <ComboboxEmpty>Không có sản phẩm.</ComboboxEmpty>
              <ComboboxList>
                {(p) => (
                  <ComboboxItem key={p._id || p.id} value={p}>
                    {p.name}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        ) : (
          <div className="space-y-2">
            {/* Tiêu đề các cột */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium mb-1 pl-1">
              <div className="w-56">Sản phẩm</div>
              <div className="w-20 text-center">Số lượng</div>
              <div className="w-28 text-center">Giá nhập</div>
              <div className="w-24 text-center">Tồn kho</div>
              <div className="w-8" />
            </div>
            {formData.items.map((item, index) => {
              const productInfo = products.find(p => (p._id === item.productId || p.id === item.productId));
              return (
                <div key={index} className="flex items-center gap-2 mb-2">
                  <div className="w-56">
                    <Combobox
                      items={products}
                      value={products.find(p => (p._id === item.productId || p.id === item.productId)) || null}
                      onValueChange={val => handleItemChange(index, 'productId', val ? (val._id || val.id) : '')}
                      getOptionValue={p => p._id || p.id}
                      getOptionLabel={p => p.name}
                    >
                      <ComboboxInput placeholder="Chọn sản phẩm" />
                      <ComboboxContent>
                        <ComboboxEmpty>Không có sản phẩm.</ComboboxEmpty>
                        <ComboboxList>
                          {(p) => (
                            <ComboboxItem key={p._id || p.id} value={p}>
                              {p.name} (Kho: {p.quantity} {p.unit || 'cái'})
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </div>
                  <div className="w-20">
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                      placeholder="Số lượng"
                      min="1"
                      step="1"
                      className={errors[`item_${index}_quantity`] ? 'border-destructive' : ''}
                    />
                  </div>
                  <div className="w-28 text-center text-xs text-muted-foreground">
                    {productInfo && typeof productInfo.importPrice === 'number'
                      ? productInfo.importPrice.toLocaleString('vi-VN') + ' ₫'
                      : <span className="italic">Chưa có</span>}
                  </div>
                  <div className="w-24 text-center text-xs text-muted-foreground">
                    {productInfo && typeof productInfo.quantity === 'number'
                      ? productInfo.quantity.toLocaleString('vi-VN') + ' ' + (productInfo.unit || 'cái')
                      : <span className="italic">Chưa có</span>}
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveItem(index)}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              );
            })}
            <Button type="button" variant="outline" size="sm" onClick={handleAddItem} className="gap-1">
              <Plus size={16} /> Thêm sản phẩm
            </Button>
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label htmlFor="tags">Tag</Label>
        <Combobox
          items={allTags}
          value={allTags.filter(tag => formData.tags.includes(tag._id))}
          onValueChange={vals => setFormData(prev => ({ ...prev, tags: Array.isArray(vals) ? vals.map(t => t._id) : [] }))}
          getOptionValue={t => t._id}
          getOptionLabel={t => t.name}
          multiple
          disabled={loadingTags}
        >
          <ComboboxInput placeholder="Chọn tag..." />
          <ComboboxContent>
            <ComboboxEmpty>Không có tag.</ComboboxEmpty>
            <ComboboxList>
              {(tag) => (
                <ComboboxItem key={tag._id} value={tag}>
                  {tag.name}
                  {tag.description && <span className="text-xs text-muted-foreground ml-2">- {tag.description}</span>}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>

      {/* Mô tả */}
      <div className="space-y-2">
        <Label htmlFor="description">Mô tả (tùy chọn)</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Mô tả về sản phẩm bán"
          rows={2}
        />
      </div>

      {/* ACTION */}
      <DialogFooter>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Đang lưu...' : (saleProduct ? 'Cập nhật' : 'Thêm')}
        </Button>
      </DialogFooter>
    </form>
  )
}

export default SaleProductForm
