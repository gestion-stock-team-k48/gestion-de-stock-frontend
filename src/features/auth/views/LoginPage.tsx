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
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { authApi } from "../../../features/auth/api/authAPi";
import { useAuthStore } from "../../../core/store/authStore";
import { PublicNavbar } from "../../../components/layout/PublicNavbar";

const createLoginSchema = (t: (key: string) => string) =>
  z.object({
    email: z.string().email(t("auth.validation.invalidEmail")),
    motDePasse: z.string().min(1, t("auth.validation.requiredPassword")),
  });

type LoginFormData = {
  email: string;
  motDePasse: string;
};

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const loginSchema = createLoginSchema(t);

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
      setServerError(t("auth.login.serverError"));
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-white font-sans">
      <PublicNavbar />
      <div className="flex flex-1 bg-white">
        {/* Panneau gauche : Alignement avec la charte et le Register */}
        <div className="hidden lg:flex lg:w-1/2 bg-[#0052CC] text-white flex-col justify-between p-12">
          <div className="max-w-md my-auto space-y-8">
            <div>
              <h2 className="text-4xl font-bold mb-4 leading-tight">
                {t("auth.login.sideTitle")}
              </h2>
              <p className="opacity-80 text-sm leading-relaxed">
                {t("auth.login.sideDescription")}
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck size={18} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm">
                    {t("auth.login.features.security.title")}
                  </p>
                  <p className="opacity-70 text-xs">
                    {t("auth.login.features.security.description")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0 mt-0.5">
                  <BarChart3 size={18} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm">
                    {t("auth.login.features.reports.title")}
                  </p>
                  <p className="opacity-70 text-xs">
                    {t("auth.login.features.reports.description")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0 mt-0.5">
                  <Users size={18} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm">
                    {t("auth.login.features.users.title")}
                  </p>
                  <p className="opacity-70 text-xs">
                    {t("auth.login.features.users.description")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="opacity-50 text-xs">{t("brand.copyright")}</p>
        </div>

        {/* Formulaire Login encadré selon la maquette */}
        <div className="flex flex-1 items-center justify-center p-6 lg:p-12 bg-white">
          <div className="w-full max-w-sm py-4">
            <p className="text-[#0066FF] text-xs font-bold tracking-wider uppercase mb-1">
              {t("auth.login.eyebrow")}
            </p>
            <h2 className="text-2xl font-bold mb-1 text-gray-900">
              {t("auth.login.title")}
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              {t("auth.login.subtitle")}
            </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                {t("auth.shared.email")}
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
                {t("auth.shared.password")}
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
                  aria-label={t("auth.shared.password")}
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
                <span>{t("auth.login.rememberMe")}</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-[#0066FF] font-semibold hover:underline"
              >
                {t("auth.login.forgotPassword")}
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
              {isSubmitting
                ? t("buttons.loginLoading")
                : `${t("buttons.login")} →`}
            </button>
          </form>

          <p className="text-center text-sm mt-6 text-gray-500">
            {t("auth.login.noAccount")}{" "}
            <Link
              to="/register"
              className="text-[#0066FF] font-semibold hover:underline"
            >
              {t("auth.login.createOne")}
            </Link>
          </p>
          </div>
        </div>
      </div>
    </main>
  );
}
