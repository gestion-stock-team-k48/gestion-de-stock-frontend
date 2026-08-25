import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  Edit3,
  Filter,
  Package,
  TrendingDown,
  TrendingUp,
  User,
  X,
} from "lucide-react";
import {
  useStockAlertes,
  useStockMouvements,
  useStockMutations,
} from "../hooks";
import { useArticleList } from "../../articles/hooks";
import type { MvtStkResponse, AlerteStockResponse } from "../types";
import type { TypeMvtStk, SourceMvtStk } from "../../../core/types";

/* ── Constantes ── */

type TypeFilter = "ALL" | "ENTREE" | "SORTIE";
type TabKey = "mouvements" | "alertes";

const TYPE_LABELS: Record<TypeMvtStk, { label: string; color: string }> = {
  ENTREE: { label: "Entrée", color: "text-emerald-600" },
  SORTIE: { label: "Sortie", color: "text-red-500" },
  CORRECTION_POS: { label: "Corr. positive", color: "text-emerald-600" },
  CORRECTION_NEG: { label: "Corr. négative", color: "text-red-500" },
};

const SOURCE_OPTIONS: { value: SourceMvtStk; label: string }[] = [
  { value: "COMMANDE_CLIENT", label: "Commande client" },
  { value: "COMMANDE_FOURNISSEUR", label: "Commande fournisseur" },
  { value: "VENTE", label: "Vente" },
  { value: "STOCK_INITIAL", label: "Stock initial" },
  { value: "CORRECTION_MANUELLE", label: "Correction manuelle" },
];

