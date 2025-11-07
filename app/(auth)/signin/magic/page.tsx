"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { verifyMagicLoginMutationFn } from "@/lib/api";
import { Loader } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/get-error-message";

// Komponen utama dibungkus dengan Suspense agar useSearchParams tidak error
export default function MagicLoginVerifyPage() {
  return (
    <Suspense
      fallback={
        <main className="h-full flex flex-col items-center justify-center text-center">
          {" "}
          <Loader className="animate-spin mb-4" size={28} />{" "}
          <p>Memuat halaman verifikasi...</p>{" "}
        </main>
      }
    >
      {" "}
      <VerifyContent />{" "}
    </Suspense>
  );
}

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");

  const { mutate } = useMutation({
    mutationFn: verifyMagicLoginMutationFn,
    onSuccess: (data) => {
      document.cookie = `access_token=${data.access_token}; path=/;`;
      document.cookie = `refresh_token=${data.refresh_token}; path=/;`;

      toast({
        title: "Login Berhasil",
        description: data.message || "Selamat datang kembali!",
      });

      router.replace("/home");
    },
    onError: (error: any) => {
      const message =
        getErrorMessage(error) || "Link login tidak valid atau kadaluarsa.";
      router.replace(`/?error=${encodeURIComponent(message)}`);
    },
  });

  useEffect(() => {
    if (code) mutate({ code });
  }, [code]);

  return (
    <main className="h-full flex flex-col items-center justify-center text-center">
      {" "}
      <Loader className="animate-spin mb-4" size={28} />{" "}
      <p>Sedang memverifikasi tautan login Anda...</p>{" "}
    </main>
  );
}
