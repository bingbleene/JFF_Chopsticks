import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Minus, Trash2, ShoppingCart, Receipt, Search, CreditCard, Banknote, Smartphone } from 'lucide-react'
import api from '@/lib/axios'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/hooks'

const InvoiceForm = ({ onSuccess }) => {
  // Data states
  const [saleProducts, setSaleProducts] = useState([])
  const [vouchers, setVouchers] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Cart states
  const [cartItems, setCartItems] = useState([])
  const [selectedVouchers, setSelectedVouchers] = useState([])

  // Form states
  const [staff, setStaff] = useState('')
  const [customer, setCustomer] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('tien mat')
  const [note, setNote] = useState('')

  // UI states
  const [searchTerm, setSearchTerm] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [saleProductsRes, vouchersRes] = await Promise.all([
        api.get('/sale-products'),
        api.get('/vouchers')
      ])

      const saleList = Array.isArray(saleProductsRes.data) ? saleProductsRes.data : []
      const voucherList = Array.isArray(vouchersRes.data) ? vouchersRes.data : []

      // Chi lay san pham co so luong > 0
      setSaleProducts(saleList.filter(p => p.quantity > 0))
      // Chi lay voucher con hoat dong va con so luong
      setVouchers(voucherList.filter(v => v.active && v.quantity > 0))
    } catch (error) {
      console.error('Loi khi lay du lieu:', error)
      toast.error('Khong the ket noi toi server')
    } finally {
      setIsLoading(false)
    }
  }

  // Filter products by search
  const filteredProducts = saleProducts.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Add product to cart
  const addToCart = (product) => {
    const existingItem = cartItems.find(item => item.saleItemId === (product._id || product.id))

    if (existingItem) {
      // Check if can add more
      if (existingItem.quantity >= product.quantity) {
        toast.warning(`Chi con ${product.quantity} san pham trong kho`)
        return
      }
      setCartItems(cartItems.map(item =>
        item.saleItemId === (product._id || product.id)
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setCartItems([...cartItems, {
        saleItemId: product._id || product.id,
        name: product.name,
        price: product.price,
        saleType: product.saleType,
        maxQuantity: product.quantity,
        quantity: 1
      }])
    }
    toast.success(`Da them ${product.name}`)
  }

  // Update cart item quantity
  const updateQuantity = (saleItemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(saleItemId)
      return
    }

    const item = cartItems.find(i => i.saleItemId === saleItemId)
    if (newQuantity > item.maxQuantity) {
      toast.warning(`Chi con ${item.maxQuantity} san pham trong kho`)
      return
    }

    setCartItems(cartItems.map(i =>
      i.saleItemId === saleItemId ? { ...i, quantity: newQuantity } : i
    ))
  }

  // Remove from cart
  const removeFromCart = (saleItemId) => {
    setCartItems(cartItems.filter(i => i.saleItemId !== saleItemId))
  }

  // Add voucher
  const addVoucher = (voucher) => {
    const existing = selectedVouchers.find(v => v.voucherId === (voucher._id || voucher.id))
    if (existing) {
      if (existing.quantity >= voucher.quantity) {
        toast.warning(`Chi con ${voucher.quantity} voucher`)
        return
      }
      setSelectedVouchers(selectedVouchers.map(v =>
        v.voucherId === (voucher._id || voucher.id)
          ? { ...v, quantity: v.quantity + 1 }
          : v
      ))
    } else {
      setSelectedVouchers([...selectedVouchers, {
        voucherId: voucher._id || voucher.id,
        name: voucher.name,
        price: voucher.price,
        maxQuantity: voucher.quantity,
        quantity: 1
      }])
    }
  }

  // Remove voucher
  const removeVoucher = (voucherId) => {
    setSelectedVouchers(selectedVouchers.filter(v => v.voucherId !== voucherId))
  }

  // Update voucher quantity
  const updateVoucherQuantity = (voucherId, newQuantity) => {
    if (newQuantity <= 0) {
      removeVoucher(voucherId)
      return
    }

    const voucher = selectedVouchers.find(v => v.voucherId === voucherId)
    if (newQuantity > voucher.maxQuantity) {
      toast.warning(`Chi con ${voucher.maxQuantity} voucher`)
      return
    }

    setSelectedVouchers(selectedVouchers.map(v =>
      v.voucherId === voucherId ? { ...v, quantity: newQuantity } : v
    ))
  }

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const voucherDiscount = selectedVouchers.reduce((sum, v) => sum + (v.price * v.quantity), 0)
  const total = Math.max(0, subtotal - voucherDiscount)

  // Validate form
  const validateForm = () => {
    if (cartItems.length === 0) {
      toast.error('Vui long chon it nhat 1 san pham')
      return false
    }
    if (!staff.trim()) {
      toast.error('Vui long nhap ten nhan vien')
      return false
    }
    return true
  }

  // Submit invoice
  const handleSubmit = async () => {
    if (!validateForm()) return

    setShowConfirmDialog(true)
  }

  const confirmSubmit = async () => {
    try {
      setIsSubmitting(true)

      const invoiceData = {
        items: cartItems.map(item => ({
          saleItemId: item.saleItemId,
          quantity: item.quantity
        })),
        staff: staff.trim(),
        customer: customer.trim() || 'Khach le',
        paymentMethod,
        vouchers: selectedVouchers.map(v => ({
          voucherId: v.voucherId,
          quantity: v.quantity
        })),
        note: note.trim()
      }

      const res = await api.post('/invoices', invoiceData)

      toast.success(`Tao hoa don ${res.data.invoiceIndex} thanh cong!`)

      // Reset form
      setCartItems([])
      setSelectedVouchers([])
      setStaff('')
      setCustomer('')
      setPaymentMethod('tien mat')
      setNote('')
      setShowConfirmDialog(false)

      // Refresh data
      fetchData()

      if (onSuccess) onSuccess(res.data)
    } catch (error) {
      console.error('Loi khi tao hoa don:', error)
      const errorMsg = error.response?.data?.message || 'Loi khi tao hoa don'
      toast.error(errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const paymentMethods = [
    { value: 'tien mat', label: 'Tien mat', icon: Banknote },
    { value: 'ngan hang', label: 'Ngan hang', icon: CreditCard },
    { value: 'momo', label: 'MoMo', icon: Smartphone }
  ]

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Product Selection */}
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart size={24} />
              Chon san pham
            </CardTitle>
            <CardDescription>Chon san pham de them vao hoa don</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="flex items-center gap-2">
              <Search size={20} className="text-muted-foreground" />
              <Input
                placeholder="Tim kiem san pham..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <Alert>
                <AlertDescription>Dang tai du lieu...</AlertDescription>
              </Alert>
            ) : filteredProducts.length === 0 ? (
              <Alert>
                <AlertDescription>
                  {searchTerm ? 'Khong tim thay san pham' : 'Khong co san pham nao'}
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto">
                {filteredProducts.map(product => {
                  const inCart = cartItems.find(i => i.saleItemId === (product._id || product.id))
                  return (
                    <div
                      key={product._id || product.id}
                      className={`p-3 border rounded-lg cursor-pointer transition hover:border-primary ${inCart ? 'border-primary bg-primary/5' : ''}`}
                      onClick={() => addToCart(product)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant={product.saleType === 'retail' ? 'default' : 'secondary'} className="text-xs">
                          {product.saleType === 'retail' ? 'Le' : 'Combo'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">SL: {product.quantity}</span>
                      </div>
                      <p className="font-medium text-sm truncate">{product.name}</p>
                      <p className="text-primary font-bold">{formatCurrency(product.price)}</p>
                      {inCart && (
                        <p className="text-xs text-primary mt-1">Trong gio: {inCart.quantity}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Vouchers */}
        {vouchers.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Voucher giam gia</CardTitle>
              <CardDescription>Chon voucher va so luong muon ap dung</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {vouchers.map(voucher => {
                  const selected = selectedVouchers.find(v => v.voucherId === (voucher._id || voucher.id))
                  const voucherId = voucher._id || voucher.id
                  return (
                    <div
                      key={voucherId}
                      className={`p-3 border rounded-lg transition ${selected ? 'border-green-500 bg-green-50' : 'border-border'}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                          Voucher
                        </Badge>
                        <span className="text-xs text-muted-foreground">Con: {voucher.quantity}</span>
                      </div>
                      <p className="font-medium text-sm truncate">{voucher.name}</p>
                      <p className="text-green-600 font-bold text-sm">-{formatCurrency(voucher.price)}</p>

                      {/* Quantity controls */}
                      <div className="flex items-center justify-between mt-3 pt-2 border-t">
                        {selected ? (
                          <>
                            <div className="flex items-center gap-1">
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-7 w-7"
                                onClick={() => updateVoucherQuantity(voucherId, selected.quantity - 1)}
                              >
                                <Minus size={14} />
                              </Button>
                              <span className="w-8 text-center text-sm font-medium">{selected.quantity}</span>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-7 w-7"
                                onClick={() => updateVoucherQuantity(voucherId, selected.quantity + 1)}
                                disabled={selected.quantity >= voucher.quantity}
                              >
                                <Plus size={14} />
                              </Button>
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={() => removeVoucher(voucherId)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full gap-1"
                            onClick={() => addVoucher(voucher)}
                          >
                            <Plus size={14} />
                            Chon voucher
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right: Cart & Checkout */}
      <div className="space-y-4">
        {/* Cart */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Receipt size={20} />
              Gio hang ({cartItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {cartItems.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Chua co san pham nao
              </p>
            ) : (
              <>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {cartItems.map(item => (
                    <div key={item.saleItemId} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{formatCurrency(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.saleItemId, item.quantity - 1)}
                        >
                          <Minus size={14} />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => updateQuantity(item.saleItemId, item.quantity + 1)}
                        >
                          <Plus size={14} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive"
                          onClick={() => removeFromCart(item.saleItemId)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Selected Vouchers */}
                {selectedVouchers.length > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground mb-1">Voucher ap dung:</p>
                    {selectedVouchers.map(v => (
                      <div key={v.voucherId} className="flex items-center justify-between p-2 bg-green-50 rounded mb-1">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-green-700 truncate">{v.name}</p>
                          <p className="text-xs text-green-600">-{formatCurrency(v.price * v.quantity)}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-green-700"
                            onClick={() => updateVoucherQuantity(v.voucherId, v.quantity - 1)}
                          >
                            <Minus size={14} />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium text-green-700">{v.quantity}</span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-green-700"
                            onClick={() => updateVoucherQuantity(v.voucherId, v.quantity + 1)}
                          >
                            <Plus size={14} />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-destructive"
                            onClick={() => removeVoucher(v.voucherId)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Totals */}
                <div className="pt-3 border-t space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Tam tinh:</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  {voucherDiscount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Giam gia:</span>
                      <span>-{formatCurrency(voucherDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-1">
                    <span>Tong cong:</span>
                    <span className="text-primary">{formatCurrency(total)}</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Customer Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Thong tin hoa don</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="staff" className="text-sm">Nhan vien *</Label>
              <Input
                id="staff"
                value={staff}
                onChange={(e) => setStaff(e.target.value)}
                placeholder="Ten nhan vien"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="customer" className="text-sm">Khach hang</Label>
              <Input
                id="customer"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                placeholder="Khach le"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-sm">Phuong thuc thanh toan</Label>
              <div className="flex gap-2">
                {paymentMethods.map(method => (
                  <Button
                    key={method.value}
                    type="button"
                    variant={paymentMethod === method.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setPaymentMethod(method.value)}
                    className="flex-1 gap-1"
                  >
                    <method.icon size={16} />
                    {method.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="note" className="text-sm">Ghi chu</Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ghi chu them..."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Button
          className="w-full h-12 text-lg"
          disabled={cartItems.length === 0 || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? 'Dang xu ly...' : `Thanh toan ${formatCurrency(total)}`}
        </Button>
      </div>

      {/* Confirm Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xac nhan tao hoa don</DialogTitle>
            <DialogDescription>
              Kiem tra lai thong tin truoc khi xac nhan
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="p-3 bg-muted rounded-lg space-y-2">
              <p className="font-medium">San pham ({cartItems.length}):</p>
              {cartItems.map(item => (
                <div key={item.saleItemId} className="flex justify-between text-sm">
                  <span>{item.name} x{item.quantity}</span>
                  <span>{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            {selectedVouchers.length > 0 && (
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="font-medium text-green-700">Voucher:</p>
                {selectedVouchers.map(v => (
                  <div key={v.voucherId} className="flex justify-between text-sm text-green-600">
                    <span>{v.name} x{v.quantity}</span>
                    <span>-{formatCurrency(v.price * v.quantity)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between font-bold text-lg">
              <span>Tong thanh toan:</span>
              <span className="text-primary">{formatCurrency(total)}</span>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>Nhan vien: {staff}</p>
              <p>Khach hang: {customer || 'Khach le'}</p>
              <p>Thanh toan: {paymentMethods.find(m => m.value === paymentMethod)?.label}</p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isSubmitting}
              className="flex-1"
            >
              Huy
            </Button>
            <Button
              onClick={confirmSubmit}
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Dang xu ly...' : 'Xac nhan'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default InvoiceForm
