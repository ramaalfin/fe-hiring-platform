"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { updateUserProfileMutationFn } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ChangePasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isDefaultPassword: boolean;
  onSuccess?: () => void;
}

export function ChangePasswordModal({
  open,
  onOpenChange,
  isDefaultPassword,
  onSuccess,
}: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { toast } = useToast();

  const updatePasswordMutation = useMutation({
    mutationFn: updateUserProfileMutationFn,
    onSuccess: () => {
      toast({
        title: "Password berhasil diubah",
        description: "Password Anda telah berhasil diperbarui.",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Gagal mengubah password",
        description:
          error.response?.data?.message || "Terjadi kesalahan, coba lagi.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        title: "Password tidak cocok",
        description: "Password baru dan konfirmasi password harus sama.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Password terlalu pendek",
        description: "Password minimal 8 karakter.",
        variant: "destructive",
      });
      return;
    }

    updatePasswordMutation.mutate({
      currentPassword,
      newPassword,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ubah Password</DialogTitle>
          <DialogDescription>
            {isDefaultPassword
              ? "Anda masih menggunakan password default. Silakan ubah password untuk keamanan akun Anda."
              : "Ubah password akun Anda."}
          </DialogDescription>
        </DialogHeader>

        {isDefaultPassword && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Password default Anda adalah: <strong>User12345</strong>
              <br />
              Harap segera mengubahnya untuk keamanan akun.
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Password Saat Ini</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder={
                isDefaultPassword ? "User12345" : "Masukkan password saat ini"
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Password Baru</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimal 8 karakter"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi password baru"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            {!isDefaultPassword && (
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Batal
              </Button>
            )}
            <Button
              type="submit"
              disabled={updatePasswordMutation.isPending}
              className="bg-[#01939D] hover:bg-[#017880]"
            >
              {updatePasswordMutation.isPending
                ? "Menyimpan..."
                : "Ubah Password"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
