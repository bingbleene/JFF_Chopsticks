import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

const InvoiceDetailTable = ({ invoice, onCollapse, getPaymentMethodLabel, saleProducts = [] }) => {
  const items = Array.isArray(invoice.items) ? invoice.items : [];
  const vouchers = Array.isArray(invoice.vouchers) ? invoice.vouchers : [];
  // Tính tổng tiền hàng
  const subtotal = items.reduce((sum, item) => {
    const price = item?.saleItemId?.price || 0;
    return sum + price * (item?.quantity || 0);
  }, 0) || 0;

  function getImportPrice(item) {
    let importPrice = 0;
    let saleProduct = null;
    if (saleProducts.length > 0) {
      saleProduct = saleProducts.find(p => (p._id || p.id) === (item.saleItemId?._id || item.saleItemId?.id || item.saleItemId));
    }
    if (!saleProduct) saleProduct = item.saleItemId;
    if (saleProduct) {
      if (saleProduct.saleType === 'retail' && Array.isArray(saleProduct.items) && saleProduct.items[0]) {
        importPrice = saleProduct.items[0].importPrice || 0;
      } else if (saleProduct.saleType === 'combo' && Array.isArray(saleProduct.items)) {
        importPrice = saleProduct.items.reduce((sum, i) => sum + (i.importPrice || 0) * (i.quantity || 1), 0);
      }
    }
    return importPrice;
  }

  let hasOriginalPriceVoucher = false;
  const voucherDiscount = vouchers.reduce((sum, v) => {
    const voucher = v?.voucherId;
    if (!voucher) return sum;
    if (voucher.type === 'percentage') {
      return sum + Math.round(subtotal * (voucher.value / 100)) * (v.quantity || 0);
    } else if (voucher.type === 'fixed') {
      return sum + voucher.value * (v.quantity || 0);
    } else if (voucher.type === 'original_price') {
      if (hasOriginalPriceVoucher) return sum;
      hasOriginalPriceVoucher = true;
      // Tính tổng giá nhập
      const importTotal = items.reduce((s, item) => {
        const importPrice = getImportPrice(item);
        return s + importPrice * (item.quantity || 0);
      }, 0);
      return sum + (subtotal - importTotal);
    }
    return sum;
  }, 0);
  const total = Math.max(0, subtotal - voucherDiscount);
  
  return (
    <div className="sm:max-w-5xl w-full mx-auto p-5 relative">
      {/* Collapse button giống phiếu nhập */}
      <button
        onClick={onCollapse}
        className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition"
        aria-label="Đóng chi tiết hóa đơn"
      >
        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </button>
      <div className="font-semibold mb-3 text-base text-primary">Chi tiết hóa đơn</div>
      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
        <div><b>Ghi chú:</b> {invoice.note || '-'}</div>
        <div><b>Voucher áp dụng:</b> {vouchers.length > 0
          ? vouchers.map((v, i) => v?.voucherId?.name || v?.voucherId?.code || 'Voucher').join(', ')
          : '-'}</div>
      </div>
      <div className="overflow-x-auto mt-2 rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-center">STT</TableHead>
              <TableHead className="w-[180px]">Sản phẩm</TableHead>
              <TableHead className="text-right">Đơn giá</TableHead>
              <TableHead className="text-right">Số lượng</TableHead>
              <TableHead className="text-right">Thành tiền</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => {
              const saleProduct = item?.saleItemId;
              const name = saleProduct?.name || 'Sản phẩm đã xóa';
              const price = saleProduct?.price || 0;
              return (
                <TableRow key={index}>
                  <TableCell className="text-center">{index + 1}</TableCell>
                  <TableCell className="font-medium">{name}</TableCell>
                  <TableCell className="text-right">{price.toLocaleString('vi-VN')}₫</TableCell>
                  <TableCell className="text-right">{item?.quantity || 0}</TableCell>
                  <TableCell className="text-right font-semibold">{((item?.quantity || 0) * price).toLocaleString('vi-VN')}₫</TableCell>
                </TableRow>
              );
            })}
            {/* Tạm tính */}
            <TableRow>
              <TableCell colSpan={4} className="text-right font-bold ">Tạm tính</TableCell>
              <TableCell className="text-right font-bold ">{subtotal.toLocaleString('vi-VN')}₫</TableCell>
            </TableRow>
            {/* Giảm giá */}
            {voucherDiscount > 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-right font-bold text-green-600">Giảm giá</TableCell>
                <TableCell className="text-right font-bold text-green-600">-{voucherDiscount.toLocaleString('vi-VN')}₫</TableCell>
              </TableRow>
            )}
            {/* Tổng cộng */}
            <TableRow>
              <TableCell colSpan={4} className="text-right text-lg font-bold pt-1 bg-muted">Tổng cộng</TableCell>
              <TableCell className="text-right text-lg font-bold text-primary bg-muted">{total.toLocaleString('vi-VN')}₫</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default InvoiceDetailTable;
