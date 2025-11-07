// lib/axios-client.ts
import axios from "axios";
import Cookies from "js-cookie";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL, // e.g. https://be-hiring-platform.vercel.app/api/v1
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// attach access token from cookie to Authorization header
API.interceptors.request.use((config) => {
  try {
    const token = Cookies.get("access_token");

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // ignore
  }
  config.withCredentials = true;
  return config;
});

// response interceptor: handle 401 -> try refresh
API.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    const isUnauthorized = error.response?.status === 401;
    const alreadyRetry = originalRequest._retry;

    if (isUnauthorized && !alreadyRetry) {
      originalRequest._retry = true;

      try {
        const refreshToken = Cookies.get("refresh_token");
        if (!refreshToken) {
          // no refresh token → redirect to signin
          if (typeof window !== "undefined") {
            Cookies.remove("access_token");
            Cookies.remove("refresh_token");
            window.location.href = "/signin";
          }
          return Promise.reject(error);
        }

        // call refresh API (send refresh token in body)
        const r = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh`,
          { refresh_token: refreshToken },
          { headers: { "x-skip-refresh": "1" } }
        );

        const newAccess = r.data?.access_token;
        const newRefresh = r.data?.refresh_token;

        // set cookies (use helper to set options)
        Cookies.set("access_token", newAccess, {
          secure: false,
          sameSite: "Lax",
          path: "/",
        });

        Cookies.set("refresh_token", newRefresh, {
          secure: false,
          sameSite: "Lax",
          path: "/",
        });

        // set header and retry original
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;

        return API(originalRequest);
      } catch (err) {
        // refresh failed -> clear and redirect
        if (typeof window !== "undefined") {
          Cookies.remove("access_token");
          Cookies.remove("refresh_token");
          window.location.href = "/signin";
        }
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default API;
