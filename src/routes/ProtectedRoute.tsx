import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../core/store/authStore";
import type { Role } from "../core/types";

type ProtectedRouteProps = {
  children?: ReactNode;
  allowedRoles?: Role[];
};

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const location = useLocation();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const roles = useAuthStore((s) => s.roles);

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

  if (allowedRoles && !roles.some((role) => allowedRoles.includes(role))) {
    return <Navigate to="/dashboard" replace />;
  }

  return children ?? <Outlet />;
}

export default ProtectedRoute;
