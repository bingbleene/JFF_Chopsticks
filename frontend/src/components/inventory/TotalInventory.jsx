import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, Edit2, Trash2, Search } from 'lucide-react'
import api from '@/lib/axios'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/hooks'
import ProductForm from './ProductForm'
import ListPagination from '../ListPagination'

const TotalInventory = ({ availableTags = [], onAddTag = () => {}, onInventoryChanged = () => {}, reloadInventory = 0 }) => {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  // Pagination state
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchProducts()
  }, [reloadInventory])

  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      const res = await api.get('/products')
      const productsList = Array.isArray(res.data) ? res.data : (res.data.products || [])
      setProducts(productsList)
      setFilteredProducts(productsList)
    } catch (error) {
      console.error('Loi khi lay danh sach san pham:', error)
      toast.error('Khong the ket noi toi server. Vui long kiem tra API.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const filtered = products.filter(product =>
      product && product.name && product.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredProducts(filtered)
    setPage(1); // Reset page khi filter
  }, [searchTerm, products])

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const visibleProducts = filteredProducts.slice((page - 1) * pageSize, page * pageSize);

  const handleNext = () => {
    if (page < totalPages) setPage(prev => prev + 1);
  };
  const handlePrev = () => {
    if (page > 1) setPage(prev => prev - 1);
  };
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleAddProduct = (newProduct) => {
    setProducts(prev => [newProduct, ...prev])
    setIsFormOpen(false)
    onInventoryChanged()
  }

  const handleUpdateProduct = (updatedProduct) => {
    const updatedProductId = updatedProduct._id || updatedProduct.id
    setProducts(prev => prev.map(p => {
      const pId = p._id || p.id
      return pId === updatedProductId ? updatedProduct : p
    }))
    setEditingProduct(null)
    setIsFormOpen(false)
    onInventoryChanged()
  }

  const handleDeleteProduct = async (product) => {
    if (!confirm('Ban chac chan muon xoa san pham nay?')) return

    const productId = product._id || product.id

    try {
      await api.delete(`/products/${productId}`)
      setProducts(prev => prev.filter(p => (p._id || p.id) !== productId))
      toast.success('Xoa san pham thanh cong')
      onInventoryChanged()
    } catch (error) {
      console.error('Loi khi xoa san pham:', error)
      toast.error('Loi khi xoa san pham')
    }
  }

  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setIsFormOpen(true)
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingProduct(null)
  }

  // Tinh tong gia tri ton kho
  const totalValue = filteredProducts.reduce((sum, p) => sum + (p.importPrice * p.quantity), 0)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle>Danh sach hang hoa tong</CardTitle>
              <CardDescription>Quan ly tat ca san pham trong kho (chua dat gia ban)</CardDescription>
            </div>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus size={20} />
                  Them san pham
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingProduct ? 'Cap nhat san pham' : 'Them san pham moi'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingProduct ? 'Chinh sua thong tin san pham' : 'Nhap thong tin san pham moi'}
                  </DialogDescription>
                </DialogHeader>
                <ProductForm
                  product={editingProduct}
                  allProducts={products}
                  availableTags={availableTags}
                  onAddTag={onAddTag}
                  onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}
                  onClose={handleFormClose}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Search */}
          <div className="flex items-center gap-2 mb-4">
            <Search size={20} className="text-muted-foreground" />
            <Input
              placeholder="Tim kiem san pham..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>

          {/* Table */}
          {isLoading ? (
            <Alert>
              <AlertDescription>Dang tai du lieu...</AlertDescription>
            </Alert>
          ) : filteredProducts.length === 0 ? (
            <Alert>
              <AlertDescription>
                {searchTerm ? 'Khong tim thay san pham' : 'Chua co san pham nao. Hay them san pham moi.'}
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>STT</TableHead>
                      <TableHead>Ten san pham</TableHead>
                      <TableHead>Tag</TableHead>
                      <TableHead className="text-right">So luong</TableHead>
                      <TableHead className="text-right">Gia nhap</TableHead>
                      <TableHead className="text-right">Hanh dong</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleProducts.map((product, idx) => (
                      <TableRow key={product._id || product.id}>
                        <TableCell>{(page - 1) * pageSize + idx + 1}</TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {product.tags && product.tags.length > 0 ? (
                              product.tags.map((tag, i) => (
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
                            {product.quantity} {product.unit || 'cai'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(product.importPrice)}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditProduct(product)}
                          >
                            <Edit2 size={16} />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteProduct(product)}
                          >
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
            </>
          )}

          {/* Summary */}
          {filteredProducts.length > 0 && (
            <div className="border-t pt-4 mt-4 flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Hien thi {filteredProducts.length} / {products.length} san pham
              </p>
              {/* <p className="text-sm font-medium">
                Tong gia tri ton kho: {formatCurrency(totalValue)}
              </p> */}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default TotalInventory
