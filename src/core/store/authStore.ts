import { create } from "zustand";
import { persist } from "zustand/middleware";

const ACCESS_TOKEN_STORAGE_KEY = "accessToken";
const REFRESH_TOKEN_STORAGE_KEY = "refreshToken";

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
            setAuth: (token, refreshToken) => {
                localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
                localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
                set({ token, refreshToken });
            },
            logout: () => {
                localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
                localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
                set({ token: null, refreshToken: null });
            },
            isAuthenticated: () => !!get().token,
        }),
        { name: "auth-storage" }
    )
);
