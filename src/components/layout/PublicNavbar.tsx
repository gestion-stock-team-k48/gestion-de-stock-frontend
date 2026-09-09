import { Building2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { LanguageSwitcher, ThemeToggle } from "../ui";

export function PublicNavbar() {
  const { t } = useTranslation();

  return (
    <header className="border-b border-gray-100 bg-white">
      <div className="flex w-full flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10 xl:px-16">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0052CC] text-white">
            <Building2 size={18} />
          </span>
          <span>
            <span className="block text-sm font-bold leading-tight">
              {t("brand.name")}
            </span>
            <span className="block text-xs text-gray-400">
              {t("brand.tagline")}
            </span>
          </span>
        </Link>

        <nav className="flex w-full flex-wrap items-center justify-between gap-3 sm:w-auto sm:justify-end">
          <div className="shrink-0">
            <LanguageSwitcher />
          </div>
          <ThemeToggle variant="light" />
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Link
              to="/login"
              className="rounded-lg px-3 py-2 text-sm font-semibold text-gray-600 transition-colors hover:text-[#0066FF] sm:px-4"
            >
              {t("navigation.login")}
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-[#0066FF] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0052CC] sm:px-4"
            >
              {t("navigation.register")}
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
