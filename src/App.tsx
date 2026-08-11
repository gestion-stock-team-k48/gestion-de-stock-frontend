import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Boxes,
  ClipboardList,
  PackageCheck,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { PublicNavbar } from "./components/layout/PublicNavbar";

const modules = [
  {
    key: "articles",
    icon: Boxes,
  },
  {
    key: "stock",
    icon: PackageCheck,
  },
  {
    key: "partners",
    icon: Users,
  },
  {
    key: "orders",
    icon: ClipboardList,
  },
];

function App() {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen bg-white text-gray-900 font-sans">
      <PublicNavbar />

      <section className="grid w-full gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)] lg:items-center lg:gap-14 lg:px-10 lg:py-20 xl:px-16 2xl:px-24">
        <div className="max-w-3xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#0066FF]">
            {t("home.eyebrow")}
          </p>
          <h1 className="max-w-4xl text-4xl font-bold leading-tight text-gray-950 sm:text-5xl lg:text-6xl">
            {t("home.title")}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-gray-500 lg:text-lg">
            {t("home.description")}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0066FF] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0052CC]"
            >
              {t("buttons.registerAccount")}
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition-colors hover:border-[#0066FF] hover:text-[#0066FF]"
            >
              {t("buttons.login")}
            </Link>
          </div>
        </div>

        <div className="w-full justify-self-center rounded-2xl border border-gray-100 bg-gray-50 p-4 shadow-sm sm:p-5 lg:max-w-2xl lg:justify-self-end">
          <div className="rounded-xl bg-[#0052CC] p-5 text-white sm:p-6 lg:p-8">
            <div className="mb-8 flex items-center justify-between">
              <span className="text-sm font-semibold">
                {t("home.preview.title")}
              </span>
              <ShieldCheck size={20} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-white/15 p-4">
                <p className="text-xs opacity-70">
                  {t("home.preview.articles")}
                </p>
                <p className="mt-2 text-3xl font-bold">1 248</p>
              </div>
              <div className="rounded-xl bg-white/15 p-4">
                <p className="text-xs opacity-70">
                  {t("home.preview.orders")}
                </p>
                <p className="mt-2 text-3xl font-bold">86</p>
              </div>
              <div className="rounded-xl bg-white/15 p-4 sm:col-span-2">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs opacity-70">
                    {t("home.preview.activity")}
                  </p>
                  <BarChart3 size={16} />
                </div>
                <div className="flex h-24 items-end gap-2 sm:h-28">
                  {[45, 70, 52, 82, 64, 92, 76].map((height) => (
                    <span
                      key={height}
                      className="flex-1 rounded-t bg-white/70"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-gray-100 bg-gray-50/70">
        <div className="w-full px-4 py-12 sm:px-6 lg:px-10 xl:px-16 2xl:px-24">
          <div className="mb-8 max-w-3xl">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#0066FF]">
              {t("home.modules.eyebrow")}
            </p>
            <h2 className="text-2xl font-bold text-gray-950">
              {t("home.modules.title")}
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {modules.map(({ key, icon: Icon }) => (
              <article
                key={key}
                className="rounded-lg border border-gray-100 bg-white p-5"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-[#0066FF]">
                  <Icon size={18} />
                </div>
                <h3 className="text-sm font-bold text-gray-900">
                  {t(`home.modules.${key}.title`)}
                </h3>
                <p className="mt-2 text-sm leading-6 text-gray-500">
                  {t(`home.modules.${key}.description`)}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
