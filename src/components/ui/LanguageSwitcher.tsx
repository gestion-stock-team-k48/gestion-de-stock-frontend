import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LANGUAGE_STORAGE_KEY } from "../../i18n/i18n";

const languages = [
  { code: "fr", label: "FR" },
  { code: "en", label: "EN" },
];

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const changeLanguage = (language: string) => {
    void i18n.changeLanguage(language);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  };

  return (
    <div
      className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1"
      aria-label={t("language.select")}
    >
      <Languages size={15} className="ml-2 text-gray-400" />
      {languages.map((language) => {
        const isActive = i18n.resolvedLanguage === language.code;

        return (
          <button
            key={language.code}
            type="button"
            className={`rounded-md px-2.5 py-1.5 text-xs font-bold transition-colors ${
              isActive
                ? "bg-[#0066FF] text-white"
                : "text-gray-500 hover:text-[#0066FF]"
            }`}
            onClick={() => changeLanguage(language.code)}
            aria-pressed={isActive}
          >
            {language.label}
          </button>
        );
      })}
    </div>
  );
}
