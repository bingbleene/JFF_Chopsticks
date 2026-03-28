import api from "@/lib/axios";

/**
 * Kiểm tra product có thể xóa không:
 * Nếu product này không nằm trong bất kỳ saleproduct nào thì cho xóa, ngược lại thì không cho xóa.
 * @param {string} productId
 * @returns {Promise<{canDelete: boolean, saleProductCount: number}>}
 */
export async function validateDeleteProduct(productId) {
	try {
		// Kiểm tra saleproduct
		const saleRes = await api.get(`/sale-products?productId=${productId}`);
		const saleProducts = saleRes.data?.saleProducts || [];
		if (saleProducts.length > 0) {
			return {
				canDelete: false,
				saleProductCount: saleProducts.length,
				importCount: 0,
				error: `Sản phẩm này đang được sử dụng trong ${saleProducts.length} sản phẩm bán. Không thể xóa.`
			};
		}
		// Kiểm tra import
		const importRes = await api.get(`/imports/product/${productId}`);
		const imports = importRes.data || [];
		if (imports.length > 0) {
			return {
				canDelete: false,
				saleProductCount: 0,
				importCount: imports.length,
				error: `Sản phẩm này đã từng có trong ${imports.length} phiếu nhập. Không thể xóa.`
			};
		}
		// Không bị ràng buộc
		return {
			canDelete: true,
			saleProductCount: 0,
			importCount: 0,
			error: ''
		};
	} catch (err) {
		// Nếu lỗi, không cho xóa để an toàn
		return {
			canDelete: false,
			saleProductCount: -1,
			importCount: -1,
			error: 'Không thể kiểm tra điều kiện xóa sản phẩm. Vui lòng thử lại.'
		};
	}
}
