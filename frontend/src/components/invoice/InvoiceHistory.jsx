import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ListPagination from '../ListPagination';
import { Eye } from 'lucide-react';

const InvoiceHistory = ({
  isLoading,
  invoices,
  visibleInvoices,
  page,
  pageSize,
  totalPages,
  handleNext,
  handlePrev,
  handlePageChange,
  handleViewDetail,
  getPaymentMethodLabel,
  formatDate,
  handleChangeStatus,
  handleCancelInvoice
}) => (
  <Card>
    <CardHeader>
      <CardTitle>Lich su hoa don</CardTitle>
      <CardDescription>Danh sach cac hoa don da tao</CardDescription>
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <Alert>
          <AlertDescription>Dang tai du lieu...</AlertDescription>
        </Alert>
      ) : invoices.length === 0 ? (
        <Alert>
          <AlertDescription>Chua co hoa don nao</AlertDescription>
        </Alert>
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>STT</TableHead>
                  <TableHead>Ma hoa don</TableHead>
                  <TableHead>Thoi gian</TableHead>
                  <TableHead>Nhan vien</TableHead>
                  <TableHead>Khach hang</TableHead>
                  <TableHead>Thanh toan</TableHead>
                  <TableHead className="text-right">So SP</TableHead>
                  <TableHead className="text-right">Hanh dong</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleInvoices.map((invoice, idx) => (
                  <TableRow key={invoice._id || invoice.id}>
                    <TableCell>{(page - 1) * pageSize + idx + 1}</TableCell>
                    <TableCell className="font-mono font-medium">{invoice.invoiceIndex}</TableCell>
                    <TableCell className="text-sm">{formatDate(invoice.dateBought || invoice.createdAt)}</TableCell>
                    <TableCell>
                      {invoice.staff && typeof invoice.staff === 'object'
                        ? `${invoice.staff.name}`
                        : invoice.staff || ''}
                    </TableCell>
                    <TableCell>{invoice.customer || 'Khach le'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{getPaymentMethodLabel(invoice.paymentMethod)}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{invoice.items?.length || 0}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleViewDetail(invoice)}>
                        <Eye size={16} />
                      </Button>
                      {/* Nút chuyển trạng thái */}
                      {invoice.status === 'pending' ? (
                        <Button size="sm" variant="default" onClick={() => handleChangeStatus(invoice, 'paid')}>
                          Đánh dấu đã thanh toán
                        </Button>
                      ) : invoice.status === 'paid' ? (
                        <Button size="sm" variant="secondary" onClick={() => handleChangeStatus(invoice, 'pending')}>
                          Chuyển về chờ xử lý
                        </Button>
                      ) : null}
                      {/* Nút cancel */}
                      {invoice.status !== 'cancelled' && (
                        <Button size="sm" variant="destructive" onClick={() => handleCancelInvoice(invoice)}>
                          Hủy hóa đơn
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <ListPagination
            handleNext={handleNext}
            handlePrev={handlePrev}
            handlePageChange={handlePageChange}
            page={page}
            totalPages={totalPages}
          />
        </>
      )}
      {invoices.length > 0 && (
        <div className="border-t pt-4 mt-4">
          <p className="text-sm text-muted-foreground">
            Tong cong: {invoices.length} hoa don
          </p>
        </div>
      )}
    </CardContent>
  </Card>
);

export default InvoiceHistory;
