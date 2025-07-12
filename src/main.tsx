import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router";
import Buffet from "./views/buffet";
import Auth from "./views/auth";
import QA from "./views/qa";
import Mail from "./views/mail";
import Dashboard from "./views/dashboard";

let router = createBrowserRouter([
  {
    path: "/",
    element: <Buffet></Buffet>,
    //loader: loadRootData,
  },
  {
    path: "/Auth",
    element: <Auth></Auth>,
    //loader: loadRootData,
  },
  {
    path: "/QA",
    element: <QA></QA>,
    //loader: loadRootData,
  },
  {
    path: "/Mail",
    element: <Mail></Mail>,
    //loader: loadRootData,
  },
  {
    path: "/Dashboard",
    element: <Dashboard></Dashboard>,
    //loader: loadRootData,
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
