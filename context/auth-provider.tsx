"use client";

import React, { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserSessionQueryFn } from "@/lib/api";

type UserType = {
  id: string;
  fullName: string;
  email: string;
  role: "ADMIN" | "CANDIDATE";
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

type AuthContextType = {
  user?: UserType | null;
  isLoading: boolean;
  error?: any;
  refetch: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const {
    data: user,
    error,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["authUser"],
    queryFn: getUserSessionQueryFn,
    staleTime: Infinity,
  });

  return (
    <AuthContext.Provider value={{ user, isLoading, error, refetch }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuthContext must be used within AuthProvider");
  return context;
};
