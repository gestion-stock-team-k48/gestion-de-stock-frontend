import { Navigate } from "react-router-dom";
import App from "../../App";
import { useAuthStore } from "../../core/store/authStore";

export function RootRedirect() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <App />;
}
