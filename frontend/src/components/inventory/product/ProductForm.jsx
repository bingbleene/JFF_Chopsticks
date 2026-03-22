import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DialogFooter, DialogClose } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Combobox, ComboboxInput, ComboboxContent, ComboboxList, ComboboxItem, ComboboxEmpty, ComboboxChip, ComboboxChips, ComboboxValue, ComboboxChipsInput } from '@/components/ui/combobox'
import { productUnits } from '@/lib/data'
import api from '@/lib/axios'
import { validateRequired, validateNumber } from '@/lib/helpers'

const ProductForm = ({ product, allProducts = [], onSubmit = () => {} }) => {
  const [formData, setFormData] = useState({
    name: '',
    quantity: 0,
    unit: 'cái',
    description: '',
    tag: [] 
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
      // Đảm bảo tag luôn là mảng object tag
      let tagArr = [];
      if (Array.isArray(product.tag)) {
        tagArr = product.tag.map(t =>
          typeof t === 'object' ? t : allTags.find(tag => tag._id === t)
        ).filter(Boolean);
      } else if (product.tag) {
        tagArr = [typeof product.tag === 'object' ? product.tag : allTags.find(tag => tag._id === product.tag)].filter(Boolean);
      }
      setFormData({
        name: product.name || '',
        quantity: product.quantity ?? 0,
        unit: product.unit || 'cái',
        description: product.description || '',
        tag: tagArr
      })
    } else {
      setFormData(prev => ({
        ...prev,
        quantity: 0,
        tag: []
      }))
    }
  }, [product, allTags])

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
        tag: Array.isArray(formData.tag) ? formData.tag.map(t => t._id) : []
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

      {/* TAG */}
      <div className="space-y-2">
        <Label>Tag</Label>
        <Combobox
          items={allTags}
          value={formData.tag}
          onValueChange={(tags) =>
            setFormData((prev) => ({ ...prev, tag: tags }))
          }
          itemToStringValue={(tag) => tag?.name || ""}
          multiple
          disabled={loadingTags}
        >
          <ComboboxChips>
            <ComboboxValue>
              {(values) => {
                const arr = Array.isArray(values) ? values : [];
                return (
                  <>
                    {arr.map((tag) => (
                      <ComboboxChip key={tag._id}>
                        {tag.name}
                      </ComboboxChip>
                    ))}
                    <ComboboxChipsInput placeholder="Chọn tag" />
                  </>
                );
              }}
            </ComboboxValue>
          </ComboboxChips>

          <ComboboxContent>
            <ComboboxEmpty>Không có tag.</ComboboxEmpty>
            <ComboboxList>
              {allTags.map((tag) => (
                <ComboboxItem key={tag._id} value={tag}>
                  {tag.name}
                </ComboboxItem>
              ))}
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
