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
import { Receipt, History, Trash2 } from 'lucide-react'
import api from '@/lib/axios'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/hooks'

const InvoicePage = () => {
  const [activeTab, setActiveTab] = useState('create')
  const [invoices, setInvoices] = useState([])
  const [isLoading, setIsLoading] = useState(false)

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
    <div className="min-h-screen w-full bg-gradient-background relative">
      {/* Background gradient accent */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.15), transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(34, 197, 94, 0.15), transparent 50%)`,
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
            {/* <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="create" className="gap-2">
                <Receipt size={18} />
                Tao hoa don
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <History size={18} />
                Lich su hoa don
              </TabsTrigger>
            </TabsList> */}

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
                              <TableCell className="text-right">
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleDeleteInvoice(invoice)}
                                >
                                  <Trash2 size={16} />
                                </Button>
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

          {/* Footer */}
          <Footer />
        </div>
      </div>
    </div>
  )
}

export default InvoicePage
