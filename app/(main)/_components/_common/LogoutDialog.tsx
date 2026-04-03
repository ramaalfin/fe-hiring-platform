"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { logoutMutationFn } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback } from "react";
import Cookies from "js-cookie";

const LogoutDialog = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: logoutMutationFn,
    onSuccess: async (response) => {
      console.log("🎉 Logout SUCCESS:", response);
      
      setIsOpen(false);
      
      // Clear tokens manually to ensure they're removed
      Cookies.remove("access_token", { path: "/" });
      Cookies.remove("refresh_token", { path: "/" });
      console.log("✅ Tokens cleared");
      
      toast({
        title: "Logout Berhasil",
        description: "Anda telah berhasil keluar dari sesi ini.",
      });
      
      console.log("🚀 Navigating to /");
      // Small delay to show toast before navigation
      setTimeout(() => {
        window.location.href = "/"; // Use window.location for hard refresh
      }, 500);
    },
    onError: (error: any) => {
      console.error("❌ Logout ERROR:", error);
      
      toast({
        title: "Logout gagal",
        description: error.message || "Terjadi kesalahan saat logout",
        variant: "destructive",
      });
    },
  });

  const handleLogout = useCallback(() => {
    mutate();
  }, [mutate]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="w-96">
        <DialogHeader>
          <DialogTitle>Konfirmasi Logout</DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin keluar dari sesi ini?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setIsOpen(false)}>
            Batal
          </Button>
          <Button
            className="!text-white bg-primary hover:bg-opacity-90"
            onClick={handleLogout}
            disabled={isPending}
            type="button"
          >
            {isPending && <Loader className="animate-spin mr-2" size={16} />}
            Logout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LogoutDialog;
