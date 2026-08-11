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
  Headphones,
} from "lucide-react";
import { authApi } from "../../../features/auth/api/authAPi";
import { useAuthStore } from "../../../core/store/authStore";
import { FormField } from "../../../components/ui/FormField";

const registerSchema = z
  .object({
    nomEntreprise: z.string().min(1, "Nom de l'entreprise requis"),
    codeFiscal: z.string().min(1, "Code fiscal requis"),
    email: z.string().email("Email entreprise invalide"),
    prenomAdmin: z.string().min(1, "Prénom requis"),
    nomAdmin: z.string().min(1, "Nom requis"),
    emailAdmin: z.string().email("Email invalide"),
    dateDeNaissance: z.string().min(1, "Date de naissance requise"),
    motDePasse: z.string().min(8, "8 caractères minimum"),
    confirmMotDePasse: z.string(),
    acceptConditions: z.boolean().refine((v) => v === true, {
      message: "Vous devez accepter les conditions",
    }),
  })
  .refine((data) => data.motDePasse === data.confirmMotDePasse, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmMotDePasse"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    try {
      const { confirmMotDePasse, acceptConditions, ...payload } = data;
      const res = await authApi.register(payload);
      setAuth(res.data.token, res.data.refreshToken);
      navigate("/dashboard");
    } catch {
      setServerError(
        "Impossible de créer le compte. Vérifiez vos informations.",
      );
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* Panneau gauche : Bleu identique au modèle */}
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
              Rejoignez-nous dès aujourd'hui
            </h2>
            <p className="opacity-80 text-sm leading-relaxed">
              Créez votre compte en quelques secondes et commencez à gérer votre
              entreprise efficacement.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0 mt-0.5">
                <Zap size={18} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm">Démarrage rapide</p>
                <p className="opacity-70 text-xs">Prêt en moins de 2 minutes</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldCheck size={18} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm">Essai gratuit</p>
                <p className="opacity-70 text-xs">
                  Sans engagement, sans carte bancaire
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0 mt-0.5">
                <Headphones size={18} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-sm">Support dédié</p>
                <p className="opacity-70 text-xs">Une équipe à votre écoute</p>
              </div>
            </div>
          </div>
        </div>

        <p className="opacity-50 text-xs">
          © 2026 Gestion Stock. Tous droits réservés.
        </p>
      </div>

      {/* Panneau droit : Formulaire */}
      <div className="flex flex-1 justify-center items-center p-6 lg:p-12 bg-white overflow-y-auto">
        <div className="w-full max-w-lg py-4">
          <p className="text-[#0066FF] text-xs font-bold tracking-wider uppercase mb-1">
            INSCRIPTION
          </p>
          <h2 className="text-2xl font-bold mb-1 text-gray-900">
            Créez votre compte
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            Quelques secondes suffisent pour démarrer
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                label="Nom de l'entreprise"
                icon={Building2}
                placeholder="Ma Société SARL"
                error={errors.nomEntreprise?.message}
                {...register("nomEntreprise")}
              />
              <FormField
                label="Code fiscal"
                icon={Hash}
                placeholder="123456789"
                error={errors.codeFiscal?.message}
                {...register("codeFiscal")}
              />
              <div className="sm:col-span-2">
                <FormField
                  label="Email de l'entreprise"
                  icon={Mail}
                  type="email"
                  placeholder="contact@masociete.fr"
                  error={errors.email?.message}
                  {...register("email")}
                />
              </div>
              <FormField
                label="Prénom"
                icon={User}
                placeholder="Jean"
                error={errors.prenomAdmin?.message}
                {...register("prenomAdmin")}
              />
              <FormField
                label="Nom"
                icon={User}
                placeholder="Dupont"
                error={errors.nomAdmin?.message}
                {...register("nomAdmin")}
              />
              <FormField
                label="Adresse email"
                icon={Mail}
                type="email"
                placeholder="jean@monentreprise.fr"
                error={errors.emailAdmin?.message}
                {...register("emailAdmin")}
              />
              <FormField
                label="Date de naissance"
                icon={Calendar}
                type="date"
                error={errors.dateDeNaissance?.message}
                {...register("dateDeNaissance")}
              />
              <FormField
                label="Mot de passe"
                icon={Lock}
                isPassword
                placeholder="••••••••"
                error={errors.motDePasse?.message}
                {...register("motDePasse")}
              />
              <FormField
                label="Confirmer le mot de passe"
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
                J'accepte les{" "}
                <a
                  href="#"
                  className="text-[#0066FF] font-semibold hover:underline"
                >
                  conditions d'utilisation
                </a>{" "}
                et la{" "}
                <a
                  href="#"
                  className="text-[#0066FF] font-semibold hover:underline"
                >
                  politique de confidentialité
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
              {isSubmitting ? "Création..." : "Créer mon compte →"}
            </button>
          </form>

          <p className="text-center text-sm mt-6 text-gray-500">
            Déjà un compte ?{" "}
            <Link
              to="/login"
              className="text-[#0066FF] font-semibold hover:underline"
            >
              Connectez-vous
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
