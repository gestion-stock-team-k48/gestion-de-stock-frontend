import { createBrowserRouter } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import ArticlesPage from "../../features/articles/views/ArticlesPage";
import LoginPage from "../../features/auth/views/LoginPage";
import RegisterPage from "../../features/auth/views/RegisterPage";
import ForgotPasswordPage from "../../features/auth/views/ForgotPasswordPage";
import ResetPasswordPage from "../../features/auth/views/ResetPasswordPage";
import CategoriesPage from "../../features/categories/views/CategoriesPage";
import ClientsPage from "../../features/clients/views/ClientsPage";
import CommandesClientsPage from "../../features/commandes-clients/views/CommandesClientsPage";
import CommandesFournisseursPage from "../../features/commandes-fournisseurs/views/CommandesFournisseursPage";
import DashboardPage from "../../features/dashboard/views/DashboardPage";
import EntreprisePage from "../../features/entreprise/views/EntreprisePage";
import FournisseursPage from "../../features/fournisseurs/views/FournisseursPage";
import StockMouvementsPage from "../../features/stock-mouvements/views/StockMouvementsPage";
import VentesPage from "../../features/ventes/views/VentesPage";
import UtilisateursPage from "../../features/utilisateurs/views/UtilisateursPage";
import ProtectedRoute from "../../routes/ProtectedRoute";
import { RootRedirect } from "./RootRedirect";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootRedirect />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },

  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPasswordPage />,
  },
  {
    path: "/reset-password",
    element: <ResetPasswordPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            path: "/dashboard",
            element: <DashboardPage />,
          },
          {
            path: "/articles",
            element: <ArticlesPage />,
          },
          {
            path: "/categories",
            element: <CategoriesPage />,
          },
          {
            path: "/clients",
            element: <ClientsPage />,
          },
          {
            path: "/fournisseurs",
            element: <FournisseursPage />,
          },
          {
            path: "/commandes-clients",
            element: <CommandesClientsPage />,
          },
          {
            path: "/commandes-fournisseurs",
            element: <CommandesFournisseursPage />,
          },
          {
            path: "/ventes",
            element: <VentesPage />,
          },
          {
            path: "/stock-mouvements",
            element: <StockMouvementsPage />,
          },
          {
            path: "/entreprise",
            element: <EntreprisePage />,
          },
          {
            path: "/utilisateurs",
            element: <UtilisateursPage />,
          },
        ],
      },
    ],
  },
]);
