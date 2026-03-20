import React, { useEffect, useState } from 'react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import api from '@/lib/axios';

const ImportForm = ({ importData, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    staff: '',
    items: [{ importItemId: '', quantity: 1, price: 0 }],
    note: '',
    tag: '',
    dateImported: new Date(),
  });

  const [staffs, setStaffs] = useState([]);
  const [products, setProducts] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [loadingTags, setLoadingTags] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // fetch data
  useEffect(() => {
    fetchProducts();
    fetchStaffs();

    setLoadingTags(true);
    api.get('/tags')
      .then(res => setAllTags(res.data))
      .catch(() => toast.error('Không thể tải danh sách tag'))
      .finally(() => setLoadingTags(false));
  }, []);

  // set form data for edit
  useEffect(() => {
    if (importData) {
      setFormData({
        staff: importData.staff?._id || importData.staff || '',
        items: importData.items?.map(item => ({
          importItemId: item.importItemId?._id || item.importItemId || '',
          quantity: item.quantity,
          price: item.price
        })) || [{ importItemId: '', quantity: 1, price: 0 }],
        note: importData.note || '',
        tag: importData.tag?._id || importData.tag || '',
        dateImported: importData.dateImported ? new Date(importData.dateImported) : new Date(),
      });
    } else {
      setFormData({
        staff: '',
        items: [{ importItemId: '', quantity: 1, price: 0 }],
        note: '',
        tag: '',
        dateImported: new Date(),
      });
    }
  }, [importData]);

  const fetchStaffs = async () => {
    try {
      const res = await api.get('/staffs');
      setStaffs(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error('Không thể lấy nhân viên');
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error('Không thể lấy sản phẩm');
    }
  };

  // item handlers
  const handleItemChange = (idx, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === idx ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { importItemId: '', quantity: 1, price: 0 }]
    }));
  };

  const handleRemoveItem = (idx) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx)
    }));
  };

  // validate
  const validateForm = () => {
    const newErrors = {};

    if (!formData.staff) newErrors.staff = 'Chọn nhân viên';
    if (!formData.items.length) newErrors.items = 'Thêm ít nhất 1 sản phẩm';

    formData.items.forEach((item, idx) => {
      if (!item.importItemId)
        newErrors[`item_${idx}_importItemId`] = 'Chọn sản phẩm';

      if (!item.quantity || item.quantity < 1)
        newErrors[`item_${idx}_quantity`] = 'Số lượng > 0';

      if (item.price == null || item.price < 0)
        newErrors[`item_${idx}_price`] = 'Giá >= 0';
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return toast.error('Vui lòng kiểm tra lại thông tin');
    }

    try {
      setIsSubmitting(true);

      // Prepare data for API: convert string ids to objects if needed
      const submitData = {
        ...formData,
        staff: formData.staff,
        tag: formData.tag,
        dateImported: formData.dateImported || new Date(),
        items: formData.items.map(item => ({
          importItemId: item.importItemId,
          quantity: item.quantity,
          price: item.price
        }))
      };

      let res;
      if (importData && importData._id) {
        res = await api.put(`/imports/${importData._id}`, submitData);
        toast.success('Cập nhật phiếu nhập thành công');
      } else {
        res = await api.post('/imports', submitData);
        toast.success('Tạo phiếu nhập thành công');
      }
      onSubmit(res.data);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi khi lưu phiếu nhập');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (

    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Ngày nhập & Nhân viên cùng hàng */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Ngày nhập bên trái */}
        <div className="flex-1 space-y-2">
          <Label>Ngày nhập</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={"w-full justify-start text-left font-normal " + (!formData.dateImported ? 'text-muted-foreground' : '')}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formData.dateImported ? format(formData.dateImported, "PPP") : <span>Chọn ngày</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.dateImported}
                onSelect={date => setFormData(prev => ({ ...prev, dateImported: date }))}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        {/* Nhân viên bên phải */}
        <div className="flex-1 space-y-2">
          <Label>Nhân viên *</Label>
          <Combobox
            items={staffs}
            value={staffs.find(s => s._id === formData.staff) || null}
            onValueChange={staffObj => setFormData(prev => ({ ...prev, staff: staffObj?._id || '' }))}
            itemToStringValue={s => s?.name || ''}
          >
            <ComboboxInput
              placeholder="Chọn nhân viên"
              value={staffs.find(s => s._id === formData.staff)?.name || ''}
            />
            <ComboboxContent>
              <ComboboxEmpty>Không có nhân viên.</ComboboxEmpty>
              <ComboboxList>
                {(s) => (
                  <ComboboxItem key={s._id} value={s}>
                    {s.name}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
          {errors.staff && <p className="text-xs text-destructive">{errors.staff}</p>}
        </div>
      </div>

      {/* ITEMS */}
      <div className="space-y-2">
        <Label>Danh sách hàng hóa nhập*</Label>
        {/* Tiêu đề các cột */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium mb-1 pl-1">
          <div className="w-56">Sản phẩm</div>
          <div className="w-20 text-center">Số lượng</div>
          <div className="w-28 text-center">Giá nhập</div>
          <div className="w-8" />
        </div>

        {formData.items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <Combobox
              items={products}
              value={products.find(p => p._id === item.importItemId) || null}
              onValueChange={productObj => handleItemChange(idx, 'importItemId', productObj?._id || '')}
              itemToStringValue={p => p?.name || ''}
            >
              <ComboboxInput
                placeholder="Chọn sản phẩm"
                value={products.find(p => p._id === item.importItemId)?.name || ''}
              />
              <ComboboxContent>
                <ComboboxEmpty>Không có sản phẩm.</ComboboxEmpty>
                <ComboboxList>
                  {(p) => (
                    <ComboboxItem key={p._id} value={p}>
                      {p.name}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>

            <Input
              type="number"
              min={1}
              value={item.quantity === 1 && item._touched_quantity !== true ? '' : item.quantity}
              onChange={e => {
                handleItemChange(idx, 'quantity', e.target.value === '' ? '' : Number(e.target.value));
                handleItemChange(idx, '_touched_quantity', true);
              }}
              placeholder="SL"
              className="w-28"
            />

            <Input
              type="text"
              inputMode="numeric"
              min={0}
              value={
                item.price === 0 && item._touched_price !== true
                  ? ''
                  : (typeof item.price === 'number' && !isNaN(item.price) && item.price !== ''
                    ? item.price.toLocaleString('vi-VN')
                    : item.price)
              }
              onChange={e => {
                // Remove all non-digit chars except .
                let raw = e.target.value.replace(/\./g, '').replace(/[^\d]/g, '');
                let num = raw === '' ? '' : Number(raw);
                handleItemChange(idx, 'price', num);
                handleItemChange(idx, '_touched_price', true);
              }}
              placeholder="Giá nhập"
              className="w-35"
            />

            <Button
              type="button"
              variant="ghost"
              onClick={() => handleRemoveItem(idx)}
            >
              xóa
            </Button>
          </div>
        ))}

        <Button type="button" variant="outline" onClick={handleAddItem}>
          + Thêm sản phẩm
        </Button>

        {errors.items && <p className="text-sm text-destructive">{errors.items}</p>}
      </div>

      {/* TAG */}
      <div className="space-y-2">
        <Label>Tag</Label>
        <Combobox
          items={allTags}
          value={allTags.find(tag => tag._id === formData.tag) || null}
          onValueChange={tagObj => setFormData(prev => ({ ...prev, tag: tagObj?._id || '' }))}
          itemToStringValue={tag => tag?.name || ''}
          disabled={loadingTags}
        >
          <ComboboxInput
            placeholder="Chọn tag"
            value={allTags.find(tag => tag._id === formData.tag)?.name || ''}
          />
          <ComboboxContent>
            <ComboboxEmpty>Không có tag.</ComboboxEmpty>
            <ComboboxList>
              {(tag) => (
                <ComboboxItem key={tag._id} value={tag}>
                  {tag.name}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>
      
      {/* NOTE */}
      <div className="space-y-2">
        <Label>Ghi chú</Label>
        <Textarea
          value={formData.note}
          onChange={(e) =>
            setFormData(prev => ({ ...prev, note: e.target.value }))
          }
          rows={2}
        />
      </div>

      {/* ACTION */}
      <DialogFooter>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Đang lưu...' : (importData ? 'Cập nhật phiếu nhập' : 'Tạo phiếu nhập')}
        </Button>
      </DialogFooter>

    </form>
  );
};

export default ImportForm;