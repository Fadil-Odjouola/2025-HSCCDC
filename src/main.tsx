import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import "./index.css";
import Navbar from "./components/navbar";
import Signup from "./views/auth/signup/singup";
import Buffet from "@/views/buffet/buffet";
import Mail from "./views/mail/indexMail";
import { SearchProvider } from "@/context/SearchContext";
import Dashboard from "./views/dashboard/indexDashboard";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Buffet />,
  },
  {
    path: "/mail",
    element: <Mail />,
  },
  {
    path: "/register",
    element: <Signup />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  }
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SearchProvider>
      <Navbar />
      <RouterProvider router={router} />
    </SearchProvider>
  </StrictMode>
);
