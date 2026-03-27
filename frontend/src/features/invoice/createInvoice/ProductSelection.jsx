import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import LoadingItem from '@/components/LoadingItem';
import { Search, Plus } from 'lucide-react';
import SearchBox from '@/components/SearchBox';
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogDescription } from '@/components/ui/dialog';
import InvoiceSaleProductForm from './InvoiceSaleProductForm';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ProductSelection = ({
  isLoading,
  searchTerm,
  setSearchTerm,
  filteredProducts,
  cartItems,
  addToCart,
  formatCurrency,
  allProducts = [],
  products = [],
  onProductAdded,
  reloadProducts
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formSaleType, setFormSaleType] = useState('retail');

  // Callback khi thêm hàng bán mới
  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
  };
  const handleUpdateSaleProduct = (product) => {
    handleFormClose();
    if (onProductAdded) onProductAdded(product);
    if (typeof reloadProducts === 'function') reloadProducts();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Search size={24} />
            Chọn sản phẩm
          </CardTitle>
          <CardDescription>Chọn sản phẩm để thêm vào hóa đơn</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <SearchBox
          placeholder="Tìm kiếm sản phẩm..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
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
              const inCart = cartItems.find(i => i.saleItemId === (product._id || product.id));
              const used = typeof product.usedInSaleProduct === 'number' ? product.usedInSaleProduct : 0;
              const availableStock = typeof product.quantity === 'number' ? (product.quantity - used) : 0;
              const isOutOfStock = availableStock <= 0;
              return (
                <div
                  key={product._id || product.id}
                  className={`p-3 border rounded-lg transition relative overflow-hidden ${inCart ? 'border-primary bg-primary/5' : ''} ${isOutOfStock ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-70' : 'cursor-pointer hover:border-primary'}`}
                  onClick={() => {
                    if (!isOutOfStock) addToCart(product);
                  }}
                  tabIndex={isOutOfStock ? -1 : 0}
                  aria-disabled={isOutOfStock}
                >
                  {/* Nội dung sản phẩm */}
                  <div className="relative z-0">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant={product.saleType === 'retail' ? 'default' : 'secondary'} className="text-xs">
                        {product.saleType === 'retail' ? 'Lẻ' : 'Combo'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">Còn để bán: {availableStock.toLocaleString('vi-VN')} {product.unit || 'cái'}</span>
                    </div>
                    <p className="font-medium text-sm truncate">{product.name}</p>
                    <p className="text-primary font-bold">{formatCurrency(product.price)}</p>
                    {/* Không hiển thị thành phần combo */}
                    {inCart && (
                      <p className="text-xs text-primary mt-1">Trong giỏ: {inCart.quantity}</p>
                    )}
                    {/* Overlay badge và nút cộng */}
                    {isOutOfStock && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="bg-gray-300 text-white text-xs px-2 py-0.5 rounded shadow">Hết hàng</span>
                        <button
                          type="button"
                          className="w-6 h-6 flex items-center justify-center rounded-lg bg-primary text-white hover:bg-primary/90 shadow focus:outline-none absolute bottom-0.1 right-1 z-10"
                          onClick={e => {
                            e.stopPropagation();
                            setEditingProduct(product);
                            setFormSaleType(product.saleType || 'retail');
                            setIsFormOpen(true);
                          }}
                          title="Thêm hàng"
                        >
                          <Plus size={15} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {/* Dialog thêm hàng bán */}
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="min-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingProduct
                  ? `Cập nhật sản phẩm ${editingProduct.saleType === 'retail' ? 'bán lẻ' : 'combo'}`
                  : `Thêm ${formSaleType === 'retail' ? 'sản phẩm bán lẻ' : 'combo'}`
                }
              </DialogTitle>
              <DialogDescription>
                {formSaleType === 'retail'
                  ? 'Chọn 1 sản phẩm từ hàng hóa tổng để bán lẻ'
                  : 'Kết hợp nhiều sản phẩm thành 1 combo'
                }
              </DialogDescription>
            </DialogHeader>
            <InvoiceSaleProductForm
              saleProduct={editingProduct}
              saleType={editingProduct?.saleType || formSaleType}
              products={products}
              allSaleProducts={allProducts}
              onSubmit={handleUpdateSaleProduct}
              onClose={handleFormClose}
              onlyEditQuantity={!!editingProduct}
              reloadProducts={reloadProducts}
            />
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ProductSelection;
