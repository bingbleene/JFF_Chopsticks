import { toast } from 'sonner';

// Error handler utility
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;

    if (status === 401) {
      toast.error('Vui lòng đăng nhập lại');
      // Redirect to login if needed
    } else if (status === 403) {
      toast.error('Bạn không có quyền truy cập');
    } else if (status === 404) {
      toast.error('Không tìm thấy dữ liệu');
    } else if (status >= 500) {
      toast.error('Lỗi máy chủ, vui lòng thử lại sau');
    } else {
      toast.error(data?.message || 'Đã xảy ra lỗi');
    }
  } else if (error.request) {
    toast.error('Không thể kết nối đến máy chủ');
  } else {
    toast.error('Đã xảy ra lỗi: ' + error.message);
  }
};

// Validation helpers
export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePhone = (phone) => {
  const regex = /^[0-9]{10,11}$/;
  return regex.test(phone.replace(/\D/g, ''));
};

export const validateRequired = (value) => {
  return value && value.trim() !== '';
};

export const validateMinLength = (value, min) => {
  return value && value.length >= min;
};

export const validateMaxLength = (value, max) => {
  return value && value.length <= max;
};

export const validateNumber = (value) => {
  return !isNaN(parseFloat(value)) && isFinite(value);
};

// Debounce helper
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Search/Filter helper
export const filterArray = (array, searchTerm, keys = []) => {
  if (!searchTerm) return array;

  return array.filter(item =>
    keys.some(key =>
      String(item[key]).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
};

// Sort helper
export const sortArray = (array, key, order = 'asc') => {
  return [...array].sort((a, b) => {
    if (a[key] < b[key]) return order === 'asc' ? -1 : 1;
    if (a[key] > b[key]) return order === 'asc' ? 1 : -1;
    return 0;
  });
};
