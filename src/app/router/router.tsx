import { createBrowserRouter } from "react-router-dom";
import App from "../../App";
import LoginPage from "../../features/auth/views/LoginPage";
import RegisterPage from "../../features/auth/views/RegisterPage";

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
]);
