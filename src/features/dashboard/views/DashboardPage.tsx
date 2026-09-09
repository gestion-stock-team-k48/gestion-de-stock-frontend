import { useMemo } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  BarChart3,
  CalendarDays,
  Package,
  ReceiptText,
  ShoppingCart,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../../core/store/authStore";
import { useDashboard } from "../hooks";

type StatTone = "blue" | "green" | "amber" | "slate";

const toneClasses: Record<StatTone, string> = {
  blue: "bg-blue-50 text-[#0066FF]",
  green: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-500",
  slate: "bg-slate-50 text-slate-500",
};

const formatAmount = (amount: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XAF",
    minimumFractionDigits: 0,
  }).format(amount);

const formatDate = () =>
  new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());

export default function DashboardPage() {
  const { t } = useTranslation();
  const prenomAdmin = useAuthStore((s) => s.prenomAdmin);

  const { stats, isLoading, isError } = useDashboard();

  const orderStats = useMemo(
    () => [
      {
        label: "Commandes clients en cours",
        value: stats?.commandesClientEnCours ?? 0,
        icon: ReceiptText,
        tone: "blue" as StatTone,
      },
      {
        label: "Commandes clients livrées",
        value: stats?.commandesClientLivrees ?? 0,
        icon: ArrowDown,
        tone: "green" as StatTone,
      },
      {
        label: "Commandes fournisseurs en cours",
        value: stats?.commandesFournisseurEnCours ?? 0,
        icon: ShoppingCart,
        tone: "amber" as StatTone,
      },
      {
        label: "Commandes fournisseurs livrées",
        value: stats?.commandesFournisseurLivrees ?? 0,
        icon: ArrowUp,
        tone: "slate" as StatTone,
      },
    ],
    [stats],
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-950 sm:text-3xl">
            {t("dashboard.greeting", { name: prenomAdmin ?? "" })}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {t("dashboard.todaySummary")}
          </p>
        </div>

        <div className="inline-flex h-10 w-fit items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-500">
          <CalendarDays size={15} />
          {formatDate()}
        </div>
      </div>

      {isError && (
        <div className="mt-6 rounded-xl border border-red-100 bg-white px-5 py-4 text-sm font-semibold text-red-600 shadow-sm">
          Impossible de charger les statistiques du tableau de bord.
        </div>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={BarChart3}
          label="Chiffre d'affaires total"
          value={
            isLoading
              ? "..."
              : formatAmount(stats?.chiffreAffairesTotal ?? 0)
          }
          tone="blue"
        />
        <StatCard
          icon={Package}
          label="Chiffre d'affaires du mois"
          value={
            isLoading
              ? "..."
              : formatAmount(stats?.chiffreAffairesMoisCourant ?? 0)
          }
          tone="green"
        />
        <StatCard
          icon={ReceiptText}
          label="Commandes clients en cours"
          value={
            isLoading
              ? "..."
              : String(stats?.commandesClientEnCours ?? 0)
          }
          tone="amber"
          hasArrow
        />
        <StatCard
          icon={ShoppingCart}
          label="Commandes fournisseurs en cours"
          value={
            isLoading
              ? "..."
              : String(stats?.commandesFournisseurEnCours ?? 0)
          }
          tone="slate"
          hasArrow
        />
      </div>

      <section className="mt-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-950">
              Performance commerciale
            </h2>
            <p className="text-sm text-gray-500">
              Données issues de l'endpoint dashboard
            </p>
          </div>
          <div className="w-fit rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
            Total :{" "}
            <span className="font-bold text-gray-950">
              {formatAmount(stats?.chiffreAffairesTotal ?? 0)}
            </span>
          </div>
        </div>

        <div className="grid gap-4 p-5 md:grid-cols-2">
          <RevenuePanel
            label="Mois courant"
            value={stats?.chiffreAffairesMoisCourant ?? 0}
            maxValue={Math.max(stats?.chiffreAffairesTotal ?? 0, 1)}
            tone="green"
          />
          <RevenuePanel
            label="Total enregistré"
            value={stats?.chiffreAffairesTotal ?? 0}
            maxValue={Math.max(stats?.chiffreAffairesTotal ?? 0, 1)}
            tone="blue"
          />
        </div>
      </section>

      <div className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div>
              <h2 className="text-base font-bold text-gray-950">
                Top articles vendus
              </h2>
              <p className="text-sm text-gray-500">
                Classement des articles par quantité vendue
              </p>
            </div>
            <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-semibold text-[#0066FF]">
              {stats?.topArticlesVendus?.length ?? 0}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-5 py-3 font-bold">Article</th>
                  <th className="px-5 py-3 text-right font-bold">
                    Quantité vendue
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(stats?.topArticlesVendus ?? []).map((article) => (
                  <tr key={article.articleId}>
                    <td className="px-5 py-4 font-semibold text-gray-900">
                      {article.designation}
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-emerald-600">
                      {article.quantiteVendue}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!isLoading &&
              (stats?.topArticlesVendus?.length ?? 0) === 0 && (
                <div className="px-5 py-12 text-center text-sm text-gray-500">
                  Aucun article vendu pour le moment.
                </div>
              )}
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-5 py-4">
            <h2 className="text-base font-bold text-gray-950">
              Suivi des commandes
            </h2>
            <p className="text-sm text-gray-500">
              États remontés par le backend
            </p>
          </div>

          <div className="divide-y divide-gray-100 px-5">
            {orderStats.map(({ label, value, icon: Icon, tone }) => (
              <div key={label} className="flex items-center gap-4 py-4">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${toneClasses[tone]}`}
                >
                  <Icon size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-gray-900">
                    {label}
                  </p>
                  <p className="text-xs text-gray-500">Statistique globale</p>
                </div>
                <span className="text-sm font-bold text-gray-950">
                  {isLoading ? "..." : value}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

type StatCardProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  tone: StatTone;
  hasArrow?: boolean;
};

function StatCard({ icon: Icon, label, value, tone, hasArrow }: StatCardProps) {
  return (
    <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneClasses[tone]}`}
        >
          <Icon size={18} />
        </div>
        {hasArrow && <ArrowRight size={18} className="mt-2 text-gray-400" />}
      </div>
      <p className="mt-5 break-words text-3xl font-bold tracking-tight text-gray-950">
        {value}
      </p>
      <p className="mt-1 text-sm font-medium text-gray-600">{label}</p>
    </article>
  );
}

type RevenuePanelProps = {
  label: string;
  value: number;
  maxValue: number;
  tone: "blue" | "green";
};

function RevenuePanel({ label, value, maxValue, tone }: RevenuePanelProps) {
  const percentage = Math.min(100, Math.round((value / maxValue) * 100));
  const barColor = tone === "green" ? "bg-emerald-500" : "bg-[#0B86E8]";

  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-semibold text-gray-600">{label}</span>
        <span className="text-sm font-bold text-gray-950">
          {formatAmount(value)}
        </span>
      </div>
      <div className="mt-4 h-3 overflow-hidden rounded-full bg-white">
        <div
          className={`h-full rounded-full ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-gray-500">{percentage}% du total</p>
    </div>
  );
}
