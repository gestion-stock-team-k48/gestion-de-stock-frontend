import { Link } from "react-router-dom";
import { useAuthStore } from "../core/store/authStore";

export default function NotFoundPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-8xl font-bold text-gray-200">404</h1>
        <p className="mt-4 text-xl font-semibold text-gray-700">Page introuvable</p>
        <p className="mt-2 text-gray-500">La page que vous recherchez n'existe pas ou a été déplacée.</p>
        <Link
          to={isAuthenticated ? "/dashboard" : "/"}
          className="mt-8 inline-block rounded-lg bg-[#0066FF] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0052CC]"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}
