
import React, { useState } from 'react';
import DeleteDialog from '@/components/DeleteDialog';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, MoreHorizontal as MoreHorizontalIcon } from 'lucide-react';
import { validateDeleteSaleProduct } from '@/utils/saleProductValidate';
// import CancelImportDialog from '@/features/import/CancelImportDialog';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import ListPagination from '../../../components/ListPagination';
import { Alert, AlertDescription } from '@/components/ui/alert';
import SearchBox from '@/components/SearchBox';
import LoadingItem from '@/components/LoadingItem';

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
  setSearchTerm = undefined,
  handleNext = () => {},
  handlePrev = () => {},
  handlePageChange = () => {},
  totalPages = 1,
}) => {
  const [confirmDialog, setConfirmDialog] = useState({ open: false, product: null });

  const [deleteDialog, setDeleteDialog] = useState({ open: false, product: null });
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
    setDeleteDialog({ open: true, product });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Quản lý sản phẩm bán</CardTitle>
          <CardDescription>Danh sách các sản phẩm đang được mang đi bán (bán lẻ hoặc combo)</CardDescription>
          <div className="mt-4">
            <SearchBox
              placeholder="Tìm kiếm sản phẩm bán"
              value={searchTerm}
              onChange={e => setSearchTerm && setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Table or Empty State */}
          {loading ? (
            <div className="py-12 flex justify-center"><LoadingItem /></div>
          ) : products.length === 0 ? (
            <Alert>
              <AlertDescription>Chưa có sản phẩm bán nào</AlertDescription>
            </Alert>
          ) : (
            <>
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
                              <DropdownMenuItem
                                onClick={() => handleAskDelete(product)}
                                variant="destructive"
                              >
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
              <ListPagination
                handleNext={handleNext}
                handlePrev={handlePrev}
                handlePageChange={handlePageChange}
                page={page}
                totalPages={totalPages}
              />
            </>
          )}
        </CardContent>
      </Card>
      <DeleteDialog
        open={deleteDialog.open}
        onOpenChange={open => setDeleteDialog({ open, product: open ? deleteDialog.product : null })}
        onConfirm={() => {
          if (deleteDialog.product) handleDeleteSaleProduct(deleteDialog.product);
          setDeleteDialog({ open: false, product: null });
        }}
        title="Xóa sản phẩm bán này?"
        description="Bạn có chắc chắn muốn xóa sản phẩm bán này không? Thao tác này không thể hoàn tác."
      />
    </>
  );
};

export default SaleProductTable;
