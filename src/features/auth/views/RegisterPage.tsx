import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User,
  Mail,
  Lock,
  Building2,
  Hash,
  Calendar,
  Zap,
  ShieldCheck,
  MapPin,
  Phone,
  Globe,
  FileText,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { authApi } from "../../../features/auth/api/authAPi";
import { useAuthStore } from "../../../core/store/authStore";
import { PublicNavbar } from "../../../components/layout/PublicNavbar";
import { FormField } from "../../../components/ui";

const createRegisterSchema = (t: (key: string) => string) =>
  z
    .object({
      nomEntreprise: z
        .string()
        .min(1, t("auth.validation.requiredCompanyName")),
      description: z.string().optional(),
      rue: z.string().optional(),
      ville: z.string().optional(),
      codePostal: z.string().optional(),
      pays: z.string().optional(),
      codeFiscal: z.string().min(1, t("auth.validation.requiredTaxCode")),
      email: z.string().email(t("auth.validation.invalidCompanyEmail")),
      numTel: z.string().optional(),
      siteWeb: z.string().optional(),
      prenomAdmin: z.string().min(1, t("auth.validation.requiredFirstName")),
      nomAdmin: z.string().min(1, t("auth.validation.requiredLastName")),
      emailAdmin: z.string().email(t("auth.validation.invalidEmail")),
      dateDeNaissance: z.string().optional(),
      rueAdmin: z.string().optional(),
      villeAdmin: z.string().optional(),
      codePostalAdmin: z.string().optional(),
      paysAdmin: z.string().optional(),
      motDePasse: z.string().min(8, t("auth.validation.passwordMin")),
      confirmMotDePasse: z.string(),
      acceptConditions: z.boolean().refine((v) => v === true, {
        message: t("auth.validation.acceptTerms"),
      }),
    })
    .refine((data) => data.motDePasse === data.confirmMotDePasse, {
      message: t("auth.validation.passwordMismatch"),
      path: ["confirmMotDePasse"],
    });

