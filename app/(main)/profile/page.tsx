"use client";

import { useState } from "react";
import { useAuthContext } from "@/context/auth-provider";
import { useMutation } from "@tanstack/react-query";
import { updateUserProfileMutationFn } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ChangePasswordModal } from "@/components/ChangePasswordModal";
import { Loader2, User, Mail, Shield, Calendar } from "lucide-react";

export default function ProfilePage() {
  const { user, refetch, isLoading } = useAuthContext();
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const { toast } = useToast();

  const updateProfileMutation = useMutation({
    mutationFn: updateUserProfileMutationFn,
    onSuccess: () => {
      toast({
        title: "Profile berhasil diperbarui",
        description: "Informasi profile Anda telah berhasil diubah.",
      });
      refetch();
    },
    onError: (error: any) => {
      toast({
        title: "Gagal memperbarui profile",
        description:
          error.response?.data?.message || "Terjadi kesalahan, coba lagi.",
        variant: "destructive",
      });
    },
  });

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({ fullName });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#01939D]" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Profile Saya</h1>

      <div className="grid gap-6">
        {/* Profile Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Profile</CardTitle>
            <CardDescription>
              Kelola informasi profile dan akun Anda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nama Lengkap</Label>
                <div className="flex gap-2">
                  <User className="h-5 w-5 text-gray-400 mt-2" />
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Masukkan nama lengkap"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex gap-2">
                  <Mail className="h-5 w-5 text-gray-400 mt-2" />
                  <Input
                    id="email"
                    value={user?.email}
                    disabled
                    className="flex-1 bg-gray-50"
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Email tidak dapat diubah
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <div className="flex gap-2">
                  <Shield className="h-5 w-5 text-gray-400 mt-2" />
                  <Input
                    id="role"
                    value={user?.role}
                    disabled
                    className="flex-1 bg-gray-50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="createdAt">Bergabung Sejak</Label>
                <div className="flex gap-2">
                  <Calendar className="h-5 w-5 text-gray-400 mt-2" />
                  <Input
                    id="createdAt"
                    value={
                      user?.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : ""
                    }
                    disabled
                    className="flex-1 bg-gray-50"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="bg-[#01939D] hover:bg-[#017880]"
              >
                {updateProfileMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Perubahan"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Security Card */}
        <Card>
          <CardHeader>
            <CardTitle>Keamanan</CardTitle>
            <CardDescription>
              Kelola password dan keamanan akun Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {user?.isDefaultPassword && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800 font-medium">
                    ⚠️ Anda masih menggunakan password default (User12345)
                  </p>
                  <p className="text-sm text-red-600 mt-1">
                    Harap segera ubah password untuk keamanan akun Anda.
                  </p>
                </div>
              )}

              <Button
                onClick={() => setShowPasswordModal(true)}
                variant="outline"
                className="w-full sm:w-auto"
              >
                Ubah Password
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <ChangePasswordModal
        open={showPasswordModal}
        onOpenChange={setShowPasswordModal}
        isDefaultPassword={user?.isDefaultPassword || false}
        onSuccess={() => {
          refetch();
        }}
      />
    </div>
  );
}
