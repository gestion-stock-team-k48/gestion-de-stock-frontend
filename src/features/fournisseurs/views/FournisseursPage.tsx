import { useMemo, useState, useEffect } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Edit3,
  Eye,
  LayoutGrid,
  Mail,
  MapPin,
  Phone,
  Search,
  Table2,
  Trash2,
  Truck,
  Upload,
  X,
} from "lucide-react";
import { fournisseursApi } from "../api/fournisseursApi";
import type { FournisseurRequest, FournisseurResponse } from "../types";
import { AddEntityButton, CrudToast, Pagination } from "../../../components/ui";

const fullName = (f: FournisseurResponse) =>
  [f.prenom, f.nom].filter(Boolean).join(" ") || "Sans nom";

const addressLine = (f: FournisseurResponse) =>
  [f.rue, f.codePostal, f.ville, f.pays].filter(Boolean).join(", ");

const ISO_COUNTRY_CODES = [
  "AF",
  "AL",
  "DZ",
  "DE",
  "AD",
  "AO",
  "AR",
  "AM",
  "AU",
  "AT",
  "AZ",
  "BS",
  "BH",
  "BD",
  "BB",
  "BE",
  "BZ",
  "BJ",
  "BT",
  "BO",
  "BA",
  "BW",
  "BR",
  "BN",
  "BG",
  "BF",
  "BI",
  "KH",
  "CM",
  "CA",
  "CV",
  "CF",
  "TD",
  "CL",
  "CN",
  "CY",
  "CO",
  "KM",
  "CG",
  "CD",
  "KR",
  "CR",
  "CI",
  "HR",
  "CU",
  "DK",
  "DJ",
  "DM",
  "EG",
  "AE",
  "EC",
  "ER",
  "ES",
  "EE",
  "US",
  "ET",
  "FJ",
  "FI",
  "FR",
  "GA",
  "GM",
  "GE",
  "GH",
  "GR",
  "GD",
  "GT",
  "GN",
  "GW",
  "GQ",
  "GY",
  "HT",
  "HN",
  "HU",
  "IN",
  "ID",
  "IQ",
  "IR",
  "IE",
  "IS",
  "IL",
  "IT",
  "JM",
  "JP",
  "JO",
  "KZ",
  "KE",
  "KG",
  "KI",
  "KW",
  "LA",
  "LS",
  "LV",
  "LB",
  "LR",
  "LY",
  "LI",
  "LT",
  "LU",
  "MK",
  "MG",
  "MY",
  "MW",
  "MV",
  "ML",
  "MT",
  "MA",
  "MU",
  "MR",
  "MX",
  "FM",
  "MD",
  "MC",
  "MN",
  "ME",
  "MZ",
  "MM",
  "NA",
  "NR",
  "NP",
  "NI",
  "NE",
  "NG",
  "NO",
  "NZ",
  "OM",
  "UG",
  "UZ",
  "PK",
  "PW",
  "PA",
  "PG",
  "PY",
  "NL",
  "PE",
  "PH",
  "PL",
  "PT",
  "QA",
  "CF",
  "DO",
  "RO",
  "GB",
  "RU",
  "RW",
  "SV",
  "WS",
  "ST",
  "SN",
  "RS",
  "SC",
  "SL",
  "SG",
  "SK",
  "SI",
  "SO",
  "SD",
  "SS",
  "LK",
  "SE",
  "CH",
  "SR",
  "SZ",
  "SY",
  "TJ",
  "TZ",
  "TD",
  "TH",
  "TL",
  "TG",
  "TO",
  "TT",
  "TN",
  "TM",
  "TR",
  "TV",
  "UA",
  "UY",
  "VU",
  "VA",
  "VE",
  "VN",
  "YE",
  "ZM",
  "ZW",
];
const countryNames = new Intl.DisplayNames(["fr"], { type: "region" });
const COUNTRIES = ISO_COUNTRY_CODES
  // .filter((code) => /^[A-Z]{2}$/.test(code))
  .map((code) => countryNames.of(code))
  .filter((name): name is string => Boolean(name))
  .sort((a, b) => a.localeCompare(b, "fr"));

