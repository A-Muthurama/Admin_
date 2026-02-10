import { useState } from "react";
import { AdminLogin } from "./components/AdminLogin";
import { AdminDashboard } from "./components/AdminDashboard";
import { ForgotPassword } from "./components/ForgotPassword";

import { Toaster } from 'sonner';

import "./styles/variables.css";
import "./styles/typography.css";
import "./styles/premium-ui.css";

export default function App() {
  type View = "login" | "forgot" | "dashboard";
  const [view, setView] = useState<View>(() => {
    const token = sessionStorage.getItem("adminToken");
    return token ? "dashboard" : "login";
  });

  const handleLogin = () => {
    setView("dashboard");
  };

  const handleLogout = () => {
    sessionStorage.removeItem("adminToken");
    setView("login");
  };

  return (
    <div className="min-h-screen w-full flex flex-col">
      <Toaster position="top-right" expand={true} richColors />
      {view === "dashboard" ? (
        <AdminDashboard onLogout={handleLogout} />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-white p-4">
          {view === "login" && (
            <AdminLogin
              onLogin={handleLogin}
              onForgotPassword={() => setView("forgot")}
            />
          )}

          {view === "forgot" && (
            <ForgotPassword onBack={() => setView("login")} />
          )}
        </div>
      )}
    </div>
  );
}
