import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { formatCurrency } from '@/lib/hooks';
import { getInvoiceStatusLabel } from '@/lib/data';

const InvoiceDetailDialog = ({ open, onOpenChange, selectedInvoice, formatDate, getPaymentMethodLabel }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <div className="flex items-center justify-between">
          <div>
            <DialogTitle>Chi tiet hoa don {selectedInvoice?.invoiceIndex}</DialogTitle>
            <DialogDescription className="mt-4"> 
                <span className="text-muted-foreground">Ngày tạo:</span>
              <span className="ml-2">{selectedInvoice && formatDate(selectedInvoice.dateBought || selectedInvoice.createdAt)}</span>
            </DialogDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="h-8 w-8"
          >
            <X size={18} />
          </Button>
        </div>
      </DialogHeader>
      {selectedInvoice && (() => {
        // Tính tổng tiền hàng
        const subtotal = selectedInvoice.items?.reduce((sum, item) => {
          const price = item.saleItemId?.price || 0;
          return sum + price * item.quantity;
        }, 0) || 0;
        // Tổng giảm giá từ voucher
        const voucherDiscount = selectedInvoice.vouchers?.reduce((sum, v) => {
          const price = v.voucherId?.price || 0;
          return sum + price * v.quantity;
        }, 0) || 0;
        const total = Math.max(0, subtotal - voucherDiscount);
        return (
        <div className="space-y-4">
          {/* Invoice Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Trạng thái:</span>
              <span className="ml-2 font-medium">
                {getInvoiceStatusLabel(selectedInvoice.status)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Nhân viên:</span>
              <span className="ml-2 font-medium">
                {selectedInvoice.staff && typeof selectedInvoice.staff === 'object'
                  ? `${selectedInvoice.staff.name}`
                  : selectedInvoice.staff || ''}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Khach hang:</span>
              <span className="ml-2 font-medium">{selectedInvoice.customer || 'Khach le'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Phuong thuc:</span>
              <Badge variant="outline" className="ml-2">
                {getPaymentMethodLabel(selectedInvoice.paymentMethod)}
              </Badge>
            </div>
            {selectedInvoice.note && (
              <div className="col-span-2">
                <span className="text-muted-foreground">Ghi chu:</span>
                <span className="ml-2">{selectedInvoice.note}</span>
              </div>
            )}
          </div>
          {/* Items Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sản phẩm</TableHead>
                  <TableHead className="text-right">Đơn giá</TableHead>
                  <TableHead className="text-right">Số lượng</TableHead>
                  <TableHead className="text-right">Thành tiền</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedInvoice.items?.map((item, index) => {
                  const saleProduct = item.saleItemId
                  const name = saleProduct?.name || 'Sản phẩm đã xóa'
                  const price = saleProduct?.price || 0
                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{name}</TableCell>
                      <TableCell className="text-right">{formatCurrency(price)}</TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.quantity * price)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          {/* Tổng hóa đơn */}
          <div className="pt-2 space-y-1">
            <div className="flex justify-between text-sm">
              <span>Tạm tính:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {voucherDiscount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Giảm giá:</span>
                <span>-{formatCurrency(voucherDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-1">
              <span>Tổng cộng:</span>
              <span className="text-primary">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
        );
      })()}
    </DialogContent>
  </Dialog>
);

export default InvoiceDetailDialog;
