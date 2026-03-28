import React from 'react';
// import { isValidSaleQuantity } from '@/utils/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, MoreHorizontal as MoreHorizontalIcon } from 'lucide-react';
import LoadingItem from '@/components/LoadingItem';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

import { validateDeleteSaleProduct } from '@/utils/saleProductValidate';
import { toast } from 'sonner';
function RetailProductList({
  products = [],
  getProductNames = () => '',
  getProductTags = () => [],
  formatCurrency = v => v,
  handleEditProduct = () => {},
  handleDeleteSaleProduct = () => {},
  openAddForm = () => {},
  loading = false,
}) {
  // Hàm kiểm tra trước khi xóa
  const handleAskDelete = async (product) => {
    const { canDelete, invoiceCount } = await validateDeleteSaleProduct(product._id || product.id);
    if (!canDelete) {
      let msg = 'Không thể xóa sản phẩm bán này.';
      if (invoiceCount > 0) {
        msg = `Không thể xóa vì sản phẩm này đã được sử dụng trong ${invoiceCount} hóa đơn.`;
      } else if (invoiceCount === -1) {
        msg = 'Không thể kiểm tra hóa đơn. Vui lòng thử lại.';
      }
      toast.error(msg, { position: 'bottom-right', duration: 3500 });
      return;
    }
    handleDeleteSaleProduct(product);
  };

  return (
  <Card>
    <CardHeader>
      <div className="flex items-center justify-between">
        <div>
          <CardTitle>Bán lẻ</CardTitle>
          <CardDescription>Sản phẩm bán từng cái</CardDescription>
        </div>
        <Button className="gap-2" onClick={() => openAddForm('retail')}>
          + Thêm sản phẩm bán lẻ
        </Button>
      </div>
    </CardHeader>
    <CardContent>
      {loading ? (
        <LoadingItem className="mx-auto my-8" />
      ) : products.length === 0 ? (
        <div className="text-center text-muted-foreground py-4">Chưa có sản phẩm bán lẻ nào.</div>
      ) : (
        <div className="space-y-2">
          {products.map(product => {
            const productTags = getProductTags(product)
            return (
              <div key={product._id || product.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-semibold">{product.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {getProductNames(product.items)} - {formatCurrency(product.price)}
                  </p>
                  {productTags.length > 0 && (
                    <div className="flex gap-1 mt-1">
                      {productTags.map((t, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{t}</Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                    SL: {product.quantity}
                  </span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreHorizontalIcon />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                        <Edit2 size={16} className="mr-2" /> Sửa
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleAskDelete(product)} variant="destructive">
                        <Trash2 size={16} className="mr-2" /> Xóa
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </CardContent>
  </Card>

  );
}

export default RetailProductList;
