"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader, KeySquare, Sparkles } from "lucide-react";
import Link from "next/link";
import { useMutation } from "@tanstack/react-query";

import { magicLoginMutationFn, loginMutationFn } from "@/lib/api";
import { getErrorMessage } from "@/lib/get-error-message";
import { toast } from "@/hooks/use-toast";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get("error");
  const [activeTab, setActiveTab] = useState<"password" | "magic">("password");

  // Mutations
  const { mutate: mutateMagic, isPending: pendingMagic } = useMutation({
    mutationFn: magicLoginMutationFn,
    onSuccess: () => router.replace("/check-email"),
    onError: (error) => {
      toast({
        title: "Login Gagal",
        description: getErrorMessage(error) || "Gagal mengirim magic link",
        variant: "destructive",
      });
    },
  });

  const { mutate: mutatePassword, isPending: pendingPassword } = useMutation({
    mutationFn: loginMutationFn,
    onSuccess: () => router.replace("/home"),
    onError: (error) => {
      toast({
        title: "Login Gagal",
        description: getErrorMessage(error) || "Kredensial tidak valid",
        variant: "destructive",
      });
    },
  });

  // Forms
  const passwordSchema = z.object({
    email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
    password: z.string().min(1, "Password wajib diisi"),
  });

  const magicSchema = z.object({
    email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  });

  const formPassword = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { email: "", password: "" },
  });

  const formMagic = useForm({
    resolver: zodResolver(magicSchema),
    defaultValues: { email: "" },
  });

  const isPending = pendingMagic || pendingPassword;

  // Handlers
  const onPasswordSubmit = (values: z.infer<typeof passwordSchema>) => {
    mutatePassword(values);
  };

  const onMagicSubmit = (values: z.infer<typeof magicSchema>) => {
    mutateMagic(values);
  };

  return (
    <main className="w-full h-full flex flex-col justify-center" key={errorMessage}>
      <div className="mb-8 flex flex-col items-center sm:items-start text-center sm:text-left">
        <h1 className="text-2xl font-bold mb-2 text-neutral-1000 tracking-tight">Selamat Datang Kembali</h1>
        <p className="text-neutral-60 text-sm">
          Silakan masuk ke akun Anda. Belum punya akun?{" "}
          <Link href="/signup" className="text-primary font-medium hover:underline transition-colors">
            Daftar sekarang
          </Link>
        </p>
      </div>

      {errorMessage && (
        <div className="mb-6 rounded-lg bg-red-50 text-red-600 p-3 text-sm border border-red-100 flex items-start">
          <span className="block sm:inline">{decodeURIComponent(errorMessage)}</span>
        </div>
      )}

      {/* Modern Tabs */}
      <div className="flex p-1.5 bg-neutral-100/80 rounded-xl mb-6 w-full relative border border-neutral-200/50">
        <button
          onClick={() => setActiveTab("password")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${activeTab === "password"
            ? "bg-white text-neutral-1000 shadow-sm border border-neutral-200/50"
            : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-200/30"
            }`}
        >
          <KeySquare className="w-4 h-4" /> Password
        </button>
        <button
          onClick={() => setActiveTab("magic")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${activeTab === "magic"
            ? "bg-white text-neutral-1000 shadow-sm border border-neutral-200/50"
            : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-200/30"
            }`}
        >
          <Sparkles className="w-4 h-4" /> Magic Link
        </button>
      </div>

      {/* Forms */}
      <div className="transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
        {activeTab === "password" ? (
          <Form {...formPassword} key="password-form">
            <form onSubmit={formPassword.handleSubmit(onPasswordSubmit)} className="space-y-5">
              <FormField
                control={formPassword.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-neutral-90 font-medium">Alamat Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="contoh@email.com"
                        className="h-12 bg-white/50 focus-visible:ring-primary/40 focus-visible:bg-white text-[15px] rounded-xl transition-colors text-neutral-1000"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={formPassword.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between pb-1">
                      <FormLabel className="text-neutral-90 font-medium">Password</FormLabel>
                      <Link
                        href={`/forgot-password?email=${formPassword.getValues("email")}`}
                        className="text-xs text-primary font-medium hover:underline transition-colors"
                      >
                        Lupa password?
                      </Link>
                    </div>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="h-12 bg-white/50 focus-visible:ring-primary/40 focus-visible:bg-white text-[15px] rounded-xl transition-colors text-neutral-1000"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="pt-3">
                <Button
                  className="w-full h-12 text-[15px] font-semibold bg-primary hover:bg-primary/90 text-white rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                  disabled={isPending}
                  type="submit"
                >
                  {isPending ? <Loader className="animate-spin w-5 h-5 mr-2" /> : "Masuk ke Akun"}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <Form {...formMagic} key="magic-form">
            <form onSubmit={formMagic.handleSubmit(onMagicSubmit)} className="space-y-5">
              <div className="mb-2 text-[15px] leading-relaxed text-neutral-60 bg-primary/5 p-4 rounded-xl border border-primary/10 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>
                  Kami akan mengirimkan link sekali pakai ke email Anda. Anda bisa langsung masuk tanpa perlu memasukkan password!
                </span>
              </div>
              <FormField
                control={formMagic.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-neutral-90 font-medium">Alamat Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="contoh@email.com"
                        className="h-12 bg-white/50 focus-visible:ring-primary/40 focus-visible:bg-white text-[15px] rounded-xl transition-colors text-neutral-1000"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="pt-3">
                <Button
                  className="w-full h-12 text-[15px] font-semibold bg-primary hover:bg-primary/90 text-white rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                  disabled={isPending}
                  type="submit"
                >
                  {isPending ? <Loader className="animate-spin w-5 h-5 mr-2" /> : "Kirim Magic Link"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </div>
    </main>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div className="h-full flex items-center justify-center py-10"><Loader className="animate-spin text-primary" size={32} /></div>}>
      <SignInContent />
    </Suspense>
  );
}
