import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Edit3,
  LayoutGrid,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Table2,
  Trash2,
  UserCircle2,
  X,
} from "lucide-react";
import { clientsApi } from "../api/clientsApi";
import type { ClientRequest, ClientResponse } from "../types";

const fullName = (client: ClientResponse) =>
  [client.prenom, client.nom].filter(Boolean).join(" ") || "Client sans nom";

const addressLine = (client: ClientResponse) =>
  [client.rue, client.codePostal, client.ville, client.pays]
    .filter(Boolean)
    .join(", ");

export default function ClientsPage() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draftNom, setDraftNom] = useState("");
  const [draftPrenom, setDraftPrenom] = useState("");
  const [draftEmail, setDraftEmail] = useState("");
  const [draftPhone, setDraftPhone] = useState("");
  const [draftRue, setDraftRue] = useState("");
  const [draftVille, setDraftVille] = useState("");
  const [draftCodePostal, setDraftCodePostal] = useState("");
  const [draftPays, setDraftPays] = useState("");

  const clientsQuery = useQuery({
    queryKey: ["clients"],
    queryFn: async () => (await clientsApi.getAll({ page: 0, size: 100 })).data,
  });

  const createClientMutation = useMutation({
    mutationFn: (payload: ClientRequest) => clientsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: (id: number) => clientsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });

  const clients = clientsQuery.data?.content ?? [];

  const filteredClients = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return clients;
    }

    return clients.filter((client) =>
      [
        fullName(client),
        client.email,
        client.numTel ?? "",
        addressLine(client),
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [clients, query]);

  const totals = useMemo(
    () => ({
      clients: clientsQuery.data?.totalElements ?? clients.length,
      withPhone: clients.filter((client) => Boolean(client.numTel)).length,
      withAddress: clients.filter((client) => Boolean(addressLine(client))).length,
      withPhoto: clients.filter((client) => Boolean(client.photo)).length,
    }),
    [clients, clientsQuery.data?.totalElements]
  );

  function resetForm() {
    setDraftNom("");
    setDraftPrenom("");
    setDraftEmail("");
    setDraftPhone("");
    setDraftRue("");
    setDraftVille("");
    setDraftCodePostal("");
    setDraftPays("");
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload: ClientRequest = {
      nom: draftNom.trim(),
      prenom: draftPrenom.trim(),
      email: draftEmail.trim(),
      numTel: draftPhone.trim(),
      rue: draftRue.trim(),
      ville: draftVille.trim(),
      codePostal: draftCodePostal.trim(),
      pays: draftPays.trim(),
      photo: null,
    };

    if (!payload.nom || !payload.prenom || !payload.email) {
      return;
    }

    createClientMutation.mutate(payload);
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-950 sm:text-3xl">
          Gestion des Clients
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Gérez votre base de clients
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Clients" value={String(totals.clients)} tone="blue" />
        <StatCard label="Téléphones" value={String(totals.withPhone)} tone="purple" />
        <StatCard label="Adresses" value={String(totals.withAddress)} tone="green" />
        <StatCard label="Photos" value={String(totals.withPhoto)} tone="orange" />
      </div>

      <section className="mt-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 px-5 py-6 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-base font-bold text-gray-950">
            Liste des Clients
          </h2>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="inline-flex h-10 w-fit rounded-lg border border-gray-200 bg-white p-1">
              <ViewButton active={viewMode === "grid"} onClick={() => setViewMode("grid")} icon={LayoutGrid}>
                Grille
              </ViewButton>
              <ViewButton active={viewMode === "table"} onClick={() => setViewMode("table")} icon={Table2}>
                Table
              </ViewButton>
            </div>

            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex h-10 w-fit items-center gap-2 rounded-lg bg-[#05061D] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#11132E]"
            >
              <Plus size={16} />
              Ajouter un Client
            </button>
          </div>
        </div>

        <div className="px-5 pb-5">
          <label className="flex h-10 items-center gap-3 rounded-lg bg-gray-100 px-3 text-slate-400">
            <Search size={17} />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-slate-500"
              placeholder="Rechercher par nom, email, téléphone ou adresse..."
            />
          </label>
        </div>

        <div className="px-5 pb-6">
          {viewMode === "grid" ? (
            <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {filteredClients.map((client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  onDelete={() => deleteClientMutation.mutate(client.id)}
                />
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
                    <th className="py-3 pl-4 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredClients.map((client) => (
                    <tr key={client.id}>
                      <td className="py-4 pr-4 font-semibold text-gray-950">
                        {fullName(client)}
                      </td>
                      <td className="px-4 py-4 text-slate-700">{client.email}</td>
                      <td className="px-4 py-4 text-slate-700">
                        {client.numTel || "-"}
                      </td>
                      <td className="px-4 py-4 text-slate-700">
                        {addressLine(client) || "-"}
                      </td>
                      <td className="py-4 pl-4">
                        <div className="flex justify-end gap-2">
                          <IconButton label="Modifier" icon={Edit3} />
                          <IconButton
                            label="Supprimer"
                            icon={Trash2}
                            danger
                            onClick={() => deleteClientMutation.mutate(client.id)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {clientsQuery.isLoading && <ListMessage message="Chargement des clients..." />}
          {clientsQuery.isError && <ListMessage message="Impossible de charger les clients." />}
          {!clientsQuery.isLoading && filteredClients.length === 0 && (
            <ListMessage message="Aucun client ne correspond à votre recherche." />
          )}
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 px-4">
          <form onSubmit={handleSubmit} className="w-full max-w-xl rounded-xl bg-white p-5 shadow-xl">
            <ModalHeader onClose={() => setIsModalOpen(false)} />

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <TextField label="Nom" value={draftNom} onChange={setDraftNom} placeholder="Nom" />
              <TextField label="Prénom" value={draftPrenom} onChange={setDraftPrenom} placeholder="Prénom" />
              <TextField label="Email" value={draftEmail} onChange={setDraftEmail} placeholder="client@email.fr" type="email" />
              <TextField label="Téléphone" value={draftPhone} onChange={setDraftPhone} placeholder="06 12 34 56 78" />
              <div className="sm:col-span-2">
                <TextField label="Rue" value={draftRue} onChange={setDraftRue} placeholder="Adresse" />
              </div>
              <TextField label="Ville" value={draftVille} onChange={setDraftVille} placeholder="Ville" />
              <TextField label="Code postal" value={draftCodePostal} onChange={setDraftCodePostal} placeholder="75000" />
              <TextField label="Pays" value={draftPays} onChange={setDraftPays} placeholder="Pays" />
            </div>

            {createClientMutation.isError && (
              <p className="mt-4 text-sm font-semibold text-red-600">
                Impossible de créer le client. Vérifiez les champs requis.
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="h-10 rounded-lg border border-gray-200 px-4 text-sm font-semibold text-slate-600 transition-colors hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={createClientMutation.isPending}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#0066FF] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#0052CC] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Plus size={16} />
                {createClientMutation.isPending ? "Ajout..." : "Ajouter"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

type StatCardProps = {
  label: string;
  value: string;
  tone: "blue" | "purple" | "green" | "orange";
};

const statToneClasses: Record<StatCardProps["tone"], string> = {
  blue: "bg-blue-100 text-[#0066FF]",
  purple: "bg-purple-100 text-purple-600",
  green: "bg-emerald-100 text-emerald-600",
  orange: "bg-orange-100 text-orange-600",
};

function StatCard({ label, value, tone }: StatCardProps) {
  return (
    <article className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${statToneClasses[tone]}`}>
          <UserCircle2 size={23} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-1 break-words text-2xl font-bold leading-tight text-gray-950">
            {value}
          </p>
        </div>
      </div>
    </article>
  );
}

function ClientCard({ client, onDelete }: { client: ClientResponse; onDelete: () => void }) {
  return (
    <article className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[#0066FF]">
          <UserCircle2 size={22} />
        </div>
        <div className="min-w-0">
          <h3 className="break-words text-lg font-bold text-gray-950">
            {fullName(client)}
          </h3>
          <span className="mt-2 inline-flex rounded-lg bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            Actif
          </span>
        </div>
      </div>

      <div className="mt-7 space-y-3 text-sm text-slate-700">
        <InfoLine icon={Mail}>{client.email}</InfoLine>
        {client.numTel && <InfoLine icon={Phone}>{client.numTel}</InfoLine>}
        {addressLine(client) && <InfoLine icon={MapPin}>{addressLine(client)}</InfoLine>}
      </div>

      <div className="mt-6 flex gap-2">
        <button
          type="button"
          className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-950 transition-colors hover:border-blue-200 hover:text-[#0066FF]"
        >
          <Edit3 size={16} />
          Modifier
        </button>
        <IconButton label="Supprimer" icon={Trash2} danger onClick={onDelete} />
      </div>
    </article>
  );
}

function ListMessage({ message }: { message: string }) {
  return <div className="py-12 text-center text-sm text-slate-500">{message}</div>;
}

type TextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
};

function TextField({ label, value, onChange, placeholder, type = "text" }: TextFieldProps) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 h-11 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#0066FF]"
        placeholder={placeholder}
      />
    </label>
  );
}

function ModalHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-lg font-bold text-gray-950">Ajouter un client</h2>
        <p className="mt-1 text-sm text-slate-500">
          Les champs correspondent au payload ClientRequest du Swagger.
        </p>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-gray-100"
        aria-label="Fermer"
      >
        <X size={17} />
      </button>
    </div>
  );
}

type ViewButtonProps = {
  active: boolean;
  onClick: () => void;
  icon: typeof LayoutGrid;
  children: string;
};

function ViewButton({ active, onClick, icon: Icon, children }: ViewButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-md px-4 text-sm font-semibold transition-colors ${
        active ? "bg-[#05061D] text-white" : "text-gray-700 hover:bg-gray-50"
      }`}
    >
      <Icon size={15} />
      {children}
    </button>
  );
}

type InfoLineProps = {
  icon: typeof Mail;
  children: string;
};

function InfoLine({ icon: Icon, children }: InfoLineProps) {
  return (
    <p className="flex items-start gap-3">
      <Icon size={16} className="mt-0.5 shrink-0 text-slate-400" />
      <span className="leading-6">{children}</span>
    </p>
  );
}

type IconButtonProps = {
  label: string;
  icon: typeof Edit3;
  danger?: boolean;
  onClick?: () => void;
};

function IconButton({ label, icon: Icon, danger, onClick }: IconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-9 w-10 items-center justify-center rounded-lg border transition-colors ${
        danger
          ? "border-red-100 text-red-500 hover:bg-red-50"
          : "border-gray-200 text-slate-500 hover:border-blue-200 hover:text-[#0066FF]"
      }`}
      aria-label={label}
      title={label}
    >
      <Icon size={16} />
    </button>
  );
}
