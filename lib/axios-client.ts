// lib/axios-client.ts
import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";
import { ApiErrorResponse } from "@/types/api";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 30000, // Increased to 30 seconds for slow operations (email sending, etc.)
  headers: {
    "Content-Type": "application/json",
  },
});

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

API.interceptors.response.use(
  (res) => {
    console.log("📥 Response interceptor:", {
      url: res.config.url,
      status: res.status,
      hasSkipHeader: !!res.config.headers?.['x-skip-interceptor'],
      data: res.data,
    });

    // Even if skip-interceptor is set, we still need to handle error responses
    // Check if response follows new standardized format
    if (res.data && typeof res.data.success !== "undefined") {
      if (!res.data.success) {
        // Handle API error response (success: false)
        console.error("❌ API Error Response (success: false):", res.data);
        const errorData = res.data as ApiErrorResponse;
        const error: any = new Error(errorData.error.message);
        error.code = errorData.error.code;
        error.field = errorData.error.field;
        error.details = errorData.error.details;
        error.response = res;
        error.status = res.status;
        return Promise.reject(error);
      }
      // success: true - pass through
      console.log("✅ Success response (success: true):", res.data);
      return res;
    }

    // For backward compatibility: if response has no 'success' field,
    // it's likely an old format response, allow it through
    console.log("⚠️ Old format response (no success field):", res.data);
    return res;
  },
  async (error: AxiosError) => {
    const originalRequest: any = error.config;
    if (!originalRequest) return Promise.reject(error);

    console.error("🔴 Error interceptor triggered:", {
      url: originalRequest.url,
      status: error.response?.status,
      hasSkipRefresh: !!originalRequest.headers?.['x-skip-refresh'],
    });

    const isUnauthorized = error.response?.status === 401;
    const alreadyRetry = originalRequest._retry;
    const skipRefresh = originalRequest.headers?.['x-skip-refresh'];

    // Handle rate limiting
    if (error.response?.status === 429) {
      const errorData = error.response.data as ApiErrorResponse;
      if (errorData?.error?.code === "RATE_LIMIT_EXCEEDED") {
        // Show user-friendly rate limit message
        console.warn("Rate limit exceeded. Please try again later.");
      }
      return Promise.reject(error);
    }

    // Don't attempt token refresh for:
    // 1. Endpoints with x-skip-refresh header (magic link, logout, etc.)
    // 2. Already retried requests
    // 3. Non-401 errors
    if (isUnauthorized && !alreadyRetry && !skipRefresh) {
      originalRequest._retry = true;

      try {
        const refreshToken = Cookies.get("refresh_token");
        if (!refreshToken) {
          // no refresh token → redirect to signin
          console.warn("No refresh token found, redirecting to /");
          if (typeof window !== "undefined") {
            Cookies.remove("access_token");
            Cookies.remove("refresh_token");
            window.location.href = "/";
          }
          return Promise.reject(error);
        }

        console.log("🔄 Attempting token refresh...");
        // call refresh API (send refresh token in body)
        const r = await axios.post(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/refresh`,
          { refresh_token: refreshToken },
          { headers: { "x-skip-refresh": "1" } }
        );

        const newAccess = r.data?.access_token;
        const newRefresh = r.data?.refresh_token;

        console.log("✅ Token refresh successful");
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
        console.error("❌ Token refresh failed:", err);
        if (typeof window !== "undefined") {
          Cookies.remove("access_token");
          Cookies.remove("refresh_token");
          window.location.href = "/";
        }
        return Promise.reject(err);
      }
    }

    // For magic link endpoints or other errors, just reject without refresh attempt
    console.log("⏭️ Skipping token refresh, rejecting error");
    return Promise.reject(error);
  }
);

export default API;
