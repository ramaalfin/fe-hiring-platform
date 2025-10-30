// lib/axios-client.ts
import axios from "axios";

// --- axios utama untuk semua request user ---
const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true, // ⬅️ penting agar cookie HttpOnly dikirim & diterima
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- axios khusus untuk refresh token ---
const APIRefresh = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: true, // ⬅️ wajib juga
});

// --- Interceptor utama ---
API.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // Tambahan: jika request tidak punya config (kadang di network error)
    if (!originalRequest) return Promise.reject(error);

    // Hindari infinite loop refresh
    const skipRefresh = originalRequest.headers["x-skip-refresh"];
    const isUnauthorized = error.response?.status === 401;

    if (isUnauthorized && !skipRefresh && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Coba refresh token
        await APIRefresh.get("/auth/refresh", {
          headers: {
            "x-skip-refresh": "1", // hindari trigger infinite refresh
          },
        });

        // Jika refresh berhasil, ulang request awal
        return API(originalRequest);
      } catch (err) {
        // Jika refresh gagal, redirect ke halaman login
        if (typeof window !== "undefined") {
          window.location.href = "/";
        }
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default API;
