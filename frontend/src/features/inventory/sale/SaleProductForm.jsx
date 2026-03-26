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
  ComboboxChip,
  ComboboxChips,
  ComboboxValue,
  ComboboxChipsInput
} from '@/components/ui/combobox'
import { DialogFooter, DialogClose } from '@/components/ui/dialog'
import { toast } from 'sonner'
import api from '@/lib/axios'
import { validateProductStock, getTotalProductInCart } from '@/lib/utils';

const SaleProductForm = ({
  saleProduct,
  saleType = 'retail',
  products = [],
  allSaleProducts = [],
  onSubmit,
  onClose,
  onlyEditQuantity = false,
  reloadProducts
}) => {

  // Reset formData khi mở form sửa sản phẩm
  useEffect(() => {
    if (saleProduct) {
      setFormData({
        name: saleProduct.name || '',
        description: saleProduct.description || '',
        saleType: saleProduct.saleType || 'retail',
        price: saleProduct.price || '',
        quantity: saleProduct.quantity || '',
        tags: Array.isArray(saleProduct.tags)
          ? saleProduct.tags.map(t => (typeof t === 'object' && t !== null ? t._id : t))
          : (saleProduct.tag ? [saleProduct.tag] : []),
        items: saleProduct.items
          ? saleProduct.items.map(item => ({
              productId: item.productId?._id || item.productId || '',
              quantity: item.quantity || 1
            }))
          : []
      });
    } else {
      setFormData({
        name: '',
        description: '',
        saleType: saleType,
        price: '',
        quantity: '',
        tags: [],
        items: saleType === 'retail' ? [{ productId: '', quantity: 1 }] : []
      });
    }
  }, [saleProduct, saleType]);
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

  // Hàm validate trả về errors object
  const validateErrors = () => {
    const newErrors = {};
    if (!validateRequired(formData.name)) {
      newErrors.name = 'Tên sản phẩm không được để trống';
    }
    if (!validateRequired(formData.price.toString())) {
      newErrors.price = 'Giá bán không được để trống';
    } else if (!validateNumber(formData.price)) {
      newErrors.price = 'Giá bán phải là số';
    }
    if (!validateRequired(formData.quantity.toString())) {
      newErrors.quantity = 'Số lượng không được để trống';
    } else if (!validateNumber(formData.quantity)) {
      newErrors.quantity = 'Số lượng phải là số';
    } else if (formData.saleType === 'retail' && formData.items.length === 1) {
      const productInfo = products.find(p => (p._id === formData.items[0]?.productId || p.id === formData.items[0]?.productId));
      if (productInfo && productInfo.quantity !== undefined) {
        const stock = productInfo.quantity;
        const productId = productInfo._id || productInfo.id;
        let totalUsed = 0;
        allSaleProducts.forEach(sp => {
          if (saleProduct && (sp._id === saleProduct._id || sp.id === saleProduct.id)) return;
          if (sp.saleType === 'retail') {
            if (sp.items && sp.items[0] && (sp.items[0].productId === productId || sp.items[0].productId?._id === productId)) {
              totalUsed += Number(sp.quantity) || 0;
            }
          } else if (sp.saleType === 'combo' && Array.isArray(sp.items)) {
            sp.items.forEach(item => {
              if (item.productId === productId || item.productId?._id === productId) {
                totalUsed += (Number(item.quantity) || 0) * (Number(sp.quantity) || 1);
              }
            });
          }
        });
        const currentInput = Number(formData.quantity) || 0;
        if (totalUsed + currentInput > stock) {
          newErrors.quantity = `Tồn kho chỉ còn ${stock}, đã dùng: ${totalUsed}`;
        }
      }
    }
    if (formData.items.length === 0) {
      newErrors.items = 'Phải có ít nhất 1 sản phẩm';
    }
    if (formData.saleType === 'retail' && formData.items.length > 1) {
      newErrors.items = 'Sản phẩm bán lẻ chỉ được chọn 1 sản phẩm gốc';
    }
    formData.items.forEach((item, index) => {
      if (!validateRequired(item.productId?.toString())) {
        newErrors[`item_${index}_productId`] = 'Vui lòng chọn sản phẩm';
      }
      if (!validateRequired(item.quantity?.toString())) {
        newErrors[`item_${index}_quantity`] = 'Số lượng không được để trống';
      } else if (!validateNumber(item.quantity) || item.quantity <= 0) {
        newErrors[`item_${index}_quantity`] = 'Số lượng phải > 0';
      } else {
        const productInfo = products.find(p => (p._id === item.productId || p.id === item.productId));
        if (productInfo && productInfo.quantity !== undefined) {
          const stock = productInfo.quantity;
          const productId = productInfo._id || productInfo.id;
          let totalUsed = 0;
          allSaleProducts.forEach(sp => {
            if (saleProduct && (sp._id === saleProduct._id || sp.id === saleProduct.id)) return;
            if (sp.saleType === 'retail') {
              if (sp.items && sp.items[0] && (sp.items[0].productId === productId || sp.items[0].productId?._id === productId)) {
                totalUsed += Number(sp.quantity) || 0;
              }
            } else if (sp.saleType === 'combo' && Array.isArray(sp.items)) {
              sp.items.forEach(spItem => {
                if (spItem.productId === productId || spItem.productId?._id === productId) {
                  totalUsed += (Number(spItem.quantity) || 0) * (Number(sp.quantity) || 1);
                }
              });
            }
          });
          const currentInput = Number(item.quantity) || 0;
          if (totalUsed + currentInput > stock) {
            newErrors[`item_${index}_quantity`] = `Tồn kho chỉ còn ${stock}, đã dùng: ${totalUsed}`;
          }
        }
      }
    });
    return newErrors;
  };

  // Tự động validate khi thay đổi quantity hoặc items
  useEffect(() => {
    setErrors(validateErrors());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.quantity, formData.items]);

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

  // validateForm chỉ dùng cho submit
  const validateForm = () => {
    const errs = validateErrors();
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }


  const handleSubmit = async (e) => {
  e.preventDefault();

    if (!validateForm()) {
      // Ưu tiên báo lỗi tồn kho nếu có
      if (Object.values(errors).some(msg => typeof msg === 'string' && msg.includes('Tồn kho'))) {
        toast.error('Số lượng nhập vượt quá tồn kho!');
      } else {
        toast.error('Vui lòng kiểm tra lại thông tin');
      }
      return;
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

      console.log('[SaleProductForm] Submit data:', submitData)

      if (saleProduct) {
        const res = await api.put(`/sale-products/${saleProduct._id || saleProduct.id}`, submitData)
        console.log('[SaleProductForm] API PUT response:', res)
        onSubmit(res.data)
        toast.success('Cập nhật thành công')
        if (typeof reloadProducts === 'function') reloadProducts();
      } else {
        const res = await api.post('/sale-products', submitData)
        console.log('[SaleProductForm] API POST response:', res)
        onSubmit(res.data)
        toast.success('Thêm thành công')
        if (typeof reloadProducts === 'function') reloadProducts();
      }
      onClose()
    } catch (error) {
      console.error('[SaleProductForm] Lỗi khi gọi API:', error)
      const errorMsg = error.response?.data?.message || 'Lỗi khi lưu sản phẩm'
      toast.error(errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }




  const isRetail = formData.saleType === 'retail';


  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 space-y-2">
          <Label htmlFor="name">Tên sản phẩm bán *</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder={isRetail ? 'VD: Sticker BL' : 'VD: Combo Dây đeo & Bao thẻ'}
            className={errors.name ? 'border-destructive' : ''}
            disabled={onlyEditQuantity}
            tabIndex={onlyEditQuantity ? -1 : 0}
          />
          {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
        </div>
        <div className="flex-1 space-y-2">
          <Label htmlFor="price">Giá bán (VND) *</Label>
          <div className="relative">
            <Input
              id="price"
              name="price"
              type="text"
              inputMode="numeric"
              value={
                formData.price === '' ? '' : Number(formData.price).toLocaleString('vi-VN')
              }
              onChange={e => {
                const raw = e.target.value.replace(/[^\d]/g, '')
                setFormData(prev => ({ ...prev, price: raw }))
                if (errors.price) setErrors(prev => ({ ...prev, price: '' }))
              }}
              placeholder="0"
              min="0"
              className={errors.price ? 'border-destructive' : ''}
              autoComplete="off"
              disabled={onlyEditQuantity}
              tabIndex={onlyEditQuantity ? -1 : 0}
            />
          </div>
          {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
        </div>
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

      {/* Sản phẩm gốc */}
      <div className="space-y-2">
        <Label>{isRetail ? 'Sản phẩm gốc (chỉ 1 sản phẩm) *' : 'Sản phẩm trong combo *'}</Label>
        {errors.items && <p className="text-xs text-destructive">{errors.items}</p>}
        {isRetail ? (
          <Combobox
            items={products}
            value={products.find(p => (p._id === formData.items[0]?.productId || p.id === formData.items[0]?.productId)) || null}
            onValueChange={val => setFormData(prev => ({ ...prev, items: [{ productId: val ? (val._id || val.id) : '', quantity: 1 }] }))}
            itemToStringValue={p => p?.name || ''}
            disabled={onlyEditQuantity}
          >
            <ComboboxInput
              placeholder="Chọn sản phẩm gốc"
              value={
                products.find(p => (p._id === formData.items[0]?.productId || p.id === formData.items[0]?.productId))?.name || ''
              }
              readOnly
              tabIndex={onlyEditQuantity ? -1 : 0}
            />
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
                      itemToStringValue={p => p?.name || ''}
                      disabled={onlyEditQuantity}
                    >
                      <ComboboxInput
                        placeholder="Chọn sản phẩm"
                        value={products.find(p => (p._id === item.productId || p.id === item.productId))?.name || ''}
                        readOnly
                        tabIndex={onlyEditQuantity ? -1 : 0}
                      />
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
                      disabled={onlyEditQuantity}
                      tabIndex={onlyEditQuantity ? -1 : 0}
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
                  <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveItem(index)} disabled={onlyEditQuantity} tabIndex={onlyEditQuantity ? -1 : 0}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              );
            })}
            <Button type="button" variant="outline" size="sm" onClick={handleAddItem} className="gap-1" disabled={onlyEditQuantity} tabIndex={onlyEditQuantity ? -1 : 0}>
              <Plus size={16} /> Thêm sản phẩm
            </Button>
          </div>
        )}
      </div>

      {/* TAG */}
      <div className="space-y-2">
        <Label>Tag</Label>
        <Combobox
          items={allTags}
          value={allTags.filter(tag => formData.tags.includes(tag._id))}
          onValueChange={(selectedTags) =>
            setFormData((prev) => ({ ...prev, tags: selectedTags.map(tag => tag._id) }))
          }
          itemToStringValue={(tag) => tag?.name || ""}
          multiple
          disabled={loadingTags || onlyEditQuantity}
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
                    <ComboboxChipsInput placeholder="Chọn tag" disabled={onlyEditQuantity} tabIndex={onlyEditQuantity ? -1 : 0} />
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
