"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { KeyRound, Loader } from "lucide-react";
import Link from "next/link";

import { magicLoginMutationFn } from "@/lib/api";
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
import { getErrorMessage } from "@/lib/get-error-message";

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get("error");

  const formSchema = z.object({
    email: z.string().email("Email tidak valid").min(1, "Email wajib diisi"),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "" },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: magicLoginMutationFn,
    onSuccess: () => {
      router.replace("/check-email");
    },
    onError: (error: any) => {
      form.setError("email", {
        type: "manual",
        message: getErrorMessage(error) || "Email tidak ditemukan.",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutate(values);
  };

  return (
    <main className="w-full h-full p-8 rounded-md" key={errorMessage}>
      <h1 className="text-xl font-bold mb-2 text-center sm:text-left">
        Masuk ke Get Job
      </h1>

      <p className="mb-4 text-center sm:text-left text-base">
        Belum punya akun?{" "}
        <Link className="text-primary" href="/signup-with-link">
          Daftar menggunakan email
        </Link>
      </p>

      {/* tampilkan pesan error dari query param */}
      {errorMessage && (
        <div className="mb-4 rounded-md bg-red-100 text-red-800 p-3 text-sm">
          {decodeURIComponent(errorMessage)}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="mb-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alamat Email</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button
            className="w-full text-[15px] h-[40px] text-neutral-90 font-semibold bg-secondary hover:bg-yellow-500"
            disabled={isPending}
            type="submit"
          >
            {isPending && <Loader className="animate-spin mr-2" size={16} />}
            Kirim Link
          </Button>

          <div className="flex items-center justify-center mt-6 mb-4">
            <div className="w-full border border-neutral-60" />
            <span className="mx-3 text-sm text-neutral-60">or</span>
            <div className="w-full border border-neutral-60" />
          </div>

          <Link href="/signin" className="flex items-center gap-2">
            <Button variant="outline" className="w-full">
              <KeyRound className="w-4" />
              Masuk dengan kata sandi
            </Button>
          </Link>
        </form>
      </Form>
    </main>
  );
}
