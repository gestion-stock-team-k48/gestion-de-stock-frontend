import { useState } from "react";
import { Save, Lock, Upload } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../../core/store/authStore";
import { useEntreprise } from "../hooks";
import { utilisateurApi } from "../../utilisateurs/api/utilisateurApi";

const STOCK_ALERT_OPTIONS = [
  "5 unités",
  "10 unités",
  "15 unités",
  "20 unités",
  "50 unités",
  "100 unités",
];

const DEVISE_OPTIONS = [
  "Euro (€)",
  "Dollar ($)",
  "Franc CFA (FCFA)",
  "Livre sterling (£)",
];

export default function EntreprisePage() {
  const { t } = useTranslation();
  const fetchUserProfile = useAuthStore((s) => s.fetchUserProfile);
  const { entreprise, isLoading, updateEntreprise } = useEntreprise();

  // Champs éditables — initialisés à "" et remplis dès que les données arrivent
  const [nom, setNom] = useState("");
  const [codeFiscal, setCodeFiscal] = useState("");
  const [numTel, setNumTel] = useState("");
  const [email, setEmail] = useState("");
  const [rue, setRue] = useState("");
  const [codePostal, setCodePostal] = useState("");
  const [ville, setVille] = useState("");
  const [pays, setPays] = useState("");
  const [alerteStock, setAlerteStock] = useState(
    () => localStorage.getItem("entreprise_alerteStock") ?? "10 unités",
  );
  const [devise, setDevise] = useState(
    () => localStorage.getItem("entreprise_devise") ?? "Euro (€)",
  );

  // Init fields on first load from backend data (without useEffect)
  if (entreprise && !nom) {
    setNom(entreprise.nom ?? "");
    setCodeFiscal(entreprise.codeFiscal ?? "");
    setNumTel(entreprise.numTel ?? "");
    setEmail(entreprise.email ?? "");
    setRue(entreprise.rue ?? "");
    setCodePostal(entreprise.codePostal ?? "");
    setVille(entreprise.ville ?? "");
    setPays(entreprise.pays ?? "");
  }

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const handleUpdate = async () => {
    updateEntreprise.mutate({
      nom,
      codeFiscal,
      email,
      numTel,
      rue,
      codePostal,
      ville,
      pays,
    });
    await fetchUserProfile();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("entreprise_alerteStock", alerteStock);
    localStorage.setItem("entreprise_devise", devise);
    handleUpdate();
  };

  const handleChangePassword = async () => {
    setPasswordError(null);
    setPasswordSuccess(false);
    if (!oldPassword || !newPassword) {
      setPasswordError("Veuillez remplir tous les champs.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("Le mot de passe doit faire au moins 8 caractères.");
      return;
    }
    try {
      await utilisateurApi.changePassword({
        oldPassword,
        newPassword,
      });
      setPasswordSuccess(true);
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setTimeout(() => setShowChangePassword(false), 2000);
    } catch {
      setPasswordError("L'ancien mot de passe est incorrect.");
    }
  };

  const handlePhotoUpload = async () => {
    if (!photoFile || !entreprise?.id) return;
    setIsUploadingPhoto(true);
    try {
      await utilisateurApi.uploadPhoto(Number(entreprise.id), photoFile);
      await fetchUserProfile();
      setPhotoFile(null);
    } catch {
      // silently fail
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded-lg bg-gray-200" />
          <div className="h-4 w-72 rounded bg-gray-200" />
          <div className="mt-8 h-96 rounded-xl border border-gray-200 bg-white" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-950 sm:text-3xl">
          {t("navigation.entreprise")}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Paramètres et informations de votre entreprise
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="px-6 py-5">
            {/* ── INFORMATIONS GÉNÉRALES ── */}
            <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-400">
              Informations générales
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Nom de l'entreprise"
                value={nom}
                onChange={setNom}
                placeholder="Mon Entreprise"
              />
              <Field
                label="SIRET"
                value={codeFiscal}
                onChange={setCodeFiscal}
                placeholder="123 456 789 00012"
              />
              <Field
                label="Téléphone"
                value={numTel}
                onChange={setNumTel}
                placeholder="01 23 45 67 89"
              />
              <Field
                label="Email"
                value={email}
                onChange={setEmail}
                placeholder="contact@entreprise.fr"
                type="email"
              />
              <Field
                label="Rue"
                value={rue}
                onChange={setRue}
                placeholder="15 rue du Commerce"
              />
              <Field
                label="Ville"
                value={ville}
                onChange={setVille}
                placeholder="Paris"
              />
              <Field
                label="Code postal"
                value={codePostal}
                onChange={setCodePostal}
                placeholder="75001"
              />
              <Field
                label="Pays"
                value={pays}
                onChange={setPays}
                placeholder="France"
              />
            </div>

            {/* ── PRÉFÉRENCES ── */}
            <h2 className="mt-8 mb-4 text-xs font-bold uppercase tracking-wider text-gray-400">
              Préférences
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Alertes de stock
                </span>
                <select
                  value={alerteStock}
                  onChange={(e) => setAlerteStock(e.target.value)}
                  className="mt-1.5 h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[#0066FF]"
                >
                  {STOCK_ALERT_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Devise
                </span>
                <select
                  value={devise}
                  onChange={(e) => setDevise(e.target.value)}
                  className="mt-1.5 h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[#0066FF]"
                >
                  {DEVISE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </label>
            </div>

            {updateEntreprise.isError && (
              <p className="mt-4 text-sm font-semibold text-red-600">
                Erreur lors de la mise à jour. Vérifiez les champs.
              </p>
            )}
            {updateEntreprise.isSuccess && (
              <p className="mt-4 text-sm font-semibold text-emerald-600">
                Informations mises à jour avec succès.
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
            <button
              type="submit"
              disabled={updateEntreprise.isPending}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#0066FF] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#0052CC] disabled:opacity-60"
            >
              <Save size={16} />
              {updateEntreprise.isPending ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </div>
      </form>

      {/* ── SÉCURITÉ ── */}
      <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="px-6 py-5">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-400">
            Sécurité
          </h2>
          <button
            type="button"
            onClick={() => setShowChangePassword(!showChangePassword)}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-200 px-4 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            <Lock size={16} />
            Changer le mot de passe
          </button>

          {showChangePassword && (
            <div className="mt-4 max-w-md space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <Field
                label="Mot de passe actuel"
                value={oldPassword}
                onChange={setOldPassword}
                type="password"
                placeholder="••••••••"
              />
              <Field
                label="Nouveau mot de passe"
                value={newPassword}
                onChange={setNewPassword}
                type="password"
                placeholder="••••••••"
              />
              <Field
                label="Confirmer le nouveau mot de passe"
                value={confirmNewPassword}
                onChange={setConfirmNewPassword}
                type="password"
                placeholder="••••••••"
              />
              {passwordError && (
                <p className="text-sm font-semibold text-red-600">{passwordError}</p>
              )}
              {passwordSuccess && (
                <p className="text-sm font-semibold text-emerald-600">
                  Mot de passe changé avec succès !
                </p>
              )}
              <button
                type="button"
                onClick={handleChangePassword}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#0066FF] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#0052CC]"
              >
                <Lock size={16} />
                Confirmer
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── PHOTO ── */}
      <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="px-6 py-5">
          <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-400">
            Photo de profil
          </h2>
          <div className="flex items-center gap-4">
            <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-gray-200 px-4 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50">
              <Upload size={16} />
              {photoFile ? photoFile.name : "Choisir une photo"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
              />
            </label>
            {photoFile && (
              <button
                type="button"
                onClick={handlePhotoUpload}
                disabled={isUploadingPhoto}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#0066FF] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#0052CC] disabled:opacity-60"
              >
                {isUploadingPhoto ? "Upload..." : "Envoyer"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 h-11 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#0066FF]"
      />
    </label>
  );
}
