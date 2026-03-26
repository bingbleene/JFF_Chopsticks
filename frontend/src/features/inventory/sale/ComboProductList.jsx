import React from 'react';
import LoadingItem from '@/components/LoadingItem';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, Package, MoreHorizontal as MoreHorizontalIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

const ComboProductList = ({
  products = [],
  getProductNames = () => '',
  getProductTags = () => [],
  formatCurrency = v => v,
  handleEditProduct = () => {},
  handleDeleteSaleProduct = () => {},
  openAddForm = () => {},
  loading = false,
}) => (
  <Card>
    <CardHeader>
      <div className="flex items-center justify-between">
        <div>
          <CardTitle>Bán combo</CardTitle>
          <CardDescription>Kết hợp nhiều sản phẩm thành 1 combo</CardDescription>
        </div>
        <Button className="gap-2" onClick={() => openAddForm('combo')}>
          + Thêm combo
        </Button>
      </div>
    </CardHeader>
    <CardContent>
      {loading ? (
        <LoadingItem className="mx-auto my-8" />
      ) : products.length === 0 ? (
        <div className="text-center text-muted-foreground py-4">Chưa có combo nào.</div>
      ) : (
        <div className="space-y-2">
          {products.map(product => {
            const productTags = getProductTags(product)
            return (
              <div key={product._id || product.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Package size={18} className="text-purple-600" />
                    <p className="font-semibold">{product.name}</p>
                  </div>
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
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
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
                      <DropdownMenuItem onClick={() => handleDeleteSaleProduct(product)} variant="destructive">
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

export default ComboProductList;
