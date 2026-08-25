import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  Edit3,
  Eye,
  Mail,
  MapPin,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useUtilisateurs } from "../hooks";
import { utilisateurApi } from "../api/utilisateurApi";
import { useQuery } from "@tanstack/react-query";
import type { UtilisateurRequest, UtilisateurResponse } from "../types";
import type { Role } from "../../../core/types";

const fullName = (u: UtilisateurResponse) =>
  [u.prenom, u.nom].filter(Boolean).join(" ") || "Sans nom";

const ROLE_LABELS: Record<Role, { label: string; bg: string; text: string }> = {
  ROLE_ADMIN: { label: "Admin", bg: "bg-purple-100", text: "text-purple-700" },
  ROLE_USER: { label: "Utilisateur", bg: "bg-blue-100", text: "text-blue-700" },
};

export default function UtilisateursPage() {
  const {
    utilisateurs,
    isLoading,
    createUtilisateur,
    updateUtilisateur,
    deleteUtilisateur,
  } = useUtilisateurs();

  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<UtilisateurResponse | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [draftNom, setDraftNom] = useState("");
  const [draftPrenom, setDraftPrenom] = useState("");
  const [draftEmail, setDraftEmail] = useState("");
  const [draftRue, setDraftRue] = useState("");
  const [draftVille, setDraftVille] = useState("");
  const [draftCodePostal, setDraftCodePostal] = useState("");
  const [draftPays, setDraftPays] = useState("");
  const [draftRoles, setDraftRoles] = useState<Role[]>(["ROLE_USER"]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return utilisateurs;
    return utilisateurs.filter(
      (u) =>
        fullName(u).toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q),
    );
  }, [utilisateurs, query]);

  const isSubmitting = createUtilisateur.isPending || updateUtilisateur.isPending;

  function resetForm() {
    setDraftNom("");
    setDraftPrenom("");
    setDraftEmail("");
    setDraftRue("");
    setDraftVille("");
    setDraftCodePostal("");
    setDraftPays("");
    setDraftRoles(["ROLE_USER"]);
  }

  function openCreate() {
    setEditing(null);
    resetForm();
    setIsModalOpen(true);
  }

  function openEdit(u: UtilisateurResponse) {
    setEditing(u);
    setDraftNom(u.nom);
    setDraftPrenom(u.prenom);
    setDraftEmail(u.email);
    setDraftRue(u.rue ?? "");
    setDraftVille(u.ville ?? "");
    setDraftCodePostal(u.codePostal ?? "");
    setDraftPays(u.pays ?? "");
    setDraftRoles(u.roles.length > 0 ? u.roles : ["ROLE_USER"]);
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditing(null);
    resetForm();
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const data: UtilisateurRequest = {
      nom: draftNom.trim(),
      prenom: draftPrenom.trim(),
      email: draftEmail.trim(),
      rue: draftRue.trim() || undefined,
      ville: draftVille.trim() || undefined,
      codePostal: draftCodePostal.trim() || undefined,
      pays: draftPays.trim() || undefined,
      roles: draftRoles,
    };
    if (!data.nom || !data.prenom || !data.email || data.roles.length === 0) return;

    if (editing) {
      updateUtilisateur.mutate({ id: editing.id, data }, { onSuccess: closeModal });
    } else {
      createUtilisateur.mutate(data, { onSuccess: closeModal });
    }
  };

  const toggleRole = (role: Role) => {
    setDraftRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role],
    );
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-950 sm:text-3xl">
            Gestion des Utilisateurs
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Gérez les utilisateurs de votre entreprise
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex h-10 w-fit items-center gap-2 rounded-lg bg-[#0066FF] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#0052CC]"
        >
          <Plus size={16} />
          Nouvel utilisateur
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <label className="flex h-10 items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 text-gray-400 shadow-sm">
          <Search size={17} />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
            placeholder="Rechercher par nom ou email..."
          />
        </label>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-5 py-3 font-bold">Utilisateur</th>
                <th className="px-5 py-3 font-bold">Email</th>
                <th className="px-5 py-3 font-bold">Rôle</th>
                <th className="px-5 py-3 font-bold">Adresse</th>
                <th className="px-5 py-3 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
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
                  <td colSpan={5} className="px-5 py-12 text-center text-sm text-gray-500">
                    {query ? "Aucun utilisateur ne correspond à votre recherche." : "Aucun utilisateur enregistré."}
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                          <User size={16} />
                        </div>
                        <span className="font-semibold text-gray-900">{fullName(u)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      <span className="inline-flex items-center gap-1.5">
                        <Mail size={14} className="text-gray-400" />
                        {u.email}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1">
                        {u.roles.map((role) => {
                          const info = ROLE_LABELS[role];
                          return info ? (
                            <span key={role} className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${info.bg} ${info.text}`}>
                              <ShieldCheck size={12} />
                              {info.label}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin size={14} className="text-gray-400" />
                        {[u.rue, u.codePostal, u.ville, u.pays].filter(Boolean).join(", ") || "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setDetailId(u.id)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                          title="Voir"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(u)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                          title="Modifier"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteId(u.id)}
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
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={handleSubmit} className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h2 className="text-lg font-bold text-gray-950">
                {editing ? "Modifier l'utilisateur" : "Nouvel utilisateur"}
              </h2>
              <button type="button" onClick={closeModal} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[65vh] overflow-y-auto px-6 py-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Prénom" value={draftPrenom} onChange={setDraftPrenom} placeholder="Jean" />
                <Field label="Nom" value={draftNom} onChange={setDraftNom} placeholder="Dupont" />
                <div className="sm:col-span-2">
                  <Field label="Email" value={draftEmail} onChange={setDraftEmail} placeholder="jean@entreprise.fr" type="email" />
                </div>
                <div className="sm:col-span-2">
                  <Field label="Rue" value={draftRue} onChange={setDraftRue} placeholder="15 rue du Commerce" />
                </div>
                <Field label="Ville" value={draftVille} onChange={setDraftVille} placeholder="Paris" />
                <Field label="Code postal" value={draftCodePostal} onChange={setDraftCodePostal} placeholder="75001" />
                <Field label="Pays" value={draftPays} onChange={setDraftPays} placeholder="France" />
              </div>

              {/* Rôles */}
              <div className="mt-4">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Rôles</label>
                <div className="flex gap-3">
                  {(["ROLE_ADMIN", "ROLE_USER"] as Role[]).map((role) => {
                    const info = ROLE_LABELS[role];
                    const active = draftRoles.includes(role);
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => toggleRole(role)}
                        className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors ${
                          active
                            ? `${info.bg} ${info.text} border-current`
                            : "border-gray-200 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        <ShieldCheck size={16} />
                        {info.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
              <button type="button" onClick={closeModal} className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-lg bg-[#0066FF] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0052CC] disabled:opacity-50"
              >
                {isSubmitting ? "Enregistrement..." : editing ? "Enregistrer" : "Créer"}
              </button>
            </div>

            {(createUtilisateur.isError || updateUtilisateur.isError) && (
              <p className="px-6 pb-4 text-sm text-red-500">Erreur lors de l'enregistrement.</p>
            )}
          </form>
        </div>
      )}

      {/* Modal Détail */}
      {detailId !== null && <DetailUtilisateurModal id={detailId} onClose={() => setDetailId(null)} />}

      {/* Modal suppression */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <Trash2 size={20} className="text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Supprimer cet utilisateur ?
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
                onClick={() => {
                  deleteUtilisateur.mutate(deleteId, {
                    onSuccess: () => setDeleteId(null),
                  });
                }}
                disabled={deleteUtilisateur.isPending}
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleteUtilisateur.isPending ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Modal Détail Utilisateur ── */

function DetailUtilisateurModal({ id, onClose }: { id: number; onClose: () => void }) {
  const { data: utilisateur, isLoading } = useQuery({
    queryKey: ["utilisateurs", id],
    queryFn: async () => (await utilisateurApi.getById(id)).data,
    enabled: id !== null,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-950">Détail de l'utilisateur</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"><X size={20} /></button>
        </div>
        <div className="px-6 py-5">
          {isLoading ? (
            <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-5 w-full animate-pulse rounded bg-gray-200" />)}</div>
          ) : !utilisateur ? (
            <p className="text-center text-sm text-gray-500">Utilisateur introuvable.</p>
          ) : (
            <>
              {utilisateur.photo && (
                <div className="mb-4 flex justify-center">
                  <img src={utilisateur.photo} alt="" className="h-24 w-24 rounded-full object-cover" />
                </div>
              )}
              <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-gray-500">Nom complet</p><p className="font-semibold text-gray-900">{utilisateur.prenom} {utilisateur.nom}</p></div>
                <div><p className="text-gray-500">Email</p><p className="font-semibold text-gray-900">{utilisateur.email}</p></div>
                <div><p className="text-gray-500">Rôles</p><div className="flex flex-wrap gap-1">{utilisateur.roles.map((r) => <span key={r} className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700"><ShieldCheck size={12} />{r === "ROLE_ADMIN" ? "Admin" : "Utilisateur"}</span>)}</div></div>
                <div><p className="text-gray-500">Adresse</p><p className="font-semibold text-gray-900">{[utilisateur.rue, utilisateur.codePostal, utilisateur.ville, utilisateur.pays].filter(Boolean).join(", ") || "—"}</p></div>
                <div><p className="text-gray-500">Entreprise</p><p className="font-semibold text-gray-900">{utilisateur.entrepriseNom}</p></div>
                <div><p className="text-gray-500">Doit changer le mot de passe</p><p className="font-semibold text-gray-900">{utilisateur.mustChangePassword ? "Oui" : "Non"}</p></div>
              </div>
              {(utilisateur.createdBy || utilisateur.createdAt) && (
                <div className="border-t border-gray-100 pt-4 text-xs text-gray-400">
                  {utilisateur.createdBy && <span>Créé par {utilisateur.createdBy}</span>}
                  {utilisateur.createdAt && <span> le {new Date(utilisateur.createdAt).toLocaleDateString("fr-FR")}</span>}
                </div>
              )}
            </>
          )}
        </div>
        <div className="flex justify-end border-t border-gray-100 px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Fermer</button>
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
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
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
