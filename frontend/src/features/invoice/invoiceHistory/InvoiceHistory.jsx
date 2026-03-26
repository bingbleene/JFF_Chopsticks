import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import InvoiceTable from './InvoiceTable';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ListPagination from '../../../components/ListPagination';

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
      <CardTitle>Lịch sử hóa đơn</CardTitle>
      <CardDescription>Danh sách các hóa đơn đã tạo</CardDescription>
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <Alert>
          <AlertDescription>Đang tải dữ liệu</AlertDescription>
        </Alert>
      ) : invoices.length === 0 ? (
        <Alert>
          <AlertDescription>Chưa có hóa đơn nào</AlertDescription>
        </Alert>
      ) : (
        <>
          <InvoiceTable
            visibleInvoices={visibleInvoices}
            page={page}
            pageSize={pageSize}
            getPaymentMethodLabel={getPaymentMethodLabel}
            formatDate={formatDate}
            handleViewDetail={handleViewDetail}
            handleChangeStatus={handleChangeStatus}
            handleCancelInvoice={handleCancelInvoice}
          />
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
            Tổng cộng: {invoices.length} hóa đơn
          </p>
        </div>
      )}
    </CardContent>
  </Card>
);

export default InvoiceHistory;
