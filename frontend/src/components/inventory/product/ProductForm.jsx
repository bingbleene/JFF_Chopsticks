import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DialogFooter, DialogClose } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'

import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from '@/components/ui/combobox'

import { ChevronDown } from 'lucide-react'
import api from '@/lib/axios'
import { validateRequired, validateNumber } from '@/lib/helpers'
import { productUnits } from '@/lib/data'

const ProductForm = ({ product, onSubmit, onClose, allProducts = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    quantity: 0,
    unit: 'cái',
    description: '',
    tag: '' // will store single tag _id
  })
  const [allTags, setAllTags] = useState([])
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadingTags, setLoadingTags] = useState(false)

  // Fetch all tags from API
  useEffect(() => {
    setLoadingTags(true)
    api.get('/tags')
      .then(res => {
        setAllTags(res.data)
      })
      .catch(() => {
        toast.error('Không thể tải danh sách tag')
      })
      .finally(() => setLoadingTags(false))
  }, [])

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        quantity: product.quantity ?? 0,
        unit: product.unit || 'cái',
        description: product.description || '',
        tag: product && Array.isArray(product.tags) && product.tags.length > 0
          ? (typeof product.tags[0] === 'object' && product.tags[0]._id ? product.tags[0]._id : product.tags[0])
          : ''
      })
    } else {
      setFormData(prev => ({
        ...prev,
        quantity: 0
      }))
    }
  }, [product])

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
  }



  // Tag select handler
  const handleTagChange = (value) => {
    setFormData(prev => ({ ...prev, tag: value }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!validateRequired(formData.name)) {
      newErrors.name = 'Tên sản phẩm không được để trống'
    } else {
      const isDuplicate = allProducts.some(p => {
        if (product && (p._id === product._id || p.id === product.id)) {
          return false
        }
        return p.name.toLowerCase().trim() === formData.name.toLowerCase().trim()
      })
      if (isDuplicate) {
        newErrors.name = 'Sản phẩm với tên này đã tồn tại'
      }
    }

    // Chỉ validate số lượng khi chỉnh sửa sản phẩm
    if (product) {
      if (!validateRequired(formData.quantity.toString())) {
        newErrors.quantity = 'Số lượng không được để trống'
      } else if (!validateNumber(formData.quantity)) {
        newErrors.quantity = 'Số lượng phải là số'
      }
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
        name: formData.name,
        quantity: product ? parseFloat(formData.quantity) : 0,
        unit: formData.unit,
        description: formData.description,
        tags: formData.tag ? [formData.tag] : [] // always array for backend
      }

      if (product) {
        try {
          const res = await api.put(`/products/${product._id || product.id}`, submitData)
          onSubmit(res.data)
          toast.success('Cập nhật sản phẩm thành công')
        } catch (error) {
          const errorMsg = error.response?.data?.message || 'Lỗi khi cập nhật sản phẩm'
          toast.error(errorMsg)
          console.error('Lỗi khi cập nhật:', error.response?.data)
        }
      } else {
        try {
          const res = await api.post('/products', submitData)
          onSubmit(res.data)
          toast.success('Thêm sản phẩm thành công')
        } catch (error) {
          const errorMsg = error.response?.data?.message || 'Lỗi khi thêm sản phẩm'
          toast.error(errorMsg)
          console.error('Lỗi khi thêm:', error.response?.data)
          return
        }
      }
    } catch (error) {
      console.error('Lỗi:', error)
      toast.error('Lỗi khi lưu sản phẩm')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Tên sản phẩm *</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Nhập tên sản phẩm"
          className={errors.name ? 'border-destructive' : ''}
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
      </div>

      {/* Unit (Combobox) */}
      <div className="space-y-2">
        <Label htmlFor="unit">Đơn vị</Label>
        <Combobox
          items={productUnits}
          value={formData.unit}
          onValueChange={unitValue => setFormData(prev => ({ ...prev, unit: unitValue }))}
          itemToStringValue={u => u?.label || ''}
        >
          <ComboboxInput placeholder="Chọn đơn vị" />
          <ComboboxContent>
            <ComboboxEmpty>Không có đơn vị.</ComboboxEmpty>
            <ComboboxList>
              {(u) => (
                <ComboboxItem key={u.value} value={u.value}>
                  {u.label}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>

      {/* Tag (Combobox) */}
      <div className="space-y-2">
        <Label htmlFor="tag">Tag</Label>
        <Combobox
          items={allTags}
          value={formData.tag}
          onValueChange={tagId => setFormData(prev => ({ ...prev, tag: tagId }))}
          itemToStringValue={t => t?.name || ''}
          disabled={loadingTags}
        >
          <ComboboxInput placeholder="Chọn tag..." />
          <ComboboxContent>
            <ComboboxEmpty>Không có tag.</ComboboxEmpty>
            <ComboboxList>
              {(tag) => (
                <ComboboxItem key={tag._id} value={tag._id}>
                  {tag.name}
                  {tag.description && <span className="text-xs text-muted-foreground ml-2">- {tag.description}</span>}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Mô tả</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Nhập mô tả sản phẩm (tùy chọn)"
          rows={3}
        />
      </div>

      {/* Actions */}
      <DialogFooter>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Đang lưu...' : (product ? 'Cập nhật' : 'Thêm')}
        </Button>
      </DialogFooter>
    </form>
  )
}

export default ProductForm
