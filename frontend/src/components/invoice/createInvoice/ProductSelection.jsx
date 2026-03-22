import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import LoadingItem from '@/components/LoadingItem';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const ProductSelection = ({
  isLoading,
  searchTerm,
  setSearchTerm,
  filteredProducts,
  cartItems,
  addToCart,
  formatCurrency
}) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Search size={24} />
        Chọn sản phẩm
      </CardTitle>
      <CardDescription>Chọn sản phẩm để thêm vào hóa đơn</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex items-center gap-2">
        <Search size={20} className="text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm sản phẩm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
      </div>
      {isLoading ? (
        <LoadingItem message="Đang tải dữ liệu..." />
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
                    {product.saleType === 'retail' ? 'Lẻ' : 'Combo'}
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
);

export default ProductSelection;