export default function FournisseursPage() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<FournisseurResponse | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [draftNom, setDraftNom] = useState("");
  const [draftPrenom, setDraftPrenom] = useState("");
  const [draftEmail, setDraftEmail] = useState("");
  const [draftPhone, setDraftPhone] = useState("");
  const [draftRue, setDraftRue] = useState("");
  const [draftVille, setDraftVille] = useState("");
  const [draftCodePostal, setDraftCodePostal] = useState("");
  const [draftPays, setDraftPays] = useState("");
  const [detailId, setDetailId] = useState<number | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(null);
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const fournisseursQuery = useQuery({
    queryKey: ["fournisseurs", page, pageSize],
    queryFn: async () => (await fournisseursApi.getAll({ page, size: pageSize })).data,
  });

  const createMutation = useMutation({
    mutationFn: (data: FournisseurRequest) => fournisseursApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fournisseurs"] });
      closeModal();
      setToast({ message: "Fournisseur ajouté avec succès.", variant: "success" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FournisseurRequest }) =>
      fournisseursApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fournisseurs"] });
      closeModal();
      setToast({ message: "Fournisseur modifié avec succès.", variant: "success" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => fournisseursApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fournisseurs"] });
      setDeleteId(null);
      setToast({ message: "Fournisseur supprimé avec succès.", variant: "success" });
    },
  });

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const uploadPhotoMutation = useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) =>
      fournisseursApi.uploadPhoto(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fournisseurs"] });
      setPhotoFile(null);
    },
  });

  const fournisseurs = useMemo(
    () => fournisseursQuery.data?.content ?? [],
    [fournisseursQuery.data],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return fournisseurs;
    return fournisseurs.filter(
      (f) =>
        fullName(f).toLowerCase().includes(q) ||
        f.email.toLowerCase().includes(q) ||
        (f.numTel ?? "").includes(q),
    );
  }, [fournisseurs, query]);

  const totals = useMemo(
    () => ({
      total: fournisseursQuery.data?.totalElements ?? fournisseurs.length,
      withPhone: fournisseurs.filter((f) => !!f.numTel).length,
      withAddress: fournisseurs.filter((f) => !!addressLine(f)).length,
    }),
    [fournisseurs, fournisseursQuery.data],
  );

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  function resetForm() {
    setDraftNom("");
    setDraftPrenom("");
    setDraftEmail("");
    setDraftPhone("");
    setDraftRue("");
    setDraftVille("");
    setDraftCodePostal("");
    setDraftPays("");
    setPhotoFile(null);
  }

  function openEdit(f: FournisseurResponse) {
    setEditing(f);
    setDraftNom(f.nom);
    setDraftPrenom(f.prenom);
    setDraftEmail(f.email);
    setDraftPhone(f.numTel ?? "");
    setDraftRue(f.rue ?? "");
    setDraftVille(f.ville ?? "");
    setDraftCodePostal(f.codePostal ?? "");
    setDraftPays(f.pays ?? "");
    setPhotoFile(null);
    setIsModalOpen(true);
  }

  function openCreate() {
    setEditing(null);
    resetForm();
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditing(null);
    resetForm();
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const data: FournisseurRequest = {
      nom: draftNom.trim(),
      prenom: draftPrenom.trim(),
      email: draftEmail.trim(),
      numTel: draftPhone.trim() || undefined,
      rue: draftRue.trim() || undefined,
      ville: draftVille.trim() || undefined,
      codePostal: draftCodePostal.trim() || undefined,
      pays: draftPays.trim() || undefined,
    };
    if (!data.prenom) { setToast({ message: "Le prénom est obligatoire.", variant: "error" }); return; }
    if (!data.nom) { setToast({ message: "Le nom est obligatoire.", variant: "error" }); return; }
    if (!data.email) { setToast({ message: "L'adresse email est obligatoire.", variant: "error" }); return; }
    if (!/^\S+@\S+\.\S+$/.test(data.email)) { setToast({ message: "Veuillez saisir une adresse email valide.", variant: "error" }); return; }

    if (editing) {
      updateMutation.mutate(
        { id: editing.id, data },
        {
          onSuccess: () => {
            if (photoFile)
              uploadPhotoMutation.mutate({ id: editing.id, file: photoFile });
          },
        },
      );
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      {toast && <CrudToast message={toast.message} variant={toast.variant} onClose={() => setToast(null)} />}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-950 sm:text-3xl">
            Gestion des Fournisseurs
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Gérez vos fournisseurs et leurs informations
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Total Fournisseurs" value={String(totals.total)} tone="blue" />
        <StatCard label="Téléphones" value={String(totals.withPhone)} tone="purple" />
        <StatCard label="Adresses" value={String(totals.withAddress)} tone="green" />
      </div>

      <section className="mt-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 px-5 py-6 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-base font-bold text-gray-950">Liste des Fournisseurs</h2>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="inline-flex h-10 w-fit rounded-lg border border-gray-200 bg-white p-1">
              <ViewButton active={viewMode === "grid"} onClick={() => setViewMode("grid")} icon={LayoutGrid}>Grille</ViewButton>
              <ViewButton active={viewMode === "table"} onClick={() => setViewMode("table")} icon={Table2}>Table</ViewButton>
            </div>
            <AddEntityButton label="Ajouter un Fournisseur" onClick={openCreate} />
          </div>
        </div>

        <div className="px-5 pb-5">
          <label className="flex h-10 w-full max-w-md items-center gap-3 rounded-lg bg-gray-100 px-3 text-slate-400">
            <Search size={17} />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-slate-500" placeholder="Rechercher par nom, email, téléphone..." />
          </label>
        </div>

        <div className="px-5 pb-6">
          {viewMode === "grid" ? (
            <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {filtered.map((f) => (
                <article key={f.id} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600"><Truck size={22} /></div>
                    <div className="min-w-0"><h3 className="text-lg font-bold text-gray-950">{fullName(f)}</h3><span className="mt-2 inline-flex rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">Actif</span></div>
                  </div>
                  <div className="mt-7 space-y-3 text-sm text-slate-700">
                    <p className="flex items-start gap-3"><Mail size={16} className="mt-0.5 shrink-0 text-slate-400" />{f.email}</p>
                    {f.numTel && <p className="flex items-start gap-3"><Phone size={16} className="mt-0.5 shrink-0 text-slate-400" />{f.numTel}</p>}
                    {addressLine(f) && <p className="flex items-start gap-3"><MapPin size={16} className="mt-0.5 shrink-0 text-slate-400" />{addressLine(f)}</p>}
                  </div>
                  <div className="mt-6 flex gap-2"><button type="button" onClick={() => setDetailId(f.id)} className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-950 hover:border-blue-200 hover:text-[#0066FF]"><Eye size={16} /> Voir</button><button type="button" onClick={() => openEdit(f)} className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-950 hover:border-blue-200 hover:text-[#0066FF]"><Edit3 size={16} /> Modifier</button><button type="button" onClick={() => setDeleteId(f.id)} className="inline-flex h-9 w-10 items-center justify-center rounded-lg border border-red-100 text-red-500 hover:bg-red-50"><Trash2 size={16} /></button></div>
                </article>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-5 py-3 font-bold">Fournisseur</th>
                <th className="px-5 py-3 font-bold">Email</th>
                <th className="px-5 py-3 font-bold">Téléphone</th>
                <th className="px-5 py-3 font-bold">Adresse</th>
                <th className="px-5 py-3 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {fournisseursQuery.isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center text-sm text-gray-500"
                  >
                    {query
                      ? "Aucun fournisseur ne correspond à votre recherche."
                      : "Aucun fournisseur enregistré."}
                  </td>
                </tr>
              ) : (
                filtered.map((f) => (
                  <tr
                    key={f.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                          <Truck size={16} />
                        </div>
                        <span className="font-semibold text-gray-900">
                          {fullName(f)}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      <span className="inline-flex items-center gap-1.5">
                        <Mail size={14} className="text-gray-400" />
                        {f.email}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      <span className="inline-flex items-center gap-1.5">
                        <Phone size={14} className="text-gray-400" />
                        {f.numTel || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin size={14} className="text-gray-400" />
                        {addressLine(f) || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setDetailId(f.id)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                          title="Voir"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(f)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                          title="Modifier"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteId(f.id)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table></div>
          )}
          {fournisseursQuery.isLoading && <div className="py-12 text-center text-sm text-slate-500">Chargement...</div>}
          {!fournisseursQuery.isLoading && filtered.length === 0 && <div className="py-12 text-center text-sm text-slate-500">Aucun fournisseur trouvé.</div>}
        </div>
      </section>

      <Pagination page={page} totalPages={fournisseursQuery.data?.totalPages ?? 0} onPageChange={setPage} />

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-lg rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-lg font-bold text-gray-950">
                {editing ? "Modifier le fournisseur" : "Nouveau fournisseur"}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[65vh] overflow-y-auto px-6 py-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Prénom"
                  value={draftPrenom}
                  onChange={setDraftPrenom}
                  placeholder="Jean"
                />
                <Field
                  label="Nom"
                  value={draftNom}
                  onChange={setDraftNom}
                  placeholder="Dupont"
                />
                <div className="sm:col-span-2">
                  <Field
                    label="Email"
                    value={draftEmail}
                    onChange={setDraftEmail}
                    placeholder="fournisseur@email.fr"
                    type="email"
                  />
                </div>
                <Field
                  label="Téléphone"
                  value={draftPhone}
                  onChange={setDraftPhone}
                  placeholder="651 12 34 56"
                  pattern="6[45789][0-9]{7}|620[0-9]{6}|2[234][0-9]{7}"
                  title="Numéro invalide : mobile Orange/MTN (6X...), mobile CAMTEL (620...) ou fixe CAMTEL (22/23/24...) — 9 chiffres au total"
                />
                <div className="sm:col-span-2">
                  <Field
                    label="Rue"
                    value={draftRue}
                    onChange={setDraftRue}
                    placeholder="15 rue du Commerce"
                  />
                </div>
                <Field
                  label="Ville"
                  value={draftVille}
                  onChange={setDraftVille}
                  placeholder="Paris"
                  pattern="[A-Za-zÀ-Ÿ][A-Za-zÀ-Ÿ\s\-']*"
                  title="La ville doit commencer par une lettre (espaces, tirets et apostrophes autorisés ensuite)"
                />
                <Field
                  label="Code postal"
                  value={draftCodePostal}
                  onChange={setDraftCodePostal}
                  placeholder="BP12345"
                  pattern="BP[0-9]{1,5}"
                  title="le code postal doit commencer par BP suivi de 1 à 5 chiffres"
                />
                {/* <Field label="Pays" value={draftPays} onChange={setDraftPays} placeholder="France" /> */}

                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-gray-700">
                    Pays
                  </span>
                  <select
                    value={draftPays}
                    onChange={(e) => setDraftPays(e.target.value)}
                    className="mt-1.5 h-11 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#0066FF]"
                  >
                    <option value="">--choisir un pays--</option>
                    {COUNTRIES.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </label>

                {editing && (
                  <div className="sm:col-span-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Photo
                    </span>
                    <div className="mt-1.5 flex items-center gap-3">
                      {(photoFile || editing.photo) && (
                        <img
                          src={
                            photoFile
                              ? URL.createObjectURL(photoFile)
                              : editing.photo!
                          }
                          alt="aperçu"
                          className="h-11 w-11 shrink-0 rounded-full object-cover"
                        />
                      )}

                      <label className="mt-1.5 flex h-11 w-full cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 text-sm text-slate-500 hover:bg-gray-100 transition-colors">
                        <Upload size={15} />
                        {photoFile ? photoFile.name : "Choisir une photo"}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            setPhotoFile(e.target.files?.[0] ?? null)
                          }
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-lg bg-[#0066FF] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0052CC] disabled:opacity-50"
              >
                {isSubmitting
                  ? "Enregistrement..."
                  : editing
                    ? "Enregistrer"
                    : "Créer"}
              </button>
            </div>

            {(createMutation.isError || updateMutation.isError) && (
              <p className="px-6 pb-4 text-sm text-red-500">
                Erreur lors de l'enregistrement.
              </p>
            )}
          </form>
        </div>
      )}

      {/* Modal Détail */}
      {detailId !== null && (
        <DetailFournisseurModal
          id={detailId}
          onClose={() => setDetailId(null)}
        />
      )}

      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <Trash2 size={20} className="text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Supprimer ce fournisseur ?
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Cette action est irréversible.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => deleteMutation.mutate(deleteId)}
                disabled={deleteMutation.isPending}
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleteMutation.isPending ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Modal Détail Fournisseur ── */

function DetailFournisseurModal({
  id,
  onClose,
}: {
  id: number;
  onClose: () => void;
}) {
  const { data: fournisseur, isLoading } = useQuery({
    queryKey: ["fournisseurs", id],
    queryFn: async () => (await fournisseursApi.getById(id)).data,
    enabled: id !== null,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-950">
            Détail du fournisseur
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>
        <div className="px-6 py-5">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-5 w-full animate-pulse rounded bg-gray-200"
                />
              ))}
            </div>
          ) : !fournisseur ? (
            <p className="text-center text-sm text-gray-500">
              Fournisseur introuvable.
            </p>
          ) : (
            <>
              {fournisseur.photo && (
                <div className="mb-4 flex justify-center">
                  <img
                    src={fournisseur.photo}
                    alt={fullName(fournisseur)}
                    className="h-24 w-24 rounded-full object-cover"
                  />
                </div>
              )}
              <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Nom complet</p>
                  <p className="font-semibold text-gray-900">
                    {fournisseur.prenom} {fournisseur.nom}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="font-semibold text-gray-900">
                    {fournisseur.email}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Téléphone</p>
                  <p className="font-semibold text-gray-900">
                    {fournisseur.numTel || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Adresse</p>
                  <p className="font-semibold text-gray-900">
                    {[
                      fournisseur.rue,
                      fournisseur.codePostal,
                      fournisseur.ville,
                      fournisseur.pays,
                    ]
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </p>
                </div>
              </div>
              {(fournisseur.createdBy || fournisseur.createdAt) && (
                <div className="border-t border-gray-100 pt-4 text-xs text-gray-400">
                  {fournisseur.createdBy && (
                    <span>Créé par {fournisseur.createdBy}</span>
                  )}
                  {fournisseur.createdAt && (
                    <span>
                      {" "}
                      le{" "}
                      {new Date(fournisseur.createdAt).toLocaleDateString(
                        "fr-FR",
                      )}
                    </span>
                  )}
                </div>
              )}
            </>
          )}
        </div>
        <div className="flex justify-end border-t border-gray-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Fermer
          </button>
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
  pattern,
  title,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  pattern?: string;
  title?: string;
  maxLength?: number;
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
        pattern={pattern}
        title={title}
        maxLength={maxLength}
        className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "blue" | "purple" | "green";
}) {
  const tones = {
    blue: "bg-blue-100 text-[#0066FF]",
    purple: "bg-purple-100 text-purple-600",
    green: "bg-emerald-100 text-emerald-600",
  };
  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${tones[tone]}`}><Truck size={22} /></div>
      <div><p className="text-sm text-slate-500">{label}</p><p className="mt-1 text-2xl font-bold text-gray-950">{value}</p></div>
    </div>
  );
}

function ViewButton({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof LayoutGrid;
  children: string;
}) {
  return <button type="button" onClick={onClick} className={`inline-flex h-8 items-center gap-2 rounded-md px-3 text-sm font-semibold ${active ? "bg-[#0066FF] text-white" : "text-gray-700 hover:bg-gray-50"}`}><Icon size={15} />{children}</button>;
}
