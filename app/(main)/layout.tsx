"use client";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import Asidebar from "./_components/Asidebar";
import Header from "./_components/Header";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/context/auth-provider";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
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
    </AuthProvider>
  );
}
