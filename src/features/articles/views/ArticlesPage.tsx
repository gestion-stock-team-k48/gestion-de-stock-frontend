import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Boxes,
  Edit3,
  Eye,
  PackagePlus,
  Plus,
  Search,
  Tag,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { articleApi } from "../api/articleApi";
import type { ArticleRequest, ArticleResponse } from "../types";
import { categorieApi } from "../../categories/api/categorieApi";

const formatAmount = (amount: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: 2 }).format(amount);

export default function ArticlesPage() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<ArticleResponse | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [draftCode, setDraftCode] = useState("");
  const [draftDesignation, setDraftDesignation] = useState("");
  const [draftCategoryId, setDraftCategoryId] = useState("");
  const [draftPrixHt, setDraftPrixHt] = useState("");
  const [draftTauxTva, setDraftTauxTva] = useState("19.25");
  const [draftSeuilMinimum, setDraftSeuilMinimum] = useState("1");
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const articlesQuery = useQuery({
    queryKey: ["articles"],
    queryFn: async () => (await articleApi.getAll({ page: 0, size: 500 })).data,
  });

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await categorieApi.getAll()).data,
  });

  const createMutation = useMutation({
    mutationFn: (payload: ArticleRequest) => articleApi.create(payload),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["articles"] }); closeModal(); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: ArticleRequest }) => articleApi.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["articles"] }); closeModal(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => articleApi.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["articles"] }); setDeleteId(null); },
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) => articleApi.uploadPhoto(id, file),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["articles"] }); setPhotoFile(null); },
  });

  const articles = useMemo(() => articlesQuery.data?.content ?? [], [articlesQuery.data]);
  const categories = useMemo(() => categoriesQuery.data ?? [], [categoriesQuery.data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return articles;
    return articles.filter((a) => [a.code, a.designation, a.categoryDesignation].join(" ").toLowerCase().includes(q));
  }, [articles, query]);

  const totals = useMemo(() => ({
    total: articlesQuery.data?.totalElements ?? articles.length,
    categories: new Set(articles.map((a) => a.categoryId)).size,
    lowStock: articles.filter((a) => Number(a.seuilMinimum) > 0).length,
    value: articles.reduce((s, a) => s + Number(a.prixUnitaireTtc || 0), 0),
  }), [articles, articlesQuery.data]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  function resetForm() {
    setDraftCode(""); setDraftDesignation(""); setDraftCategoryId(""); setDraftPrixHt(""); setDraftTauxTva("19.25"); setDraftSeuilMinimum("1"); setPhotoFile(null);
  }

  function openCreate() { setEditing(null); resetForm(); setIsModalOpen(true); }

  function openEdit(a: ArticleResponse) {
    setEditing(a); setDraftCode(a.code); setDraftDesignation(a.designation); setDraftCategoryId(String(a.categoryId));
    setDraftPrixHt(String(a.prixUnitaireHt)); setDraftTauxTva(String(a.tauxTva)); setDraftSeuilMinimum(String(a.seuilMinimum));
    setPhotoFile(null);
    setIsModalOpen(true);
  }

  function closeModal() { setIsModalOpen(false); setEditing(null); resetForm(); }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const data: ArticleRequest = {
      code: draftCode.trim(), designation: draftDesignation.trim(), categoryId: Number(draftCategoryId),
      prixUnitaireHt: Number(draftPrixHt), tauxTva: Number(draftTauxTva),
      prixUnitaireTtc: Number(draftPrixHt) + Number(draftPrixHt) * (Number(draftTauxTva) / 100),
      seuilMinimum: Number(draftSeuilMinimum), photo: null,
    };
    if (!data.code || !data.designation || !data.categoryId) return;
    if (editing) {
      updateMutation.mutate({ id: editing.id, data }, {
        onSuccess: () => {
          if (photoFile) uploadPhotoMutation.mutate({ id: editing.id, file: photoFile });
        },
      });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-950 sm:text-3xl">Gestion des Articles</h1>
        <p className="mt-2 text-sm text-slate-500">Gérez votre catalogue et vos prix</p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Boxes} label="Total Articles" value={String(totals.total)} tone="blue" />
        <StatCard icon={Tag} label="Catégories" value={String(totals.categories)} tone="purple" />
        <StatCard icon={AlertTriangle} label="Seuils suivis" value={String(totals.lowStock)} tone="amber" />
        <StatCard icon={PackagePlus} label="Valeur catalogue" value={formatAmount(totals.value)} tone="green" />
      </div>

      <section className="mt-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 px-5 py-6 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-bold text-gray-950">Liste des Articles</h2>
          <button type="button" onClick={openCreate} className="inline-flex h-10 w-fit items-center gap-2 rounded-lg bg-[#0066FF] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#0052CC]">
            <Plus size={16} /> Ajouter un Article
          </button>
        </div>

        <div className="px-5 pb-5">
          <label className="flex h-10 items-center gap-3 rounded-lg bg-gray-100 px-3 text-slate-400">
            <Search size={17} />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-slate-500" placeholder="Rechercher par code, désignation ou catégorie..." />
          </label>
        </div>

        <div className="overflow-x-auto px-5 pb-6">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-gray-950">
                <th className="py-3 pr-4 font-semibold">Code</th>
                <th className="px-4 py-3 font-semibold">Désignation</th>
                <th className="px-4 py-3 font-semibold">Catégorie</th>
                <th className="px-4 py-3 text-right font-semibold">Prix HT</th>
                <th className="px-4 py-3 text-right font-semibold">TVA</th>
                <th className="px-4 py-3 text-right font-semibold">Prix TTC</th>
                <th className="px-4 py-3 text-right font-semibold">Seuil</th>
                <th className="py-3 pl-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((a) => (
                <tr key={a.id}>
                  <td className="py-4 pr-4 font-mono text-xs font-bold text-slate-500">{a.code}</td>
                  <td className="px-4 py-4 font-semibold text-gray-950">{a.designation}</td>
                  <td className="px-4 py-4"><span className="rounded-lg bg-blue-100 px-2.5 py-1 text-xs font-semibold text-[#0066FF]">{a.categoryDesignation}</span></td>
                  <td className="px-4 py-4 text-right text-slate-700">{formatAmount(Number(a.prixUnitaireHt || 0))}</td>
                  <td className="px-4 py-4 text-right text-slate-700">{Number(a.tauxTva || 0)}%</td>
                  <td className="px-4 py-4 text-right font-bold text-emerald-600">{formatAmount(Number(a.prixUnitaireTtc || 0))}</td>
                  <td className="px-4 py-4 text-right font-semibold text-slate-700">{a.seuilMinimum}</td>
                  <td className="py-4 pl-4">
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => setDetailId(a.id)} className="inline-flex h-9 w-10 items-center justify-center rounded-lg border border-gray-200 text-slate-500 transition-colors hover:border-blue-200 hover:text-[#0066FF]" title="Voir"><Eye size={16} /></button>
                      <button type="button" onClick={() => openEdit(a)} className="inline-flex h-9 w-10 items-center justify-center rounded-lg border border-gray-200 text-slate-500 transition-colors hover:border-blue-200 hover:text-[#0066FF]" title="Modifier"><Edit3 size={16} /></button>
                      <button type="button" onClick={() => setDeleteId(a.id)} className="inline-flex h-9 w-10 items-center justify-center rounded-lg border border-red-100 text-red-500 transition-colors hover:bg-red-50" title="Supprimer"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {articlesQuery.isLoading && <div className="py-12 text-center text-sm text-slate-500">Chargement...</div>}
          {articlesQuery.isError && <div className="py-12 text-center text-sm text-red-500">Impossible de charger les articles.</div>}
          {!articlesQuery.isLoading && filtered.length === 0 && <div className="py-12 text-center text-sm text-slate-500">Aucun article trouvé.</div>}
        </div>
      </section>

      {/* Modal Création / Édition */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 px-4">
          <form onSubmit={handleSubmit} className="w-full max-w-xl rounded-xl bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-lg font-bold text-gray-950">{editing ? "Modifier l'article" : "Ajouter un article"}</h2>
              <button type="button" onClick={closeModal} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-gray-100"><X size={17} /></button>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <TextField label="Code" value={draftCode} onChange={setDraftCode} placeholder="ART-001" />
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Catégorie</span>
                <select value={draftCategoryId} onChange={(e) => setDraftCategoryId(e.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[#0066FF]">
                  <option value="">Choisir une catégorie</option>
                  {categories.map((c: { id: number; designation: string }) => <option key={c.id} value={c.id}>{c.designation}</option>)}
                </select>
              </label>
              <div className="sm:col-span-2"><TextField label="Désignation" value={draftDesignation} onChange={setDraftDesignation} placeholder="Nom de l'article" /></div>
              <TextField label="Prix HT" value={draftPrixHt} onChange={setDraftPrixHt} type="number" placeholder="0.00" />
              <TextField label="Taux TVA" value={draftTauxTva} onChange={setDraftTauxTva} type="number" placeholder="19.25" />
              <TextField label="Seuil minimum" value={draftSeuilMinimum} onChange={setDraftSeuilMinimum} type="number" placeholder="1" />
              <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-slate-600">
                Prix TTC estimé
                <span className="mt-1 block font-bold text-gray-950">{formatAmount(Number(draftPrixHt || 0) + Number(draftPrixHt || 0) * (Number(draftTauxTva || 0) / 100))}</span>
              </div>
              {/* Upload photo */}
              {editing && (
                <div className="sm:col-span-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Photo</span>
                  <label className="mt-1.5 flex h-11 w-full cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-3 text-sm text-slate-500 hover:bg-gray-100 transition-colors">
                    <Upload size={15} />
                    {photoFile ? photoFile.name : "Choisir une photo"}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)} />
                  </label>
                </div>
              )}
            </div>
            {(createMutation.isError || updateMutation.isError) && <p className="mt-4 text-sm font-semibold text-red-600">Erreur. Vérifiez les champs requis.</p>}
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={closeModal} className="h-10 rounded-lg border border-gray-200 px-4 text-sm font-semibold text-slate-600 hover:bg-gray-50">Annuler</button>
              <button type="submit" disabled={isSubmitting} className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#0066FF] px-4 text-sm font-semibold text-white hover:bg-[#0052CC] disabled:opacity-60">
                {isSubmitting ? "Enregistrement..." : editing ? "Enregistrer" : "Ajouter"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Détail */}
      {detailId !== null && <DetailArticleModal id={detailId} onClose={() => setDetailId(null)} />}

      {/* Modal suppression */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100"><Trash2 size={20} className="text-red-600" /></div>
            <h3 className="text-lg font-bold text-gray-900">Supprimer cet article ?</h3>
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

/* ── Modal Détail Article ── */

function DetailArticleModal({ id, onClose }: { id: number; onClose: () => void }) {
  const { data: article, isLoading } = useQuery({
    queryKey: ["articles", id],
    queryFn: async () => (await articleApi.getById(id)).data,
    enabled: id !== null,
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-950">Détail de l'article</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"><X size={20} /></button>
        </div>
        <div className="px-6 py-5">
          {isLoading ? (
            <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-5 w-full animate-pulse rounded bg-gray-200" />)}</div>
          ) : !article ? (
            <p className="text-center text-sm text-gray-500">Article introuvable.</p>
          ) : (
            <>
              {article.photo && (
                <div className="mb-4 flex justify-center">
                  <img src={article.photo} alt={article.designation} className="h-32 w-32 rounded-xl object-cover" />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-gray-500">Code</p><p className="font-mono font-bold text-gray-900">{article.code}</p></div>
                <div><p className="text-gray-500">Catégorie</p><p className="font-semibold text-gray-900">{article.categoryDesignation}</p></div>
                <div className="sm:col-span-2"><p className="text-gray-500">Désignation</p><p className="font-semibold text-gray-900">{article.designation}</p></div>
                <div><p className="text-gray-500">Prix HT</p><p className="font-semibold text-gray-900">{formatAmount(article.prixUnitaireHt)}</p></div>
                <div><p className="text-gray-500">TVA</p><p className="font-semibold text-gray-900">{article.tauxTva}%</p></div>
                <div><p className="text-gray-500">Prix TTC</p><p className="font-bold text-emerald-600">{formatAmount(article.prixUnitaireTtc)}</p></div>
                <div><p className="text-gray-500">Seuil minimum</p><p className="font-semibold text-gray-900">{article.seuilMinimum}</p></div>
              </div>
              {(article.createdBy || article.createdAt) && (
                <div className="mt-4 border-t border-gray-100 pt-4 text-xs text-gray-400">
                  {article.createdBy && <span>Créé par {article.createdBy}</span>}
                  {article.createdAt && <span> le {new Date(article.createdAt).toLocaleDateString("fr-FR")}</span>}
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

function StatCard({ icon: Icon, label, value, tone }: { icon: typeof Boxes; label: string; value: string; tone: "blue" | "purple" | "amber" | "green" }) {
  const cls = { blue: "bg-blue-100 text-[#0066FF]", purple: "bg-purple-100 text-purple-600", amber: "bg-amber-100 text-amber-600", green: "bg-emerald-100 text-emerald-600" };
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
      <input type={type} min={type === "number" ? "0" : undefined} step={type === "number" ? "0.01" : undefined} value={value} onChange={(e) => onChange(e.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#0066FF]" placeholder={placeholder} />
    </label>
  );
}
