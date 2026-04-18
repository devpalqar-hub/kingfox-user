import axios from "axios";

// Flag to prevent multiple 401 handlers from triggering
let isHandlingAuthError = false;

// Create axios instance
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

// 👉 Request Interceptor (attach token automatically)
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// 👉 Response Interceptor (handle 401 globally)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const skipAuth = error.config?.headers?.["Skip-Auth-Error"];

    if (
      error.response?.status === 401 &&
      !isHandlingAuthError &&
      !skipAuth // ✅ ADD THIS CONDITION
    ) {
      isHandlingAuthError = true;

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("openLoginModal"));
      }

      setTimeout(() => {
        isHandlingAuthError = false;
      }, 1000);
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
