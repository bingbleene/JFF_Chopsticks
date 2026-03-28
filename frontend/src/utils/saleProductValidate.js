
import api from "@/lib/axios";


/**
 * Kiểm tra saleProduct có thể xóa không:
 * Nếu saleProduct này có trong ít nhất 1 hóa đơn thì không cho xóa, ngược lại thì cho xóa.
 * @param {string} saleProductId
 * @returns {Promise<{canDelete: boolean, invoiceCount: number}>}
 */
export async function validateDeleteSaleProduct(saleProductId) {
  try {
    // Gọi API lấy danh sách hóa đơn có chứa saleProduct này
    const res = await api.get(`/invoices?saleProductId=${saleProductId}`);
    // Giả sử API trả về mảng invoices
    const invoices = res.data?.invoices || res.data || [];
    return {
      canDelete: invoices.length === 0,
      invoiceCount: invoices.length
    };
  } catch (err) {
    // Nếu lỗi, không cho xóa để an toàn
    return {
      canDelete: false,
      invoiceCount: -1
    };
  }
}

// Hàm tính tổng số lượng còn lại của sản phẩm gốc, loại trừ lượng đã bán của saleProduct đang sửa (nếu có)
export function getAvailableStockForProduct(productId, products, editingSaleProduct = null) {
  const product = products.find(p => p._id === productId || p.id === productId);
  if (!product) return 0;
  const stock = Number(product.quantity) || 0;
  let used = Number(product.usedInSaleProduct) || 0;
  // Nếu đang sửa, loại trừ lượng đã bán của bản ghi đang sửa (nếu có)
  if (editingSaleProduct) {
    // retail: chỉ có 1 sản phẩm gốc
    if (editingSaleProduct.saleType === 'retail') {
      if (
        editingSaleProduct.productId === productId ||
        editingSaleProduct.saleItemId === productId ||
        (editingSaleProduct.items && editingSaleProduct.items[0] && (editingSaleProduct.items[0].productId === productId || editingSaleProduct.items[0].productId?._id === productId))
      ) {
        used -= Number(editingSaleProduct.quantity) || 0;
      }
    }
    // combo: có thể có nhiều sản phẩm gốc
    if (editingSaleProduct.saleType === 'combo' && Array.isArray(editingSaleProduct.items)) {
      editingSaleProduct.items.forEach(item => {
        if (item.productId === productId || item.productId?._id === productId) {
          used -= (Number(item.quantity) || 0) * (Number(editingSaleProduct.quantity) || 0);
        }
      });
    }
  }
  return stock - used;
}

// Hàm kiểm tra hợp lệ khi nhập saleProduct (tổng số lượng bán mới + đã bán phải <= tồn kho)
export function isValidSaleQuantity(totalToSell, productId, products, editingSaleProduct = null) {
  const available = getAvailableStockForProduct(productId, products, editingSaleProduct);
  return totalToSell <= available;
}
