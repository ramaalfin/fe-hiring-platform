import { create } from "zustand";
import { persist } from "zustand/middleware";

type User = {
    id: string;
    email: string;
    fullName: string;
    role: string;
};

type AuthStore = {
    user: User | null;
    message: string | null;
    setUser: (user: User | null) => void;
    clearUser: () => void;
};

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            user: null,
            message: null,
            setUser: (user) => set({ user }),
            clearUser: () => set({ user: null, message: null }),
        }),
        {
            name: "auth-storage", // key untuk localStorage
        }
    )
);
