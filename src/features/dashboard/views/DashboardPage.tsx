import { Link } from "react-router-dom";
import {
  BarChart3,
  Bell,
  Boxes,
  Building2,
  ClipboardList,
  LogOut,
  PackageCheck,
  ShoppingCart,
  Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../../core/store/authStore";
import { LanguageSwitcher } from "../../../components/ui";

const dashboardModules = [
  {
    key: "articles",
    icon: Boxes,
  },
  {
    key: "stock",
    icon: PackageCheck,
  },
  {
    key: "sales",
    icon: ShoppingCart,
  },
  {
    key: "orders",
    icon: ClipboardList,
  },
  {
    key: "partners",
    icon: Users,
  },
  {
    key: "reports",
    icon: BarChart3,
  },
];

export default function DashboardPage() {
  const { t } = useTranslation();
  const logout = useAuthStore((s) => s.logout);

  return (
    <main className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0052CC] text-white">
              <Building2 size={18} />
            </div>
            <div>
              <p className="text-sm font-bold leading-tight">
                {t("brand.name")}
              </p>
              <p className="text-xs text-gray-400">
                {t("dashboard.subtitle")}
              </p>
            </div>
          </div>

          <div className="flex w-full flex-wrap items-center justify-between gap-2 sm:w-auto sm:justify-end">
            <LanguageSwitcher />
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:border-[#0066FF] hover:text-[#0066FF]"
              aria-label={t("dashboard.notifications")}
            >
              <Bell size={16} />
            </button>
            <Link
              to="/login"
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-600 transition-colors hover:border-red-200 hover:text-red-500"
            >
              <LogOut size={16} />
              {t("buttons.logout")}
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="rounded-2xl bg-[#0052CC] p-6 text-white sm:p-8">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider opacity-75">
            {t("dashboard.privateSpace")}
          </p>
          <h1 className="max-w-3xl text-3xl font-bold leading-tight sm:text-4xl">
            {t("dashboard.welcome")}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 opacity-80">
            {t("dashboard.description")}
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-gray-100 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
              {t("dashboard.stats.articles")}
            </p>
            <p className="mt-3 text-3xl font-bold text-gray-950">--</p>
            <p className="mt-1 text-sm text-gray-500">
              {t("dashboard.stats.articlesDescription")}
            </p>
          </div>
          <div className="rounded-lg border border-gray-100 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
              {t("dashboard.stats.orders")}
            </p>
            <p className="mt-3 text-3xl font-bold text-gray-950">--</p>
            <p className="mt-1 text-sm text-gray-500">
              {t("dashboard.stats.ordersDescription")}
            </p>
          </div>
          <div className="rounded-lg border border-gray-100 bg-white p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
              {t("dashboard.stats.sales")}
            </p>
            <p className="mt-3 text-3xl font-bold text-gray-950">--</p>
            <p className="mt-1 text-sm text-gray-500">
              {t("dashboard.stats.salesDescription")}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dashboardModules.map(({ key, icon: Icon }) => (
            <article
              key={key}
              className="rounded-lg border border-gray-100 bg-white p-5"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-[#0066FF]">
                <Icon size={18} />
              </div>
              <h2 className="text-sm font-bold text-gray-900">
                {t(`dashboard.modules.${key}.title`)}
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                {t(`dashboard.modules.${key}.description`)}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
