"use client";

import { useEffect, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { verifyMagicLoginMutationFn } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import Cookies from "js-cookie";

function MagicLoginVerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const hasExecuted = useRef(false);

  const { mutate, isPending } = useMutation({
    mutationFn: verifyMagicLoginMutationFn,
    onSuccess: (apiResponse) => {
      console.log("🎉 Magic login SUCCESS - API Response:", apiResponse);
      
      // apiResponse is now directly from backend: { success: true, message: "...", data: { user, access_token, refresh_token } }
      if (!apiResponse || !apiResponse.success) {
        console.error("❌ Unexpected response format:", apiResponse);
        throw new Error("Invalid response format");
      }

      const { user, access_token, refresh_token } = apiResponse.data;
      console.log("🎉 Extracted data:", { user, access_token, refresh_token });

      if (access_token) {
        Cookies.set("access_token", access_token, { path: "/" });
        console.log("✅ Access token set");
      }
      if (refresh_token) {
        Cookies.set("refresh_token", refresh_token, { path: "/" });
        console.log("✅ Refresh token set");
      }

      toast({
        title: "Login Berhasil",
        description: `Selamat datang kembali, ${user?.fullName || "User"}!`,
      });

      const redirectUrl = user?.role === "ADMIN" ? "/admin/home" : "/home";
      console.log("🚀 Redirecting to:", redirectUrl);
      
      setTimeout(() => {
        router.replace(redirectUrl);
      }, 500);
    },
    onError: (error: any) => {
      console.error("❌ Magic login ERROR:", error);
      console.error("❌ Error message:", error?.message);
      console.error("❌ Error response:", error?.response);
      console.error("❌ Error response data:", error?.response?.data);
      console.error("❌ Error response status:", error?.response?.status);
      
      // Extract error message from response if available
      const backendMessage = error?.response?.data?.error?.message 
        || error?.response?.data?.message;
      
      let errorMessage = backendMessage || "Terjadi kesalahan saat verifikasi.";
      let errorDescription = "";
      
      // Provide helpful context based on error
      if (error?.response?.status === 401 || backendMessage?.includes("expired") || backendMessage?.includes("invalid")) {
        errorMessage = "Link Tidak Valid atau Sudah Kedaluwarsa";
        errorDescription = "Link magic login hanya dapat digunakan satu kali dan berlaku selama 30 menit. Silakan minta link baru.";
      } else if (error?.response?.status === 429) {
        errorMessage = "Terlalu Banyak Percobaan";
        errorDescription = "Anda telah mencoba terlalu banyak kali. Silakan tunggu beberapa saat.";
      }
      
      toast({
        title: errorMessage,
        description: errorDescription || backendMessage || "Silakan coba lagi atau minta link baru.",
        variant: "destructive",
      });
      
      setTimeout(() => {
        router.replace("/");
      }, 2000); // Increased to 2 seconds so user can read the message
    },
  });

  useEffect(() => {
    // Prevent double execution in React Strict Mode (development)
    if (hasExecuted.current) {
      console.log("⏭️ Skipping duplicate execution");
      return;
    }

    if (code) {
      console.log("🚀 Executing magic login verification");
      hasExecuted.current = true;
      mutate({ code });
    } else {
      router.replace("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
      <div className="mb-6 bg-primary/10 p-4 rounded-full">
        <Loader className="animate-spin text-primary w-10 h-10" />
      </div>
      <h2 className="text-xl font-bold text-neutral-1000 mb-2">Memeriksa Link Anda</h2>
      <p className="text-neutral-60 max-w-[280px]">
        Mohon tunggu sebentar, kami sedang melakukan verifikasi link login Anda...
      </p>
    </div>
  );
}

export default function MagicLoginVerify() {
  return (
    <Suspense fallback={
        <div className="flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
          <Loader className="animate-spin text-primary w-10 h-10 mb-4" />
          <p>Memuat...</p>
        </div>
      }>
      <MagicLoginVerifyContent />
    </Suspense>
  );
}
