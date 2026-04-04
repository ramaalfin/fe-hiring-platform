"use client";

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import Asidebar from "./_components/Asidebar";
import Header from "./_components/Header";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuthContext } from "@/context/auth-provider";
import { ChangePasswordModal } from "@/components/ChangePasswordModal";
import { useEffect, useState } from "react";

function MainLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, refetch } = useAuthContext();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    if (user?.isDefaultPassword) {
      setShowPasswordModal(true);
    }
  }, [user]);

  return (
    <>
      <SidebarProvider>
        <Asidebar />
        <SidebarInset>
          <main className="w-full">
            <Header />
            {children}
            <Toaster />
          </main>
        </SidebarInset>
      </SidebarProvider>

      <ChangePasswordModal
        open={showPasswordModal}
        onOpenChange={setShowPasswordModal}
        isDefaultPassword={user?.isDefaultPassword || false}
        onSuccess={() => {
          refetch();
        }}
      />
    </>
  );
}

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <MainLayoutContent>{children}</MainLayoutContent>
    </AuthProvider>
  );
}
