import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router";
import navbar_data from "./data/navbarData";
import Buffet from "./views/buffet";
import Auth from "./views/auth";
import QA from "./views/qa";
import Mail from "./views/mail";
import Dashboard from "./views/dashboard";

let router = createBrowserRouter(navbar_data);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
