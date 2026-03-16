import React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Edit2, Trash2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

const BoxManagement = ({ boxes, products, onEdit, onDelete }) => {
  const formatCurrency = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const getProductInfo = (productId) => {
    const product = products.find(p => p._id === productId)
    return product || { name: `Sản phẩm #${productId}`, salePrice: 0 }
  }

  return (
    <div className="space-y-4">
      {boxes.length === 0 ? (
        <Alert>
          <AlertDescription>Chưa có box nào. Hãy tạo box mới.</AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {boxes.map(box => (
            <Card key={box.id} className="overflow-hidden">
              <div className="p-4 space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-lg">{box.name}</h3>
                    {box.description && (
                      <p className="text-xs text-muted-foreground mt-1">{box.description}</p>
                    )}
                  </div>
                  <Badge variant="default" className="whitespace-nowrap">
                    {formatCurrency(box.price)}
                  </Badge>
                </div>

                {/* Items List */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">
                    Nội dung box:
                  </p>
                  <div className="space-y-1">
                    {box.items && box.items.length > 0 ? (
                      box.items.map((item, index) => {
                        const productInfo = getProductInfo(item.productId)
                        return (
                          <div
                            key={index}
                            className="flex items-center justify-between text-xs bg-muted/50 p-2 rounded"
                          >
                            <div className="flex-1">
                              <span className="font-medium">{productInfo.name}</span>
                            </div>
                            <span className="font-semibold text-primary ml-2">
                              x{item.quantity}
                            </span>
                          </div>
                        )
                      })
                    ) : (
                      <p className="text-xs text-muted-foreground italic">Chưa có sản phẩm</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(box)}
                    className="flex-1"
                  >
                    <Edit2 size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDelete(box.id)}
                    className="flex-1"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default BoxManagement
