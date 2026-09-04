import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Edit3,
  Eye,
  LayoutGrid,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Table2,
  Trash2,
  Upload,
  UserCircle2,
  X,
} from "lucide-react";
import { clientsApi } from "../api/clientsApi";
import type { ClientRequest, ClientResponse } from "../types";

const fullName = (c: ClientResponse) =>
  [c.prenom, c.nom].filter(Boolean).join(" ") || "Sans nom";
const addressLine = (c: ClientResponse) =>
  [c.rue, c.codePostal, c.ville, c.pays].filter(Boolean).join(", ");

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

export default function ClientsPage() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<ClientResponse | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [draftNom, setDraftNom] = useState("");
  const [draftPrenom, setDraftPrenom] = useState("");
  const [draftEmail, setDraftEmail] = useState("");
  const [draftPhone, setDraftPhone] = useState("");
  const [draftRue, setDraftRue] = useState("");
  const [draftVille, setDraftVille] = useState("");
  const [draftCodePostal, setDraftCodePostal] = useState("");
  const [draftPays, setDraftPays] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const clientsQuery = useQuery({
    queryKey: ["clients"],
    queryFn: async () => (await clientsApi.getAll({ page: 0, size: 500 })).data,
  });

  const createMutation = useMutation({
    mutationFn: (d: ClientRequest) => clientsApi.create(d),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      closeModal();
      setToast("Client ajouté avec succès.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ClientRequest }) =>
      clientsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      closeModal();
      setToast("Client modifié avec succès.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => clientsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      setDeleteId(null);
      setToast("Client supprimé");
    },
  });

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);
  const uploadPhotoMutation = useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) =>
      clientsApi.uploadPhoto(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      setPhotoFile(null);
    },
  });

  const clients = useMemo(
    () => clientsQuery.data?.content ?? [],
    [clientsQuery.data],
  );
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((c) =>
      [fullName(c), c.email, c.numTel ?? "", addressLine(c)]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [clients, query]);

  const totals = useMemo(
    () => ({
      total: clientsQuery.data?.totalElements ?? clients.length,
      withPhone: clients.filter((c) => !!c.numTel).length,
      withAddress: clients.filter((c) => !!addressLine(c)).length,
    }),
    [clients, clientsQuery.data],
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

  function openCreate() {
    setEditing(null);
    resetForm();
    setIsModalOpen(true);
  }

  function openEdit(c: ClientResponse) {
    setEditing(c);
    setDraftNom(c.nom);
    setDraftPrenom(c.prenom);
    setDraftEmail(c.email);
    setDraftPhone(c.numTel ?? "");
    setDraftRue(c.rue ?? "");
    setDraftVille(c.ville ?? "");
    setDraftCodePostal(c.codePostal ?? "");
    setDraftPays(c.pays ?? "");
    setPhotoFile(null);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditing(null);
    resetForm();
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const data: ClientRequest = {
      nom: draftNom.trim(),
      prenom: draftPrenom.trim(),
      email: draftEmail.trim(),
      numTel: draftPhone.trim() || undefined,
      rue: draftRue.trim() || undefined,
      ville: draftVille.trim() || undefined,
      codePostal: draftCodePostal.trim() || undefined,
      pays: draftPays.trim() || undefined,
      photo: null,
    };
    if (!data.nom || !data.prenom || !data.email) return;
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
    } else createMutation.mutate(data);
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {toast && (
        <div className="fixed right-4 top-4 z-[60] rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg">
          {toast}
        </div>
      )}
      <div>
        <h1 className="text-2xl font-bold text-gray-950 sm:text-3xl">
          Gestion des Clients
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Gérez votre base de clients
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Clients"
          value={String(totals.total)}
          tone="blue"
        />
        <StatCard
          label="Téléphones"
          value={String(totals.withPhone)}
          tone="purple"
        />
        <StatCard
          label="Adresses"
          value={String(totals.withAddress)}
          tone="green"
        />
      </div>

      <section className="mt-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 px-5 py-6 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-base font-bold text-gray-950">
            Liste des Clients
          </h2>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="inline-flex h-10 w-fit rounded-lg border border-gray-200 bg-white p-1">
              <ViewButton
                active={viewMode === "grid"}
                onClick={() => setViewMode("grid")}
                icon={LayoutGrid}
              >
                Grille
              </ViewButton>
              <ViewButton
                active={viewMode === "table"}
                onClick={() => setViewMode("table")}
                icon={Table2}
              >
                Table
              </ViewButton>
            </div>
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex h-10 w-fit items-center gap-2 rounded-lg bg-[#0066FF] px-4 text-sm font-semibold text-white hover:bg-[#0052CC]"
            >
              <Plus size={16} /> Ajouter un Client
            </button>
          </div>
        </div>

        <div className="px-5 pb-5">
          <label className="flex h-10 items-center gap-3 rounded-lg bg-gray-100 px-3 text-slate-400">
            <Search size={17} />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-slate-500"
              placeholder="Rechercher par nom, email, téléphone..."
            />
          </label>
        </div>

        <div className="px-5 pb-6">
          {viewMode === "grid" ? (
            <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {filtered.map((c) => (
                <article
                  key={c.id}
                  className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    {c.photo ? (
                      <img
                        src={c.photo}
                        alt={fullName(c)}
                        className="h-12 w-12 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[#0066FF]">
                        <UserCircle2 size={22} />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-gray-950">
                        {fullName(c)}
                      </h3>
                      <span className="mt-2 inline-flex rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        Actif
                      </span>
                    </div>
                  </div>
                  <div className="mt-7 space-y-3 text-sm text-slate-700">
                    <p className="flex items-start gap-3">
                      <Mail
                        size={16}
                        className="mt-0.5 shrink-0 text-slate-400"
                      />
                      {c.email}
                    </p>
                    {c.numTel && (
                      <p className="flex items-start gap-3">
                        <Phone
                          size={16}
                          className="mt-0.5 shrink-0 text-slate-400"
                        />
                        {c.numTel}
                      </p>
                    )}
                    {addressLine(c) && (
                      <p className="flex items-start gap-3">
                        <MapPin
                          size={16}
                          className="mt-0.5 shrink-0 text-slate-400"
                        />
                        {addressLine(c)}
                      </p>
                    )}
                  </div>
                  <div className="mt-6 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setDetailId(c.id)}
                      className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-950 hover:border-blue-200 hover:text-[#0066FF]"
                    >
                      <Eye size={16} /> Voir
                    </button>
                    <button
                      type="button"
                      onClick={() => openEdit(c)}
                      className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-950 hover:border-blue-200 hover:text-[#0066FF]"
                    >
                      <Edit3 size={16} /> Modifier
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteId(c.id)}
                      className="inline-flex h-9 w-10 items-center justify-center rounded-lg border border-red-100 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-950">
                    <th className="py-3 pr-4 font-semibold">Client</th>
                    <th className="px-4 py-3 font-semibold">Email</th>
                    <th className="px-4 py-3 font-semibold">Téléphone</th>
                    <th className="px-4 py-3 font-semibold">Adresse</th>
                    <th className="py-3 pl-4 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filtered.map((c) => (
                    <tr key={c.id}>
                      <td className="py-4 pr-4 font-semibold text-gray-950">
                        {fullName(c)}
                      </td>
                      <td className="px-4 py-4 text-slate-700">{c.email}</td>
                      <td className="px-4 py-4 text-slate-700">
                        {c.numTel || "—"}
                      </td>
                      <td className="px-4 py-4 text-slate-700">
                        {addressLine(c) || "—"}
                      </td>
                      <td className="py-4 pl-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setDetailId(c.id)}
                            className="inline-flex h-9 w-10 items-center justify-center rounded-lg border border-gray-200 text-slate-500 hover:border-blue-200 hover:text-[#0066FF]"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEdit(c)}
                            className="inline-flex h-9 w-10 items-center justify-center rounded-lg border border-gray-200 text-slate-500 hover:border-blue-200 hover:text-[#0066FF]"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteId(c.id)}
                            className="inline-flex h-9 w-10 items-center justify-center rounded-lg border border-red-100 text-red-500 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {clientsQuery.isLoading && (
            <div className="py-12 text-center text-sm text-slate-500">
              Chargement...
            </div>
          )}
          {clientsQuery.isError && (
            <div className="py-12 text-center text-sm text-red-500">
              Impossible de charger les clients.
            </div>
          )}
          {!clientsQuery.isLoading && filtered.length === 0 && (
            <div className="py-12 text-center text-sm text-slate-500">
              Aucun client trouvé.
            </div>
          )}
        </div>
      </section>

      {/* Modal Création / Édition */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 px-4">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-xl rounded-xl bg-white p-5 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-lg font-bold text-gray-950">
                {editing ? "Modifier le client" : "Ajouter un client"}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-gray-100"
              >
                <X size={17} />
              </button>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
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
              <Field
                label="Email"
                value={draftEmail}
                onChange={setDraftEmail}
                placeholder="client@email.fr"
                type="email"
              />
              <Field
                label="Téléphone"
                value={draftPhone}
                onChange={setDraftPhone}
                placeholder="6 52 34 56 78"
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
            {(createMutation.isError || updateMutation.isError) && (
              <p className="mt-4 text-sm font-semibold text-red-600">
                Erreur. Vérifiez les champs requis.
              </p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="h-10 rounded-lg border border-gray-200 px-4 text-sm font-semibold text-slate-600 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#0066FF] px-4 text-sm font-semibold text-white hover:bg-[#0052CC] disabled:opacity-60"
              >
                {isSubmitting
                  ? "Enregistrement..."
                  : editing
                    ? "Enregistrer"
                    : "Ajouter"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Détail */}
      {detailId !== null && (
        <DetailClientModal id={detailId} onClose={() => setDetailId(null)} />
      )}

      {/* Modal suppression */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <Trash2 size={20} className="text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Supprimer ce client ?
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

/* ── Modal Détail Client ── */

function DetailClientModal({
  id,
  onClose,
}: {
  id: number;
  onClose: () => void;
}) {
  const { data: client, isLoading } = useQuery({
    queryKey: ["clients", id],
    queryFn: async () => (await clientsApi.getById(id)).data,
    enabled: id !== null,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-950">Détail du client</h2>
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
          ) : !client ? (
            <p className="text-center text-sm text-gray-500">
              Client introuvable.
            </p>
          ) : (
            <>
              {client.photo && (
                <div className="mb-4 flex justify-center">
                  <img
                    src={client.photo}
                    alt={fullName(client)}
                    className="h-24 w-24 rounded-full object-cover"
                  />
                </div>
              )}
              <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Nom complet</p>
                  <p className="font-semibold text-gray-900">
                    {client.prenom} {client.nom}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="font-semibold text-gray-900">{client.email}</p>
                </div>
                <div>
                  <p className="text-gray-500">Téléphone</p>
                  <p className="font-semibold text-gray-900">
                    {client.numTel || "—"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Adresse</p>
                  <p className="font-semibold text-gray-900">
                    {[client.rue, client.codePostal, client.ville, client.pays]
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </p>
                </div>
              </div>
              {(client.createdBy || client.createdAt) && (
                <div className="border-t border-gray-100 pt-4 text-xs text-gray-400">
                  {client.createdBy && <span>Créé par {client.createdBy}</span>}
                  {client.createdAt && (
                    <span>
                      {" "}
                      le{" "}
                      {new Date(client.createdAt).toLocaleDateString("fr-FR")}
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

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "blue" | "purple" | "green";
}) {
  const cls = {
    blue: "bg-blue-100 text-[#0066FF]",
    purple: "bg-purple-100 text-purple-600",
    green: "bg-emerald-100 text-emerald-600",
  };
  return (
    <article className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-lg ${cls[tone]}`}
        >
          <UserCircle2 size={23} />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-950">{value}</p>
        </div>
      </div>
    </article>
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  pattern?: string;
  title?: string;
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
        className="mt-1.5 h-11 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#0066FF]"
        placeholder={placeholder}
        pattern={pattern}
        title={title}
      />
    </label>
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
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-md px-4 text-sm font-semibold transition-colors ${active ? "bg-[#0066FF] text-white" : "text-gray-700 hover:bg-gray-50"}`}
    >
      <Icon size={15} />
      {children}
    </button>
  );
}
