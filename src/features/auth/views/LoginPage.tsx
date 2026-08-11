import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  BarChart3,
  Users,
  Building2,
} from "lucide-react";
import { authApi } from "../../../features/auth/api/authAPi";
import { useAuthStore } from "../../../core/store/authStore";

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  motDePasse: z.string().min(1, "Mot de passe requis"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      const res = await authApi.authenticate(data);
      setAuth(res.data.token, res.data.refreshToken);
      navigate("/dashboard");
    } catch {
      setServerError("Email ou mot de passe incorrect");
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* Panneau gauche : Alignement avec la charte et le Register */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0052CC] text-white flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center">
            <Building2 size={18} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">Gestion Stock</p>
            <p className="opacity-70 text-xs">Solution professionnelle</p>
          </div>
        </div>

        <div className="max-w-md my-auto space-y-8">
          <div>
            <h2 className="text-4xl font-bold mb-4 leading-tight">
              Gérez votre entreprise avec simplicité
            </h2>
            <p className="opacity-80 text-sm leading-relaxed">
              Suivi des stocks, gestion des commandes, facturation — tout ce
              dont votre entreprise a besoin, au même endroit.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck size={18} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm">Données sécurisées</p>
                <p className="opacity-70 text-xs">
                  Protection professionnelle de vos informations
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0 mt-0.5">
                <BarChart3 size={18} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm">Rapports détaillés</p>
                <p className="opacity-70 text-xs">
                  Visualisez l'évolution de votre activité
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0 mt-0.5">
                <Users size={18} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm">Multi-utilisateurs</p>
                <p className="opacity-70 text-xs">
                  Collaborez avec votre équipe en temps réel
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="opacity-50 text-xs">
          © 2026 Gestion Stock. Tous droits réservés.
        </p>
      </div>

      {/* Formulaire Login encadré selon la maquette */}
      <div className="flex flex-1 items-center justify-center p-6 lg:p-12 bg-white">
        <div className="w-full max-w-sm py-4">
          <p className="text-[#0066FF] text-xs font-bold tracking-wider uppercase mb-1">
            CONNEXION
          </p>
          <h2 className="text-2xl font-bold mb-1 text-gray-900">
            Content de vous revoir
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            Connectez-vous pour accéder à votre espace entreprise
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Adresse email
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <input
                  type="email"
                  className="w-full py-2.5 pl-10 pr-3.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  placeholder="admin@monentreprise.fr"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full py-2.5 pl-10 pr-10 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                  placeholder="••••••••"
                  {...register("motDePasse")}
                />
                <button
                  type="button"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.motDePasse && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.motDePasse.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-gray-300 text-[#0066FF] focus:ring-[#0066FF]"
                />
                <span>Se souvenir de moi</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-[#0066FF] font-semibold hover:underline"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            {serverError && (
              <p className="text-red-500 text-sm">{serverError}</p>
            )}

            <button
              type="submit"
              className="w-full bg-[#0066FF] hover:bg-[#0052CC] text-white font-semibold py-3 px-4 rounded-xl transition-colors text-sm mt-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Connexion..." : "Se connecter →"}
            </button>
          </form>

          <p className="text-center text-sm mt-6 text-gray-500">
            Pas encore de compte ?{" "}
            <Link
              to="/register"
              className="text-[#0066FF] font-semibold hover:underline"
            >
              Créez-en un
            </Link>
          </p>

          <div className="mt-6 p-3 bg-gray-50 rounded-xl border border-gray-100 text-center text-xs text-gray-500">
            Démo —{" "}
            <span className="font-mono text-gray-700">
              admin@monentreprise.fr
            </span>{" "}
            / <span className="font-mono text-gray-700">demo123</span>
          </div>
        </div>
      </div>
    </div>
  );
}
