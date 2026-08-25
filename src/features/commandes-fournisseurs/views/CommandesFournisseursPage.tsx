import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Eye,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import {
  useCommandesFournisseurs,
  useCommandeFournisseur,
} from "../hooks";
import { fournisseursApi } from "../../fournisseurs/api/fournisseursApi";
import { articleApi } from "../../articles/api/articleApi";
import type { CommandeFournisseurResponse } from "../types";
import type { EtatCommande } from "../../../core/types";
import type { ArticleResponse } from "../../articles/types";

/* ── Constantes ── */

type EtatFilter = "ALL" | EtatCommande;

const ETAT_LABELS: Record<EtatCommande, { label: string; bg: string; text: string }> = {
  EN_PREPARATION: { label: "En préparation", bg: "bg-amber-50", text: "text-amber-700" },
  VALIDEE: { label: "Validée", bg: "bg-blue-50", text: "text-blue-700" },
  LIVREE: { label: "Livrée", bg: "bg-emerald-50", text: "text-emerald-700" },
  ANNULEE: { label: "Annulée", bg: "bg-red-50", text: "text-red-600" },
};

const ETAT_OPTIONS: { value: EtatCommande | "ALL"; label: string }[] = [
  { value: "ALL", label: "Tous les statuts" },
  { value: "EN_PREPARATION", label: "En préparation" },
  { value: "VALIDEE", label: "Validée" },
  { value: "LIVREE", label: "Livrée" },
  { value: "ANNULEE", label: "Annulée" },
];

function formatAmount(amount: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: 2 }).format(amount);
}

