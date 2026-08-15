import { createBrowserRouter } from "react-router-dom";
import App from "../../App";
import DashboardLayout from "../../components/layout/DashboardLayout";
import ArticlesPage from "../../features/articles/views/ArticlesPage";
import LoginPage from "../../features/auth/views/LoginPage";
import RegisterPage from "../../features/auth/views/RegisterPage";
import CategoriesPage from "../../features/categories/views/CategoriesPage";
import ClientsPage from "../../features/clients/views/ClientsPage";
import CommandesClientsPage from "../../features/commandes-clients/views/CommandesClientsPage";
import CommandesFournisseursPage from "../../features/commandes-fournisseurs/views/CommandesFournisseursPage";
import DashboardPage from "../../features/dashboard/views/DashboardPage";
import EntreprisePage from "../../features/entreprise/views/EntreprisePage";
import FournisseursPage from "../../features/fournisseurs/views/FournisseursPage";
import StockMouvementsPage from "../../features/stock-mouvements/views/StockMouvementsPage";
import VentesPage from "../../features/ventes/views/VentesPage";
import ProtectedRoute from "../../routes/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
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
        ],
      },
    ],
  },
]);
