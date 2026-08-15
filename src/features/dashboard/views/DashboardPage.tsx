import {
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CalendarDays,
  Package,
  ReceiptText,
  ShoppingBag,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const statCards = [
  {
    key: "stockArticles",
    value: "247",
    icon: ShoppingBag,
    tone: "blue",
  },
  {
    key: "lowStock",
    value: "3",
    icon: AlertTriangle,
    tone: "amber",
  },
  {
    key: "salesToday",
    value: "3 850,5 €",
    icon: Package,
    tone: "green",
  },
  {
    key: "pendingOrders",
    value: "8",
    icon: ReceiptText,
    tone: "slate",
  },
];

const salesBars = [
  { key: "jan", value: 12500, height: 66 },
  { key: "feb", value: 10800, height: 57 },
  { key: "mar", value: 14300, height: 75 },
  { key: "apr", value: 11600, height: 61 },
  { key: "may", value: 16000, height: 84 },
  { key: "jun", value: 13900, height: 73 },
  { key: "jul", value: 18500, height: 97 },
];

const alertRows = [
  {
    article: "Clavier USB filaire",
    category: "Informatique",
    stock: 8,
    min: 15,
  },
  {
    article: "Enveloppes kraft A4 x100",
    category: "Fournitures",
    stock: 3,
    min: 10,
  },
  {
    article: "Bureau cadre acier 140cm",
    category: "Mobilier",
    stock: 2,
    min: 4,
  },
];

const recentActivity = [
  {
    key: "paper",
    quantity: "+50",
    direction: "in",
  },
  {
    key: "ink",
    quantity: "-5",
    direction: "out",
  },
  {
    key: "cabinet",
    quantity: "+8",
    direction: "in",
  },
];

const toneClasses = {
  blue: "bg-blue-50 text-[#0066FF]",
  amber: "bg-amber-50 text-amber-500",
  green: "bg-emerald-50 text-emerald-600",
  slate: "bg-slate-50 text-slate-500",
};

export default function DashboardPage() {
  const { t } = useTranslation();

  return (
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-950 sm:text-3xl">
                {t("dashboard.greeting", { name: "Marie" })}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {t("dashboard.todaySummary")}
              </p>
            </div>

            <div className="inline-flex h-10 w-fit items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-500">
              <CalendarDays size={15} />
              {t("dashboard.currentDate")}
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map(({ key, value, icon: Icon, tone }) => (
              <article
                key={key}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      toneClasses[tone as keyof typeof toneClasses]
                    }`}
                  >
                    <Icon size={18} />
                  </div>
                  {(key === "lowStock" || key === "pendingOrders") && (
                    <ArrowRight size={18} className="mt-2 text-gray-400" />
                  )}
                </div>
                <p className="mt-5 text-3xl font-bold tracking-tight text-gray-950">
                  {value}
                </p>
                <p className="mt-1 text-sm font-medium text-gray-600">
                  {t(`dashboard.kpis.${key}`)}
                </p>
              </article>
            ))}
          </div>

          <section className="mt-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-bold text-gray-950">
                  {t("dashboard.salesEvolution.title")}
                </h2>
                <p className="text-sm text-gray-500">
                  {t("dashboard.salesEvolution.subtitle")}
                </p>
              </div>
              <div className="w-fit rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
                {t("dashboard.salesEvolution.total")} :{" "}
                <span className="font-bold text-gray-950">96 950 €</span>
              </div>
            </div>

            <div className="overflow-x-auto px-5 py-5">
              <div className="relative min-w-[680px]">
                <div className="absolute inset-x-10 top-0 bottom-8 flex flex-col justify-between">
                  {[20, 15, 10, 5, 0].map((value) => (
                    <div key={value} className="flex items-center gap-3">
                      <span className="w-10 text-xs text-gray-500">
                        {value}k €
                      </span>
                      <span className="h-px flex-1 bg-gray-100" />
                    </div>
                  ))}
                </div>

                <div className="relative z-10 ml-16 flex h-56 items-end gap-7 pr-4">
                  {salesBars.map(({ key, height }) => (
                    <div key={key} className="flex flex-1 flex-col items-center gap-2">
                      <div
                        className={`w-full min-w-16 rounded-t-lg ${
                          key === "jul" ? "bg-[#0B86E8]" : "bg-blue-300"
                        }`}
                        style={{ height: `${height}%` }}
                      />
                      <span className="text-xs text-gray-500">
                        {t(`dashboard.months.${key}`)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <div className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.95fr)]">
            <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                <div>
                  <h2 className="text-base font-bold text-gray-950">
                    {t("dashboard.alerts.title")}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {t("dashboard.alerts.subtitle")}
                  </p>
                </div>
                <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-600">
                  3
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                    <tr>
                      <th className="px-5 py-3 font-bold">
                        {t("dashboard.alerts.article")}
                      </th>
                      <th className="px-5 py-3 font-bold">
                        {t("dashboard.alerts.category")}
                      </th>
                      <th className="px-5 py-3 text-right font-bold">
                        {t("dashboard.alerts.stock")}
                      </th>
                      <th className="px-5 py-3 text-right font-bold">
                        {t("dashboard.alerts.min")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {alertRows.map((row) => (
                      <tr key={row.article}>
                        <td className="px-5 py-4 font-semibold text-gray-900">
                          {row.article}
                        </td>
                        <td className="px-5 py-4">
                          <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-gray-600">
                            {row.category}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right font-bold text-amber-600">
                          {row.stock}
                        </td>
                        <td className="px-5 py-4 text-right text-gray-500">
                          {row.min}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                <div>
                  <h2 className="text-base font-bold text-gray-950">
                    {t("dashboard.activity.title")}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {t("dashboard.activity.subtitle")}
                  </p>
                </div>
                <button className="text-sm font-semibold text-[#0066FF]">
                  {t("dashboard.activity.viewAll")}
                </button>
              </div>

              <div className="divide-y divide-gray-100 px-5">
                {recentActivity.map(({ key, quantity, direction }) => {
                  const isIn = direction === "in";
                  const Icon = isIn ? ArrowDown : ArrowUp;

                  return (
                    <div key={key} className="flex items-center gap-4 py-4">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                          isIn
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-blue-50 text-[#0066FF]"
                        }`}
                      >
                        <Icon size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-gray-900">
                          {t(`dashboard.activity.items.${key}.title`)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {t(`dashboard.activity.items.${key}.time`)}
                        </p>
                      </div>
                      <span
                        className={`text-sm font-bold ${
                          isIn ? "text-emerald-600" : "text-[#0066FF]"
                        }`}
                      >
                        {quantity}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </div>
  );
}
