export function cartValidate(cartItems, saleProducts) {
  for (const item of cartItems) {
    const saleProduct = saleProducts.find(p => (p._id || p.id) === item.saleItemId);
    if (!saleProduct) return { valid: false, message: `Không tìm thấy sản phẩm bán: ${item.name}` };
    if (item.quantity > saleProduct.quantity) {
      return { valid: false, message: `Số lượng sản phẩm "${item.name}" vượt quá số lượng còn lại để bán!` };
    }
  }
  return { valid: true };
}
