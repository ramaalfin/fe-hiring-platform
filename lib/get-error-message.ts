// lib/getErrorMessage.ts
import { ApiErrorResponse, ErrorCode } from "@/types/api";

/**
 * Utility to normalize error messages from API responses
 * Handles both old and new response formats
 */
export function getErrorMessage(
    error: any,
    fallback = "Terjadi kesalahan. Silakan coba lagi."
): string {
    if (!error) return fallback;

    // New standardized format: { success: false, error: { code, message } }
    if (error.response?.data?.success === false) {
        const errorData = error.response.data as ApiErrorResponse;

        // Handle specific error codes with user-friendly messages
        switch (errorData.error.code) {
            case ErrorCode.RATE_LIMIT_EXCEEDED:
                return "Terlalu banyak percobaan. Silakan coba lagi nanti.";
            case ErrorCode.UNAUTHORIZED:
                return "Sesi Anda telah berakhir. Silakan login kembali.";
            case ErrorCode.FORBIDDEN:
                return "Anda tidak memiliki akses untuk melakukan ini.";
            case ErrorCode.NOT_FOUND:
                return "Data tidak ditemukan.";
            case ErrorCode.CONFLICT:
                return errorData.error.message || "Data sudah ada.";
            case ErrorCode.VALIDATION_ERROR:
                return errorData.error.message || "Data tidak valid.";
            default:
                return errorData.error.message;
        }
    }

    // Old format: { message: "..." }
    if (error.response?.data?.message) {
        return String(error.response.data.message);
    }

    // Some backends put message at error.response.data.error
    if (error.response?.data?.error) {
        return String(error.response.data.error);
    }

    // Direct error from interceptor (already processed)
    if (error.code && error.message) {
        return error.message;
    }

    // axios error message or JS Error
    if (error.message) {
        return String(error.message);
    }

    return fallback;
}

/**
 * Get error code from error object
 */
export function getErrorCode(error: any): string | undefined {
    if (error.response?.data?.success === false) {
        return error.response.data.error.code;
    }
    if (error.code) {
        return error.code;
    }
    return undefined;
}

/**
 * Get error field from validation errors
 */
export function getErrorField(error: any): string | undefined {
    if (error.response?.data?.success === false) {
        return error.response.data.error.field;
    }
    if (error.field) {
        return error.field;
    }
    return undefined;
}