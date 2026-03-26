import React from 'react';
import LoadingItem from '@/components/LoadingItem';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Minus, Trash2 } from 'lucide-react';


const VoucherSelection = ({
  vouchers,
  selectedVouchers,
  addVoucher,
  updateVoucherQuantity,
  removeVoucher,
  formatCurrency,
  isLoading
}) => (
  <Card>
    <CardHeader className="pb-3">
      <CardTitle className="text-lg">Voucher giảm giá</CardTitle>
      <CardDescription>Chọn voucher và số lượng muốn áp dụng</CardDescription>
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <LoadingItem message="Đang tải voucher..." />
      ) : vouchers.length > 0 ? (
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
                  <span className="text-xs text-muted-foreground">Còn: {voucher.quantity}</span>
                </div>
                <p className="font-medium text-sm truncate">{voucher.name}</p>
                <p className="text-green-600 font-bold text-sm">
                  {voucher.type === 'percentage' && `-${voucher.value}%`}
                  {voucher.type === 'fixed' && `-${formatCurrency(voucher.value)}`}
                  {voucher.type === 'original_price' && 'Giá gốc'}
                </p>
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
      ) : null}
    </CardContent>
  </Card>
);

export default VoucherSelection;
