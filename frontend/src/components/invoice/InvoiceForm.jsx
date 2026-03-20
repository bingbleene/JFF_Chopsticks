import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Calendar as CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Minus, Trash2, ShoppingCart, Receipt, Search, CreditCard, Banknote, Smartphone } from 'lucide-react'
import api from '@/lib/axios'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/hooks'
import { paymentMethods, getPaymentMethodLabel } from '@/lib/data'


const InvoiceForm = ({ onSuccess }) => {
  // Data states
  const [saleProducts, setSaleProducts] = useState([])
  const [vouchers, setVouchers] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Cart states
  const [cartItems, setCartItems] = useState([])
  const [selectedVouchers, setSelectedVouchers] = useState([])


  // Helper to get importPrice from saleProducts
  const getImportPrice = (saleItemId) => {
    const product = saleProducts.find(p => (p._id || p.id) === saleItemId)
    if (!product) return 0
    if (product.saleType === 'retail' && product.items && product.items.length === 1) {
      return product.items[0].importPrice || 0
    } else if (product.saleType === 'combo' && product.items && product.items.length > 0) {
      // For combo, importPrice is the sum of all items' importPrice * quantity in combo
      return product.items.reduce((sum, i) => sum + (i.importPrice || 0) * (i.quantity || 1), 0)
    }
    return 0
  }

  // Form states
  const [staff, setStaff] = useState('')
  const [staffList, setStaffList] = useState([])
  const [customer, setCustomer] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('tien mat')
  const [note, setNote] = useState('')
  const [dateCreated, setDateCreated] = useState(() => new Date())

  // UI states
  const [searchTerm, setSearchTerm] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)



  useEffect(() => {
    fetchData()
    fetchStaff()
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

      setSaleProducts(saleList.filter(p => p.quantity > 0))
      setVouchers(voucherList.filter(v => v.active && v.quantity > 0))
    } catch (error) {
      console.error('Loi khi lay du lieu:', error)
      toast.error('Khong the ket noi toi server')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStaff = async () => {
    try {
      const res = await api.get('/staffs')
      setStaffList(Array.isArray(res.data) ? res.data : [])
    } catch (error) {
      toast.error('Không thể lấy danh sách nhân viên')
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
        toast.warning(`Chỉ còn ${product.quantity} sản phẩm trong kho`)
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
    toast.success(`Đã thêm ${product.name}`)
  }

  const updateQuantity = (saleItemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(saleItemId)
      return
    }

    const item = cartItems.find(i => i.saleItemId === saleItemId)
    if (newQuantity > item.maxQuantity) {
      toast.warning(`Chỉ còn ${item.maxQuantity} sản phẩm trong kho`)
      return
    }

    setCartItems(cartItems.map(i =>
      i.saleItemId === saleItemId ? { ...i, quantity: newQuantity } : i
    ))
  }
  const removeFromCart = (saleItemId) => {
    setCartItems(cartItems.filter(i => i.saleItemId !== saleItemId))
  }

  const addVoucher = (voucher) => {
    const existing = selectedVouchers.find(v => v.voucherId === (voucher._id || voucher.id))
    if (existing) {
      if (existing.quantity >= voucher.quantity) {
        toast.warning(`Chỉ còn ${voucher.quantity} voucher`)
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
        type: voucher.type,
        value: voucher.value,
        maxQuantity: voucher.quantity,
        quantity: 1
      }])
    }
  }

  const removeVoucher = (voucherId) => {
    setSelectedVouchers(selectedVouchers.filter(v => v.voucherId !== voucherId))
  }

  const updateVoucherQuantity = (voucherId, newQuantity) => {
    if (newQuantity <= 0) {
      removeVoucher(voucherId)
      return
    }

    const voucher = selectedVouchers.find(v => v.voucherId === voucherId)
    if (newQuantity > voucher.maxQuantity) {
      toast.warning(`Chỉ còn ${voucher.maxQuantity} voucher`)
      return
    }

    setSelectedVouchers(selectedVouchers.map(v =>
      v.voucherId === voucherId ? { ...v, quantity: newQuantity } : v
    ))
  }

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  // Tính tổng giảm giá từ voucher theo type/value
  // Chỉ cho phép 1 voucher 'original_price' trên 1 hóa đơn
  let hasOriginalPriceVoucher = false;
  const voucherDiscount = selectedVouchers.reduce((sum, v) => {
    const voucher = vouchers.find(vc => (vc._id || vc.id) === v.voucherId)
    if (!voucher) return sum
    if (voucher.type === 'percentage') {
      return sum + Math.round(subtotal * (voucher.value / 100)) * v.quantity
    } else if (voucher.type === 'fixed') {
      return sum + voucher.value * v.quantity
    } else if (voucher.type === 'original_price') {
      if (hasOriginalPriceVoucher) return sum; 
      hasOriginalPriceVoucher = true;
      const importTotal = cartItems.reduce((s, item) => {
        const importPrice = getImportPrice(item.saleItemId)
        return s + importPrice * item.quantity
      }, 0)
      return sum + (subtotal - importTotal)
    }
    return sum
  }, 0)
  const total = Math.max(0, subtotal - voucherDiscount)

  // Validate form
  const validateForm = () => {
    if (cartItems.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 sản phẩm')
      return false
    }
    if (!staff) {
      toast.error('Vui lòng chọn nhân viên')
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
        staff,
        customer: customer.trim() || 'Khách lẻ',
        paymentMethod,
        vouchers: selectedVouchers.map(v => ({
          voucherId: v.voucherId,
          quantity: v.quantity
        })),
        note: note.trim(),
        status: 'pending',
        dateCreated: dateCreated ? dateCreated.toISOString() : new Date().toISOString()
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
      console.error('Lỗi khi tao hoa don:', error)
      const errorMsg = error.response?.data?.message || 'Loi khi tao hoa don'
      toast.error(errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Product Selection */}
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart size={24} />
              Chọn sản phẩm
            </CardTitle>
            <CardDescription>Chọn sản phẩm để thêm vào hóa đơn</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="flex items-center gap-2">
              <Search size={20} className="text-muted-foreground" />
              <Input
                placeholder="ìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <Alert>
                <AlertDescription>Đang tải dữ liệu...</AlertDescription>
              </Alert>
            ) : filteredProducts.length === 0 ? (
              <Alert>
                <AlertDescription>
                  {searchTerm ? 'Không tìm thấy sản phẩm' : 'Không có sản phẩm nào'}
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
                        <p className="text-xs text-primary mt-1">Trong giỏ: {inCart.quantity}</p>
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
              <CardTitle className="text-lg">Voucher giảm giá</CardTitle>
              <CardDescription>Chọn voucher và số lượng muốn áp dụng</CardDescription>
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
                      <p className="text-green-600 font-bold text-sm">
                        {voucher.type === 'percentage' && `-${voucher.value}%`}
                        {voucher.type === 'fixed' && `-${formatCurrency(voucher.value)}`}
                        {voucher.type === 'original_price' && 'Giá gốc'}
                      </p>

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
                            Chọn voucher
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
              Giỏ hàng ({cartItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {cartItems.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Chưa có sản phẩm nào
              </p>
            ) : (
              <>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {cartItems.map(item => {
                    // Kiểm tra có voucher original_price không
                    const hasOriginalPriceVoucher = selectedVouchers.some(v => {
                      const voucher = vouchers.find(vc => (vc._id || vc.id) === v.voucherId)
                      return voucher && voucher.type === 'original_price'
                    })
                    const importPrice = getImportPrice(item.saleItemId)
                    return (
                    <div key={item.saleItemId} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground"> Giá bán: {formatCurrency(item.price)}
                          {hasOriginalPriceVoucher && (
                            <p className="text-green-700">
                              <span className="">Giá gốc: {formatCurrency(importPrice)}</span>
                            </p>
                          )}
                        </p>
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
                  );
                })}
                </div>

                {/* Selected Vouchers */}
                {selectedVouchers.length > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground mb-1">Voucher ap dung:</p>
                    {selectedVouchers.map(v => (
                      <div key={v.voucherId} className="flex items-center justify-between p-2 bg-green-50 rounded mb-1">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-green-700 truncate">{v.name}</p>
                          <p className="text-xs text-green-600">
                            {(() => {
                              const voucher = vouchers.find(vc => (vc._id || vc.id) === v.voucherId)
                              if (!voucher) return null
                              if (voucher.type === 'percentage') {
                                return `-${Math.round(subtotal * (voucher.value / 100)) * v.quantity}₫`
                              } else if (voucher.type === 'fixed') {
                                return `-${formatCurrency(voucher.value * v.quantity)}`
                              } else if (voucher.type === 'original_price') {
                                return 'Giá gốc'
                              }
                              return null
                            })()}
                          </p>
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
              </>
            )}
          </CardContent>
        </Card>

        {/* Customer Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Thông tin hóa đơn</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="dateCreated" className="text-sm">Ngày tạo hóa đơn</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={"w-full justify-start text-left font-normal " + (!dateCreated ? 'text-muted-foreground' : '')}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateCreated ? format(dateCreated, "PPP") : <span>Chọn ngày</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateCreated}
                    onSelect={setDateCreated}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1">
              <Label htmlFor="staff" className="text-sm">Nhân viên *</Label>
              <select
                id="staff"
                value={staff}
                onChange={e => setStaff(e.target.value)}
                className="w-full border rounded px-2 py-1 text-sm"
              >
                <option value="">-- Chọn nhân viên --</option>
                {staffList.map(s => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="customer" className="text-sm">Khách hàng</Label>
              <Input
                id="customer"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                placeholder="Khách lẻ"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-sm">Phương thức thanh toán</Label>
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
              <Label htmlFor="note" className="text-sm">Ghi chú</Label>
              <Textarea
                id="note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ghi chú thêm..."
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
            <DialogTitle>Xác nhận tạo hóa đơn</DialogTitle>
            <DialogDescription>
              Kiểm tra lại thông tin trước khi xác nhận
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="p-3 bg-muted rounded-lg space-y-2">
              <p className="font-medium">Sản phẩm ({cartItems.length}):</p>
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
              <span>Tổng thanh toán:</span>
              <span className="text-primary">{formatCurrency(total)}</span>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>Nhân viên: {staff}</p>
              <p>Khách hàng: {customer || 'Khách lẻ'}</p>
              <p>Thanh toán: {getPaymentMethodLabel(paymentMethod)}</p>
            </div>
          </div>

          <div className="flex gap-3 pt-4 items-center">
            <Button
              onClick={confirmSubmit}
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Đang xử lý...' : 'Xác nhận'}
            </Button>
            <button
              type="button"
              onClick={() => setShowConfirmDialog(false)}
              aria-label="Đóng"
              className="rounded-full p-2 hover:bg-muted transition border border-input text-xl flex items-center justify-center"
              disabled={isSubmitting}
            >
              <span aria-hidden="true">×</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default InvoiceForm
