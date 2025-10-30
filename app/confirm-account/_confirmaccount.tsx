"use client";

import React from "react";
import Logo from "@/components/logo";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { verifyEmailMutationFn } from "@/lib/api";
import { Loader } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const ConfirmAccount = () => {
  const router = useRouter();
  const params = useSearchParams();
  const code = params.get("code");

  const { mutate, isPending } = useMutation({
    mutationFn: verifyEmailMutationFn,
  });

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();

    if (!code) {
      toast({
        title: "Error",
        description: "Confirmation token not found",
        variant: "destructive",
      });
      return;
    }

    mutate(
      { code },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Account confirmed successfully",
          });
          router.replace("/");
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message || "An error occurred",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <main className="flex flex-col justify-center items-center w-full h-full min-h-screen bg-[#FAFAFA]">
      <div className="w-full max-w-[600px] mx-auto px-4">
        <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-white">
          <Logo />

          <h1
            className="text-xl tracking-[-0.16px] dark:text-[#fcfdffef] font-bold mb-4 mt-8
            text-center sm:text-left"
          >
            Account confirmation
          </h1>
          <p className="mb-6 text-center sm:text-left text-[15px] dark:text-[#f1f7feb5] font-normal">
            To confirm your account, please follow the button below.
          </p>
          <form onSubmit={handleSubmit}>
            <Button
              type="submit"
              disabled={isPending}
              className="w-full text-[15px] h-[40px] text-white font-semibold"
            >
              {isPending && <Loader className="animate-spin" />}
              Confirm account
            </Button>
          </form>

          <p className="mt-6 text-sm text-muted-foreground dark:text-[#f1f7feb5] font-normal">
            If you have any issue confirming your account please, contact{" "}
            <a
              className="outline-none transition duration-150 ease-in-out
                focus-visible:ring-2 text-primary hover:underline focus-visible:ring-primary"
              href="#"
            >
              support@getjob.com
            </a>
            .
          </p>
        </div>
      </div>
    </main>
  );
};

export default ConfirmAccount;
