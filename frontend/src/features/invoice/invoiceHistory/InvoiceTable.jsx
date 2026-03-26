
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
import InvoiceDetailTable from './InvoiceDetailTable';

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

  // Sử dụng util chung
  const getImportPrice = (saleItemId) => getImportPriceFromSaleProducts(saleProducts, saleItemId);
  
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
                        return <InvoiceDetailTable invoice={invoice} onCollapse={() => setExpandedId(null)} getImportPrice={getImportPrice} getPaymentMethodLabel={getPaymentMethodLabel} saleProducts={saleProducts} />;
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
