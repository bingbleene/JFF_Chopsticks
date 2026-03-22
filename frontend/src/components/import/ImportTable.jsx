import React, { useState } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Eye, Ban, MoreHorizontal as MoreHorizontalIcon, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';



const ImportTable = ({ visibleImports, page, pageSize, setSelectedImport, handleDisableImport }) => {
  const [expandedId, setExpandedId] = useState(null);

  // Only expand/collapse via dropdown action
  const handleExpandDetail = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>STT</TableHead>
          <TableHead>Mã phiếu</TableHead>
          <TableHead>Ngày nhập</TableHead>
          <TableHead>Nhân viên</TableHead>
          <TableHead>Tag</TableHead>
          <TableHead>Sản phẩm nhập</TableHead>
          <TableHead>Trạng thái</TableHead>
          <TableHead>Hành động</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {visibleImports.map((imp, idx) => (
          <React.Fragment key={imp._id}>
            <TableRow>
              <TableCell>
                {(page - 1) * pageSize + idx + 1}
              </TableCell>
              <TableCell className="flex flex-wrap gap-1">{imp.importIndex}</TableCell>
              <TableCell className="font-medium">{imp.dateImported ? format(new Date(imp.dateImported), 'dd/MM/yyyy') : '-'}</TableCell>
              <TableCell className="font-medium">{imp.staff?.name || '-'}</TableCell>
              <TableCell className="font-medium">{imp.tag?.name || '-'}</TableCell>
              <TableCell  className="font-medium">
                {imp.items && imp.items.length > 0 ? (
                  <ul className="list-disc pl-4">
                    {imp.items.map((item, i) => (
                      <li key={i}>
                        {item.importItemId?.name || 'Sản phẩm'} x{item.quantity}
                      </li>
                    ))}
                  </ul>
                ) : '-'}
              </TableCell>
              <TableCell>{imp.status === 'active' ? 'Sử dụng' : 'Đã hủy'}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8">
                      <MoreHorizontalIcon />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleExpandDetail(imp._id)}>
                        <Eye className="w-4 h-4 mr-2" />
                      {expandedId === imp._id ? 'Thu gọn' : 'Xem chi tiết'}
                    </DropdownMenuItem>
                    {/* <DropdownMenuItem>Sửa</DropdownMenuItem> */}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDisableImport(imp)}
                      disabled={imp.status !== 'active'}
                      className={imp.status === 'active' ? 'text-destructive' : ''}
                    >
                        {/* icon vô hiệu hóa*/}
                        <Ban className="w-4 h-4 mr-2" />
                      Vô hiệu hóa
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
            {expandedId === imp._id && (
              <TableRow>
                <TableCell colSpan={8} className="bg-white px-6 py-6 rounded-b-lg shadow border-t border-border relative">
                  {/* Collapse button */}
                  <button
                    onClick={() => setExpandedId(null)}
                    className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition"
                    aria-label="Đóng chi tiết"
                  >
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  </button>
                  <div className="font-semibold mb-3 text-base text-primary">Chi tiết sản phẩm nhập</div>
                  <div className="overflow-x-auto rounded-lg border border-border bg-background">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-100">
                          <TableHead className="px-3 py-2 font-semibold text-center">STT</TableHead>
                          <TableHead className="px-3 py-2 font-semibold text-center">Tên sản phẩm</TableHead>
                          <TableHead className="px-3 py-2 font-semibold text-center">Đơn vị</TableHead>
                          <TableHead className="px-3 py-2 font-semibold text-center">Số lượng</TableHead>
                          <TableHead className="px-3 py-2 font-semibold text-center">Giá nhập</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {imp.items.map((item, i) => (
                          <TableRow key={i} className="hover:bg-gray-50">
                            <TableCell className="px-3 py-2 text-center">{i + 1}</TableCell>
                            <TableCell className="px-3 py-2 text-center">{item.importItemId?.name || 'Sản phẩm'}</TableCell>
                            <TableCell className="px-3 py-2 text-center">{item.importItemId?.unit || '-'}</TableCell>
                            <TableCell className="px-3 py-2 text-center">{item.quantity}</TableCell>
                            <TableCell className="px-3 py-2 text-center text-green-700 font-medium">{item.price.toLocaleString('vi-VN')}₫</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {/* Totals */}
                  <div className="flex flex-wrap gap-4 mt-4 text-sm font-medium justify-start">
                    <div className="bg-gray-100 rounded px-3 py-2">
                      Tổng số sản phẩm: <span className="text-primary font-semibold">{imp.items.length}</span>
                    </div>
                    <div className="bg-gray-100 rounded px-3 py-2">
                      Tổng số lượng: <span className="text-primary font-semibold">{imp.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                    </div>
                    <div className="bg-gray-100 rounded px-3 py-2">
                      Tổng tiền nhập: <span className="text-green-700 font-semibold">{imp.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString('vi-VN')}₫</span>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground mt-3"><b>Ghi chú:</b> {imp.note || '-'}</div>
                </TableCell>
              </TableRow>
            )}
          </React.Fragment>
        ))}
      </TableBody>
    </Table>
  );
};

export default ImportTable;
