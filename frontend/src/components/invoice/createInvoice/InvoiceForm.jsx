import React, { useState, useEffect } from 'react'
import ProductSelection from './ProductSelection';
import VoucherSelection from './VoucherSelection';
import Cart from './Cart';
import InvoiceInfo from './InvoiceInfo';
import InvoiceConfirmDialog from './InvoiceConfirmDialog';
import { Button } from '@/components/ui/button';
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
      console.error('Lỗi khi lấy dữ liệu:', error)
      toast.error('Không thể kết nối tới server')
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

      toast.success(`Tạo hóa đơn ${res.data.invoiceIndex} thành công!`)

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
      const errorMsg = error.response?.data?.message || 'Lỗi khi tạo hóa đơn'
      toast.error(errorMsg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Product Selection & Voucher */}
      <div className="lg:col-span-2 space-y-4">
        <ProductSelection
          isLoading={isLoading}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filteredProducts={filteredProducts}
          cartItems={cartItems}
          addToCart={addToCart}
          formatCurrency={formatCurrency}
        />
        <VoucherSelection
          vouchers={vouchers}
          selectedVouchers={selectedVouchers}
          addVoucher={addVoucher}
          updateVoucherQuantity={updateVoucherQuantity}
          removeVoucher={removeVoucher}
          formatCurrency={formatCurrency}
          isLoading={isLoading}
        />
      </div>

      {/* Right: Cart & Invoice Info */}
      <div className="space-y-4">
        <Cart
          cartItems={cartItems}
          selectedVouchers={selectedVouchers}
          vouchers={vouchers}
          getImportPrice={getImportPrice}
          updateQuantity={updateQuantity}
          removeFromCart={removeFromCart}
          updateVoucherQuantity={updateVoucherQuantity}
          removeVoucher={removeVoucher}
          subtotal={subtotal}
          voucherDiscount={voucherDiscount}
          total={total}
          formatCurrency={formatCurrency}
          isLoading={isLoading}
        />
        <InvoiceInfo
          dateCreated={dateCreated}
          setDateCreated={setDateCreated}
          staff={staff}
          setStaff={setStaff}
          staffList={staffList}
          customer={customer}
          setCustomer={setCustomer}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          note={note}
          setNote={setNote}
          paymentMethods={paymentMethods}
          isLoading={isLoading}
        />
        <Button
          className="w-full h-12 text-lg"
          disabled={cartItems.length === 0 || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? 'Đang xử lý...' : `Thanh toán ${formatCurrency(total)}`}
        </Button>
      </div>

      {/* Confirm Dialog */}
      <InvoiceConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        cartItems={cartItems}
        selectedVouchers={selectedVouchers}
        vouchers={vouchers}
        staff={staff}
        staffList={staffList}
        customer={customer}
        paymentMethod={paymentMethod}
        total={total}
        voucherDiscount={voucherDiscount}
        isSubmitting={isSubmitting}
        confirmSubmit={confirmSubmit}
      />
    </div>
  )
}

export default InvoiceForm
