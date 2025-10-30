"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { KeyRound, Loader } from "lucide-react";
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
import { useMutation } from "@tanstack/react-query";
import { loginMutationFn } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { getErrorMessage } from "@/lib/get-error-message";

export default function Login() {
  const router = useRouter();
  const { mutate, isPending } = useMutation({
    mutationFn: loginMutationFn,
  });

  const formSchema = z.object({
    email: z.string().trim().email().min(1, {
      message: "Email is required",
    }),
    password: z.string().trim().min(1, {
      message: "Password is required",
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutate(values, {
      onSuccess: () => {
        router.replace("/home");
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: getErrorMessage(error) || "Something went wrong",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <main className="w-full h-full p-8 rounded-md">
      <h1 className="text-xl tracking-[-0.16px] font-bold mb-1.5 text-center sm:text-left text-neutral-1000">
        Masuk ke Get Job
      </h1>
      <p className="mb-4 text-center sm:text-left text-base font-normal text-neutral-1000">
        Belum punya akun?{" "}
        <Link className="text-primary" href="/signup-with-link">
          Daftar menggunakan email
        </Link>
      </p>
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
                    <Input {...field} />
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
                  <FormLabel className="dark:text-[#f1f7feb5] text-sm">
                    Password
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="••••••••••••"
                      {...field}
                      type="password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="mb-4 flex w-full items-center justify-end">
            <Link
              className="text-sm text-primary"
              href={`/forgot-password?email=${form.getValues("email")}`}
            >
              Lupa kata sandi?
            </Link>
          </div>
          <Button
            className="w-full text-[15px] h-[40px] text-neutral-90 font-semibold bg-secondary hover:bg-yellow-500"
            disabled={isPending}
            type="submit"
          >
            {isPending && <Loader className="animate-spin" />}
            Masuk
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
      <Link className="flex items-center gap-2" href="/">
        <Button variant="outline" className="w-full h-[40px] text-neutral-1000">
          <KeyRound className="!w-3 font-bold" />
          Kirim link login dengan email
        </Button>
      </Link>
    </main>
  );
}
