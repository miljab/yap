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
});

let csrfToken: string | null = null;

export const fetchCsrfToken = async () => {
  if (csrfToken) return;

  const res = await axiosInstance.get("/api/csrf-token");
  csrfToken = res.data.csrfToken;
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

axiosInstance.interceptors.request.use(addCsrfToken);
axiosPrivate.interceptors.request.use(addCsrfToken);
