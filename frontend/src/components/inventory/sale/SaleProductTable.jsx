import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2 } from 'lucide-react';
import ListPagination from '../../ListPagination';

const SaleProductTable = ({
  products = [],
  page = 1,
  pageSize = 10,
  getProductNames = () => '',
  handleEditProduct = () => {},
  handleDeleteSaleProduct = () => {},
  formatCurrency = v => v,
  productsList = [],
  loading = false,
  searchTerm = '',
  handleNext = () => {},
  handlePrev = () => {},
  handlePageChange = () => {},
  totalPages = 1,
}) => (
  <Card>
    <CardHeader>
      <CardTitle>Quản lý sản phẩm bán</CardTitle>
      <CardDescription>Danh sách các sản phẩm đang được mang đi bán (bán lẻ hoặc combo)</CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>STT</TableHead>
              <TableHead>Tên sản phẩm</TableHead>
              <TableHead>Loại</TableHead>
              <TableHead>Sản phẩm gốc</TableHead>
              <TableHead className="text-right">Số lượng</TableHead>
              <TableHead className="text-right">Giá bán</TableHead>
              <TableHead className="text-right">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product, idx) => (
              <TableRow key={product._id || product.id}>
                <TableCell>{(page - 1) * pageSize + idx + 1}</TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>
                  <Badge variant={product.saleType === 'retail' ? 'default' : 'secondary'} className="text-xs">
                    {product.saleType === 'retail' ? 'Bán lẻ' : 'Combo'}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                  {getProductNames(product.items)}
                </TableCell>
                <TableCell className="text-right">
                  <span className={`px-2 py-1 rounded text-xs ${product.saleType === 'retail' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                    {product.quantity}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(product.price)}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button size="sm" variant="outline" onClick={() => handleEditProduct(product)}>
                    <Edit2 size={16} />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => handleDeleteSaleProduct(product)}>
                    <Trash2 size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <ListPagination
        handleNext={handleNext}
        handlePrev={handlePrev}
        handlePageChange={handlePageChange}
        page={page}
        totalPages={totalPages}
      />
    </CardContent>
  </Card>
);

export default SaleProductTable;
