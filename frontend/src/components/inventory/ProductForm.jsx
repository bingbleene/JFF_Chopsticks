import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import api from '@/lib/axios'
import { validateRequired, validateNumber } from '@/lib/helpers'

const ProductForm = ({ product, onSubmit, onClose, availableTags = [], onAddTag = () => {}, allProducts = [] }) => {
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    importPrice: '',
    unit: 'cai',
    description: '',
    tags: []
  })
  const [tagInput, setTagInput] = useState('')
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        quantity: product.quantity || '',
        importPrice: product.importPrice || '',
        unit: product.unit || 'cai',
        description: product.description || '',
        tags: product.tags || []
      })
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

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim()
    if (!trimmedTag) return

    if (formData.tags.includes(trimmedTag)) {
      toast.warning('Dot ban nay da ton tai')
      return
    }

    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, trimmedTag]
    }))
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

  const validateForm = () => {
    const newErrors = {}

    if (!validateRequired(formData.name)) {
      newErrors.name = 'Ten san pham khong duoc de trong'
    } else {
      const isDuplicate = allProducts.some(p => {
        if (product && (p._id === product._id || p.id === product.id)) {
          return false
        }
        return p.name.toLowerCase().trim() === formData.name.toLowerCase().trim()
      })
      if (isDuplicate) {
        newErrors.name = 'San pham voi ten nay da ton tai'
      }
    }

    if (!validateRequired(formData.quantity.toString())) {
      newErrors.quantity = 'So luong khong duoc de trong'
    } else if (!validateNumber(formData.quantity)) {
      newErrors.quantity = 'So luong phai la so'
    }
    if (!validateRequired(formData.importPrice.toString())) {
      newErrors.importPrice = 'Gia nhap khong duoc de trong'
    } else if (!validateNumber(formData.importPrice)) {
      newErrors.importPrice = 'Gia nhap phai la so'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error('Vui long kiem tra lai thong tin')
      return
    }

    try {
      setIsSubmitting(true)

      const submitData = {
        ...formData,
        quantity: parseFloat(formData.quantity),
        importPrice: parseFloat(formData.importPrice)
      }

      if (product) {
        try {
          const res = await api.put(`/products/${product._id || product.id}`, submitData)
          onSubmit(res.data)
          toast.success('Cap nhat san pham thanh cong')
        } catch (error) {
          const errorMsg = error.response?.data?.message || 'Loi khi cap nhat san pham'
          toast.error(errorMsg)
          console.error('Loi cap nhat:', error.response?.data)
        }
      } else {
        try {
          const res = await api.post('/products', submitData)
          onSubmit(res.data)
          toast.success('Them san pham thanh cong')
        } catch (error) {
          const errorMsg = error.response?.data?.message || 'Loi khi them san pham'
          toast.error(errorMsg)
          console.error('Loi them:', error.response?.data)
          return
        }
      }
    } catch (error) {
      console.error('Loi:', error)
      toast.error('Loi khi luu san pham')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Ten san pham *</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Nhap ten san pham"
          className={errors.name ? 'border-destructive' : ''}
        />
        {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
      </div>

      {/* Quantity and Unit */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="quantity">So luong *</Label>
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

        <div className="space-y-2">
          <Label htmlFor="unit">Don vi</Label>
          <select
            id="unit"
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="cai">Cai</option>
            <option value="hop">Hop</option>
            <option value="kg">Kg</option>
            <option value="lit">Lit</option>
            <option value="goi">Goi</option>
          </select>
        </div>
      </div>

      {/* Import Price */}
      <div className="space-y-2">
        <Label htmlFor="importPrice">Gia nhap (VND) *</Label>
        <Input
          id="importPrice"
          name="importPrice"
          type="number"
          value={formData.importPrice}
          onChange={handleChange}
          placeholder="0"
          min="0"
          step="0.01"
          className={errors.importPrice ? 'border-destructive' : ''}
        />
        {errors.importPrice && <p className="text-sm text-destructive">{errors.importPrice}</p>}
        <p className="text-xs text-muted-foreground">
          Gia ban se duoc thiet lap khi tao san pham ban (retail/combo)
        </p>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label htmlFor="tags">Tag / Dot nhap</Label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              id="tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={handleTagInputKeyPress}
              placeholder="Nhap tag (VD: Dot 1, Tet 2024) roi nhan Enter"
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleAddTag}
              className="px-3"
            >
              +
            </Button>
          </div>

          {availableTags.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Tag da dung:</p>
              <div className="flex flex-wrap gap-1">
                {availableTags.map((tag, idx) => {
                  const isSelected = formData.tags.includes(tag)
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        if (!isSelected) {
                          setFormData(prev => ({
                            ...prev,
                            tags: [...prev.tags, tag]
                          }))
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

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Mo ta</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Nhap mo ta san pham (tuy chon)"
          rows={3}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? 'Dang luu...' : (product ? 'Cap nhat' : 'Them')}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSubmitting}
          className="flex-1"
        >
          Huy
        </Button>
      </div>
    </form>
  )
}

export default ProductForm
