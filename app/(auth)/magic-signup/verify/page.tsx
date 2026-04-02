"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Loader, PartyPopper } from "lucide-react";
import { verifyMagicRegisterMutationFn } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import Cookies from "js-cookie";

function MagicSignupVerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");

  const { mutate, isPending } = useMutation({
    mutationFn: verifyMagicRegisterMutationFn,
    onSuccess: (data) => {
      const { access_token, refresh_token, user } = data;

      if (access_token) {
        Cookies.set("access_token", access_token, { path: "/" });
      }
      if (refresh_token) {
        Cookies.set("refresh_token", refresh_token, { path: "/" });
      }

      toast({
        title: "Pendaftaran Berhasil",
        description: "Selamat datang! Akun Anda telah berhasil diverifikasi.",
      });

      const redirectUrl = user?.role === "ADMIN" ? "/admin/home" : "/home";
      router.replace(redirectUrl);
    },
    onError: (error: any) => {
      toast({
        title: "Pendaftaran Gagal",
        description: "Link pendaftaran tidak valid atau sudah kedaluwarsa.",
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
      <div className="mb-6 bg-secondary/10 p-4 rounded-full">
        <PartyPopper className="text-secondary w-10 h-10 animate-bounce" />
      </div>
      <h2 className="text-xl font-bold text-neutral-1000 mb-2">Sedang Memverifikasi</h2>
      <p className="text-neutral-60 max-w-[280px]">
        Selamat! Akun Anda sedang diproses. Mohon tunggu beberapa detik...
      </p>
    </div>
  );
}

export default function MagicSignupVerify() {
  return (
    <Suspense fallback={
        <div className="flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
          <Loader className="animate-spin text-primary w-10 h-10 mb-4" />
          <p>Memuat...</p>
        </div>
      }>
      <MagicSignupVerifyContent />
    </Suspense>
  );
}
