import Buffet from "@/views/buffet";
import QA from "@/views/qa";
import Mail from "@/views/mail";
import Dashboard from "@/views/dashboard";
import Signup from "@/views/auth/signup/singup";
import Login from "@/views/auth/login/login";


const navbar_data = [
  {
    title: "buffet",
    path: "/",
    element: <Buffet />,
    active: false
  },
  {
    title: "QA",
    path: "/QA",
    element: <QA/>,
    //loader: loadRootData,
    active: false,
  },
  {
    title: "Mail",
    path: "/Mail",
    element: <Mail/>,
    //loader: loadRootData,
    active: false,

  },
  {
    title: "Dashboard",
    path: "/Dashboard",
    element: <Dashboard/>,
    //loader: loadRootData,
    active: false,
  },

];

export default navbar_data;