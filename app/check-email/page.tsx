"use client";

import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { Suspense } from "react";
import { Info } from "lucide-react";

function CheckEmailContent() {
  const searchParams = useSearchParams();
  const isRegister = searchParams.get("type") === "register";

  return (
    <div className="flex flex-col justify-center items-center w-full h-full min-h-screen bg-[#FAFAFA]">
      <div className="w-full max-w-[600px] mx-auto px-4">
        <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-white rounded-lg shadow-sm">
          <h1 className="text-2xl font-semibold mb-2 text-neutral-90">
            Periksa Email Anda
          </h1>
          <p className="text-neutral-700 max-w-md text-sm">
            Kami sudah mengirimkan link {isRegister ? "pendaftaran" : "login"} ke email Anda yang berlaku dalam 30 menit
          </p>

          {isRegister && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-left">
                  <p className="text-sm text-blue-900 font-medium mb-1">
                    Password Default Anda
                  </p>
                  <p className="text-sm text-blue-700">
                    Setelah verifikasi, Anda akan mendapatkan password default:{" "}
                    <span className="font-mono font-bold bg-blue-100 px-2 py-0.5 rounded">
                      User12345
                    </span>
                  </p>
                  <p className="text-xs text-blue-600 mt-2">
                    Anda akan diminta untuk mengubah password ini saat pertama kali login untuk keamanan akun Anda.
                  </p>
                </div>
              </div>
            </div>
          )}

          <Image
            src="/assets/illustration/Container.svg"
            alt="Check Email Illustration"
            width={240}
            height={240}
            className="mt-6"
          />
        </div>
      </div>
    </div>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col justify-center items-center w-full h-full min-h-screen bg-[#FAFAFA]">
        <div className="w-full max-w-[600px] mx-auto px-4">
          <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-white">
            <p>Memuat...</p>
          </div>
        </div>
      </div>
    }>
      <CheckEmailContent />
    </Suspense>
  );
}
