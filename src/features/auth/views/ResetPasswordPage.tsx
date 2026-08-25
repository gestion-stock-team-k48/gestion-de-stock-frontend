import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { authApi } from "../api/authAPi";
import { PublicNavbar } from "../../../components/layout/PublicNavbar";

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    setFieldError(null);

    if (!newPassword || newPassword.length < 8) {
      setFieldError(t("auth.resetPassword.passwordMin"));
      return;
    }
    if (newPassword !== confirmPassword) {
      setFieldError(t("auth.resetPassword.passwordMismatch"));
      return;
    }
    if (!token) {
      setServerError(t("auth.resetPassword.serverError"));
      return;
    }

    setIsSubmitting(true);
    try {
      await authApi.resetPassword({ token, newPassword });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch {
      setServerError(t("auth.resetPassword.serverError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-white font-sans">
      <PublicNavbar />
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm py-4">
          <p className="text-[#0066FF] text-xs font-bold tracking-wider uppercase mb-1">
            {t("auth.resetPassword.eyebrow")}
          </p>
          <h2 className="text-2xl font-bold mb-1 text-gray-900">
            {t("auth.resetPassword.title")}
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            {t("auth.resetPassword.subtitle")}
          </p>

          {success ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center">
              <CheckCircle size={40} className="mx-auto mb-3 text-emerald-500" />
              <p className="text-sm font-semibold text-emerald-700">
                {t("auth.resetPassword.success")}
              </p>
              <p className="mt-1 text-xs text-emerald-600">
                {t("auth.resetPassword.successRedirect")}
              </p>
            </div>
          ) : !token ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-center">
              <p className="text-sm font-semibold text-red-600">
                {t("auth.resetPassword.serverError")}
              </p>
              <Link
                to="/login"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#0066FF] hover:underline"
              >
                <ArrowLeft size={14} />
                {t("auth.resetPassword.backToLogin")}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  {t("auth.resetPassword.newPasswordLabel")}
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
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label="Toggle password"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  {t("auth.resetPassword.confirmPasswordLabel")}
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full py-2.5 pl-10 pr-3.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {fieldError && (
                <p className="text-red-500 text-sm">{fieldError}</p>
              )}
              {serverError && (
                <p className="text-red-500 text-sm">{serverError}</p>
              )}

              <button
                type="submit"
                className="w-full bg-[#0066FF] hover:bg-[#0052CC] text-white font-semibold py-3 px-4 rounded-xl transition-colors text-sm"
                disabled={isSubmitting}
              >
                {isSubmitting
                  ? t("auth.resetPassword.submitLoading")
                  : t("auth.resetPassword.submit")}
              </button>
            </form>
          )}

          {!success && (
            <p className="text-center text-sm mt-6 text-gray-500">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-[#0066FF] font-semibold hover:underline"
              >
                <ArrowLeft size={14} />
                {t("auth.resetPassword.backToLogin")}
              </Link>
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
