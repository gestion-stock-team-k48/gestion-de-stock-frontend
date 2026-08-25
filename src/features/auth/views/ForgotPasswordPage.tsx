import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Send } from "lucide-react";
import { useTranslation } from "react-i18next";
import { authApi } from "../api/authAPi";
import { PublicNavbar } from "../../../components/layout/PublicNavbar";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    setServerError(null);
    try {
      await authApi.forgotPassword({ email: email.trim() });
      setSuccess(true);
    } catch {
      setServerError(t("auth.forgotPassword.serverError"));
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
            {t("auth.forgotPassword.eyebrow")}
          </p>
          <h2 className="text-2xl font-bold mb-1 text-gray-900">
            {t("auth.forgotPassword.title")}
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            {t("auth.forgotPassword.subtitle")}
          </p>

          {success ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center">
              <p className="text-sm font-semibold text-emerald-700">
                {t("auth.forgotPassword.success")}
              </p>
              <Link
                to="/login"
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#0066FF] hover:underline"
              >
                <ArrowLeft size={14} />
                {t("auth.forgotPassword.backToLogin")}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  {t("auth.forgotPassword.emailLabel")}
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                  <input
                    type="email"
                    className="w-full py-2.5 pl-10 pr-3.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
                    placeholder={t("auth.forgotPassword.emailPlaceholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {serverError && (
                <p className="text-red-500 text-sm">{serverError}</p>
              )}

              <button
                type="submit"
                className="w-full bg-[#0066FF] hover:bg-[#0052CC] text-white font-semibold py-3 px-4 rounded-xl transition-colors text-sm"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <Send size={14} className="animate-pulse" />
                    {t("auth.forgotPassword.submitLoading")}
                  </span>
                ) : (
                  t("auth.forgotPassword.submit")
                )}
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
                {t("auth.forgotPassword.backToLogin")}
              </Link>
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
