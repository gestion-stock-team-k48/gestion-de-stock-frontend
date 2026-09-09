import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const THEME_STORAGE_KEY = "gestion-stock-theme";

export function ThemeToggle({ variant = "header" }: { variant?: "header" | "light" }) {
  const { t } = useTranslation();
  const [isDark, setIsDark] = useState(() =>
    typeof window !== "undefined" && localStorage.getItem(THEME_STORAGE_KEY) === "dark",
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    document.documentElement.style.colorScheme = isDark ? "dark" : "light";
    localStorage.setItem(THEME_STORAGE_KEY, isDark ? "dark" : "light");
  }, [isDark]);

  return (
    <button
      type="button"
      onClick={() => setIsDark((value) => !value)}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
        variant === "light"
          ? "border-gray-200 bg-white text-gray-600 hover:bg-gray-100"
          : "border-white/20 bg-white/10 text-white hover:bg-white/20"
      }`}
      aria-label={t("theme.toggle")}
      title={t(isDark ? "theme.light" : "theme.dark")}
      aria-pressed={isDark}
    >
      {isDark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}
