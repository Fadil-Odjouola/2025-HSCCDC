import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router";
import navbar_data from "./data/navbarData";
import "./index.css"
import Navbar from "./components/navbar";
import Login from "./views/auth/login/login";
import Signup from "./views/auth/signup/singup";


const router = createBrowserRouter([
  ...navbar_data.map((item) => ({
    path: item.path,
    element: item.element,
  })),
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
        <Navbar/>
    <RouterProvider router={router} />
  </StrictMode>,
)
