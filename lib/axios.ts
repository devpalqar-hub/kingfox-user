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
    // Handle 401 Unauthorized - token expired or invalid
    if (error.response?.status === 401 && !isHandlingAuthError) {
      isHandlingAuthError = true;

      // Clear auth data from localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Dispatch global event to trigger login modal
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("openLoginModal"));
      }

      // Reset flag after delay to allow subsequent 401 errors to be handled
      setTimeout(() => {
        isHandlingAuthError = false;
      }, 1000);
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
