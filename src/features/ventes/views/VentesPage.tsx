import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  DollarSign,
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
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(amount);

const formatDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const saleTotal = (sale: VenteResponse) =>
  sale.lignes.reduce(
    (sum, line) => sum + Number(line.quantite || 0) * Number(line.prixUnitaire || 0),
    0
  );

const saleQuantity = (sale: VenteResponse) =>
  sale.lignes.reduce((sum, line) => sum + Number(line.quantite || 0), 0);

const saleProducts = (sale: VenteResponse) =>
  sale.lignes.map((line) => line.articleDesignation).filter(Boolean).join(", ");

export default function VentesPage() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draftCode, setDraftCode] = useState("");
  const [draftCommentaire, setDraftCommentaire] = useState("");
  const [draftArticleId, setDraftArticleId] = useState("");
  const [draftQuantity, setDraftQuantity] = useState("1");

  const ventesQuery = useQuery({
    queryKey: ["ventes"],
    queryFn: async () => (await ventesApi.getAll({ page: 0, size: 100 })).data,
  });

  const articlesQuery = useQuery({
    queryKey: ["articles"],
    queryFn: async () => (await articleApi.getAll({ page: 0, size: 100 })).data,
  });

  const createVenteMutation = useMutation({
    mutationFn: (payload: VenteRequest) => ventesApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ventes"] });
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const deleteVenteMutation = useMutation({
    mutationFn: (id: number) => ventesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ventes"] });
    },
  });

  const ventes = ventesQuery.data?.content ?? [];
  const articles = articlesQuery.data?.content ?? [];

  const filteredSales = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return ventes;
    }

    return ventes.filter((sale) =>
      [sale.code, sale.commentaire ?? "", saleProducts(sale)]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [query, ventes]);

  const totals = useMemo(
    () => ({
      totalAmount: ventes.reduce((sum, sale) => sum + saleTotal(sale), 0),
      soldArticles: ventes.reduce((sum, sale) => sum + saleQuantity(sale), 0),
      saleCount: ventesQuery.data?.totalElements ?? ventes.length,
    }),
    [ventes, ventesQuery.data?.totalElements]
  );

  function resetForm() {
    setDraftCode("");
    setDraftCommentaire("");
    setDraftArticleId("");
    setDraftQuantity("1");
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const articleId = Number(draftArticleId);
    const quantite = Number(draftQuantity);

    if (!articleId || quantite <= 0) {
      return;
    }

    createVenteMutation.mutate({
      code: draftCode.trim() || null,
      commentaire: draftCommentaire.trim() || null,
      lignes: [{ articleId, quantite }],
    });
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-950 sm:text-3xl">
          Gestion des Ventes
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Enregistrez et suivez vos ventes
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <StatCard icon={DollarSign} label="Total des Ventes" value={formatAmount(totals.totalAmount)} tone="green" />
        <StatCard icon={Package} label="Articles Vendus" value={String(totals.soldArticles)} tone="blue" />
        <StatCard icon={TrendingUp} label="Nombre de Ventes" value={String(totals.saleCount)} tone="purple" />
      </div>

      <section className="mt-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 px-5 py-6 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-bold text-gray-950">
            Historique des Ventes
          </h2>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex h-10 w-fit items-center gap-2 rounded-lg bg-[#05061D] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#11132E]"
          >
            <Plus size={16} />
            Nouvelle Vente
          </button>
        </div>

        <div className="px-5 pb-5">
          <label className="flex h-10 items-center gap-3 rounded-lg bg-gray-100 px-3 text-slate-400">
            <Search size={17} />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full bg-transparent text-sm text-gray-800 outline-none placeholder:text-slate-500"
              placeholder="Rechercher par code, article ou commentaire..."
            />
          </label>
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
                <th className="px-4 py-3 font-semibold">Statut</th>
                <th className="py-3 pl-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="align-middle">
                  <td className="py-4 pr-4 text-gray-900">
                    {formatDate(sale.dateVente)}
                  </td>
                  <td className="px-4 py-4 font-mono text-xs font-bold text-slate-500">
                    {sale.code}
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-gray-950">
                      {saleProducts(sale) || "-"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {sale.lignes.length} ligne(s)
                    </p>
                  </td>
                  <td className="px-4 py-4 text-slate-700">
                    {sale.commentaire || "-"}
                  </td>
                  <td className="px-4 py-4 text-right text-gray-900">
                    {saleQuantity(sale)}
                  </td>
                  <td className="px-4 py-4 text-right font-bold text-emerald-600">
                    {formatAmount(saleTotal(sale))}
                  </td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center rounded-lg bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Complété
                    </span>
                  </td>
                  <td className="py-4 pl-4">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => deleteVenteMutation.mutate(sale.id)}
                        className="inline-flex h-9 w-10 items-center justify-center rounded-lg border border-red-100 text-red-500 transition-colors hover:bg-red-50"
                        aria-label="Supprimer"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {ventesQuery.isLoading && <ListMessage message="Chargement des ventes..." />}
          {ventesQuery.isError && <ListMessage message="Impossible de charger les ventes." />}
          {!ventesQuery.isLoading && filteredSales.length === 0 && (
            <ListMessage message="Aucune vente ne correspond à votre recherche." />
          )}
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 px-4">
          <form onSubmit={handleSubmit} className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-950">
                  Nouvelle vente
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Sélectionnez un article réel du catalogue.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-gray-100"
                aria-label="Fermer"
              >
                <X size={17} />
              </button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <TextField label="Code" value={draftCode} onChange={setDraftCode} placeholder="VENTE-001" />
              <TextField label="Quantité" value={draftQuantity} onChange={setDraftQuantity} type="number" placeholder="1" />

              <label className="block sm:col-span-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Article
                </span>
                <select
                  value={draftArticleId}
                  onChange={(event) => setDraftArticleId(event.target.value)}
                  className="mt-1.5 h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[#0066FF]"
                >
                  <option value="">Choisir un article</option>
                  {articles.map((article) => (
                    <option key={article.id} value={article.id}>
                      {article.designation} - {formatAmount(Number(article.prixUnitaireTtc || 0))}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block sm:col-span-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Commentaire
                </span>
                <textarea
                  value={draftCommentaire}
                  onChange={(event) => setDraftCommentaire(event.target.value)}
                  className="mt-1.5 min-h-24 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#0066FF]"
                  placeholder="Note optionnelle"
                />
              </label>
            </div>

            {createVenteMutation.isError && (
              <p className="mt-4 text-sm font-semibold text-red-600">
                Impossible de créer la vente. Vérifiez le stock et l'article sélectionné.
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
                disabled={createVenteMutation.isPending}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#0066FF] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#0052CC] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CheckCircle2 size={16} />
                {createVenteMutation.isPending ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

type StatCardProps = {
  icon: typeof DollarSign;
  label: string;
  value: string;
  tone: "green" | "blue" | "purple";
};

const statToneClasses: Record<StatCardProps["tone"], string> = {
  green: "bg-emerald-100 text-emerald-600",
  blue: "bg-blue-100 text-[#0066FF]",
  purple: "bg-purple-100 text-purple-600",
};

function StatCard({ icon: Icon, label, value, tone }: StatCardProps) {
  return (
    <article className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${statToneClasses[tone]}`}>
          <Icon size={23} />
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
        min={type === "number" ? "1" : undefined}
        step={type === "number" ? "1" : undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 h-11 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#0066FF]"
        placeholder={placeholder}
      />
    </label>
  );
}
