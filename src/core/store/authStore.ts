import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
    token: string | null;
    refreshToken: string | null;
    setAuth: (token: string, refreshToken: string) => void;
    logout: () => void;
    isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            token: null,
            refreshToken: null,
            setAuth: (token, refreshToken) => set({ token, refreshToken }),
            logout: () => set({ token: null, refreshToken: null }),
            isAuthenticated: () => !!get().token,
        }),
        { name: "auth-storage" }
    )
);