function formatDateFr(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/* ── Page ── */

export default function CommandesFournisseursPage() {
  const [etatFilter, setEtatFilter] = useState<EtatFilter | "ALL">("ALL");
  const [searchCode] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);

  const { commandes, isLoading, deleteCommande, updateEtat } = useCommandesFournisseurs();

  const filtered = useMemo(() => {
    let result = commandes;
    if (etatFilter !== "ALL") result = result.filter((c) => c.etatCommande === etatFilter);
    if (searchCode.trim()) {
      const q = searchCode.toLowerCase();
      result = result.filter(
        (c) =>
          c.codeCommande.toLowerCase().includes(q) ||
          `${c.fournisseurPrenom} ${c.fournisseurNom}`.toLowerCase().includes(q),
      );
    }
    return result;
  }, [commandes, etatFilter, searchCode]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* ── Header ── */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-950 sm:text-3xl">
            Commandes Fournisseurs
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Gestion des commandes passées à vos fournisseurs
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-[#0066FF] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0052CC]"
        >
          <Plus size={16} />
          Nouvelle commande
        </button>
      </div>

      {/* ── Filtre ── */}
      <div className="mb-6">
        <select
          value={etatFilter}
          onChange={(e) => setEtatFilter(e.target.value as EtatFilter | "ALL")}
          className="appearance-none rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 focus:border-blue-500 focus:outline-none"
        >
          {ETAT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* ── Tableau ── */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-white text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-6 py-3.5 font-bold">N° commande</th>
                <th className="px-6 py-3.5 font-bold">Date</th>
                <th className="px-6 py-3.5 font-bold">Fournisseur</th>
                <th className="px-6 py-3.5 font-bold">Montant total</th>
                <th className="px-6 py-3.5 font-bold">Statut</th>
                <th className="px-6 py-3.5 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-sm text-gray-500">
                    Aucune commande fournisseur trouvée.
                  </td>
                </tr>
              ) : (
                filtered.map((cmd) => (
                  <CommandeRow
                    key={cmd.id}
                    cmd={cmd}
                    onView={() => setDetailId(cmd.id)}
                    onDelete={() => deleteCommande.mutate(cmd.id)}
                    onStatusChange={(etat) => updateEtat.mutate({ id: cmd.id, etat })}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modals ── */}
      {showCreateModal && (
        <CreateCommandeModal onClose={() => setShowCreateModal(false)} />
      )}
      {detailId !== null && (
        <DetailCommandeModal id={detailId} onClose={() => setDetailId(null)} />
      )}
    </div>
  );
}

/* ── Ligne tableau ── */

function CommandeRow({
  cmd,
  onView,
  onDelete,
  onStatusChange,
}: {
  cmd: CommandeFournisseurResponse;
  onView: () => void;
  onDelete: () => void;
  onStatusChange: (etat: EtatCommande) => void;
}) {
  const etat = ETAT_LABELS[cmd.etatCommande];
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const nextStatuses: EtatCommande[] = (() => {
    switch (cmd.etatCommande) {
      case "EN_PREPARATION": return ["VALIDEE", "ANNULEE"];
      case "VALIDEE": return ["LIVREE", "ANNULEE"];
      default: return [];
    }
  })();

  return (
    <tr className="hover:bg-gray-50/50 transition-colors">
      <td className="px-6 py-4 font-medium text-gray-900">{cmd.codeCommande}</td>
      <td className="px-6 py-4 text-gray-500">{formatDateFr(cmd.dateCommande)}</td>
      <td className="px-6 py-4 text-gray-900">
        {cmd.fournisseurPrenom} {cmd.fournisseurNom}
      </td>
      <td className="px-6 py-4 font-medium text-gray-900">{formatAmount(cmd.totalTtc)}</td>
      <td className="px-6 py-4">
        <div className="relative">
          <button
            type="button"
            onClick={() => nextStatuses.length > 0 && setShowStatusMenu(!showStatusMenu)}
            className={`inline-block cursor-pointer rounded-full px-2.5 py-0.5 text-xs font-bold transition-colors ${etat.bg} ${etat.text} ${nextStatuses.length > 0 ? "hover:opacity-80" : "cursor-default"}`}
          >
            {etat.label}
          </button>
          {showStatusMenu && (
            <div className="absolute left-0 top-full z-10 mt-1 w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
              {nextStatuses.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    onStatusChange(s);
                    setShowStatusMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {ETAT_LABELS[s].label}
                </button>
              ))}
            </div>
          )}
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="inline-flex items-center gap-1">
          <button
            type="button"
            onClick={onView}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            title="Voir"
          >
            <Eye size={16} />
          </button>
          {cmd.etatCommande === "EN_PREPARATION" && (
            <button
              type="button"
              onClick={onDelete}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
              title="Supprimer"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

/* ── Modal création ── */

function CreateCommandeModal({ onClose }: { onClose: () => void }) {
  const { createCommande } = useCommandesFournisseurs();
  const [fournisseurId, setFournisseurId] = useState<number | "">("");
  const [articleSearch, setArticleSearch] = useState("");
  const [selectedArticles, setSelectedArticles] = useState<
    { article: ArticleResponse; quantite: number }[]
  >([]);

  const fournisseursQuery = useQuery({
    queryKey: ["fournisseurs", "list"],
    queryFn: async () => (await fournisseursApi.getAll()).data,
  });

  const articlesQuery = useQuery({
    queryKey: ["articles", "list"],
    queryFn: async () => (await articleApi.getAll({ page: 0, size: 500 })).data.content,
  });

  const fournisseurs = (fournisseursQuery.data?.content ?? []) as { id: number; prenom: string; nom: string }[];

  const matchingArticles = useMemo(() => {
    const articles = (articlesQuery.data ?? []) as ArticleResponse[];
    if (!articleSearch.trim()) return articles.slice(0, 10);
    const q = articleSearch.toLowerCase();
    return articles.filter(
      (a) => a.designation.toLowerCase().includes(q) || a.code.toLowerCase().includes(q),
    );
  }, [articlesQuery.data, articleSearch]);

  const { subtotalHt, tva, totalTtc } = useMemo(() => {
    let ht = 0;
    for (const sa of selectedArticles) {
      ht += sa.article.prixUnitaireHt * sa.quantite;
    }
    const tvaAmt = ht * 0.2;
    return { subtotalHt: ht, tva: tvaAmt, totalTtc: ht + tvaAmt };
  }, [selectedArticles]);

  const addArticle = (article: ArticleResponse) => {
    setSelectedArticles((prev) => {
      const existing = prev.find((sa) => sa.article.id === article.id);
      if (existing) {
        return prev.map((sa) =>
          sa.article.id === article.id ? { ...sa, quantite: sa.quantite + 1 } : sa,
        );
      }
      return [...prev, { article, quantite: 1 }];
    });
    setArticleSearch("");
  };

  const updateQuantity = (articleId: number, quantite: number) => {
    if (quantite < 1) return;
    setSelectedArticles((prev) =>
      prev.map((sa) => (sa.article.id === articleId ? { ...sa, quantite } : sa)),
    );
  };

  const removeArticle = (articleId: number) => {
    setSelectedArticles((prev) => prev.filter((sa) => sa.article.id !== articleId));
  };

  const handleSubmit = () => {
    if (!fournisseurId || selectedArticles.length === 0) return;
    createCommande.mutate(
      {
        idFournisseur: Number(fournisseurId),
        dateCommande: new Date().toISOString().slice(0, 10),
        lignes: selectedArticles.map((sa) => ({
          articleId: sa.article.id,
          quantite: sa.quantite,
        })),
      },
      { onSuccess: onClose },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-950">Nouvelle Commande Fournisseur</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
          {/* Sélection fournisseur */}
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Sélectionner un fournisseur</label>
          <select
            value={fournisseurId}
            onChange={(e) => setFournisseurId(e.target.value ? Number(e.target.value) : "")}
            className="mb-5 w-full appearance-none rounded-lg border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:bg-white focus:outline-none"
          >
            <option value="">-- Choisir un fournisseur --</option>
            {fournisseurs.map((f) => (
              <option key={f.id} value={f.id}>{f.prenom} {f.nom}</option>
            ))}
          </select>

          {/* Recherche article */}
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Rechercher et ajouter des articles</label>
          <input
            type="text"
            value={articleSearch}
            onChange={(e) => setArticleSearch(e.target.value)}
            placeholder="Rechercher un article..."
            className="mb-4 w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none"
          />

          {articleSearch && matchingArticles.length > 0 && (
            <div className="mb-4 max-h-40 overflow-y-auto rounded-lg border border-gray-200 bg-white">
              {matchingArticles.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => addArticle(a)}
                  className="flex w-full items-center justify-between px-3.5 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-800">{a.designation}</span>
                  <span className="text-gray-500">{formatAmount(a.prixUnitaireHt)}</span>
                </button>
              ))}
            </div>
          )}

          {/* Articles sélectionnés */}
          <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-bold text-gray-900">Articles sélectionnés</span>
              <span className="text-xs text-gray-500">{selectedArticles.length} article(s)</span>
            </div>
            {selectedArticles.length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-400">Aucun article sélectionné</p>
            ) : (
              <div className="space-y-2">
                {selectedArticles.map((sa) => (
                  <div key={sa.article.id} className="flex items-center justify-between rounded-lg bg-white px-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-800">{sa.article.designation}</p>
                      <p className="text-xs text-gray-500">{formatAmount(sa.article.prixUnitaireHt)} / unité</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        value={sa.quantite}
                        onChange={(e) => updateQuantity(sa.article.id, Number(e.target.value))}
                        className="w-16 rounded-lg border border-gray-200 bg-white px-2 py-1 text-center text-sm focus:border-blue-500 focus:outline-none"
                      />
                      <span className="w-20 text-right text-sm font-medium text-gray-800">
                        {formatAmount(sa.article.prixUnitaireHt * sa.quantite)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeArticle(sa.article.id)}
                        className="rounded-lg p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Totaux */}
          <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Sous-total HT</span><span>{formatAmount(subtotalHt)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>TVA (20%)</span><span>{formatAmount(tva)}</span>
            </div>
            <div className="flex items-center justify-between text-base font-bold text-gray-900">
              <span>Total TTC</span>
              <span className="text-[#0066FF]">{formatAmount(totalTtc)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!fournisseurId || selectedArticles.length === 0 || createCommande.isPending}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0066FF] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0052CC] disabled:opacity-50"
          >
            {createCommande.isPending ? "Création..." : "Créer la commande"}
          </button>
        </div>
        {createCommande.isError && (
          <p className="px-6 pb-4 text-sm text-red-500">Erreur lors de la création.</p>
        )}
      </div>
    </div>
  );
}

/* ── Modal détail ── */

function DetailCommandeModal({ id, onClose }: { id: number; onClose: () => void }) {
  const { data: commande, isLoading } = useCommandeFournisseur(id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-950">Détail de la commande</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-5 w-full animate-pulse rounded bg-gray-200" />
              ))}
            </div>
          ) : !commande ? (
            <p className="text-center text-sm text-gray-500">Commande introuvable.</p>
          ) : (
            <>
              <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">N° commande</p>
                  <p className="font-semibold text-gray-900">{commande.codeCommande}</p>
                </div>
                <div>
                  <p className="text-gray-500">Date</p>
                  <p className="font-semibold text-gray-900">{formatDateFr(commande.dateCommande)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Fournisseur</p>
                  <p className="font-semibold text-gray-900">{commande.fournisseurPrenom} {commande.fournisseurNom}</p>
                </div>
                <div>
                  <p className="text-gray-500">Statut</p>
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${ETAT_LABELS[commande.etatCommande].bg} ${ETAT_LABELS[commande.etatCommande].text}`}>
                    {ETAT_LABELS[commande.etatCommande].label}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h3 className="mb-3 text-sm font-bold text-gray-900">Articles commandés</h3>
                <div className="rounded-lg border border-gray-200">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-xs text-gray-500">
                      <tr>
                        <th className="px-3 py-2 text-left font-bold">Article</th>
                        <th className="px-3 py-2 text-right font-bold">Qté</th>
                        <th className="px-3 py-2 text-right font-bold">Prix HT</th>
                        <th className="px-3 py-2 text-right font-bold">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {commande.lignes.map((l) => (
                        <tr key={l.id}>
                          <td className="px-3 py-2 font-medium text-gray-800">{l.articleDesignation}</td>
                          <td className="px-3 py-2 text-right text-gray-600">{l.quantite}</td>
                          <td className="px-3 py-2 text-right text-gray-600">{formatAmount(l.prixUnitaireHt)}</td>
                          <td className="px-3 py-2 text-right font-semibold text-gray-900">
                            {formatAmount(l.quantite * l.prixUnitaireHt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-4 space-y-1 border-t border-gray-100 pt-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Total HT</span><span>{formatAmount(commande.totalHt)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>TVA</span><span>{formatAmount(commande.totalTva)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-gray-900">
                  <span>Total TTC</span>
                  <span className="text-[#0066FF]">{formatAmount(commande.totalTtc)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end border-t border-gray-100 px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
