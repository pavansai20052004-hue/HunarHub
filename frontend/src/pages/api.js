import axios from "axios";
import { clearSession, getToken } from "../utils/session";

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, "");

const api = axios.create({
  // Production uses the Vercel rewrite, avoiding stale API URLs in dashboard settings.
  baseURL: import.meta.env.PROD ? "/api" : configuredApiUrl || "/api",
  // Free hosting can need more than 50 seconds to wake up after inactivity.
  timeout: 65000,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => {
    if (typeof response.data === "string") {
      return Promise.reject(new Error("The API returned a webpage. Check the API deployment configuration."));
    }
    return response;
  },
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
