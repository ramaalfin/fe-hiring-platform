"use client";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Loader, Mail, MailCheckIcon } from "lucide-react";
import { registerMutationFn } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { getErrorMessage } from "@/lib/get-error-message";

export default function SignUp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get("error");

  const formSchema = z
    .object({
      fullName: z.string().trim().min(1, {
        message: "Name is required",
      }),
      email: z.string().trim().email().min(1, {
        message: "Email is required",
      }),
      password: z.string().trim().min(1, {
        message: "Password is required",
      }),
      confirmPassword: z.string().trim().min(1, {
        message: "Confirm password is required",
      }),
    })
    .refine((val) => val.password === val.confirmPassword, {
      message: "Password does not match",
      path: ["confirmPassword"],
    });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: registerMutationFn,
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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="mb-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-[#f1f7feb5] text-sm">
                    Name
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Techwithemma" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
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
          <div className="mb-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm text-neutral-90">
                    Password
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••••••"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="mb-4">
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="dark:text-[#f1f7feb5] text-sm">
                    Confirm Password
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••••••"
                      {...field}
                    />
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
      </Form>
      <Link className="flex items-center gap-2" href="/signup-with-link">
        <Button variant="outline" className="w-full h-[40px] text-neutral-1000">
          <Mail className="!w-3 font-bold" />
          Kirim link melalui email
        </Button>
      </Link>
    </main>
  );
}