function formatDateTime(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/* ── Page ── */

export default function StockMouvementsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("mouvements");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("ALL");
  const [dateFilter, setDateFilter] = useState("");
  const [articleFilter, setArticleFilter] = useState<string>("ALL");
  const [showModal, setShowModal] = useState<null | "entree" | "sortie" | "correction">(null);

  const { data: articles = [] } = useArticleList();
  const { movements, isLoading } = useStockMouvements();
  const { alertes } = useStockAlertes();

  const filteredMovements = useMemo(() => {
    let result = movements;
    if (typeFilter !== "ALL") {
      result = result.filter((m) => m.typeMvt === typeFilter);
    }
    if (dateFilter) {
      const fd = new Date(dateFilter);
      result = result.filter((m) => {
        const md = new Date(m.dateMvt);
        return (
          md.getFullYear() === fd.getFullYear() &&
          md.getMonth() === fd.getMonth() &&
          md.getDate() === fd.getDate()
        );
      });
    }
    if (articleFilter !== "ALL") {
      result = result.filter((m) => String(m.articleId) === articleFilter);
    }
    return result;
  }, [movements, typeFilter, dateFilter, articleFilter]);

  const stats = useMemo(() => {
    const entrees = movements.filter((m) => m.typeMvt === "ENTREE");
    const sorties = movements.filter((m) => m.typeMvt === "SORTIE");
    return {
      total: movements.length,
      totalEntrees: entrees.reduce((s, m) => s + m.quantite, 0),
      totalSorties: sorties.reduce((s, m) => s + m.quantite, 0),
      alertes: alertes.length,
    };
  }, [movements, alertes]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* ── Header ── */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-950 sm:text-3xl">
            Mouvements de Stock
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Historique complet des entrées et sorties
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowModal("entree")}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            <ArrowDownToLine size={16} />
            Entrée
          </button>
          <button
            type="button"
            onClick={() => setShowModal("sortie")}
            className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600"
          >
            <ArrowUpFromLine size={16} />
            Sortie
          </button>
          <button
            type="button"
            onClick={() => setShowModal("correction")}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-600"
          >
            <Edit3 size={16} />
            Correction
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Package} label="Total mouvements" value={String(stats.total)} tone="blue" />
        <StatCard icon={TrendingUp} label="Entrées totales" value={`+${stats.totalEntrees}`} tone="green" />
        <StatCard icon={TrendingDown} label="Sorties totales" value={`-${stats.totalSorties}`} tone="red" />
        <StatCard icon={AlertTriangle} label="Alertes stock" value={String(stats.alertes)} tone="amber" />
      </div>

      {/* ── Tabs ── */}
      <div className="mb-6 flex gap-1 rounded-lg bg-gray-100 p-1 w-fit">
        {([
          { key: "mouvements" as TabKey, label: "Mouvements" },
          { key: "alertes" as TabKey, label: `Alertes (${alertes.length})` },
        ]).map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={`rounded-md px-5 py-2 text-sm font-semibold transition-colors ${
              activeTab === key
                ? "bg-white text-gray-950 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Onglet Mouvements ── */}
      {activeTab === "mouvements" && (
        <>
          {/* Filtres */}
          <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <Filter size={18} className="shrink-0 text-gray-400" />
            <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
              {([
                { key: "ALL" as TypeFilter, label: "Tous" },
                { key: "ENTREE" as TypeFilter, label: "Entrées" },
                { key: "SORTIE" as TypeFilter, label: "Sorties" },
              ]).map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTypeFilter(key)}
                  className={`rounded-md px-4 py-1.5 text-sm font-semibold transition-colors ${
                    typeFilter === key
                      ? "bg-[#0066FF] text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="ml-auto flex items-center gap-3">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-1.5 text-sm text-gray-700 focus:border-blue-500 focus:bg-white focus:outline-none"
              />
              <select
                value={articleFilter}
                onChange={(e) => setArticleFilter(e.target.value)}
                className="appearance-none rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-1.5 text-sm text-gray-700 focus:border-blue-500 focus:bg-white focus:outline-none"
              >
                <option value="ALL">Tous les produits</option>
                {(articles as { id: number; designation: string }[]).map((a) => (
                  <option key={a.id} value={String(a.id)}>
                    {a.designation}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tableau */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-5 py-3 font-bold">Date</th>
                    <th className="px-5 py-3 font-bold">Produit</th>
                    <th className="px-5 py-3 font-bold">Type</th>
                    <th className="px-5 py-3 font-bold">Quantité</th>
                    <th className="px-5 py-3 font-bold">Motif</th>
                    <th className="px-5 py-3 font-bold">Utilisateur</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 6 }).map((_, j) => (
                          <td key={j} className="px-5 py-4">
                            <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : filteredMovements.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-sm text-gray-500">
                        Aucun mouvement de stock trouvé.
                      </td>
                    </tr>
                  ) : (
                    filteredMovements.map((mvt) => (
                      <MovementRow key={mvt.id} mvt={mvt} />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ── Onglet Alertes ── */}
      {activeTab === "alertes" && <AlertesSection alertes={alertes} />}

      {/* ── Modals ── */}
      {showModal === "entree" && (
        <EntreeStockModal articles={articles} onClose={() => setShowModal(null)} />
      )}
      {showModal === "sortie" && (
        <SortieStockModal articles={articles} onClose={() => setShowModal(null)} />
      )}
      {showModal === "correction" && (
        <CorrectionStockModal articles={articles} onClose={() => setShowModal(null)} />
      )}
    </div>
  );
}

/* ── Sous-composants ── */

type StatCardProps = {
  icon: typeof Package;
  label: string;
  value: string;
  tone: "blue" | "green" | "red" | "amber";
};

const toneClasses: Record<StatCardProps["tone"], string> = {
  blue: "bg-blue-50 text-[#0066FF]",
  green: "bg-emerald-50 text-emerald-600",
  red: "bg-red-50 text-red-500",
  amber: "bg-amber-50 text-amber-500",
};

function StatCard({ icon: Icon, label, value, tone }: StatCardProps) {
  return (
    <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneClasses[tone]}`}>
          <Icon size={18} />
        </div>
      </div>
      <p className="mt-4 text-2xl font-bold tracking-tight text-gray-950">{value}</p>
      <p className="mt-1 text-sm font-medium text-gray-600">{label}</p>
    </article>
  );
}

function MovementRow({ mvt }: { mvt: MvtStkResponse }) {
  const typeInfo = TYPE_LABELS[mvt.typeMvt];
  const isEntree = mvt.typeMvt === "ENTREE" || mvt.typeMvt === "CORRECTION_POS";
  const sign = isEntree ? "+" : "";

  return (
    <tr className="hover:bg-gray-50/50 transition-colors">
      <td className="px-5 py-4 text-gray-600">{formatDateTime(mvt.dateMvt)}</td>
      <td className="px-5 py-4 font-semibold text-gray-900">{mvt.articleDesignation}</td>
      <td className="px-5 py-4">
        <span className={`inline-flex items-center gap-1.5 font-semibold ${typeInfo.color}`}>
          <span className={`inline-block h-2 w-2 rounded-full ${isEntree ? "bg-emerald-500" : "bg-red-500"}`} />
          {typeInfo.label}
        </span>
      </td>
      <td className={`px-5 py-4 font-bold ${isEntree ? "text-emerald-600" : "text-red-500"}`}>
        {sign}{mvt.quantite}
      </td>
      <td className="px-5 py-4 text-gray-600">{mvt.motif ?? "—"}</td>
      <td className="px-5 py-4">
        <span className="inline-flex items-center gap-2 text-gray-600">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100">
            <User size={14} className="text-gray-400" />
          </span>
          {mvt.createdBy ?? "—"}
        </span>
      </td>
    </tr>
  );
}

/* ── Alertes ── */

function AlertesSection({ alertes }: { alertes: AlerteStockResponse[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      {alertes.length === 0 ? (
        <div className="px-5 py-16 text-center">
          <AlertTriangle size={40} className="mx-auto mb-4 text-gray-300" />
          <p className="text-sm font-medium text-gray-500">Aucune alerte de stock</p>
          <p className="mt-1 text-xs text-gray-400">Tous les articles sont au-dessus du seuil minimum.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-5 py-3 font-bold">Code</th>
                <th className="px-5 py-3 font-bold">Désignation</th>
                <th className="px-5 py-3 text-right font-bold">Stock actuel</th>
                <th className="px-5 py-3 text-right font-bold">Seuil minimum</th>
                <th className="px-5 py-3 text-right font-bold">Écart</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {alertes.map((a) => (
                <tr key={a.articleId} className="hover:bg-red-50/30 transition-colors">
                  <td className="px-5 py-4 font-mono text-xs font-semibold text-gray-500">{a.code}</td>
                  <td className="px-5 py-4 font-semibold text-gray-900">{a.designation}</td>
                  <td className="px-5 py-4 text-right font-bold text-red-500">{a.quantiteStock}</td>
                  <td className="px-5 py-4 text-right text-gray-600">{a.seuilMinimum}</td>
                  <td className="px-5 py-4 text-right">
                    <span className="inline-block rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-600">
                      -{a.seuilMinimum - a.quantiteStock}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ── Modal Entrée de stock ── */

function EntreeStockModal({
  articles,
  onClose,
}: {
  articles: unknown[];
  onClose: () => void;
}) {
  const [articleId, setArticleId] = useState("");
  const [quantite, setQuantite] = useState("");
  const [sourceMvt, setSourceMvt] = useState<SourceMvtStk>("COMMANDE_FOURNISSEUR");
  const mutations = useStockMutations();

  const handleSubmit = () => {
    if (!articleId || !quantite) return;
    mutations.createEntree.mutate(
      { articleId: Number(articleId), quantite: Number(quantite), sourceMvt },
      { onSuccess: onClose },
    );
  };

  return (
    <Modal title="Entrée de stock" onClose={onClose}>
      <SelectField label="Article" value={articleId} onChange={setArticleId} options={articles} />
      <NumberField label="Quantité" value={quantite} onChange={setQuantite} placeholder="0" />
      <SelectField
        label="Source"
        value={sourceMvt}
        onChange={(v) => setSourceMvt(v as SourceMvtStk)}
        options={SOURCE_OPTIONS}
      />
      <ModalFooter
        onClose={onClose}
        onSubmit={handleSubmit}
        isPending={mutations.createEntree.isPending}
        label="Enregistrer l'entrée"
        color="emerald"
      />
    </Modal>
  );
}

/* ── Modal Sortie de stock ── */

function SortieStockModal({
  articles,
  onClose,
}: {
  articles: unknown[];
  onClose: () => void;
}) {
  const [articleId, setArticleId] = useState("");
  const [quantite, setQuantite] = useState("");
  const [sourceMvt, setSourceMvt] = useState<SourceMvtStk>("VENTE");
  const mutations = useStockMutations();

  const handleSubmit = () => {
    if (!articleId || !quantite) return;
    mutations.createSortie.mutate(
      { articleId: Number(articleId), quantite: Number(quantite), sourceMvt },
      { onSuccess: onClose },
    );
  };

  return (
    <Modal title="Sortie de stock" onClose={onClose}>
      <SelectField label="Article" value={articleId} onChange={setArticleId} options={articles} />
      <NumberField label="Quantité" value={quantite} onChange={setQuantite} placeholder="0" />
      <SelectField
        label="Source"
        value={sourceMvt}
        onChange={(v) => setSourceMvt(v as SourceMvtStk)}
        options={SOURCE_OPTIONS}
      />
      <ModalFooter
        onClose={onClose}
        onSubmit={handleSubmit}
        isPending={mutations.createSortie.isPending}
        label="Enregistrer la sortie"
        color="red"
      />
    </Modal>
  );
}

/* ── Modal Correction ── */

function CorrectionStockModal({
  articles,
  onClose,
}: {
  articles: unknown[];
  onClose: () => void;
}) {
  const [articleId, setArticleId] = useState("");
  const [quantite, setQuantite] = useState("");
  const [motif, setMotif] = useState("");
  const [correctionType, setCorrectionType] = useState<"positive" | "negative">("positive");
  const mutations = useStockMutations();

  const handleSubmit = () => {
    if (!articleId || !quantite || !motif) return;
    const mutation =
      correctionType === "positive"
        ? mutations.createCorrectionPositive
        : mutations.createCorrectionNegative;
    mutation.mutate(
      { articleId: Number(articleId), quantite: Number(quantite), motif },
      { onSuccess: onClose },
    );
  };

  const isPending =
    correctionType === "positive"
      ? mutations.createCorrectionPositive.isPending
      : mutations.createCorrectionNegative.isPending;

  return (
    <Modal title="Correction de stock" onClose={onClose}>
      <SelectField label="Article" value={articleId} onChange={setArticleId} options={articles} />
      <NumberField label="Quantité" value={quantite} onChange={setQuantite} placeholder="0" />

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Type de correction</label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setCorrectionType("positive")}
            className={`flex-1 rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors ${
              correctionType === "positive"
                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            + Positive
          </button>
          <button
            type="button"
            onClick={() => setCorrectionType("negative")}
            className={`flex-1 rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors ${
              correctionType === "negative"
                ? "border-red-300 bg-red-50 text-red-700"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            − Négative
          </button>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Motif</label>
        <input
          type="text"
          value={motif}
          onChange={(e) => setMotif(e.target.value)}
          placeholder="Ex: Inventaire, Casse, Réclamation..."
          className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none"
        />
      </div>

      <ModalFooter
        onClose={onClose}
        onSubmit={handleSubmit}
        isPending={isPending}
        label="Enregistrer la correction"
        color="amber"
      />
    </Modal>
  );
}

/* ── Composants réutilisables ── */

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-950">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>
        <div className="space-y-4 px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { id?: number; designation?: string; value?: string; label?: string }[] | unknown[];
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-lg border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:bg-white focus:outline-none"
      >
        <option value="">-- Choisir --</option>
        {(options as { id?: number; designation?: string; value?: string; label?: string }[]).map((opt) => (
          <option key={opt.id ?? opt.value} value={String(opt.id ?? opt.value)}>
            {opt.designation ?? opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">{label}</label>
      <input
        type="number"
        min={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none"
      />
    </div>
  );
}

function ModalFooter({
  onClose,
  onSubmit,
  isPending,
  label,
  color,
}: {
  onClose: () => void;
  onSubmit: () => void;
  isPending: boolean;
  label: string;
  color: "emerald" | "red" | "amber";
}) {
  const colorClasses = {
    emerald: "bg-emerald-600 hover:bg-emerald-700",
    red: "bg-red-500 hover:bg-red-600",
    amber: "bg-amber-500 hover:bg-amber-600",
  };

  return (
    <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
      <button
        type="button"
        onClick={onClose}
        className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        Annuler
      </button>
      <button
        type="button"
        onClick={onSubmit}
        disabled={isPending}
        className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-50 ${colorClasses[color]}`}
      >
        {isPending ? "Enregistrement..." : label}
      </button>
    </div>
  );
}
