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

