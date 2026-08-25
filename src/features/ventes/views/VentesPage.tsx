import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  DollarSign,
  Eye,
  Package,
  Plus,
  Search,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import { ventesApi } from "../api/ventesApi";
import type { VenteRequest, VenteResponse } from "../types";
import { articleApi } from "../../articles/api/articleApi";

const formatAmount = (amount: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: 2 }).format(amount);

const formatDate = (v: string) => {
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return v;
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(d);
};

const saleTotal = (s: VenteResponse) => s.lignes.reduce((a, l) => a + Number(l.quantite || 0) * Number(l.prixUnitaire || 0), 0);
const saleQuantity = (s: VenteResponse) => s.lignes.reduce((a, l) => a + Number(l.quantite || 0), 0);
const saleProducts = (s: VenteResponse) => s.lignes.map((l) => l.articleDesignation).filter(Boolean).join(", ");

export default function VentesPage() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [draftCode, setDraftCode] = useState("");
  const [draftCommentaire, setDraftCommentaire] = useState("");
  const [draftArticleId, setDraftArticleId] = useState("");
  const [draftQuantity, setDraftQuantity] = useState("1");

  const ventesQuery = useQuery({ queryKey: ["ventes"], queryFn: async () => (await ventesApi.getAll({ page: 0, size: 200 })).data });
  const articlesQuery = useQuery({ queryKey: ["articles"], queryFn: async () => (await articleApi.getAll({ page: 0, size: 200 })).data });

  // Recherche par code via GET /ventes/code/{code}
  const [codeSearch, setCodeSearch] = useState("");
  const codeSearchQuery = useQuery({
    queryKey: ["ventes", "code", codeSearch],
    queryFn: async () => (await ventesApi.getByCode(codeSearch)).data,
    enabled: codeSearch.trim().length > 0,
  });

  const createMutation = useMutation({
    mutationFn: (payload: VenteRequest) => ventesApi.create(payload),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["ventes"] }); setIsCreateOpen(false); resetForm(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => ventesApi.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["ventes"] }); setDeleteId(null); },
  });

  const ventes = useMemo(() => ventesQuery.data?.content ?? [], [ventesQuery.data]);
  const articles = useMemo(() => articlesQuery.data?.content ?? [], [articlesQuery.data]);

  const filtered = useMemo(() => {
    // Si une recherche par code est active, afficher uniquement le résultat
    if (codeSearch.trim() && codeSearchQuery.data) {
      return [codeSearchQuery.data];
    }
    const q = query.trim().toLowerCase();
    if (!q) return ventes;
    return ventes.filter((s) => [s.code, s.commentaire ?? "", saleProducts(s)].join(" ").toLowerCase().includes(q));
  }, [query, ventes, codeSearch, codeSearchQuery.data]);

  const totals = useMemo(() => ({
    totalAmount: ventes.reduce((s, v) => s + saleTotal(v), 0),
    soldArticles: ventes.reduce((s, v) => s + saleQuantity(v), 0),
    saleCount: ventesQuery.data?.totalElements ?? ventes.length,
  }), [ventes, ventesQuery.data]);

  function resetForm() { setDraftCode(""); setDraftCommentaire(""); setDraftArticleId(""); setDraftQuantity("1"); }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const articleId = Number(draftArticleId), quantite = Number(draftQuantity);
    if (!articleId || quantite <= 0) return;
    createMutation.mutate({ code: draftCode.trim() || null, commentaire: draftCommentaire.trim() || null, lignes: [{ articleId, quantite }] });
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-950 sm:text-3xl">Gestion des Ventes</h1>
        <p className="mt-2 text-sm text-slate-500">Enregistrez et suivez vos ventes</p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <StatCard icon={DollarSign} label="Total des Ventes" value={formatAmount(totals.totalAmount)} tone="green" />
        <StatCard icon={Package} label="Articles Vendus" value={String(totals.soldArticles)} tone="blue" />
        <StatCard icon={TrendingUp} label="Nombre de Ventes" value={String(totals.saleCount)} tone="purple" />
      </div>

      <section className="mt-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 px-5 py-6 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-bold text-gray-950">Historique des Ventes</h2>
          <button type="button" onClick={() => setIsCreateOpen(true)} className="inline-flex h-10 w-fit items-center gap-2 rounded-lg bg-[#0066FF] px-4 text-sm font-semibold text-white hover:bg-[#0052CC]">
            <Plus size={16} /> Nouvelle Vente
          </button>
        </div>

        <div className="px-5 pb-5">
          <label className="flex h-10 items-center gap-3 rounded-lg bg-gray-100 px-3 text-slate-400">
            <Search size={17} />
            <input type="search" value={query} onChange={e => setQuery(e.target.value)} className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-slate-500" placeholder="Rechercher par code, article ou commentaire..." />
          </label>
        </div>

        <div className="px-5 pb-3">
          <label className="flex h-10 items-center gap-3 rounded-lg bg-blue-50 px-3 text-[#0066FF]">
            <Search size={17} />
            <input type="search" value={codeSearch} onChange={e => setCodeSearch(e.target.value)} className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-[#0066FF]/50" placeholder="Recherche exacte par code (ex: VENTE-001)..." />
            {codeSearch && (
              <button type="button" onClick={() => setCodeSearch("")} className="text-[#0066FF] hover:text-[#0052CC]">
                <X size={14} />
              </button>
            )}
          </label>
          {codeSearch.trim() && codeSearchQuery.isError && (
            <p className="mt-1 text-xs text-red-500">Aucune vente trouvée pour ce code.</p>
          )}
        </div>

        <div className="overflow-x-auto px-5 pb-6">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-950">
                <th className="py-3 pr-4 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Code</th>
                <th className="px-4 py-3 font-semibold">Articles</th>
                <th className="px-4 py-3 font-semibold">Commentaire</th>
                <th className="px-4 py-3 text-right font-semibold">Quantité</th>
                <th className="px-4 py-3 text-right font-semibold">Prix Total</th>
                <th className="py-3 pl-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((sale) => (
                <tr key={sale.id} className="align-middle">
                  <td className="py-4 pr-4 text-gray-900">{formatDate(sale.dateVente)}</td>
                  <td className="px-4 py-4 font-mono text-xs font-bold text-slate-500">{sale.code}</td>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-gray-950">{saleProducts(sale) || "-"}</p>
                    <p className="mt-1 text-xs text-slate-500">{sale.lignes.length} ligne(s)</p>
                  </td>
                  <td className="px-4 py-4 text-slate-700">{sale.commentaire || "-"}</td>
                  <td className="px-4 py-4 text-right text-gray-900">{saleQuantity(sale)}</td>
                  <td className="px-4 py-4 text-right font-bold text-emerald-600">{formatAmount(saleTotal(sale))}</td>
                  <td className="py-4 pl-4">
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => setDetailId(sale.id)} className="inline-flex h-9 w-10 items-center justify-center rounded-lg border border-gray-200 text-slate-500 hover:border-blue-200 hover:text-[#0066FF]" title="Voir"><Eye size={16} /></button>
                      <button type="button" onClick={() => setDeleteId(sale.id)} className="inline-flex h-9 w-10 items-center justify-center rounded-lg border border-red-100 text-red-500 hover:bg-red-50" title="Supprimer"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {ventesQuery.isLoading && <div className="py-12 text-center text-sm text-slate-500">Chargement...</div>}
          {ventesQuery.isError && <div className="py-12 text-center text-sm text-red-500">Impossible de charger les ventes.</div>}
          {!ventesQuery.isLoading && filtered.length === 0 && <div className="py-12 text-center text-sm text-slate-500">Aucune vente trouvée.</div>}
        </div>
      </section>

      {/* Modal Création */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 px-4">
          <form onSubmit={handleSubmit} className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-lg font-bold text-gray-950">Nouvelle vente</h2>
              <button type="button" onClick={() => setIsCreateOpen(false)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-gray-100"><X size={17} /></button>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <TextField label="Code" value={draftCode} onChange={setDraftCode} placeholder="VENTE-001" />
              <TextField label="Quantité" value={draftQuantity} onChange={setDraftQuantity} type="number" placeholder="1" />
              <label className="block sm:col-span-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Article</span>
                <select value={draftArticleId} onChange={e => setDraftArticleId(e.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[#0066FF]">
                  <option value="">Choisir un article</option>
                  {articles.map((a: { id: number; designation: string; prixUnitaireTtc: number }) => (
                    <option key={a.id} value={a.id}>{a.designation} - {formatAmount(Number(a.prixUnitaireTtc || 0))}</option>
                  ))}
                </select>
              </label>
              <label className="block sm:col-span-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Commentaire</span>
                <textarea value={draftCommentaire} onChange={e => setDraftCommentaire(e.target.value)} className="mt-1.5 min-h-24 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#0066FF]" placeholder="Note optionnelle" />
              </label>
            </div>
            {createMutation.isError && <p className="mt-4 text-sm font-semibold text-red-600">Erreur lors de la création. Vérifiez le stock.</p>}
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setIsCreateOpen(false)} className="h-10 rounded-lg border border-gray-200 px-4 text-sm font-semibold text-slate-600 hover:bg-gray-50">Annuler</button>
              <button type="submit" disabled={createMutation.isPending} className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#0066FF] px-4 text-sm font-semibold text-white hover:bg-[#0052CC] disabled:opacity-60">
                <CheckCircle2 size={16} /> {createMutation.isPending ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Détail */}
      {detailId !== null && <DetailModal id={detailId} onClose={() => setDetailId(null)} />}

      {/* Modal Suppression */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100"><Trash2 size={20} className="text-red-600" /></div>
            <h3 className="text-lg font-bold text-gray-900">Supprimer cette vente ?</h3>
            <p className="mt-2 text-sm text-gray-500">Cette action est irréversible.</p>
            <div className="mt-6 flex justify-center gap-3">
              <button type="button" onClick={() => setDeleteId(null)} className="rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Annuler</button>
              <button type="button" onClick={() => deleteMutation.mutate(deleteId)} disabled={deleteMutation.isPending} className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50">
                {deleteMutation.isPending ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Detail Modal ── */

function DetailModal({ id, onClose }: { id: number; onClose: () => void }) {
  const { data: vente, isLoading } = useQuery({
    queryKey: ["ventes", id],
    queryFn: async () => (await ventesApi.getById(id)).data,
    enabled: id !== null,
  });

  const total = vente ? vente.lignes.reduce((s, l) => s + l.quantite * l.prixUnitaire, 0) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-950">Détail de la vente</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"><X size={20} /></button>
        </div>
        <div className="px-6 py-5">
          {isLoading ? (
            <div className="space-y-3">{Array(3).fill(0).map((_, i) => <div key={i} className="h-5 w-full animate-pulse rounded bg-gray-200" />)}</div>
          ) : !vente ? (
            <p className="text-center text-sm text-gray-500">Vente introuvable.</p>
          ) : (
            <>
              <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-gray-500">Code</p><p className="font-semibold text-gray-900">{vente.code}</p></div>
                <div><p className="text-gray-500">Date</p><p className="font-semibold text-gray-900">{formatDate(vente.dateVente)}</p></div>
                {vente.commentaire && <div className="sm:col-span-2"><p className="text-gray-500">Commentaire</p><p className="font-medium text-gray-800">{vente.commentaire}</p></div>}
              </div>
              <div className="border-t border-gray-100 pt-4">
                <h3 className="mb-3 text-sm font-bold text-gray-900">Articles vendus</h3>
                <div className="rounded-lg border border-gray-200">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-xs text-gray-500">
                      <tr><th className="px-3 py-2 text-left font-bold">Article</th><th className="px-3 py-2 text-right font-bold">Qté</th><th className="px-3 py-2 text-right font-bold">Prix</th><th className="px-3 py-2 text-right font-bold">Total</th></tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {vente.lignes.map((l) => (
                        <tr key={l.id}>
                          <td className="px-3 py-2 font-medium text-gray-800">{l.articleDesignation}</td>
                          <td className="px-3 py-2 text-right text-gray-600">{l.quantite}</td>
                          <td className="px-3 py-2 text-right text-gray-600">{formatAmount(l.prixUnitaire)}</td>
                          <td className="px-3 py-2 text-right font-semibold text-gray-900">{formatAmount(l.quantite * l.prixUnitaire)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="mt-4 flex justify-end border-t border-gray-100 pt-4">
                <div className="text-right text-base font-bold text-gray-900">Total TTC : <span className="text-emerald-600">{formatAmount(total)}</span></div>
              </div>
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

function StatCard({ icon: Icon, label, value, tone }: { icon: typeof DollarSign; label: string; value: string; tone: "green" | "blue" | "purple" }) {
  const cls = { green: "bg-emerald-100 text-emerald-600", blue: "bg-blue-100 text-[#0066FF]", purple: "bg-purple-100 text-purple-600" };
  return (
    <article className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${cls[tone]}`}><Icon size={23} /></div>
        <div><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-1 text-2xl font-bold text-gray-950">{value}</p></div>
      </div>
    </article>
  );
}

function TextField({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</span>
      <input type={type} min={type === "number" ? "1" : undefined} step={type === "number" ? "1" : undefined} value={value} onChange={e => onChange(e.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#0066FF]" placeholder={placeholder} />
    </label>
  );
}
