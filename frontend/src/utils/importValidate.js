import api from '@/lib/axios';

/**
 * Kiểm tra có thể hủy phiếu nhập không dựa trên tồn kho thực tế của từng sản phẩm.
 * @param {Array} items - Danh sách sản phẩm trong phiếu nhập (mỗi item có importItemId và quantity)
 * @returns {Promise<{ok: boolean, message?: string}>}
 */
export async function validateCancelImport(items) {
  // Lấy thông tin từng sản phẩm
  try {
    for (const item of items) {
      // Lấy id sản phẩm (importItemId có thể là object hoặc id)
      const productId = typeof item.importItemId === 'object' && item.importItemId?._id
        ? item.importItemId._id
        : item.importItemId;
      if (!productId) continue;
      // Gọi API lấy chi tiết sản phẩm kèm usedInSaleProduct
      const res = await api.get(`/products/${productId}/with-import`);
      const product = res.data;
      // Nếu không có thông tin tồn kho thì bỏ qua
      if (!product || typeof product.quantity !== 'number' || typeof product.usedInSaleProduct !== 'number') continue;
      // Kiểm tra điều kiện: Sau khi hủy, tồn kho còn lại phải >= usedInSaleProduct
      const afterCancel = product.quantity - item.quantity;
      if (afterCancel < product.usedInSaleProduct) {
        return {
          ok: false,
          message: `Không thể hủy phiếu nhập: Sản phẩm "${product.name}" đã được sử dụng cho bán hàng (${product.usedInSaleProduct}), không đủ tồn kho để hủy số lượng ${item.quantity}.`
        };
      }
    }
    return { ok: true };
  } catch (error) {
    return { ok: false, message: 'Lỗi kiểm tra tồn kho sản phẩm. Vui lòng thử lại.' };
  }
}
