import React from 'react';
import LoadingItem from '@/components/LoadingItem';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2, Receipt } from 'lucide-react';

const Cart = ({
  cartItems,
  selectedVouchers,
  vouchers,
  getImportPrice,
  updateQuantity,
  removeFromCart,
  updateVoucherQuantity,
  removeVoucher,
  subtotal,
  voucherDiscount,
  total,
  formatCurrency,
  isLoading
}) => (
  <Card>
    <CardHeader className="pb-3">
      <CardTitle className="flex items-center gap-2">
        <Receipt size={20} />
        Giỏ hàng ({cartItems.length})
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      {isLoading ? (
        <LoadingItem message="Đang tải giỏ hàng..." />
      ) : cartItems.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          Chưa có sản phẩm nào
        </p>
      ) : (
        <>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {cartItems.map(item => {
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
                        <span className="text-green-700 block">Giá gốc: {formatCurrency(importPrice)}</span>
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
              )
            })}
          </div>

          {/* Selected Vouchers */}
          {selectedVouchers.length > 0 && (
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground mb-1">Voucher áp dụng:</p>
              {selectedVouchers.map(v => (
                <div key={v.voucherId} className="flex items-center justify-between p-2 bg-green-50 rounded mb-1">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-green-700 truncate">{v.name}</p>
                    <p className="text-xs text-green-600">
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
);

export default Cart;
