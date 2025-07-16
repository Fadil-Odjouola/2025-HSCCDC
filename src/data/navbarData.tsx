import Buffet from "@/views/buffet";
import QA from "@/views/qa";
import Auth from "@/views/auth";
import Mail from "@/views/mail";
import Dashboard from "@/views/dashboard";
import Signup from "@/views/auth/signup/singup";
import Login from "@/views/auth/login/login";


const navbar_data = [
  {
    title: "buffet",
    path: "/",
    element: <Buffet />,
  },
  {
    title: "QA",
    path: "/QA",
    element: <QA/>,
    //loader: loadRootData,
  },
  {
    title: "Mail",
    path: "/Mail",
    element: <Mail/>,
    //loader: loadRootData,
  },
  {
    title: "Dashboard",
    path: "/Dashboard",
    element: <Dashboard/>,
    //loader: loadRootData,
  },
  {
    title: "Login",
    path: "/Login",
    element: <Login/>,
    //loader: loadRootData,
  },
    {
    title: "Sign Up",
    path: "/signup",
    element: <Signup/>,
    //loader: loadRootData,
  },
];

export default navbar_data;