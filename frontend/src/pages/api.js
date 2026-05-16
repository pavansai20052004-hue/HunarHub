import axios from "axios";
import { clearSession, getToken } from "../utils/session";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && !error.config?.url?.startsWith("/auth")) {
      clearSession();
      window.location.assign("/login");
    }

    if (error.code === "ECONNABORTED") {
      error.userMessage = "The server took too long to respond. Please try again.";
    } else if (!error.response) {
      error.userMessage = "Unable to reach the server. Check your connection and try again.";
    }

    return Promise.reject(error);
  }
);

export default api;
