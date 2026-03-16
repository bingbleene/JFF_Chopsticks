// Constants for pagination
export const visibleItemLimit = 10;

// API endpoints
export const API_ENDPOINTS = {
  PRODUCTS: '/products',
  SUPPLIERS: '/suppliers',
  IMPORT_ORDERS: '/import-orders',
  INVOICES: '/invoices',
};

// Product categories
export const PRODUCT_CATEGORIES = [
  { id: 1, name: 'Thực phẩm tươi sống' },
  { id: 2, name: 'Thực phẩm chế biến' },
  { id: 3, name: 'Thực phẩm khô' },
  { id: 4, name: 'Đồ điện tử' },
  { id: 5, name: 'Đồ gia dụng' },
];

// Order status
export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};
