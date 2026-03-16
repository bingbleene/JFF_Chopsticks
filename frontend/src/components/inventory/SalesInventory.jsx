import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Edit2, Trash2, Search, Package } from 'lucide-react'
import api from '@/lib/axios'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/hooks'
import SaleProductForm from './SaleProductForm'

const SalesInventory = ({ availableTags = [], onAddTag = () => {} }) => {
  const [saleProducts, setSaleProducts] = useState([])
  const [products, setProducts] = useState([])
  const [filteredSaleProducts, setFilteredSaleProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formSaleType, setFormSaleType] = useState('retail')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [productsRes, saleProductsRes] = await Promise.all([
        api.get('/products'),
        api.get('/sale-products')
      ])

      const productsList = Array.isArray(productsRes.data) ? productsRes.data : (productsRes.data.products || [])
      const saleList = Array.isArray(saleProductsRes.data) ? saleProductsRes.data : (saleProductsRes.data.saleProducts || [])

      setProducts(productsList)
      setSaleProducts(saleList)
      setFilteredSaleProducts(saleList)
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu:', error)
      toast.error('Không thể kết nối tới server. Vui lòng kiểm tra API.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const filtered = saleProducts.filter(product =>
      product && product.name && product.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredSaleProducts(filtered)
  }, [searchTerm, saleProducts])

  // Lọc sản phẩm theo loại bán
  const retailProducts = filteredSaleProducts.filter(p => p.saleType === 'retail')
  const comboProducts = filteredSaleProducts.filter(p => p.saleType === 'combo')

  const handleAddSaleProduct = (newProduct) => {
    setSaleProducts(prev => [newProduct, ...prev])
    setIsFormOpen(false)
  }

  const handleUpdateSaleProduct = (updatedProduct) => {
    const updatedProductId = updatedProduct._id || updatedProduct.id
    setSaleProducts(prev => prev.map(p => {
      const pId = p._id || p.id
      return pId === updatedProductId ? updatedProduct : p
    }))
    setEditingProduct(null)
    setIsFormOpen(false)
  }

  const handleDeleteSaleProduct = async (product) => {
    if (!confirm('Bạn chắc chắn muốn xóa sản phẩm bán này?')) return

    const productId = product._id || product.id

    try {
      await api.delete(`/sale-products/${productId}`)
      setSaleProducts(prev => prev.filter(p => (p._id || p.id) !== productId))
      toast.success('Xóa sản phẩm bán thành công')
    } catch (error) {
      console.error('Lỗi khi xóa:', error)
      toast.error('Lỗi khi xóa sản phẩm')
    }
  }

  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setFormSaleType(product.saleType || 'retail')
    setIsFormOpen(true)
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingProduct(null)
  }

  const openAddForm = (type) => {
    setFormSaleType(type)
    setEditingProduct(null)
    setIsFormOpen(true)
  }

  // Lấy thông tin sản phẩm gốc từ items
  const getProductNames = (items) => {
    if (!items || items.length === 0) return 'Chưa có sản phẩm'
    return items.map(item => {
      const product = item.productId
      if (typeof product === 'object' && product !== null) {
        return `${product.name} (x${item.quantity})`
      }
      const found = products.find(p => (p._id === product || p.id === product))
      return found ? `${found.name} (x${item.quantity})` : `SP #${product} (x${item.quantity})`
    }).join(', ')
  }

  // Lấy tags của sản phẩm (hỗ trợ cả tags và tag)
  const getProductTags = (product) => {
    return product.tags || product.tag || []
  }

  return (
    <div className="space-y-8 mt-8">
      {/* Tất cả sản phẩm bán */}
      <Card>
        <CardHeader>
          <CardTitle>Quản lý sản phẩm bán</CardTitle>
          <CardDescription>Danh sách các sản phẩm đang được mang đi bán (bán lẻ hoặc combo)</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Search */}
          <div className="flex items-center gap-2 mb-4">
            <Search size={20} className="text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm sản phẩm bán..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>

          {/* Table */}
          {isLoading ? (
            <Alert>
              <AlertDescription>Đang tải dữ liệu...</AlertDescription>
            </Alert>
          ) : filteredSaleProducts.length === 0 ? (
            <Alert>
              <AlertDescription>
                {searchTerm ? 'Không tìm thấy sản phẩm' : 'Chưa có sản phẩm bán nào. Hãy thêm sản phẩm.'}
              </AlertDescription>
            </Alert>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên sản phẩm</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead>Sản phẩm gốc</TableHead>
                    <TableHead className="text-right">Số lượng</TableHead>
                    <TableHead className="text-right">Giá bán</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSaleProducts.map(product => (
                    <TableRow key={product._id || product.id}>
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
                          onClick={() => handleDeleteSaleProduct(product)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Summary */}
          {filteredSaleProducts.length > 0 && (
            <div className="border-t pt-4 mt-4 text-sm text-muted-foreground">
              <p>Bán lẻ: {retailProducts.length} | Combo: {comboProducts.length}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bán lẻ */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Bán lẻ</CardTitle>
              <CardDescription>Sản phẩm bán từng cái</CardDescription>
            </div>
            <Button className="gap-2" onClick={() => openAddForm('retail')}>
              <Plus size={20} />
              Thêm sản phẩm bán lẻ
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {retailProducts.length === 0 ? (
            <Alert>
              <AlertDescription>Chưa có sản phẩm bán lẻ nào.</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-2">
              {retailProducts.map(product => {
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
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditProduct(product)}>
                          <Edit2 size={16} />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteSaleProduct(product)}>
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bán combo */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Bán combo</CardTitle>
              <CardDescription>Kết hợp nhiều sản phẩm thành 1 combo</CardDescription>
            </div>
            <Button className="gap-2" onClick={() => openAddForm('combo')}>
              <Plus size={20} />
              Thêm combo
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {comboProducts.length === 0 ? (
            <Alert>
              <AlertDescription>Chưa có combo nào.</AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-2">
              {comboProducts.map(product => {
                const productTags = getProductTags(product)
                return (
                  <div key={product._id || product.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Package size={18} className="text-purple-600" />
                        <p className="font-semibold">{product.name}</p>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {getProductNames(product.items)}
                      </p>
                      <p className="text-sm font-medium text-purple-700 mt-1">
                        {formatCurrency(product.price)}
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
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditProduct(product)}>
                          <Edit2 size={16} />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteSaleProduct(product)}>
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl">
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
          <SaleProductForm
            saleProduct={editingProduct}
            saleType={editingProduct?.saleType || formSaleType}
            products={products}
            availableTags={availableTags}
            onAddTag={onAddTag}
            onSubmit={editingProduct ? handleUpdateSaleProduct : handleAddSaleProduct}
            onClose={handleFormClose}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default SalesInventory
