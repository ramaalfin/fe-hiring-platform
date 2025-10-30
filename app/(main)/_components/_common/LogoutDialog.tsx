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
import { useAuthContext } from "@/context/auth-provider";

const LogoutDialog = ({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const router = useRouter();
  const { refetch } = useAuthContext();

  const { mutate, isPending } = useMutation({
    mutationFn: logoutMutationFn,
    onSuccess: async () => {
      // Pastikan data auth di-refresh setelah logout
      await refetch();
      router.replace("/");
    },
    onError: (error: any) => {
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
      <DialogContent>
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
