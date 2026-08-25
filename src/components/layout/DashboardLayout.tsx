import { NavLink, Outlet } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  LogOut,
  Menu,
  Moon,
  Package,
  ReceiptText,
  Search,
  ShoppingBag,
  ShoppingCart,
  Tag,
  Truck,
  Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "../../core/store/authStore";

const menuItems = [
  { key: "dashboard", path: "/dashboard", icon: BarChart3 },
  { key: "articles", path: "/articles", icon: ShoppingBag },
  { key: "categories", path: "/categories", icon: Tag },
  { key: "clients", path: "/clients", icon: Users },
  { key: "fournisseurs", path: "/fournisseurs", icon: Truck },
  { key: "commandesClients", path: "/commandes-clients", icon: ReceiptText },
  {
    key: "commandesFournisseurs",
    path: "/commandes-fournisseurs",
    icon: ShoppingCart,
  },
  { key: "ventes", path: "/ventes", icon: Package },
  { key: "stockMouvements", path: "/stock-mouvements", icon: ArrowRight },
  { key: "entreprise", path: "/entreprise", icon: Building2 },
];

export function DashboardLayout() {
  const { t } = useTranslation();
  const logout = useAuthStore((s) => s.logout);
  const nomEntreprise = useAuthStore((s) => s.nomEntreprise);
  const prenomAdmin = useAuthStore((s) => s.prenomAdmin);
  const nomAdmin = useAuthStore((s) => s.nomAdmin);

  const displayName = [prenomAdmin, nomAdmin].filter(Boolean).join(" ") || null;
  const initials = displayName
    ? displayName
        .split(" ")
        .map((part) => part.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : null;

  return (
    <main className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-gray-200 bg-white md:flex">
        <div className="flex h-[72px] items-center gap-3 px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0066FF] text-white">
            <BriefcaseBusiness size={18} />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight">{t("brand.name")}</p>
            <p className="text-xs text-gray-500">{nomEntreprise ?? t("dashboard.company")}</p>
          </div>
        </div>

        <div className="border-t border-gray-100 px-3 py-4">
          <label className="flex h-9 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm text-gray-400">
            <Search size={15} />
            <input
              type="search"
              className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
              placeholder={t("dashboard.searchPlaceholder")}
            />
          </label>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {menuItems.map(({ key, path, icon: Icon }) => (
            <NavLink
              key={key}
              to={path}
              className={({ isActive }) =>
                `flex h-10 w-full items-center justify-between rounded-lg px-3 text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-blue-50 text-[#0066FF]"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="flex items-center gap-3">
                    <Icon size={16} />
                    {t(`navigation.${key}`)}
                  </span>
                  {isActive && (
                    <span className="h-6 w-1 rounded-full bg-[#0066FF]" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <NavLink
          to="/login"
          onClick={logout}
          className="m-3 flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-gray-600 transition-colors hover:bg-red-50 hover:text-red-500"
        >
          <LogOut size={16} />
          {t("buttons.logout")}
        </NavLink>
      </aside>

      <section className="min-h-screen md:pl-60">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between bg-[#006FCB] px-4 text-white shadow-sm sm:px-6 lg:px-8">
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 md:hidden"
            aria-label={t("dashboard.menu")}
          >
            <Menu size={18} />
          </button>

          <div className="hidden min-w-0 items-center gap-2 overflow-x-auto md:flex">
            {menuItems.slice(0, 5).map(({ key, icon: Icon }) => (
              <span
                key={key}
                className="inline-flex shrink-0 items-center gap-2 rounded-lg px-2 py-1 text-xs font-medium text-white/70"
              >
                <Icon size={14} />
                {t(`navigation.${key}`)}
              </span>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-4">
            <Moon size={17} className="text-white/80" />
            <div className="h-5 w-px bg-white/20" />
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-xs font-bold">
                {initials ?? "--"}
              </span>
              <span className="hidden text-sm font-medium sm:inline">
                {displayName ?? t("dashboard.company")}
              </span>
            </div>
          </div>
        </header>

        <div className="border-b border-gray-200 bg-white px-4 py-3 md:hidden">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {menuItems.map(({ key, path, icon: Icon }) => (
              <NavLink
                key={key}
                to={path}
                className={({ isActive }) =>
                  `inline-flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold ${
                    isActive
                      ? "border-blue-100 bg-blue-50 text-[#0066FF]"
                      : "border-gray-200 bg-white text-gray-600"
                  }`
                }
              >
                <Icon size={14} />
                {t(`navigation.${key}`)}
              </NavLink>
            ))}
          </div>
        </div>

        <Outlet />
      </section>
    </main>
  );
}

export default DashboardLayout;
