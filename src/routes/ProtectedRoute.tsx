import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../core/store/authStore";

type ProtectedRouteProps = {
  children?: ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());

  if (!isAuthenticated) {
    const isOnRoot = location.pathname === "/";
    return (
      <Navigate
        to={isOnRoot ? "/login" : "/login"}
        replace
        state={{ from: isOnRoot ? { pathname: "/dashboard" } : location }}
      />
    );
  }

  return children ?? <Outlet />;
}

export default ProtectedRoute;
