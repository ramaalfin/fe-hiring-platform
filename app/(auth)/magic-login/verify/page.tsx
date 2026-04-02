"use client";

import { useEffect, Suspense } from "react";
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

  const { mutate, isPending } = useMutation({
    mutationFn: verifyMagicLoginMutationFn,
    onSuccess: (data) => {
      // Set tokens (backend should return them, and some are set in api interceptors/fns)
      // verifyMagicLoginMutationFn in api.ts returns response.data
      
      const { access_token, refresh_token, user } = data;

      if (access_token) {
        Cookies.set("access_token", access_token, { path: "/" });
      }
      if (refresh_token) {
        Cookies.set("refresh_token", refresh_token, { path: "/" });
      }

      toast({
        title: "Login Berhasil",
        description: `Selamat datang kembali, ${user?.fullName || "User"}!`,
      });

      const redirectUrl = user?.role === "ADMIN" ? "/admin/home" : "/home";
      router.replace(redirectUrl);
    },
    onError: (error: any) => {
      toast({
        title: "Login Gagal",
        description: "Link magic login tidak valid atau sudah kedaluwarsa.",
        variant: "destructive",
      });
      router.replace("/");
    },
  });

  useEffect(() => {
    if (code) {
      mutate({ code });
    } else {
      router.replace("/");
    }
  }, [code, mutate, router]);

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
