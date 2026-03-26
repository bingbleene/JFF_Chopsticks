import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}


export function formatCurrency(value) {
  // dạng xxx.xxx VNĐ
  return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
}

export function validateRequired(value) {
  if (typeof value === "string") {
    return value.trim() !== "";
  }
  return value !== undefined && value !== null;
}

export function validateNumber(value) {
  return !isNaN(value) && isFinite(value);
}

// Tính tổng số lượng sản phẩm productId trong cart (bao gồm retail và combo)
export function getTotalProductInCart(cartItems, productId) {
  let total = 0;
  for (const item of cartItems) {
    if (item.saleType === 'retail') {
      if (item.saleItemId === productId) total += item.quantity;
    } else if (item.saleType === 'combo' && Array.isArray(item.items)) {
      for (const comboItem of item.items) {
        if (comboItem.productId === productId) {
          total += comboItem.quantity * item.quantity;
        }
      }
    }
  }
  return total;
}

// Kiểm tra tổng số lượng sản phẩm productId trong cart có vượt quá tồn kho không
export function validateProductStock(cartItems, productId, productsInStock) {
  const total = getTotalProductInCart(cartItems, productId);
  const stock = productsInStock[productId] || 0;
  return total <= stock;
}
