import { useState } from "react";
import { AdminLogin } from "./components/AdminLogin";
import { AdminDashboard } from "./components/AdminDashboard";
import { Gem, ShieldCheck } from "lucide-react";
import "./styles/variables.css";
import "./styles/typography.css";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const token = localStorage.getItem("adminToken");
    return Boolean(token);
  });

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    setIsLoggedIn(false);
  };

  return (
    <div
      style={{ backgroundColor: "var(--bg-medium)" }}
      className="min-h-screen"
    >
      {/* Header */}
      <header
        style={{ backgroundColor: "var(--bg-primary)" }}
        className="bg-white border-b border-gray-200 shadow-md"
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3">
                <Gem
                  style={{
                    color: "var(--color-gold-primary)",
                  }}
                  className="w-12 h-12 text-black"
                />
              </div>
              <div>
                <h1 className="text-gray-900">PROJECT J</h1>
                <p className="text-sm text-gray-600">Admin Control Panel</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Admin Badge */}
              <div
                style={{ background: "var(--color-plum-light)" }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border"
              >
                <ShieldCheck
                  style={{ color: "var(--color-white)" }}
                  className="w-5 h-5"
                />
                <span
                  style={{
                    color: "var(--color-white)",
                  }}
                >
                  Admin Panel
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ backgroundColor: "var(--bg-secondary)" }}>
        {isLoggedIn ? (
          <AdminDashboard onLogout={handleLogout} />
        ) : (
          <div className="container mx-auto px-4 py-8">
            <AdminLogin onLogin={handleLogin} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer
        style={{ backgroundColor: "var(--bg-medium)" }}
        className="bg-white border-t border-gray-200 mt-16"
      >
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-600">
            <p>© 2024 PROJECT J Admin Panel. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
