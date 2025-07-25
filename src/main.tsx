import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./index.css";
import Navbar from "./components/navbar";
import Signup from "./views/auth/signup/singup";
import Buffet from "@/views/buffet/buffet";
import Mail from "./views/mail/indexMail";
import { SearchProvider } from "@/context/SearchContext";
import Dashboard from "./views/dashboard/indexDashboard";
//import QuestionPage from "@/views/questions/QuestionPage"; // <-- make sure this exists
import QA from "./views/qa/QAindex";

createRoot(document.getElementById("root")!).render(
 // <StrictMode>
    <SearchProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Buffet />} />
          <Route path="/mail" element={<Mail />} />
          <Route path="/register" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/question/:questionid" element={<QA />} />
        </Routes>
      </BrowserRouter>
    </SearchProvider>
//  </StrictMode>
);
