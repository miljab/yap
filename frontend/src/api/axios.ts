import axios, { type InternalAxiosRequestConfig } from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

export default axiosInstance;

export const axiosPrivate = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
  timeout: 10000,
});

let csrfToken: string | null = null;
let accessToken: string | null = null;
let refreshCallback: (() => Promise<string>) | null = null;

export const fetchCsrfToken = async () => {
  if (csrfToken) return;

  const res = await axiosInstance.get("/api/csrf-token");
  csrfToken = res.data.csrfToken;
};

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const setRefreshCallback = (fn: (() => Promise<string>) | null) => {
  refreshCallback = fn;
};

const addCsrfToken = (config: InternalAxiosRequestConfig) => {
  const isStateChanging = ["post", "put", "delete", "patch"].includes(
    config.method?.toLowerCase() ?? "",
  );

  if (isStateChanging && csrfToken) {
    config.headers["X-CSRF-Token"] = csrfToken;
  }

  return config;
};

const addAuthHeader = (config: InternalAxiosRequestConfig) => {
  if (accessToken && !config.headers["Authorization"]) {
    config.headers["Authorization"] = `Bearer ${accessToken}`;
  }
  return config;
};

axiosInstance.interceptors.request.use(addCsrfToken);

axiosPrivate.interceptors.request.use(addAuthHeader);
axiosPrivate.interceptors.request.use(addCsrfToken);

axiosPrivate.interceptors.response.use(
  (response) => response,
  async (error) => {
    const prevRequest = error.config;
    if (error.response?.status === 403 && !prevRequest._retry) {
      prevRequest._retry = true;
      if (refreshCallback) {
        const newAccessToken = await refreshCallback();
        prevRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return axiosPrivate(prevRequest);
      }
    }
    return Promise.reject(error);
  },
);
