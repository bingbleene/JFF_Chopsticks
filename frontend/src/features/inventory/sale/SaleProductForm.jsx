import api from '@/lib/axios'
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Combobox,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
  ComboboxChip,
  ComboboxChips,
  ComboboxValue,
  ComboboxChipsInput
} from '@/components/ui/combobox'
import { DialogFooter } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { validateRequired, validateNumber } from '@/lib/helpers';
import { isValidSaleQuantity, getAvailableStockForProduct } from '@/utils/saleProductValidate';
import SaleProductFields from './SaleProductFields';

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

  // So sánh formData với saleProduct để biết form có thay đổi không
  const isFormChanged = () => {
    if (!saleProduct) return true;
    // So sánh các trường cơ bản
    if (
      formData.name !== (saleProduct.name || '') ||
      formData.description !== (saleProduct.description || '') ||
      formData.saleType !== (saleProduct.saleType || 'retail') ||
      String(formData.price) !== String(saleProduct.price || '') ||
      String(formData.quantity) !== String(saleProduct.quantity || '')
    ) return true;
    // So sánh tags
    const tags1 = Array.isArray(formData.tags) ? formData.tags.map(String).sort() : [];
    const tags2 = Array.isArray(saleProduct.tags)
      ? saleProduct.tags.map(t => (typeof t === 'object' && t !== null ? String(t._id) : String(t))).sort()
      : (saleProduct.tag ? [String(saleProduct.tag)] : []);
    if (tags1.join(',') !== tags2.join(',')) return true;
    // So sánh items
    const items1 = Array.isArray(formData.items) ? formData.items : [];
    const items2 = Array.isArray(saleProduct.items)
      ? saleProduct.items.map(item => ({
          productId: item.productId?._id || item.productId || '',
          quantity: item.quantity || 1
        }))
      : [];
    if (items1.length !== items2.length) return true;
    for (let i = 0; i < items1.length; ++i) {
      if (
        String(items1[i].productId) !== String(items2[i].productId) ||
        String(items1[i].quantity) !== String(items2[i].quantity)
      ) return true;
    }
    return false;
  };

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
        const productId = productInfo._id || productInfo.id;
        const currentInput = Number(formData.quantity) || 0;
        const availableStock = getAvailableStockForProduct(productId, products, saleProduct);
        if (!isValidSaleQuantity(currentInput, productId, products, saleProduct)) {
          newErrors.quantity = `Tồn kho không đủ cho số lượng này.`;
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
          const productId = productInfo._id || productInfo.id;
          // Nếu là combo, kiểm tra tồn kho: item.quantity * formData.quantity
          const totalToSell = (formData.saleType === 'combo') ? (Number(item.quantity) || 0) * (Number(formData.quantity) || 0) : (Number(item.quantity) || 0);
          if (!isValidSaleQuantity(totalToSell, productId, products, saleProduct)) {
            newErrors[`item_${index}_quantity`] = `Tồn kho không đủ cho số lượng này.`;
          }
        }
      }
    });
    return newErrors;
  };

  useEffect(() => {
    setErrors(validateErrors());
  }, [formData.quantity, formData.items]);

  // Fetch all tags from API
  useEffect(() => {
    setLoadingTags(true)
    api.get('/tags')
        .then(res => setAllTags(res.data))
        .catch(() => toast.error('Không thể tải danh sách tag'))
      .finally(() => setLoadingTags(false))
  }, [])

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

  // Xóa sản phẩm khỏi combo
  const handleRemoveItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

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
      console.error('Lỗi khi gọi API:', error)
      const errorMsg = error.response?.data?.message || 'Lỗi khi lưu sản phẩm'
      toast.error(errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }
  return (
    <form onSubmit={handleSubmit}>
      <SaleProductFields
        formData={formData}
        setFormData={setFormData}
        errors={errors}
        products={products}
        saleProduct={saleProduct}
        onlyEditQuantity={onlyEditQuantity}
        handleItemChange={handleItemChange}
        handleAddItem={handleAddItem}
        handleRemoveItem={handleRemoveItem}
      />

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
      <div className="space-y-2 mb-4 mt-4">
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
        <Button type="submit" disabled={isSubmitting || (saleProduct && !isFormChanged())}>
          {isSubmitting ? 'Đang lưu...' : (saleProduct ? 'Cập nhật' : 'Thêm')}
        </Button>
      </DialogFooter>
    </form>
  );
}

export default SaleProductForm
