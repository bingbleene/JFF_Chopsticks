// Tham chiếu dữ liệu dùng chung cho frontend

// Các phương thức thanh toán cho hóa đơn
import { Banknote, CreditCard, Smartphone } from 'lucide-react';
export const paymentMethods = [
  { value: 'tien mat', label: 'Tiền mặt', icon: Banknote },
  { value: 'ngan hang', label: 'Ngân hàng', icon: CreditCard },
  { value: 'momo', label: 'Ví MoMo', icon: Smartphone },
];

export function getPaymentMethodLabel(method) {
  const found = paymentMethods.find(m => m.value === method);
  return found ? found.label : method;
}

// Các trạng thái hóa đơn
export const invoiceStatus = [
  { value: 'pending', label: 'Chờ xử lý' },
  { value: 'paid', label: 'Đã thanh toán' },
  { value: 'cancelled', label: 'Đã hủy' },
];

export function getInvoiceStatusLabel(status) {
  const found = invoiceStatus.find(s => s.value === status);
  return found ? found.label : status;
}

// Các loại sản phẩm
export const productTypes = [
  { value: 'retail', label: 'Bán lẻ' },
  { value: 'combo', label: 'Combo' },
];

export function getProductTypeLabel(type) {
  const found = productTypes.find(t => t.value === type);
  return found ? found.label : type;
}

// Thêm các tham chiếu khác tại đây nếu cần
