import React, { useState, useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Navigation from '../components/Navigation'
import InvoiceTabs from '../features/invoice/InvoiceTabs'
import { toast } from 'sonner'
import api from '@/lib/axios'
import { getPaymentMethodLabel } from '@/lib/data'

const InvoicePage = () => {
  const [activeTab, setActiveTab] = useState('create')
  const [invoices, setInvoices] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  // Pagination state
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const handleViewDetail = (invoice) => {
    setSelectedInvoice(invoice)
    setIsDetailOpen(true)
  }

  const fetchInvoices = async () => {
    try {
      setIsLoading(true)
      const res = await api.get('/invoices')
      const invoiceList = Array.isArray(res.data) ? res.data : []
      setInvoices(invoiceList)
    } catch (error) {
      console.error('Lỗi khi lấy danh sách hóa đơn:', error)
      toast.error('Không thể tải danh sách hóa đơn')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'history') {
      fetchInvoices()
    }
  }, [activeTab])

  const handleInvoiceCreated = (newInvoice) => {
    setInvoices(prev => [newInvoice, ...prev])
  }

  const handleDeleteInvoice = async (invoice) => {
    if (!confirm(`Bạn chắc chắn muốn xóa hóa đơn ${invoice.invoiceIndex}? Hành động này sẽ hoàn lại số lượng sản phẩm.`)) {
      return
    }

    try {
      await api.delete(`/invoices/${invoice._id || invoice.id}`)
      setInvoices(prev => prev.filter(i => (i._id || i.id) !== (invoice._id || invoice.id)))
      toast.success(`Đã xóa hóa đơn ${invoice.invoiceIndex}`)
    } catch (error) {
      console.error('Lỗi khi xóa hóa đơn:', error)
      toast.error('Lỗi khi xóa hóa đơn')
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleChangeStatus = async (invoice, status) => {
    try {
      await api.put(`/invoices/${invoice._id || invoice.id}`, { status })
      toast.success('Đã cập nhật trạng thái hóa đơn')
      fetchInvoices()
    } catch (error) {
      toast.error('Lỗi khi cập nhật trạng thái hóa đơn')
    }
  }

  // Đã dùng CancelImportDialog ở InvoiceTable, chỉ cần nhận lý do và truyền vào API
  const handleCancelInvoice = async (invoice, cancelReason) => {
    if (!cancelReason || cancelReason.trim() === '') {
      toast.error('Bạn phải nhập lý do hủy!');
      return;
    }
    try {
      await api.put(`/invoices/${invoice._id || invoice.id}/cancel`, { cancelReason });
      toast.success('Đã hủy hóa đơn');
      fetchInvoices();
    } catch (error) {
      toast.error('Lỗi khi hủy hóa đơn');
    }
  }

  // Pagination logic
  const totalPages = Math.ceil(invoices.length / pageSize) || 1;
  const visibleInvoices = invoices.slice((page - 1) * pageSize, page * pageSize);

  const handleNext = () => {
    if (page < totalPages) setPage(prev => prev + 1);
  };
  const handlePrev = () => {
    if (page > 1) setPage(prev => prev - 1);
  };
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  return (
    <div className="min-h-screen w-full bg-white relative">
      {/* Grid Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, #e5e7eb 1px, transparent 1px),
            linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      <div className="container pt-8 mx-auto">
        <div className="w-full max-w-7xl p-6 mx-auto space-y-6 relative z-10">
          {/* Navigation */}
          <Navigation />

          {/* Header */}
          <Header />

          {/* Tabs Navigation */}
          <InvoiceTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            handleInvoiceCreated={handleInvoiceCreated}
            isLoading={isLoading}
            invoices={invoices}
            visibleInvoices={visibleInvoices}
            page={page}
            pageSize={pageSize}
            totalPages={totalPages}
            handleNext={handleNext}
            handlePrev={handlePrev}
            handlePageChange={handlePageChange}
            handleViewDetail={handleViewDetail}
            getPaymentMethodLabel={getPaymentMethodLabel}
            formatDate={formatDate}
            handleChangeStatus={handleChangeStatus}
            handleCancelInvoice={handleCancelInvoice}
          />

          {/* Footer */}
          <Footer />
        </div>
      </div>
    </div>
  )
}

export default InvoicePage
