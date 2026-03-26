import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Edit2, Trash2, MoreHorizontal as MoreHorizontalIcon } from 'lucide-react';

const ProductTable = ({
  products = [],
  page = 1,
  pageSize = 10,
  getProductTags = () => [],
  handleEditProduct = () => {},
  handleDeleteProduct = () => {},
}) => {
  return (
    <TooltipProvider>
      <div className="overflow-x-auto">
        <Table>
        <TableHeader>
          <TableRow>
            <TableHead>STT</TableHead>
            <TableHead>Mã sản phẩm</TableHead>
            <TableHead>Tên sản phẩm</TableHead>
            <TableHead>Tag</TableHead>
            <TableHead className="text-right">Số lượng</TableHead>
            <TableHead className="text-right">Mang đi bán</TableHead>
            <TableHead className="text-right">Giá nhập</TableHead>
            <TableHead className="text-right">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product, idx) => (
            <TableRow key={product._id || product.id}>
              <TableCell>{(page - 1) * pageSize + idx + 1}</TableCell>
              <TableCell className="font-mono font-medium flex flex-wrap gap-1">{product.productIndex || product.code || product.productCode || '-'}</TableCell>
              <TableCell className="font-medium">{product.name}</TableCell>
              <TableCell className="font-medium">
                {getProductTags(product).length > 0 ? (
                  <div className="space-y-1">
                    {getProductTags(product).map((tag, i) => (
                      <div key={i} className="text-xs flex items-start">
                        <span className="mr-2 text-base leading-4" style={{lineHeight: '1.2'}}>•</span>
                        <span>{tag}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                  {product.quantity} {product.unit || 'cái'}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                  {product.usedInSaleProduct ?? 0} {product.unit || 'cái'}
                </span>
              </TableCell>
              <TableCell className="text-right">
                {product.importPrice != null ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-pointer text-lg font-bold">***</span>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      {formatCurrency(product.importPrice)}
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <span className="italic text-muted-foreground">Chưa có</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8">
                      <MoreHorizontalIcon />
                      <span className="sr-only">Mở menu</span>
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
    </TooltipProvider>
  );
};

export default ProductTable;