type RegisterFormData = {
  nomEntreprise: string;
  description?: string;
  rue?: string;
  ville?: string;
  codePostal?: string;
  pays?: string;
  codeFiscal: string;
  email: string;
  numTel?: string;
  siteWeb?: string;
  prenomAdmin: string;
  nomAdmin: string;
  emailAdmin: string;
  dateDeNaissance?: string;
  rueAdmin?: string;
  villeAdmin?: string;
  codePostalAdmin?: string;
  paysAdmin?: string;
  motDePasse: string;
  confirmMotDePasse: string;
  acceptConditions: boolean;
};

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [serverError, setServerError] = useState<string | null>(null);
  const registerSchema = createRegisterSchema(t);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    try {
      const { confirmMotDePasse, acceptConditions, ...payload } = data;
      void confirmMotDePasse;
      void acceptConditions;
      const res = await authApi.register(payload);
      setAuth(res.data.token, res.data.refreshToken);
      navigate("/dashboard");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        setServerError(t("auth.register.conflictError"));
        return;
      }

      setServerError(t("auth.register.serverError"));
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-white font-sans">
      <PublicNavbar />
      <div className="flex flex-1 bg-white">
        <div className="hidden lg:flex lg:w-1/2 bg-[#0052CC] text-white flex-col justify-between p-12">
          <div className="max-w-md my-auto space-y-8">
            <div>
              <h2 className="text-4xl font-bold mb-4 leading-tight">
                {t("auth.register.sideTitle")}
              </h2>
              <p className="opacity-80 text-sm leading-relaxed">
                {t("auth.register.sideDescription")}
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0 mt-0.5">
                  <Zap size={18} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm">
                    {t("auth.register.features.speed.title")}
                  </p>
                  <p className="opacity-70 text-xs">
                    {t("auth.register.features.speed.description")}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck size={18} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm">
                    {t("auth.register.features.trial.title")}
                  </p>
                  <p className="opacity-70 text-xs">
                    {t("auth.register.features.trial.description")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <p className="opacity-50 text-xs">{t("brand.copyright")}</p>
        </div>

        <div className="flex flex-1 justify-center items-center p-6 lg:p-12 bg-white overflow-y-auto">
          <div className="w-full max-w-lg py-4">
            <p className="text-[#0066FF] text-xs font-bold tracking-wider uppercase mb-1">
              {t("auth.register.eyebrow")}
            </p>
            <h2 className="text-2xl font-bold mb-1 text-gray-900">
              {t("auth.register.title")}
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              {t("auth.register.subtitle")}
            </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label={t("auth.shared.companyName")}
                icon={Building2}
                placeholder="Ma Société SARL"
                error={errors.nomEntreprise?.message}
                {...register("nomEntreprise")}
              />
              <FormField
                label={t("auth.shared.taxCode")}
                icon={Hash}
                placeholder="123456789"
                error={errors.codeFiscal?.message}
                {...register("codeFiscal")}
              />
              <div className="sm:col-span-2">
                <FormField
                  label={t("auth.shared.companyEmail")}
                  icon={Mail}
                  type="email"
                  placeholder="contact@masociete.fr"
                  error={errors.email?.message}
                  {...register("email")}
                />
              </div>
              <div className="sm:col-span-2">
                <FormField
                  label={t("auth.shared.description")}
                  icon={FileText}
                  placeholder="Commerce de fournitures"
                  error={errors.description?.message}
                  {...register("description")}
                />
              </div>
              <FormField
                label={t("auth.shared.street")}
                icon={MapPin}
                placeholder="Rue 1.234"
                error={errors.rue?.message}
                {...register("rue")}
              />
              <FormField
                label={t("auth.shared.city")}
                icon={MapPin}
                placeholder="Douala"
                error={errors.ville?.message}
                {...register("ville")}
              />
              <FormField
                label={t("auth.shared.postalCode")}
                icon={Hash}
                placeholder="BP 1234"
                error={errors.codePostal?.message}
                {...register("codePostal")}
              />
              <FormField
                label={t("auth.shared.country")}
                icon={MapPin}
                placeholder="Cameroun"
                error={errors.pays?.message}
                {...register("pays")}
              />
              <FormField
                label={t("auth.shared.phone")}
                icon={Phone}
                placeholder="+237 690 000 000"
                error={errors.numTel?.message}
                {...register("numTel")}
              />
              <FormField
                label={t("auth.shared.website")}
                icon={Globe}
                placeholder="https://masociete.cm"
                error={errors.siteWeb?.message}
                {...register("siteWeb")}
              />
              <FormField
                label={t("auth.shared.firstName")}
                icon={User}
                placeholder="Jean"
                error={errors.prenomAdmin?.message}
                {...register("prenomAdmin")}
              />
              <FormField
                label={t("auth.shared.lastName")}
                icon={User}
                placeholder="Dupont"
                error={errors.nomAdmin?.message}
                {...register("nomAdmin")}
              />
              <FormField
                label={t("auth.shared.email")}
                icon={Mail}
                type="email"
                placeholder="jean@monentreprise.fr"
                error={errors.emailAdmin?.message}
                {...register("emailAdmin")}
              />
              <FormField
                label={t("auth.shared.birthDate")}
                icon={Calendar}
                type="date"
                error={errors.dateDeNaissance?.message}
                {...register("dateDeNaissance")}
              />
              <FormField
                label={t("auth.shared.adminStreet")}
                icon={MapPin}
                placeholder="Rue 5.678"
                error={errors.rueAdmin?.message}
                {...register("rueAdmin")}
              />
              <FormField
                label={t("auth.shared.adminCity")}
                icon={MapPin}
                placeholder="Douala"
                error={errors.villeAdmin?.message}
                {...register("villeAdmin")}
              />
              <FormField
                label={t("auth.shared.adminPostalCode")}
                icon={Hash}
                placeholder="BP 5678"
                error={errors.codePostalAdmin?.message}
                {...register("codePostalAdmin")}
              />
              <FormField
                label={t("auth.shared.adminCountry")}
                icon={MapPin}
                placeholder="Cameroun"
                error={errors.paysAdmin?.message}
                {...register("paysAdmin")}
              />
              <FormField
                label={t("auth.shared.password")}
                icon={Lock}
                isPassword
                placeholder="••••••••"
                error={errors.motDePasse?.message}
                {...register("motDePasse")}
              />
              <FormField
                label={t("auth.shared.confirmPassword")}
                icon={Lock}
                isPassword
                placeholder="••••••••"
                error={errors.confirmMotDePasse?.message}
                {...register("confirmMotDePasse")}
              />
            </div>

            <label className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer pt-2">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-[#0066FF] focus:ring-[#0066FF]"
                {...register("acceptConditions")}
              />
              <span>
                {t("auth.register.acceptPrefix")}{" "}
                <a
                  href="#"
                  className="text-[#0066FF] font-semibold hover:underline"
                >
                  {t("auth.shared.terms")}
                </a>{" "}
                {t("auth.register.acceptMiddle")}{" "}
                <a
                  href="#"
                  className="text-[#0066FF] font-semibold hover:underline"
                >
                  {t("auth.shared.privacy")}
                </a>
              </span>
            </label>
            {errors.acceptConditions && (
              <p className="text-red-500 text-xs">
                {errors.acceptConditions.message}
              </p>
            )}

            {serverError && (
              <p className="text-red-500 text-sm">{serverError}</p>
            )}

            <button
              type="submit"
              className="w-full bg-[#0066FF] hover:bg-[#0052CC] text-white font-semibold py-3 px-4 rounded-xl transition-colors text-sm mt-2"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? t("buttons.registerLoading")
                : `${t("buttons.registerAccount")} →`}
            </button>
          </form>

          <p className="text-center text-sm mt-6 text-gray-500">
            {t("auth.register.alreadyAccount")}{" "}
            <Link
              to="/login"
              className="text-[#0066FF] font-semibold hover:underline"
            >
              {t("auth.register.loginLink")}
            </Link>
          </p>
          </div>
        </div>
      </div>
    </main>
  );
}
