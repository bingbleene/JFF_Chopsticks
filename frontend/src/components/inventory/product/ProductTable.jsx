import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Edit2, Trash2, MoreHorizontal as MoreHorizontalIcon } from 'lucide-react';
import { formatCurrency } from '@/lib/hooks';

const ProductTable = ({
  products = [],
  page = 1,
  pageSize = 10,
  getProductTags = () => [],
  handleEditProduct = () => {},
  handleDeleteProduct = () => {},
}) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>STT</TableHead>
            <TableHead>Mã sản phẩm</TableHead>
            <TableHead>Tên sản phẩm</TableHead>
            <TableHead>Tag</TableHead>
            <TableHead className="text-right">Số lượng</TableHead>
            <TableHead className="text-right">Giá nhập</TableHead>
            <TableHead className="text-right">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product, idx) => (
            <TableRow key={product._id || product.id}>
              <TableCell>{(page - 1) * pageSize + idx + 1}</TableCell>
              <TableCell className="flex flex-wrap gap-1">{product.productIndex || product.code || product.productCode || '-'}</TableCell>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {getProductTags(product).length > 0 ? (
                    getProductTags(product).map((tag, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                  {product.quantity} {product.unit || 'cái'}
                </span>
              </TableCell>
              <TableCell className="text-right">
                {product.importPrice != null ? formatCurrency(product.importPrice) : <span className="italic text-muted-foreground">Chưa có</span>}
              </TableCell>
              <TableCell className="text-right">
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
                    <DropdownMenuItem onClick={() => handleDeleteProduct(product)} className="text-destructive">
                      <Trash2 size={16} className="mr-2" /> Xóa
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductTable;
