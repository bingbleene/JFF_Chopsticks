import axios from "axios";
import { useAuthStore } from "@/stores/useAuthStore.js";

const BASE_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5001/api"
    : "/api";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true
});

api.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  }
);

api.interceptors.response.use((res) => res, async (error) => {
  const originalRequest = error.config;

  // những api không cần check
  if (originalRequest.url.includes('/signin') || originalRequest.url.includes('/refresh-token')) {
    return Promise.reject(error);
  }

  originalRequest._retryCount = originalRequest._retryCount || 0;

  if (error.response?.status === 403 && originalRequest._retryCount < 4) {
    originalRequest._retryCount += 1;
    console.log("refresh", originalRequest._retryCount);

    try {
      const res = await api.post ("/auth/refresh-token", {}, { withCredentials: true });
      const newAccessToken = res.data.accessToken;

      useAuthStore.getState().setAccessToken(newAccessToken);

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      useAuthStore.getState().clearState();
      return Promise.reject(refreshError);
    }
  }

  return Promise.reject(error);
});

export default api;