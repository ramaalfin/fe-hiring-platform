"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { verifyMagicRegisterMutationFn } from "@/lib/api";
import { Loader } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/get-error-message";

export default function MagicRegisterVerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");

  const { mutate } = useMutation({
    mutationFn: verifyMagicRegisterMutationFn,
    onSuccess: (data) => {
      toast({
        title: "Register Berhasil",
        description: data.message || "Selamat datang kembali!",
      });
      router.replace("/home");
    },
    onError: (error: any) => {
      const message =
        getErrorMessage(error) || "Link register tidak valid atau kadaluarsa.";
      router.replace(`/?error=${encodeURIComponent(message)}`);
    },
  });

  useEffect(() => {
    if (code) mutate({ code });
  }, [code]);

  return (
    <main className="h-full flex flex-col items-center justify-center text-center">
      <Loader className="animate-spin mb-4" size={28} />
      <p>Sedang memverifikasi tautan register Anda...</p>
    </main>
  );
}
