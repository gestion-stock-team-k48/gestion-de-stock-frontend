import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  Boxes,
  Edit3,
  PackagePlus,
  Plus,
  Search,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { articleApi } from "../api/articleApi";
import type { ArticleRequest } from "../types";
import { categorieApi } from "../../categories/api/categorieApi";

const formatAmount = (amount: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(amount);

export default function ArticlesPage() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draftCode, setDraftCode] = useState("");
  const [draftDesignation, setDraftDesignation] = useState("");
  const [draftCategoryId, setDraftCategoryId] = useState("");
  const [draftPrixHt, setDraftPrixHt] = useState("");
  const [draftTauxTva, setDraftTauxTva] = useState("19.25");
  const [draftSeuilMinimum, setDraftSeuilMinimum] = useState("1");

  const articlesQuery = useQuery({
    queryKey: ["articles"],
    queryFn: async () => (await articleApi.getAll({ page: 0, size: 100 })).data,
  });

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await categorieApi.getAll()).data,
  });

  const createArticleMutation = useMutation({
    mutationFn: (payload: ArticleRequest) => articleApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const deleteArticleMutation = useMutation({
    mutationFn: (id: number) => articleApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
  });

  const articles = articlesQuery.data?.content ?? [];
  const categories = categoriesQuery.data ?? [];

  const filteredArticles = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return articles;
    }

    return articles.filter((article) =>
      [article.code, article.designation, article.categoryDesignation]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [articles, query]);

  const totals = useMemo(() => {
    const lowStockArticles = articles.filter(
      (article) => Number(article.seuilMinimum) > 0
    ).length;
    const totalValue = articles.reduce(
      (sum, article) => sum + Number(article.prixUnitaireTtc || 0),
      0
    );

    return {
      total: articlesQuery.data?.totalElements ?? articles.length,
      categories: new Set(articles.map((article) => article.categoryId)).size,
      lowStockArticles,
      totalValue,
    };
  }, [articles, articlesQuery.data?.totalElements]);

  function resetForm() {
    setDraftCode("");
    setDraftDesignation("");
    setDraftCategoryId("");
    setDraftPrixHt("");
    setDraftTauxTva("19.25");
    setDraftSeuilMinimum("1");
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const code = draftCode.trim();
    const designation = draftDesignation.trim();
    const categoryId = Number(draftCategoryId);
    const prixUnitaireHt = Number(draftPrixHt);
    const tauxTva = Number(draftTauxTva);
    const seuilMinimum = Number(draftSeuilMinimum);
    const prixUnitaireTtc = prixUnitaireHt + prixUnitaireHt * (tauxTva / 100);

    if (
      !code ||
      !designation ||
      !categoryId ||
      prixUnitaireHt < 0 ||
      tauxTva < 0 ||
      seuilMinimum < 0
    ) {
      return;
    }

    createArticleMutation.mutate({
      code,
      designation,
      categoryId,
      prixUnitaireHt,
      tauxTva,
      prixUnitaireTtc,
      seuilMinimum,
      photo: null,
    });
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-950 sm:text-3xl">
          Gestion des Articles
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Gérez votre catalogue et vos prix
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Boxes} label="Total Articles" value={String(totals.total)} tone="blue" />
        <StatCard icon={Tag} label="Catégories" value={String(totals.categories)} tone="purple" />
        <StatCard icon={AlertTriangle} label="Seuils suivis" value={String(totals.lowStockArticles)} tone="amber" />
        <StatCard icon={PackagePlus} label="Valeur catalogue" value={formatAmount(totals.totalValue)} tone="green" />
      </div>

      <section className="mt-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 px-5 py-6 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-bold text-gray-950">
            Liste des Articles
          </h2>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex h-10 w-fit items-center gap-2 rounded-lg bg-[#05061D] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#11132E]"
          >
            <Plus size={16} />
            Ajouter un Article
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
              placeholder="Rechercher par code, désignation ou catégorie..."
            />
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
              {filteredArticles.map((article) => (
                <tr key={article.id}>
                  <td className="py-4 pr-4 font-mono text-xs font-bold text-slate-500">
                    {article.code}
                  </td>
                  <td className="px-4 py-4 font-semibold text-gray-950">
                    {article.designation}
                  </td>
                  <td className="px-4 py-4">
                    <span className="rounded-lg bg-blue-100 px-2.5 py-1 text-xs font-semibold text-[#0066FF]">
                      {article.categoryDesignation}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right text-slate-700">
                    {formatAmount(Number(article.prixUnitaireHt || 0))}
                  </td>
                  <td className="px-4 py-4 text-right text-slate-700">
                    {Number(article.tauxTva || 0)}%
                  </td>
                  <td className="px-4 py-4 text-right font-bold text-emerald-600">
                    {formatAmount(Number(article.prixUnitaireTtc || 0))}
                  </td>
                  <td className="px-4 py-4 text-right font-semibold text-slate-700">
                    {article.seuilMinimum}
                  </td>
                  <td className="py-4 pl-4">
                    <div className="flex justify-end gap-2">
                      <IconButton label="Modifier" icon={Edit3} />
                      <IconButton
                        label="Supprimer"
                        icon={Trash2}
                        danger
                        onClick={() => deleteArticleMutation.mutate(article.id)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {articlesQuery.isLoading && <ListMessage message="Chargement des articles..." />}
          {articlesQuery.isError && <ListMessage message="Impossible de charger les articles." />}
          {!articlesQuery.isLoading && filteredArticles.length === 0 && (
            <ListMessage message="Aucun article ne correspond à votre recherche." />
          )}
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 px-4">
          <form onSubmit={handleSubmit} className="w-full max-w-xl rounded-xl bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-950">
                  Ajouter un article
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Les champs correspondent au payload ArticleRequest du Swagger.
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
              <TextField label="Code" value={draftCode} onChange={setDraftCode} placeholder="ART-001" />
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Catégorie
                </span>
                <select
                  value={draftCategoryId}
                  onChange={(event) => setDraftCategoryId(event.target.value)}
                  className="mt-1.5 h-11 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none focus:border-[#0066FF]"
                >
                  <option value="">Choisir une catégorie</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.designation}
                    </option>
                  ))}
                </select>
              </label>
              <div className="sm:col-span-2">
                <TextField label="Désignation" value={draftDesignation} onChange={setDraftDesignation} placeholder="Nom de l'article" />
              </div>
              <TextField label="Prix HT" value={draftPrixHt} onChange={setDraftPrixHt} type="number" placeholder="0.00" />
              <TextField label="Taux TVA" value={draftTauxTva} onChange={setDraftTauxTva} type="number" placeholder="19.25" />
              <TextField label="Seuil minimum" value={draftSeuilMinimum} onChange={setDraftSeuilMinimum} type="number" placeholder="1" />
              <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-slate-600">
                Prix TTC estimé
                <span className="mt-1 block font-bold text-gray-950">
                  {formatAmount(Number(draftPrixHt || 0) + Number(draftPrixHt || 0) * (Number(draftTauxTva || 0) / 100))}
                </span>
              </div>
            </div>

            {createArticleMutation.isError && (
              <p className="mt-4 text-sm font-semibold text-red-600">
                Impossible de créer l'article. Vérifiez les champs requis.
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
                disabled={createArticleMutation.isPending}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#0066FF] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#0052CC] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Plus size={16} />
                {createArticleMutation.isPending ? "Ajout..." : "Ajouter"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

type StatCardProps = {
  icon: typeof Boxes;
  label: string;
  value: string;
  tone: "blue" | "purple" | "amber" | "green";
};

const statToneClasses: Record<StatCardProps["tone"], string> = {
  blue: "bg-blue-100 text-[#0066FF]",
  purple: "bg-purple-100 text-purple-600",
  amber: "bg-amber-100 text-amber-600",
  green: "bg-emerald-100 text-emerald-600",
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
        min={type === "number" ? "0" : undefined}
        step={type === "number" ? "0.01" : undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 h-11 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#0066FF]"
        placeholder={placeholder}
      />
    </label>
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
