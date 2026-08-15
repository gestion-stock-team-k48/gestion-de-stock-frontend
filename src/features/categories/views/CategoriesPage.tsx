import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import {
  Building2,
  Edit3,
  Gift,
  Laptop,
  Lightbulb,
  Package,
  Plus,
  Shirt,
  Trash2,
  Wrench,
  X,
} from "lucide-react";
import { articleApi } from "../../articles/api/articleApi";
import { categorieApi } from "../api/categorieApi";
import type { CategoryRequest, CategoryResponse } from "../types";

type CategoryTone = "blue" | "purple" | "orange" | "green" | "pink" | "cyan" | "red" | "yellow";

const categoryVisuals: Array<{ icon: LucideIcon; tone: CategoryTone }> = [
  { icon: Laptop, tone: "blue" },
  { icon: Building2, tone: "purple" },
  { icon: Wrench, tone: "orange" },
  { icon: Lightbulb, tone: "green" },
  { icon: Shirt, tone: "pink" },
  { icon: Package, tone: "cyan" },
  { icon: Wrench, tone: "red" },
  { icon: Gift, tone: "yellow" },
];

const toneClasses: Record<CategoryTone, string> = {
  blue: "bg-blue-100 text-[#0066FF]",
  purple: "bg-purple-100 text-purple-600",
  orange: "bg-orange-100 text-orange-600",
  green: "bg-emerald-100 text-emerald-600",
  pink: "bg-pink-100 text-pink-600",
  cyan: "bg-cyan-100 text-cyan-600",
  red: "bg-red-100 text-red-600",
  yellow: "bg-yellow-100 text-yellow-600",
};

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryResponse | null>(null);
  const [draftCode, setDraftCode] = useState("");
  const [draftDesignation, setDraftDesignation] = useState("");

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await categorieApi.getAll()).data,
  });

  const articlesQuery = useQuery({
    queryKey: ["articles"],
    queryFn: async () => (await articleApi.getAll({ page: 0, size: 500 })).data,
  });

  const createCategoryMutation = useMutation({
    mutationFn: (payload: CategoryRequest) => categorieApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      closeModal();
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CategoryRequest }) =>
      categorieApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      closeModal();
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: number) => categorieApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      closeModal();
    },
  });

  const categories = categoriesQuery.data ?? [];
  const articles = articlesQuery.data?.content ?? [];

  const articleCounts = useMemo(() => {
    return articles.reduce<Record<number, number>>((counts, article) => {
      counts[article.categoryId] = (counts[article.categoryId] ?? 0) + 1;
      return counts;
    }, {});
  }, [articles]);

  const isSubmitting =
    createCategoryMutation.isPending ||
    updateCategoryMutation.isPending ||
    deleteCategoryMutation.isPending;

  const hasMutationError =
    createCategoryMutation.isError ||
    updateCategoryMutation.isError ||
    deleteCategoryMutation.isError;

  const openCreateModal = () => {
    setEditingCategory(null);
    setDraftCode("");
    setDraftDesignation("");
    setIsModalOpen(true);
  };

  const openEditModal = (category: CategoryResponse) => {
    setEditingCategory(category);
    setDraftCode(category.code);
    setDraftDesignation(category.designation);
    setIsModalOpen(true);
  };

  function closeModal() {
    setIsModalOpen(false);
    setEditingCategory(null);
    setDraftCode("");
    setDraftDesignation("");
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload: CategoryRequest = {
      code: draftCode.trim(),
      designation: draftDesignation.trim(),
    };

    if (!payload.code || !payload.designation) {
      return;
    }

    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id, payload });
      return;
    }

    createCategoryMutation.mutate(payload);
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-950">Catégories</h1>
          <p className="mt-2 text-sm text-slate-500">
            Organisez vos produits par catégorie
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex h-10 w-fit items-center gap-2 rounded-lg bg-[#3B82F6] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB]"
        >
          <Plus size={16} />
          Nouvelle catégorie
        </button>
      </div>

      <div className="mt-8">
        {categoriesQuery.isLoading && (
          <div className="rounded-xl border border-gray-200 bg-white py-14 text-center text-sm text-slate-500 shadow-sm">
            Chargement des catégories...
          </div>
        )}

        {categoriesQuery.isError && (
          <div className="rounded-xl border border-red-100 bg-white py-14 text-center text-sm font-semibold text-red-600 shadow-sm">
            Impossible de charger les catégories.
          </div>
        )}

        {!categoriesQuery.isLoading && !categoriesQuery.isError && categories.length === 0 && (
          <div className="rounded-xl border border-gray-200 bg-white py-14 text-center text-sm text-slate-500 shadow-sm">
            Aucune catégorie enregistrée.
          </div>
        )}

        {categories.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {categories.map((category, index) => {
              const visual = categoryVisuals[index % categoryVisuals.length];

              return (
                <CategoryCard
                  key={category.id}
                  category={category}
                  articleCount={articleCounts[category.id] ?? 0}
                  icon={visual.icon}
                  tone={visual.tone}
                  onManage={() => openEditModal(category)}
                />
              );
            })}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/40 px-4">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-950">
                  {editingCategory ? "Gérer la catégorie" : "Nouvelle catégorie"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Code et désignation sont requis par l'API.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-gray-100"
                aria-label="Fermer"
              >
                <X size={17} />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <TextField
                label="Code"
                value={draftCode}
                onChange={setDraftCode}
                placeholder="CAT-001"
              />
              <TextField
                label="Désignation"
                value={draftDesignation}
                onChange={setDraftDesignation}
                placeholder="Électronique"
              />
            </div>

            {hasMutationError && (
              <p className="mt-4 text-sm font-semibold text-red-600">
                Requête impossible. Vérifiez le code et les droits utilisateur.
              </p>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              {editingCategory ? (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => deleteCategoryMutation.mutate(editingCategory.id)}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-red-100 px-4 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Trash2 size={16} />
                  Supprimer
                </button>
              ) : (
                <span />
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="h-10 rounded-lg border border-gray-200 px-4 text-sm font-semibold text-slate-600 transition-colors hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#0066FF] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#0052CC] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {editingCategory ? <Edit3 size={16} /> : <Plus size={16} />}
                  {editingCategory ? "Enregistrer" : "Créer"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

type CategoryCardProps = {
  category: CategoryResponse;
  articleCount: number;
  icon: LucideIcon;
  tone: CategoryTone;
  onManage: () => void;
};

function CategoryCard({
  category,
  articleCount,
  icon: Icon,
  tone,
  onManage,
}: CategoryCardProps) {
  return (
    <article className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
      <div
        className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${toneClasses[tone]}`}
      >
        <Icon size={25} />
      </div>
      <h2 className="mt-5 break-words text-base font-bold text-gray-950">
        {category.designation}
      </h2>
      <p className="mt-3 text-xs font-medium text-slate-500">
        {articleCount} article{articleCount > 1 ? "s" : ""}
      </p>
      <button
        type="button"
        onClick={onManage}
        className="mt-5 h-10 w-full rounded-lg bg-gray-50 text-sm font-medium text-slate-700 transition-colors hover:bg-blue-50 hover:text-[#0066FF]"
      >
        Gérer
      </button>
    </article>
  );
}

type TextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

function TextField({ label, value, onChange, placeholder }: TextFieldProps) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 h-11 w-full rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-[#0066FF]"
        placeholder={placeholder}
      />
    </label>
  );
}
