import React from 'react';
import { Button } from '@/components/ui/button';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableFooter,
  TableCaption
} from '@/components/ui/table';

const ImportDetail = ({ selectedImport, onClose }) => {
  if (!selectedImport) return null;
  const totalAmount = selectedImport.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return (
    <div className="sm:max-w-3xl w-full mx-auto">
      <DialogHeader className="flex flex-row items-center justify-between">
        <DialogTitle>Chi tiết phiếu nhập</DialogTitle>
      </DialogHeader>
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div><b>Mã phiếu:</b> {selectedImport.importIndex}</div>
          <div><b>Ngày nhập:</b> {new Date(selectedImport.dateImported).toLocaleString()}</div>
          <div><b>Nhân viên:</b> {selectedImport.staff?.name || '-'}</div>
          <div><b>Trạng thái:</b> {selectedImport.status === 'active' ? 'Đang hiệu lực' : 'Đã hủy'}</div>
          <div><b>Ghi chú:</b> {selectedImport.note || '-'}</div>
          <div><b>Tag:</b> {selectedImport.tag && typeof selectedImport.tag === 'object' ? selectedImport.tag.name : (selectedImport.tag || '-')}</div>
        </div>
        <div className="overflow-x-auto mt-2">
          <Table>
            <TableCaption>Danh sách sản phẩm nhập.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Tên sản phẩm</TableHead>
                <TableHead>Đơn vị</TableHead>
                <TableHead className="text-right">Số lượng</TableHead>
                <TableHead className="text-right">Giá nhập</TableHead>
                <TableHead className="text-right">Tổng giá nhập</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedImport.items.map((item, idx) => {
                const total = item.price * item.quantity;
                return (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{item.importItemId?.name || 'Sản phẩm'}</TableCell>
                    <TableCell>{item.importItemId?.unit || '-'}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{item.price.toLocaleString('vi-VN')}₫</TableCell>
                    <TableCell className="text-right font-semibold">{total.toLocaleString('vi-VN')}₫</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={4} className="text-right font-bold">Tổng cộng</TableCell>
                <TableCell className="text-right font-bold">{totalAmount.toLocaleString('vi-VN')}₫</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default ImportDetail;
