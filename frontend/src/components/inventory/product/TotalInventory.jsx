import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
// ...existing imports...
import ProductTable from './ProductTable'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, Edit2, Trash2, Search } from 'lucide-react'
import api from '@/lib/axios'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/hooks'
import ProductForm from './ProductForm'
import ListPagination from '../../ListPagination'

const TotalInventory = ({ onInventoryChanged = () => {}, reloadInventory = 0 }) => {
    const [allTags, setAllTags] = useState([])
    const [loadingTags, setLoadingTags] = useState(false)
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

  // Fetch all tags from API
  useEffect(() => {
    setLoadingTags(true)
    api.get('/tags')
      .then(res => setAllTags(res.data))
      .catch(() => toast.error('Không thể tải danh sách tag'))
      .finally(() => setLoadingTags(false))
  }, [])

  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      const res = await api.get('/products/with-import')
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
  const totalValue = filteredProducts.reduce((sum, p) => sum + ((p.importPrice || 0) * p.quantity), 0)

  // Lấy tên tag từ id hoặc object
  const getProductTags = (product) => {
    let tagIds = [];
    if (Array.isArray(product.tags)) tagIds = product.tags;
    else if (product.tags) tagIds = [product.tags];
    return tagIds.map(tagId => {
      if (typeof tagId === 'object' && tagId !== null && tagId.name) return tagId.name;
      const found = allTags.find(t => t._id === tagId);
      return found ? found.name : tagId;
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle>Danh sách hàng hóa tổng</CardTitle>
              <CardDescription>Quản lý tất cả sản phẩm trong kho (chưa đặt giá bán)</CardDescription>
            </div>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus size={20} />
                  Thêm sản phẩm
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingProduct ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingProduct ? 'Chỉnh sửa thông tin sản phẩm' : 'Nhập thông tin sản phẩm mới'}
                  </DialogDescription>
                </DialogHeader>
                <ProductForm
                  product={editingProduct}
                  allProducts={products}
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
                {searchTerm ? 'Không tìm thấy sản phẩm' : 'Chưa có sản phẩm nào. Hãy thêm sản phẩm mới.'}
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <ProductTable
                products={visibleProducts}
                page={page}
                pageSize={pageSize}
                getProductTags={getProductTags}
                handleEditProduct={handleEditProduct}
                handleDeleteProduct={handleDeleteProduct}
              />
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
                Tổng {products.length} sản phẩm
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default TotalInventory
