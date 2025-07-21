import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import "./index.css";
import Navbar from "./components/navbar";
import Signup from "./views/auth/signup/singup";
import Buffet from "@/views/buffet/buffet";
import Mail from "./views/mail/indexMail";


const router = createBrowserRouter([
  {
    path: '/',
    element: <Buffet/>
  },
  {
    path: "/mail",
    element: <Mail/>
  },
  {
    path: "/register",
    element: <Signup />,
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Navbar />
    <RouterProvider router={router} />
  </StrictMode>
);
