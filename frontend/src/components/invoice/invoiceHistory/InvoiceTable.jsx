
import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell, TableFooter } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, MoreHorizontal, Ban, ChevronUp, Check, CheckLine, Flag } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { getInvoiceStatusLabel } from '@/lib/data';

const InvoiceTable = ({
  visibleInvoices,
  page,
  pageSize,
  getPaymentMethodLabel,
  formatDate,
  handleViewDetail,
  handleChangeStatus,
  handleCancelInvoice
}) => {
  // Defensive prop checks
  if (!Array.isArray(visibleInvoices)) {
    console.error('InvoiceTable: visibleInvoices is not an array', visibleInvoices);
    return <div className="text-red-600">Lỗi: Dữ liệu hóa đơn không hợp lệ.</div>;
  }
  if (typeof getPaymentMethodLabel !== 'function' || typeof formatDate !== 'function') {
    console.error('InvoiceTable: getPaymentMethodLabel or formatDate is not a function');
    return <div className="text-red-600">Lỗi: Hàm xử lý dữ liệu không hợp lệ.</div>;
  }
  const [expandedId, setExpandedId] = useState(null);

  
  const [saleProducts, setSaleProducts] = useState([]);
  useEffect(() => {
    if (saleProducts.length === 0) {
      api.get('/sale-products')
        .then(res => {
          const data = Array.isArray(res.data) ? res.data : [];
          setSaleProducts(data);
        })
        .catch((err) => {
          console.error('API /sale-products error:', err);
          setSaleProducts([]);
        });
    }
  }, []);

  const getImportPrice = (saleItemId) => {
    const product = saleProducts.find(p => (p._id || p.id) === (saleItemId?._id || saleItemId?.id || saleItemId));
    if (!product) return 0;
    if (product.saleType === 'retail' && product.items && product.items.length === 1) {
      return product.items[0].importPrice || 0;
    } else if (product.saleType === 'combo' && product.items && product.items.length > 0) {
      return product.items.reduce((sum, i) => sum + (i.importPrice || 0) * (i.quantity || 1), 0);
    }
    return 0;
  };

  const renderInvoiceDetail = (invoice, onCollapse) => {
    const items = Array.isArray(invoice.items) ? invoice.items : [];
    const subtotal = items.reduce((sum, item) => {
      const price = item?.saleItemId?.price || 0;
      return sum + price * (item?.quantity || 0);
    }, 0) || 0;
    // Chỉ cho phép 1 voucher original_price
    let hasOriginalPriceVoucher = false;
    const vouchers = Array.isArray(invoice.vouchers) ? invoice.vouchers : [];
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
        const importTotal = items.reduce((s, item) => {
          const importPrice = getImportPrice(item?.saleItemId);
          return s + importPrice * (item?.quantity || 0);
        }, 0) || 0;
        return sum + (subtotal - importTotal);
      }
      return sum;
    }, 0) || 0;
    const total = Math.max(0, subtotal - voucherDiscount);
    return (
      <div className="sm:max-w-5xl w-full mx-auto p-5 relative">
        {/* Collapse button giống phiếu nhập */}
        <button
          onClick={onCollapse}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition"
          aria-label="Đóng chi tiết hóa đơn"
        >
          <ChevronUp className="w-5 h-5 text-gray-500" />
        </button>
        <div className="font-semibold mb-3 text-base text-primary">Chi tiết hóa đơn</div>
        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
          {/* <div><b>Trạng thái:</b> {getInvoiceStatusLabel(invoice.status) || '-'}</div>
          <div><b>Phương thức:</b> <b>{getPaymentMethodLabel(invoice.paymentMethod) || '-'}</b></div> */}
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
              {(Array.isArray(invoice.items) ? invoice.items : []).map((item, index) => {
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

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
              <TableHead>STT</TableHead>
              <TableHead>Mã hóa đơn</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead>Nhân viên</TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Thanh toán</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Số sản phẩm</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
            {(Array.isArray(visibleInvoices) ? visibleInvoices : []).map((invoice, idx) => [
              <TableRow key={invoice?._id || invoice?.id || idx}>
                <TableCell>{(page - 1) * pageSize + idx + 1}</TableCell>
                <TableCell className="font-mono font-medium">{invoice?.invoiceIndex || '-'}</TableCell>
                <TableCell className="text-sm">{formatDate(invoice?.dateBought || invoice?.createdAt) || '-'}</TableCell>
                <TableCell>
                  {invoice?.staff && typeof invoice.staff === 'object'
                    ? `${invoice.staff.name}`
                    : invoice?.staff || '-'}
                </TableCell>
                <TableCell>{invoice?.customer || 'Khách lẻ'}</TableCell>
                <TableCell>
                  <Badge
                    className={
                      invoice?.paymentMethod === 'tien mat'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : invoice?.paymentMethod === 'ngan hang'
                        ? 'bg-green-600 text-white border-green-600'
                        : invoice?.paymentMethod === 'momo'
                        ? 'bg-pink-500 text-white border-pink-500'
                        : 'bg-gray-200 text-gray-700 border-gray-200'
                    }
                  >
                    {getPaymentMethodLabel(invoice?.paymentMethod) || '-'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={
                    invoice?.status === 'paid' ? 'success' :
                    invoice?.status === 'pending' ? 'warning' :
                    invoice?.status === 'cancelled' ? 'destructive' : 'outline'
                  }>
                    {getInvoiceStatusLabel(invoice?.status) || '-'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{Array.isArray(invoice?.items) ? invoice.items.length : 0}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreHorizontal />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-[180px]">
                      <DropdownMenuItem onClick={() => setExpandedId(expandedId === invoice?._id ? null : invoice?._id)}>
                        {expandedId === invoice?._id ? (
                          <ChevronUp className="w-4 h-4 mr-2" />
                        ) : (
                          <Eye className="w-4 h-4 mr-2" />
                        )}
                        {expandedId === invoice?._id ? 'Thu gọn' : 'Chi tiết'}
                      </DropdownMenuItem>
                      
                      {invoice?.status === 'pending' ? (
                        <DropdownMenuItem onClick={() => handleChangeStatus(invoice, 'paid')}>
                          <CheckLine className="w-4 h-4 mr-2" />
                          Đã thanh toán
                        </DropdownMenuItem>
                      ) : invoice?.status === 'paid' ? (
                        <DropdownMenuItem onClick={() => handleChangeStatus(invoice, 'pending')}>
                            <Flag className="w-4 h-4 mr-2" />
                          Chưa xử lý
                        </DropdownMenuItem>
                      ) : null}
                      <DropdownMenuSeparator />
                      {invoice?.status !== 'cancelled' && (
                        <DropdownMenuItem variant="destructive" onClick={() => handleCancelInvoice(invoice)}>
                          <Ban className="w-4 h-4 mr-2" />
                          Hủy
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>,
            expandedId === invoice?._id && (
              <TableRow key={(invoice?._id || invoice?.id || idx) + '-detail'}>
                <TableCell colSpan={9} className="p-0 bg-white">
                  <div style={{ minWidth: 900, maxWidth: 1100, margin: '0 auto' }}>
                    {/* Error boundary for detail rendering */}
                    {(() => {
                      try {
                        return renderInvoiceDetail(invoice, () => setExpandedId(null));
                      } catch (err) {
                        console.error('Lỗi khi hiển thị chi tiết hóa đơn:', err, invoice);
                        return <div className="text-red-600">Lỗi khi hiển thị chi tiết hóa đơn.</div>;
                      }
                    })()}
                  </div>
                </TableCell>
              </TableRow>
            )
          ])}
        </TableBody>
      </Table>
    </div>
  );
};

export default InvoiceTable;
