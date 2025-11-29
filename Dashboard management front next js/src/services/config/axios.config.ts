import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";
import { CACHE_CONFIG } from "@/hooks/queryKeys";

const API_CONFIG = {
  BASE_URL: "http://127.0.0.1:8000/api",
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: CACHE_CONFIG.RETRY_ATTEMPTS,
  RETRY_DELAY: CACHE_CONFIG.RETRY_DELAY,
};

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token =
      localStorage.getItem("authToken") || localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    console.error("Request Error:", error.message);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    console.error(
      "Response Error:",
      error.response?.data || error.message
    );

    if (error.response) {
      switch (error.response.status) {
        case 401:
          console.error("Unauthorized - Invalid or expired token");
          localStorage.removeItem("authToken");
          localStorage.removeItem("token");
          break;

        case 403:
          console.error("Forbidden - No access permission");
          break;

        case 404:
          console.error("Not Found - Endpoint doesn't exist");
          break;

        case 500:
          console.error("Server Error");
          break;

        default:
          console.error(`Error ${error.response.status}`);
      }
    }

    return Promise.reject(error);
  }
);

export { API_CONFIG };
