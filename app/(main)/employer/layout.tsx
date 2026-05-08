"use client";

import { useAuthContext } from "@/context/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader } from "lucide-react";

export default function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user && user.role !== "EMPLOYER") {
      if (user.role === "ADMIN") router.replace("/admin/home");
      else router.replace("/home");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader className="animate-spin h-6 w-6 text-neutral-400" />
      </div>
    );
  }

  if (!user || user.role !== "EMPLOYER") {
    return null;
  }

  return <>{children}</>;
}
