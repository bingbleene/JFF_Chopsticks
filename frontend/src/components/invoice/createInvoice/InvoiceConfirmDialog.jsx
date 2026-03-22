import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/hooks';
import { getPaymentMethodLabel } from '@/lib/data';

const InvoiceConfirmDialog = ({
  open,
  onOpenChange,
  cartItems,
  selectedVouchers,
  vouchers,
  staff,
  staffList,
  customer,
  paymentMethod,
  total,
  voucherDiscount,
  isSubmitting,
  confirmSubmit
}) => {
  // Get staff name by id
  const staffName = staffList.find(s => s._id === staff)?.name || '';

  // Calculate voucher discount display per voucher
  const getVoucherDiscount = (v) => {
    const voucher = vouchers.find(vc => (vc._id || vc.id) === v.voucherId);
    if (!voucher) return 0;
    if (voucher.type === 'percentage') {
      // Tính trên tổng phụ
      const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      return Math.round(subtotal * (voucher.value / 100)) * v.quantity;
    } else if (voucher.type === 'fixed') {
      return voucher.value * v.quantity;
    } else if (voucher.type === 'original_price') {
      // Chỉ cho 1 voucher loại này
      const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const importTotal = cartItems.reduce((s, item) => {
        const importPrice = item.importPrice || 0;
        return s + importPrice * item.quantity;
      }, 0);
      return subtotal - importTotal;
    }
    return 0;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <form onSubmit={e => {
        e.preventDefault();
        confirmSubmit();
    }}
    onKeyDown={(e) => {
        if (e.key === 'Enter') {
        e.preventDefault();
        confirmSubmit();
        }
    }}
    >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Xác nhận tạo hóa đơn</DialogTitle>
            <DialogDescription>
              Kiểm tra lại thông tin trước khi xác nhận
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col md:flex-row gap-6 mt-2">
            {/* Left: Invoice Info */}
            <div className="flex-1 min-w-[220px] bg-gray-50 rounded-lg p-4 space-y-3 border">
              <div>
                <span className="font-medium">Ngày tạo hóa đơn:</span>
                <span className="ml-2">{new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: '2-digit', day: '2-digit' })}</span>
              </div>
              <div>
                <span className="font-medium">Nhân viên:</span>
                <span className="ml-2">{staffName}</span>
              </div>
              <div>
                <span className="font-medium">Khách hàng:</span>
                <span className="ml-2">{customer || 'Khách lẻ'}</span>
              </div>
              <div>
                <span className="font-medium">Phương thức thanh toán:</span>
                <span className="ml-2">{getPaymentMethodLabel(paymentMethod)}</span>
              </div>
            </div>
            {/* Right: Product & Voucher List */}
            <div className="flex-1 min-w-[260px] space-y-3">
              <div className="p-3 bg-muted rounded-lg space-y-2">
                <p className="font-medium">Sản phẩm ({cartItems.length}):</p>
                {cartItems.map(item => (
                  <div key={item.saleItemId} className="flex justify-between text-sm">
                    <span>{item.name} x{item.quantity}</span>
                    <span>{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              {selectedVouchers.length > 0 && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="font-medium text-green-700">Voucher:</p>
                  {selectedVouchers.map(v => {
                    const voucher = vouchers.find(vc => (vc._id || vc.id) === v.voucherId);
                    if (voucher && voucher.type === 'original_price') {
                      return (
                        <div key={v.voucherId} className="flex justify-between text-sm text-green-600">
                          <span>{v.name} x{v.quantity}</span>
                        </div>
                      );
                    } else {
                      return (
                        <div key={v.voucherId} className="flex justify-between text-sm text-green-600">
                          <span>{v.name} x{v.quantity}</span>
                          <span>-{formatCurrency(getVoucherDiscount(v))}</span>
                        </div>
                      );
                    }
                  })}
                  <div className="flex justify-between text-sm font-semibold pt-2">
                    <span>Tổng giảm giá:</span>
                    <span className="text-green-700">-{formatCurrency(voucherDiscount)}</span>
                  </div>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg">
                <span>Tổng thanh toán:</span>
                <span className="text-primary">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
          <div className="flex pt-6 justify-end">
            <Button
              type="submit"
              size="sm"
              className="mr-0"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang xử lý...' : 'Xác nhận'}
            </Button>
          </div>
        </DialogContent>
      </form>
    </Dialog>
  );
};

export default InvoiceConfirmDialog;
