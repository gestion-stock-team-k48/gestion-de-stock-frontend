import { create } from "zustand";
import { persist } from "zustand/middleware";
import { entrepriseApi } from "../../features/entreprise/api/entrepriseApi";
import { utilisateurApi } from "../../features/utilisateurs/api/utilisateurApi";

const ACCESS_TOKEN_STORAGE_KEY = "accessToken";
const REFRESH_TOKEN_STORAGE_KEY = "refreshToken";

type EnterpriseIdentifier = number | string | null;

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  entrepriseId: EnterpriseIdentifier;
  nomEntreprise: string | null;
  prenomAdmin: string | null;
  nomAdmin: string | null;
  setAuth: (token: string, refreshToken: string) => void;
  fetchUserProfile: () => Promise<void>;
  logout: () => void;
  isAuthenticated: () => boolean;
  getCurrentEntrepriseId: () => EnterpriseIdentifier;
}

const safeAtob = (value: string): string | null => {
  try {
    return atob(value);
  } catch {
    return null;
  }
};

const extractEntrepriseIdFromToken = (token: string | null): EnterpriseIdentifier => {
  if (!token) return null;

  const parts = token.split(".");
  if (parts.length < 2) return null;

  const payload = safeAtob(parts[1].replace(/-/g, "+").replace(/_/g, "/"));
  if (!payload) return null;

  try {
    const decoded = JSON.parse(payload) as Record<string, unknown>;

    const possibleKeys = [
      "entrepriseId",
      "enterpriseId",
      "idEntreprise",
      "companyId",
      "entreprise_id",
      "company_id",
      "tenantId",
      "sub",
    ];

    for (const key of possibleKeys) {
      const value = decoded[key];
      if (typeof value === "number" || typeof value === "string") {
        return value;
      }
    }
  } catch {
    return null;
  }

  return null;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      refreshToken: null,
      entrepriseId: null,
      nomEntreprise: null,
      prenomAdmin: null,
      nomAdmin: null,

      setAuth: (token, refreshToken) => {
        localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
        localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);

        const resolvedEntrepriseId =
          extractEntrepriseIdFromToken(token) ?? null;

        set({
          token,
          refreshToken,
          entrepriseId: resolvedEntrepriseId,
        });
      },

      fetchUserProfile: async () => {
        const token = get().token;
        if (!token) return;

        try {
          const [entrepriseRes, utilisateurRes] = await Promise.all([
            entrepriseApi.getEntreprise(),
            utilisateurApi.getMine(),
          ]);

          const entreprise = entrepriseRes.data as {
            id?: number;
            nom?: string;
          };
          const utilisateur = utilisateurRes.data as {
            id?: number;
            prenom?: string;
            nom?: string;
            entrepriseId?: number;
          };

          set({
            entrepriseId:
              utilisateur.entrepriseId ??
              entreprise.id ??
              get().entrepriseId,
            nomEntreprise: entreprise.nom ?? get().nomEntreprise,
            prenomAdmin: utilisateur.prenom ?? get().prenomAdmin,
            nomAdmin: utilisateur.nom ?? get().nomAdmin,
          });
        } catch {
          // Silently fail — token info is still available
        }
      },

      logout: () => {
        localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
        localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
        set({
          token: null,
          refreshToken: null,
          entrepriseId: null,
          nomEntreprise: null,
          prenomAdmin: null,
          nomAdmin: null,
        });
      },

      isAuthenticated: () => !!get().token,

      getCurrentEntrepriseId: () => get().entrepriseId,
    }),
    { name: "auth-storage" },
  ),
);
