"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Link from "next/link";
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
import { KeyRound, Loader } from "lucide-react";
import { magicRegisterMutationFn } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import { getErrorMessage } from "@/lib/get-error-message";

export default function SignUp() {
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
    mutationFn: magicRegisterMutationFn,
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
    <main className="w-full h-full p-8 rounded-md">
      <h1 className="text-xl tracking-[-0.16px] font-bold mb-1.5 text-center sm:text-left text-neutral-1000">
        Bergabung dengan Get Job
      </h1>
      <p className="mb-4 text-center sm:text-left text-base font-normal text-neutral-1000">
        Sudah punya akun?{" "}
        <Link className="text-primary" href="/">
          Masuk
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
                  <FormLabel className="text-sm text-neutral-90">
                    Alamat Email
                  </FormLabel>
                  <FormControl>
                    <Input autoComplete="off" {...field} />
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
            {isPending && <Loader className="animate-spin" />}
            Daftar
          </Button>

          <div className="mb-6 mt-6 flex items-center justify-center">
            <div
              aria-hidden="true"
              className="w-full border border-neutral-60"
              data-orientation="horizontal"
              role="separator"
            ></div>
            <h1 className="mx-4 text-sm text-neutral-60">or</h1>
            <div
              aria-hidden="true"
              className="w-full border border-neutral-60"
              data-orientation="horizontal"
              role="separator"
            ></div>
          </div>
        </form>
        <Link className="flex items-center gap-2" href="/signup">
          <Button
            variant="outline"
            className="w-full h-[40px] text-neutral-1000"
          >
            <KeyRound className="!w-3 font-bold" />
            Daftar dengan kata sandi
          </Button>
        </Link>
      </Form>
    </main>
  );
}
