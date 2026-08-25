import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../../core/store/authStore";
import { entrepriseApi } from "../api/entrepriseApi";
import type { EntrepriseRequest } from "../types";

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
  const queryClient = useQueryClient();
  const fetchUserProfile = useAuthStore((s) => s.fetchUserProfile);

  const entrepriseQuery = useQuery({
    queryKey: ["entreprise", "me"],
    queryFn: async () => (await entrepriseApi.getEntreprise()).data,
  });

  const entreprise = entrepriseQuery.data;

  const [nom, setNom] = useState("");
  const [codeFiscal, setCodeFiscal] = useState("");
  const [numTel, setNumTel] = useState("");
  const [email, setEmail] = useState("");
  const [rue, setRue] = useState("");
  const [codePostal, setCodePostal] = useState("");
  const [ville, setVille] = useState("");
  const [pays, setPays] = useState("");
  const [alerteStock, setAlerteStock] = useState("10 unités");
  const [devise, setDevise] = useState("Euro (€)");

  useEffect(() => {
    if (entreprise) {
      setNom(entreprise.nom ?? "");
      setCodeFiscal(entreprise.codeFiscal ?? "");
      setNumTel(entreprise.numTel ?? "");
      setEmail(entreprise.email ?? "");
      setRue(entreprise.rue ?? "");
      setCodePostal(entreprise.codePostal ?? "");
      setVille(entreprise.ville ?? "");
      setPays(entreprise.pays ?? "");
    }
  }, [entreprise]);

  useEffect(() => {
    const savedAlerte = localStorage.getItem("entreprise_alerteStock");
    const savedDevise = localStorage.getItem("entreprise_devise");
    if (savedAlerte) setAlerteStock(savedAlerte);
    if (savedDevise) setDevise(savedDevise);
  }, []);

  const updateMutation = useMutation({
    mutationFn: (data: EntrepriseRequest) => entrepriseApi.updateEntreprise(data),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["entreprise", "me"] });
      await fetchUserProfile();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("entreprise_alerteStock", alerteStock);
    localStorage.setItem("entreprise_devise", devise);
    updateMutation.mutate({
      nom,
      codeFiscal,
      email,
      numTel,
      rue,
      codePostal,
      ville,
      pays,
    });
  };

  if (entrepriseQuery.isLoading) {
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
                placeholder="contact@monentreprise.fr"
                type="email"
              />
              <div className="sm:col-span-2">
                <Field
                  label="Adresse"
                  value={rue}
                  onChange={setRue}
                  placeholder="15 rue du Commerce, 75001 Paris"
                />
              </div>
              <Field
                label="Code postal"
                value={codePostal}
                onChange={setCodePostal}
                placeholder="75001"
              />
              <Field
                label="Ville"
                value={ville}
                onChange={setVille}
                placeholder="Paris"
              />
              <Field
                label="Pays"
                value={pays}
                onChange={setPays}
                placeholder="France"
              />
            </div>

            {/* ── PARAMÈTRES DE STOCK ── */}
            <h2 className="mb-4 mt-8 text-xs font-bold uppercase tracking-wider text-gray-400">
              Paramètres de stock
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField
                label="Alerte stock faible par défaut"
                value={alerteStock}
                onChange={setAlerteStock}
                options={STOCK_ALERT_OPTIONS}
              />
              <SelectField
                label="Devise"
                value={devise}
                onChange={setDevise}
                options={DEVISE_OPTIONS}
              />
            </div>
          </div>

          {/* ── BOUTON ENREGISTRER ── */}
          <div className="flex justify-end border-t border-gray-100 px-6 py-4">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-[#0066FF] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0052CC] disabled:opacity-50"
            >
              <Save size={16} />
              {updateMutation.isPending
                ? "Enregistrement..."
                : "Enregistrer"}
            </button>
          </div>
        </div>

        {updateMutation.isError && (
          <p className="mt-3 text-sm text-red-500">
            Une erreur est survenue lors de l'enregistrement.
          </p>
        )}
        {updateMutation.isSuccess && (
          <p className="mt-3 text-sm text-emerald-600">
            Modifications enregistrées avec succès.
          </p>
        )}
      </form>
    </div>
  );
}

/* ── Sous-composants ── */

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
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-lg border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
