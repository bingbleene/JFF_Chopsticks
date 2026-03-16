import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { mockProducts, mockSalesProducts, mockBoxes } from '@/lib/mockData'

const MockDataViewer = () => {
  const [expanded, setExpanded] = useState({
    products: false,
    salesProducts: false,
    boxes: false
  })

  const formatCurrency = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const toggleExpand = (section) => {
    setExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  return (
    <Card className="border-info/20 bg-info/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              🧪 Mock Data Viewer
            </CardTitle>
            <CardDescription>Dữ liệu mẫu để thử nghiệm</CardDescription>
          </div>
          <span className="text-xs bg-info text-white px-2 py-1 rounded">
            Dev Mode
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Products */}
        <div className="border rounded-lg">
          <button
            onClick={() => toggleExpand('products')}
            className="w-full flex items-center justify-between p-3 hover:bg-muted/50"
          >
            <div className="flex items-center gap-2">
              <Badge variant="default">10</Badge>
              <span className="font-semibold">Hàng hóa tổng (mockProducts)</span>
            </div>
            {expanded.products ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          {expanded.products && (
            <div className="border-t p-3 space-y-2 max-h-64 overflow-y-auto bg-white">
              {mockProducts.map(product => (
                <div key={product.id} className="text-sm border-l-2 border-blue-300 pl-3 py-1">
                  <div className="font-semibold">{product.id}. {product.name}</div>
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <div>🏭 Kho: {product.quantity} {product.unit}</div>
                    <div>💰 Giá nhập: {formatCurrency(product.importPrice)}</div>
                    <div>🛒 Giá bán: {formatCurrency(product.salePrice)}</div>
                    <div>📁 Danh mục: {product.category}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sales Products */}
        <div className="border rounded-lg">
          <button
            onClick={() => toggleExpand('salesProducts')}
            className="w-full flex items-center justify-between p-3 hover:bg-muted/50"
          >
            <div className="flex items-center gap-2">
              <Badge variant="secondary">7</Badge>
              <span className="font-semibold">Hàng hóa bán (mockSalesProducts)</span>
            </div>
            {expanded.salesProducts ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          {expanded.salesProducts && (
            <div className="border-t p-3 space-y-2 max-h-64 overflow-y-auto bg-white">
              {mockSalesProducts.map(product => {
                const saleTypeLabel = {
                  retail: '🔵 Bán lẻ',
                  combo: '🟣 Bán combo',
                  box: '🟢 Bán box'
                }[product.saleType]

                return (
                  <div key={product.id} className="text-sm border-l-2 border-purple-300 pl-3 py-1">
                    <div className="font-semibold">{product.id}. {product.name}</div>
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      <div>{saleTypeLabel}</div>
                      <div>📦 Kho: {product.quantity}</div>
                      <div>💵 Giá gốc: {formatCurrency(product.originalPrice)}</div>
                      {product.customPrice && (
                        <div>🎯 Giá tuỳ chỉnh: {formatCurrency(product.customPrice)}</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Boxes */}
        <div className="border rounded-lg">
          <button
            onClick={() => toggleExpand('boxes')}
            className="w-full flex items-center justify-between p-3 hover:bg-muted/50"
          >
            <div className="flex items-center gap-2">
              <Badge variant="info">5</Badge>
              <span className="font-semibold">Box/Combo (mockBoxes)</span>
            </div>
            {expanded.boxes ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>

          {expanded.boxes && (
            <div className="border-t p-3 space-y-3 max-h-64 overflow-y-auto bg-white">
              {mockBoxes.map(box => (
                <div key={box.id} className="border rounded p-2 bg-gradient-to-r from-green-50 to-blue-50">
                  <div className="font-semibold text-sm">{box.id}. {box.name}</div>
                  <div className="text-xs text-muted-foreground mb-2">
                    Giá: {formatCurrency(box.price)}
                  </div>
                  <div className="text-xs space-y-0.5 bg-white rounded p-1">
                    <div className="font-semibold text-gray-700">Nội dung:</div>
                    {box.items.map((item, idx) => {
                      const product = mockSalesProducts.find(p => p.productId === item.productId)
                      return (
                        <div key={idx} className="text-gray-600">
                          • {product?.name || `Sản phẩm #${item.productId}`} x{item.quantity}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="bg-amber-50 border border-amber-200 rounded p-3 text-sm">
          <p className="font-semibold text-amber-900 mb-1">💡 Ghi chú:</p>
          <ul className="text-amber-800 space-y-1 text-xs">
            <li>• Mock data tự động sử dụng khi API không sẵn sàng</li>
            <li>• Dữ liệu sẽ reset khi refresh trang (không persistent)</li>
            <li>• Sửa dữ liệu tại <code className="bg-white px-1 rounded">src/lib/mockData.js</code></li>
            <li>• Để xem chi tiết: Mở DevTools (F12) → Console</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

export default MockDataViewer
