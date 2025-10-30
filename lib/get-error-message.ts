// lib/getErrorMessage.ts
// Utility to normalize error messages coming from axios / network errors

export function getErrorMessage(error: any, fallback = "Terjadi kesalahan. Silakan coba lagi.") {
    if (!error) return fallback;

    // Axios HTTP response with body { message: "..." }
    if (error.response?.data?.message) return String(error.response.data.message);

    // Some backends put message at error.response.data.error
    if (error.response?.data?.error) return String(error.response.data.error);

    // axios error message or JS Error
    if (error.message) return String(error.message);

    return fallback;
}