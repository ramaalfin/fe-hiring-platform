"use client";

import useAuth from "@/hooks/use-auth";
import React, { createContext, useContext } from "react";

type UserType = {
  id: string;
  fullName: string;
  email: string;
  isEmailVerified: boolean;
  role: "ADMIN" | "CANDIDATE";
  createdAt: string;
  updatedAt: string;
};

type AuthContextType = {
  user?: UserType | null;
  error: any;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data: user, error, isLoading, isFetching, refetch } = useAuth();

  return (
    <AuthContext.Provider
      value={{ user, error, isLoading, isFetching, refetch }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
