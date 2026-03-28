import api from '@/lib/axios'
import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { formatCurrency } from '@/utils/utils';
import { toast } from 'sonner'
import SaleProductForm from './SaleProductForm'
import SaleProductTable from './SaleProductTable';
import RetailProductList from './RetailProductList';
import ComboProductList from './ComboProductList';
import DeleteDialog from '@/components/DeleteDialog';

const SalesInventory = ({ onInventoryChanged = () => {}, reloadInventory = 0 }) => {
  const [allTags, setAllTags] = useState([])
  const [loadingTags, setLoadingTags] = useState(false)
  const [saleProducts, setSaleProducts] = useState([])
  const [products, setProducts] = useState([])
  const [filteredSaleProducts, setFilteredSaleProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formSaleType, setFormSaleType] = useState('retail')
  // Pagination state
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // State cho dialog xác nhận xóa sale product (bán lẻ/combo)
  const [deleteDialog, setDeleteDialog] = useState({ open: false, product: null });

  useEffect(() => {
    fetchData()
  }, [reloadInventory])

  // Fetch all tags from API
  useEffect(() => {
    setLoadingTags(true)
    api.get('/tags')
      .then(res => setAllTags(res.data))
      .catch(() => toast.error('Không thể tải danh sách tag'))
      .finally(() => setLoadingTags(false))
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      // Sử dụng API mới trả về đầy đủ importPrice và usedInSaleProduct
      const [productsRes, saleProductsRes] = await Promise.all([
        api.get('/products/with-import'),
        api.get('/sale-products')
      ])

      // API mới trả về mảng products trực tiếp
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
    setPage(1); // Reset page khi filter
  }, [searchTerm, saleProducts])

  // Pagination logic
  const totalPages = Math.ceil(filteredSaleProducts.length / pageSize) || 1;
  const visibleSaleProducts = filteredSaleProducts.slice((page - 1) * pageSize, page * pageSize);

  const handleNext = () => {
    if (page < totalPages) setPage(prev => prev + 1);
  };
  const handlePrev = () => {
    if (page > 1) setPage(prev => prev - 1);
  };
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  // Lọc sản phẩm theo loại bán
  const retailProducts = filteredSaleProducts.filter(p => p.saleType === 'retail')
  const comboProducts = filteredSaleProducts.filter(p => p.saleType === 'combo')

  const handleAddSaleProduct = (newProduct) => {
    setSaleProducts(prev => [newProduct, ...prev])
    setIsFormOpen(false)
    onInventoryChanged()
  }

  const handleUpdateSaleProduct = (updatedProduct) => {
    const updatedProductId = updatedProduct._id || updatedProduct.id
    setSaleProducts(prev => prev.map(p => {
      const pId = p._id || p.id
      return pId === updatedProductId ? updatedProduct : p
    }))
    setEditingProduct(null)
    setIsFormOpen(false)
    onInventoryChanged()
  }

  // Hàm gọi API xóa sale product (bán lẻ/combo)
  const handleDeleteSaleProduct = async (product) => {
    const productId = product._id || product.id
    try {
      await api.delete(`/sale-products/${productId}`)
      setSaleProducts(prev => prev.filter(p => (p._id || p.id) !== productId))
      toast.success('Xóa sản phẩm bán thành công')
      onInventoryChanged()
    } catch (error) {
      console.error('Lỗi khi xóa:', error)
      toast.error('Lỗi khi xóa sản phẩm')
    }
  }

  // Hàm mở dialog xác nhận xóa
  const askDeleteSaleProduct = (product) => {
    setDeleteDialog({ open: true, product });
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

  // Lấy tags của sản phẩm (hiển thị tên tag)
  const getProductTags = (product) => {
    return product.tag?.name ? [product.tag.name] : []
  }

  return (

    <div className="space-y-8 mt-8">
        <>
          {/* Tất cả sản phẩm bán */}
          {/* Tổng sản phẩm bán */}
          <SaleProductTable
            products={visibleSaleProducts}
            page={page}
            pageSize={pageSize}
            getProductNames={getProductNames}
            handleEditProduct={handleEditProduct}
            handleDeleteSaleProduct={handleDeleteSaleProduct}
            formatCurrency={formatCurrency}
            productsList={products}
            loading={isLoading}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            handleNext={handleNext}
            handlePrev={handlePrev}
            handlePageChange={handlePageChange}
            totalPages={totalPages}
          />

          {/* Bán lẻ và Bán combo cạnh nhau */}
          <div className="flex gap-6">
            <div className="flex-1">
              <RetailProductList
                products={retailProducts}
                getProductNames={getProductNames}
                getProductTags={getProductTags}
                formatCurrency={formatCurrency}
                handleEditProduct={handleEditProduct}
                handleDeleteSaleProduct={askDeleteSaleProduct}
                openAddForm={openAddForm}
                loading={isLoading}
              />
            </div>
            <div className="flex-1">
              <ComboProductList
                  products={comboProducts}
                  getProductNames={getProductNames}
                  getProductTags={getProductTags}
                  formatCurrency={formatCurrency}
                  handleEditProduct={handleEditProduct}
                  handleDeleteSaleProduct={askDeleteSaleProduct}
                  openAddForm={openAddForm}
                  loading={isLoading}
                />
                  {/* Dialog xác nhận xóa sale product (bán lẻ/combo) */}
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
            </div>
          </div>
        </>

      {/* Form Dialog */}
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
          <SaleProductForm
            saleProduct={editingProduct}
            saleType={editingProduct?.saleType || formSaleType}
            products={products}
            allSaleProducts={saleProducts}
            onSubmit={editingProduct ? handleUpdateSaleProduct : handleAddSaleProduct}
            onClose={handleFormClose}
            reloadProducts={fetchData}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default SalesInventory
