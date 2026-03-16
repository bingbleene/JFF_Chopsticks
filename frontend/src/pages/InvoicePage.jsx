import React, { useState, useEffect } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import Navigation from '../components/Navigation'
import InvoiceForm from '../components/invoice/InvoiceForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Receipt, History, Trash2, Eye, X } from 'lucide-react'
import api from '@/lib/axios'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/hooks'

const InvoicePage = () => {
  const [activeTab, setActiveTab] = useState('create')
  const [invoices, setInvoices] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

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
      console.error('Loi khi lay danh sach hoa don:', error)
      toast.error('Khong the tai danh sach hoa don')
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
    if (!confirm(`Ban chac chan muon xoa hoa don ${invoice.invoiceIndex}? Hanh dong nay se hoan lai so luong san pham.`)) {
      return
    }

    try {
      await api.delete(`/invoices/${invoice._id || invoice.id}`)
      setInvoices(prev => prev.filter(i => (i._id || i.id) !== (invoice._id || invoice.id)))
      toast.success(`Da xoa hoa don ${invoice.invoiceIndex}`)
    } catch (error) {
      console.error('Loi khi xoa hoa don:', error)
      toast.error('Loi khi xoa hoa don')
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

  const getPaymentMethodLabel = (method) => {
    switch (method) {
      case 'momo': return 'momo'
      case 'ngan hang': return 'ngan hang'
      case 'tien mat': return 'tien mat'
      default: return method
    }
  }

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
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="create" className="gap-2">
                <Receipt size={18} />
                Tao hoa don
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <History size={18} />
                Lich su hoa don
              </TabsTrigger>
            </TabsList>

            {/* Create Invoice Tab */}
            <TabsContent value="create">
              <InvoiceForm onSuccess={handleInvoiceCreated} />
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history">
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
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
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
                          {invoices.map(invoice => (
                            <TableRow key={invoice._id || invoice.id}>
                              <TableCell className="font-mono font-medium">
                                {invoice.invoiceIndex}
                              </TableCell>
                              <TableCell className="text-sm">
                                {formatDate(invoice.dateBought || invoice.createdAt)}
                              </TableCell>
                              <TableCell>{invoice.staff}</TableCell>
                              <TableCell>{invoice.customer || 'Khach le'}</TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {getPaymentMethodLabel(invoice.paymentMethod)}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                {invoice.items?.length || 0}
                              </TableCell>
                              <TableCell className="text-right space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewDetail(invoice)}
                                >
                                  <Eye size={16} />
                                </Button>
{/* <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeleteInvoice(invoice)}
                                >
                                  <Trash2 size={16} />
                                </Button> */}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
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
            </TabsContent>
          </Tabs>

          {/* Invoice Detail Dialog */}
          <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle>Chi tiet hoa don {selectedInvoice?.invoiceIndex}</DialogTitle>
                    <DialogDescription>
                      {selectedInvoice && formatDate(selectedInvoice.dateBought || selectedInvoice.createdAt)}
                    </DialogDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsDetailOpen(false)}
                    className="h-8 w-8"
                  >
                    <X size={18} />
                  </Button>
                </div>
              </DialogHeader>

              {selectedInvoice && (
                <div className="space-y-4">
                  {/* Invoice Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Nhan vien:</span>
                      <span className="ml-2 font-medium">{selectedInvoice.staff}</span>
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
                          <TableHead>San pham</TableHead>
                          <TableHead className="text-right">Don gia</TableHead>
                          <TableHead className="text-right">So luong</TableHead>
                          <TableHead className="text-right">Thanh tien</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedInvoice.items?.map((item, index) => {
                          const saleProduct = item.saleItemId
                          const name = saleProduct?.name || 'San pham da xoa'
                          const price = saleProduct?.price || 0
                          return (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{name}</TableCell>
                              <TableCell className="text-right">{formatCurrency(price)}</TableCell>
                              <TableCell className="text-right">{item.quantity}</TableCell>
                              <TableCell className="text-right">{formatCurrency(price * item.quantity)}</TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Vouchers Section */}
                  {selectedInvoice.vouchers && selectedInvoice.vouchers.length > 0 && (
                    <div className="border rounded-lg">
                      <div className="px-4 py-2 bg-muted/50 border-b">
                        <span className="font-medium text-sm">Voucher su dung</span>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Ten voucher</TableHead>
                            <TableHead className="text-right">Gia tri</TableHead>
                            <TableHead className="text-right">So luong</TableHead>
                            <TableHead className="text-right">Giam gia</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedInvoice.vouchers.map((voucherItem, index) => {
                            const voucher = voucherItem.voucherId
                            const name = voucher?.name || 'Voucher da xoa'
                            const price = voucher?.price || 0
                            return (
                              <TableRow key={index}>
                                <TableCell className="font-medium">{name}</TableCell>
                                <TableCell className="text-right">{formatCurrency(price)}</TableCell>
                                <TableCell className="text-right">{voucherItem.quantity}</TableCell>
                                <TableCell className="text-right text-green-600">-{formatCurrency(price * voucherItem.quantity)}</TableCell>
                              </TableRow>
                            )
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {/* Total */}
                  <div className="space-y-2 pt-4 border-t">
                    {(() => {
                      const subtotal = selectedInvoice.items?.reduce((sum, item) => {
                        const price = item.saleItemId?.price || 0
                        return sum + price * item.quantity
                      }, 0) || 0

                      const voucherDiscount = selectedInvoice.vouchers?.reduce((sum, voucherItem) => {
                        const price = voucherItem.voucherId?.price || 0
                        return sum + price * voucherItem.quantity
                      }, 0) || 0

                      const total = subtotal - voucherDiscount

                      return (
                        <>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Tam tinh:</span>
                            <span>{formatCurrency(subtotal)}</span>
                          </div>
                          {voucherDiscount > 0 && (
                            <div className="flex justify-between items-center text-sm text-green-600">
                              <span>Giam gia voucher:</span>
                              <span>-{formatCurrency(voucherDiscount)}</span>
                            </div>
                          )}
                          <div className="flex justify-between items-center pt-2 border-t">
                            <span className="text-lg font-semibold">Tong cong:</span>
                            <span className="text-xl font-bold text-primary">
                              {formatCurrency(total)}
                            </span>
                          </div>
                        </>
                      )
                    })()}
                  </div>

                  {/* Close Button */}
                  <div className="flex justify-end pt-4">
                    <Button onClick={() => setIsDetailOpen(false)}>
                      Dong
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Footer */}
          <Footer />
        </div>
      </div>
    </div>
  )
}

export default InvoicePage
