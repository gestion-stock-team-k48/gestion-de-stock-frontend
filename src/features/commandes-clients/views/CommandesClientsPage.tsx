import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Plus, Search, Trash2, X } from "lucide-react";
import { useCommandesClients } from "../hooks";
import { useArticleList } from "../../articles/hooks";
import { useClientList } from "../../clients/hooks";
import type { CommandeClientResponse } from "../types";
import type { EtatCommande } from "../../../core/types";
import type { ArticleResponse } from "../../articles/types";
import { commandeClientsApi } from "../api/commandesClientsApi";
import { CrudToast, Pagination } from "../../../components/ui";

/* ── Constantes ── */

const ETAT_LABELS: Record<
  EtatCommande,
  { label: string; bg: string; text: string }
> = {
  EN_PREPARATION: {
    label: "En préparation",
    bg: "bg-amber-50",
    text: "text-amber-700",
  },
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
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XAF",
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDateFr(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/* ── Page ── */

export default function CommandesClientsPage() {
  const queryClient = useQueryClient();
  const [etatFilter, setEtatFilter] = useState<EtatCommande | "ALL">("ALL");
  const [query, setQuery] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [toast, setToast] = useState<{ message: string; variant: "success" | "error" } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const { commandes, isLoading, deleteCommande, updateEtat, totalPages } =
    useCommandesClients(page, pageSize);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const min = priceMin === "" ? null : Number(priceMin);
    const max = priceMax === "" ? null : Number(priceMax);
    return commandes.filter((c) => {
      const matchesStatus = etatFilter === "ALL" || c.etatCommande === etatFilter;
      const matchesText = !normalized || `${c.codeCommande} ${c.clientPrenom} ${c.clientNom}`.toLowerCase().includes(normalized);
      return matchesStatus && matchesText && (min === null || c.totalTtc >= min) && (max === null || c.totalTtc <= max);
    });
  }, [commandes, etatFilter, priceMax, priceMin, query]);

  const handleCreateSuccess = () => {
    setShowModal(false);
    queryClient.invalidateQueries({ queryKey: ["commandes-clients"] });
    queryClient.invalidateQueries({ queryKey: ["mouvements-stock"] });
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    setToast({ message: "Commande client créée avec succès.", variant: "success" });
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {toast && <CrudToast message={toast.message} variant={toast.variant} onClose={() => setToast(null)} />}
      {/* ── Header ── */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-950 sm:text-3xl">
          Commandes Clients
        </h1>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-[#0066FF] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0052CC]"
        >
          <Plus size={16} />
          Nouvelle commande
        </button>
      </div>

      {/* ── Filtre statut ── */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <label className="flex h-10 w-full max-w-md items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 text-gray-400">
          <Search size={17} />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400" placeholder="Rechercher par client ou numéro..." />
        </label>
        <select
          value={etatFilter}
          onChange={(e) =>
            setEtatFilter(e.target.value as EtatCommande | "ALL")
          }
          className="appearance-none rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 focus:border-blue-500 focus:outline-none"
        >
          {ETAT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <input type="number" min="0" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} className="h-10 w-32 rounded-lg border border-gray-200 px-3 text-sm" placeholder="Prix min" aria-label="Prix minimum" />
        <input type="number" min="0" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} className="h-10 w-32 rounded-lg border border-gray-200 px-3 text-sm" placeholder="Prix max" aria-label="Prix maximum" />
      </div>

      {/* ── Tableau ── */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-white text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-6 py-3.5 font-bold">N° commande</th>
                <th className="px-6 py-3.5 font-bold">Date</th>
                <th className="px-6 py-3.5 font-bold">Client</th>
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
                  <td
                    colSpan={6}
                    className="px-6 py-16 text-center text-sm text-gray-500"
                  >
                    Aucune commande client trouvée.
                  </td>
                </tr>
              ) : (
                filtered.map((cmd) => (
                  <CommandeRow
                    key={cmd.id}
                    cmd={cmd}
                    onView={() => setDetailId(cmd.id)}
                    onDelete={() => setDeleteId(cmd.id)}
                    onStatusChange={(etat) =>
                      updateEtat.mutate({ id: cmd.id, etat }, { onSuccess: () => setToast({ message: "Statut de la commande mis à jour.", variant: "success" }) })
                    }
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* ── Modal création ── */}
      {showModal && (
        <CreateCommandeModal
          onClose={() => setShowModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {/* ── Modal détail ── */}
      {detailId !== null && (
        <DetailCommandeModal id={detailId} onClose={() => setDetailId(null)} />
      )}

      {/* ── Modal suppression ── */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <Trash2 size={20} className="text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Supprimer cette commande ?
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
                  deleteCommande.mutate(deleteId, {
                    onSuccess: () => { setDeleteId(null); setToast({ message: "Commande client supprimée avec succès.", variant: "success" }); },
                  });
                }}
                disabled={deleteCommande.isPending}
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleteCommande.isPending ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
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
  cmd: CommandeClientResponse;
  onView: () => void;
  onDelete: () => void;
  onStatusChange: (etat: EtatCommande) => void;
}) {
  const etat = ETAT_LABELS[cmd.etatCommande];
  // const [showStatusMenu, setShowStatusMenu] = useState(false);

  const nextStatuses: EtatCommande[] = (() => {
    switch (cmd.etatCommande) {
      case "EN_PREPARATION":
        return ["VALIDEE", "ANNULEE"];
      case "VALIDEE":
        return ["LIVREE", "ANNULEE"];
      default:
        return [];
    }
  })();

  return (
    <tr className="hover:bg-gray-50/50 transition-colors">
      <td className="px-6 py-4 font-medium text-gray-900">
        {cmd.codeCommande}
      </td>
      <td className="px-6 py-4 text-gray-500">
        {formatDateFr(cmd.dateCommande)}
      </td>
      <td className="px-6 py-4 text-gray-900">
        {cmd.clientPrenom} {cmd.clientNom}
      </td>
      <td className="px-6 py-4 font-medium text-gray-900">
        {formatAmount(cmd.totalTtc)}
      </td>
      <td className="px-6 py-4">
        <span
          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${etat.bg} ${etat.text}`}
        >
          {etat.label}
        </span>
      </td>

      <td className="px-6 py-4 text-right">
        <div className="inline-flex items-center gap-2">
          {nextStatuses.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                onStatusChange(s);
                // setShowStatusMenu(false);
              }}
              className="rounded-lg px-2 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50"
            >
              {ETAT_LABELS[s].label}
            </button>
          ))}
          {/* <div className="relative">
          <button
            type="button"
            onClick={() => nextStatuses.length > 0 && setShowStatusMenu(!showStatusMenu)}
            className={`inline-block cursor-pointer rounded-full px-2.5 py-0.5 text-xs font-bold transition-colors ${etat.bg} ${etat.text} ${nextStatuses.length > 0 ? "hover:opacity-80" : "cursor-default"}`}
          >
            {etat.label}
          </button>
          {showStatusMenu && (
            <div className="absolute left-0 top-full z-10 mt-1 w-40 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
             
            </div>
          )}
        </div> */}
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

/* ── Modal détail ── */

function DetailCommandeModal({
  id,
  onClose,
}: {
  id: number;
  onClose: () => void;
}) {
  const { data: commande, isLoading } = useCommandeClient(id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-950">
            Détail de la commande
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
          ) : !commande ? (
            <p className="text-center text-sm text-gray-500">
              Commande introuvable.
            </p>
          ) : (
            <>
              <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">N° commande</p>
                  <p className="font-semibold text-gray-900">
                    {commande.codeCommande}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Date</p>
                  <p className="font-semibold text-gray-900">
                    {formatDateFr(commande.dateCommande)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Client</p>
                  <p className="font-semibold text-gray-900">
                    {commande.clientPrenom} {commande.clientNom}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Statut</p>
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${ETAT_LABELS[commande.etatCommande].bg} ${ETAT_LABELS[commande.etatCommande].text}`}
                  >
                    {ETAT_LABELS[commande.etatCommande].label}
                  </span>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-4">
                <h3 className="mb-3 text-sm font-bold text-gray-900">
                  Articles commandés
                </h3>
                <div className="rounded-lg border border-gray-200">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-xs text-gray-500">
                      <tr>
                        <th className="px-3 py-2 text-left font-bold">
                          Article
                        </th>
                        <th className="px-3 py-2 text-right font-bold">Qté</th>
                        <th className="px-3 py-2 text-right font-bold">
                          Prix HT
                        </th>
                        <th className="px-3 py-2 text-right font-bold">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {commande.lignes.map((l) => (
                        <tr key={l.id}>
                          <td className="px-3 py-2 font-medium text-gray-800">
                            {l.articleDesignation}
                          </td>
                          <td className="px-3 py-2 text-right text-gray-600">
                            {l.quantite}
                          </td>
                          <td className="px-3 py-2 text-right text-gray-600">
                            {formatAmount(l.prixUnitaireHt)}
                          </td>
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
                  <span>Total HT</span>
                  <span>{formatAmount(commande.totalHt)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>TVA</span>
                  <span>{formatAmount(commande.totalTva)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-gray-900">
                  <span>Total TTC</span>
                  <span className="text-[#0066FF]">
                    {formatAmount(commande.totalTtc)}
                  </span>
                </div>
              </div>
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

function useCommandeClient(id: number | null) {
  return useQuery({
    queryKey: ["commandes-clients", id],
    queryFn: async () => (await commandeClientsApi.getById(id!)).data,
    enabled: id !== null,
  });
}

/* ── Modal création commande ── */

type SelectedArticle = {
  article: ArticleResponse;
  quantite: number;
};

function CreateCommandeModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [clientId, setClientId] = useState<number | "">("");
  // const [articleSearch, setArticleSearch] = useState("");
  const [selectedArticles, setSelectedArticles] = useState<SelectedArticle[]>(
    [],
  );

  const { data: clients = [] } = useClientList();
  const { data: articles = [] } = useArticleList();

  const createMutation = useMutation({
    mutationFn: commandeClientsApi.create,
    onSuccess: () => onSuccess(),
  });

  // const matchingArticles = useMemo(() => {
  //   const articleList = (articles as ArticleResponse[]) ?? [];
  //   if (!articleSearch.trim()) return articleList.slice(0, 10);
  //   const q = articleSearch.toLowerCase();
  //   return articleList.filter(
  //     (a) =>
  //       a.designation.toLowerCase().includes(q) ||
  //       a.code.toLowerCase().includes(q),
  //   );
  // }, [articles, articleSearch]);

  const { subtotalHt, tva, totalTtc } = useMemo(() => {
    let ht = 0;
    let tvaAmount = 0;
    for (const sa of selectedArticles) {
      const ligneHt = sa.article.prixUnitaireHt * sa.quantite;
      ht += ligneHt;
      tvaAmount += ligneHt * (sa.article.tauxTva / 100); // <- taux réel de l'article
    }

    return { subtotalHt: ht, tva: tvaAmount, totalTtc: ht + tvaAmount };
  }, [selectedArticles]);

  const addArticle = (article: ArticleResponse) => {
    setSelectedArticles((prev) => {
      const existing = prev.find((sa) => sa.article.id === article.id);
      if (existing) {
        return prev.map((sa) =>
          sa.article.id === article.id
            ? { ...sa, quantite: sa.quantite + 1 }
            : sa,
        );
      }
      return [...prev, { article, quantite: 1 }];
    });
    // setArticleSearch("");
  };

  const updateQuantity = (articleId: number, quantite: number) => {
    if (!Number.isInteger(quantite) || quantite < 1) return;
    setSelectedArticles((prev) =>
      prev.map((sa) =>
        sa.article.id === articleId ? { ...sa, quantite } : sa,
      ),
    );
  };

  const removeArticle = (articleId: number) => {
    setSelectedArticles((prev) =>
      prev.filter((sa) => sa.article.id !== articleId),
    );
  };

  const handleSubmit = () => {
    if (!clientId || selectedArticles.length === 0 || selectedArticles.some((sa) => !Number.isInteger(sa.quantite) || sa.quantite < 1)) return;
    createMutation.mutate({
      idClient: Number(clientId),
      dateCommande: new Date().toISOString().slice(0, 10),
      lignes: selectedArticles.map((sa) => ({
        articleId: sa.article.id,
        quantite: sa.quantite,
      })),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-950">
            Nouvelle Commande Client
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Sélectionner un client
          </label>
          <select
            value={clientId}
            onChange={(e) =>
              setClientId(e.target.value ? Number(e.target.value) : "")
            }
            className="mb-5 w-full appearance-none rounded-lg border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:bg-white focus:outline-none"
          >
            <option value="">-- Choisir un client --</option>
            {(clients as { id: number; prenom: string; nom: string }[]).map(
              (c) => (
                <option key={c.id} value={c.id}>
                  {c.prenom} {c.nom}
                </option>
              ),
            )}
          </select>

          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            ajouter des articles
          </label>

          <select
            value=""
            onChange={(e) => {
              const id = Number(e.target.value);
              const article = (articles as ArticleResponse[]).find(
                (a) => a.id === id,
              );
              if (article) addArticle(article);
            }}
            className="mb-4 w-full appearance-none rounded-lg border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:bg-white focus:outline-none"
          >
            <option value="">--choisir un article--</option>
            {(articles as ArticleResponse[]).map((a) => (
              <option key={a.id} value={a.id}>
                {a.designation}
              </option>
            ))}
          </select>
          {/* <div className="relative mb-4">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            /> */}
          {/* <input
              type="text"
              value={articleSearch}
              onChange={(e) => setArticleSearch(e.target.value)}
              placeholder="Rechercher un article..."
              className="w-full rounded-lg border border-gray-200 bg-gray-50/50 py-2.5 pl-10 pr-3.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none"
            />
          </div> */}

          {/* {articleSearch && matchingArticles.length > 0 && (
            <div className="mb-4 max-h-40 overflow-y-auto rounded-lg border border-gray-200 bg-white">
              {matchingArticles.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => addArticle(a)}
                  className="flex w-full items-center justify-between px-3.5 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-800">
                    {a.designation}
                  </span>
                  <span className="text-gray-500">{formatAmount(a.prixUnitaireHt)}</span>
                </button>
              ))}
            </div>
          )} */}

          <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-bold text-gray-900">
                Articles sélectionnés
              </span>
              <span className="text-xs text-gray-500">
                {selectedArticles.length} article(s)
              </span>
            </div>

            {selectedArticles.length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-400">
                Aucun article sélectionné
              </p>
            ) : (
              <div className="space-y-2">
                {selectedArticles.map((sa) => (
                  <div
                    key={sa.article.id}
                    className="flex items-center justify-between rounded-lg bg-white px-3 py-2.5"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-800">
                        {sa.article.designation}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatAmount(sa.article.prixUnitaireHt)} / unité
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        value={sa.quantite}
                        onChange={(e) =>
                          updateQuantity(sa.article.id, Number(e.target.value))
                        }
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
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Sous-total HT</span>
              <span>{formatAmount(subtotalHt)}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>TVA</span>
              <span>{formatAmount(tva)}</span>
            </div>
            <div className="flex items-center justify-between text-base font-bold text-gray-900">
              <span>Total TTC</span>
              <span className="text-[#0066FF]">{formatAmount(totalTtc)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              !clientId ||
              selectedArticles.length === 0 ||
              createMutation.isPending
            }
            className="inline-flex items-center gap-2 rounded-lg bg-[#0066FF] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0052CC] disabled:opacity-50"
          >
            {createMutation.isPending ? "Création..." : "Créer la commande"}
          </button>
        </div>

        {createMutation.isError && (
          <p className="px-6 pb-4 text-sm text-red-500">
            Erreur lors de la création de la commande.
          </p>
        )}
      </div>
    </div>
  );
}
