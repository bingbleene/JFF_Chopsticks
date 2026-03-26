import React, { useEffect } from 'react';
import LoadingItem from '@/components/LoadingItem';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import * as Combobox from '@/components/ui/combobox';

const InvoiceInfo = ({
  dateCreated,
  setDateCreated,
  staff,
  setStaff,
  staffList,
  customer,
  setCustomer,
  paymentMethod,
  setPaymentMethod,
  note,
  setNote,
  paymentMethods,
  isLoading
}) => {
  // Khi staff thay đổi, lưu vào localStorage
  useEffect(() => {
    if (staff) {
      localStorage.setItem('lastInvoiceStaff', staff);
    }
  }, [staff]);

  useEffect(() => {
    if (!staff) {
      const cached = localStorage.getItem('lastInvoiceStaff');
      if (cached && staffList.some(s => s._id === cached)) {
        setStaff(cached);
      }
    }
  }, [staff, staffList, setStaff]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Thông tin hóa đơn</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading && <LoadingItem message="Đang tải thông tin hóa đơn" />}
        {!isLoading && <>
        <div className="space-y-1">
          <Label htmlFor="dateCreated" className="text-sm">Ngày tạo hóa đơn</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={"w-full justify-start text-left font-normal " + (!dateCreated ? 'text-muted-foreground' : '')}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateCreated ? format(dateCreated, "EEEE, dd/MM/yyyy", { locale: vi }) : <span>Chọn ngày</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateCreated}
                onSelect={setDateCreated}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-1">
          <Label htmlFor="staff" className="text-sm">Nhân viên *</Label>
          <Combobox.Combobox value={staff} onValueChange={setStaff}>
            <Combobox.ComboboxInput
              placeholder="Chọn nhân viên"
              showTrigger
              showClear
              className="w-full"
              aria-label="Chọn nhân viên"
              value={staffList.find(s => s._id === staff)?.name || ''}
              readOnly
            />
            <Combobox.ComboboxContent>
              <Combobox.ComboboxList>
                {staffList.map(s => (
                  <Combobox.ComboboxItem key={s._id} value={s._id}>
                    {s.name}
                  </Combobox.ComboboxItem>
                ))}
              </Combobox.ComboboxList>
            </Combobox.ComboboxContent>
          </Combobox.Combobox>
        </div>
      <div className="space-y-1">
        <Label htmlFor="customer" className="text-sm">Khách hàng</Label>
        <Input
          id="customer"
          value={customer}
          onChange={(e) => setCustomer(e.target.value)}
          placeholder="Khách lẻ"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-sm">Phương thức thanh toán</Label>
        <div className="flex gap-2">
          {paymentMethods.map(method => {
            let color = '';
            if (method.value === 'tien mat') color = paymentMethod === method.value ? 'bg-blue-600 text-white' : 'border-blue-600 text-blue-600';
            else if (method.value === 'ngan hang') color = paymentMethod === method.value ? 'bg-green-600 text-white' : 'border-green-600 text-green-600';
            else if (method.value === 'momo') color = paymentMethod === method.value ? 'bg-pink-500 text-white' : 'border-pink-500 text-pink-500';
            return (
              <Button
                key={method.value}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPaymentMethod(method.value)}
                className={`flex-1 gap-1 border-2 ${color} ${paymentMethod === method.value ? '' : 'bg-white'}`}
                style={paymentMethod === method.value ? { borderColor: 'transparent' } : {}}
              >
                <method.icon size={16} />
                {method.label}
              </Button>
            );
          })}
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="note" className="text-sm">Ghi chú</Label>
        <Textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ghi chú thêm..."
          rows={2}
        />
      </div>
      </>}
    </CardContent>
  </Card>
  );
};

export default InvoiceInfo;
