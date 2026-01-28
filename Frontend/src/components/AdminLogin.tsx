import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, Gem, AlertCircle, ArrowRight } from "lucide-react";
import { adminLogin } from "../api/api";
import icon from "../assets/icon.png";
import "../styles/auth.css";

interface AdminLoginProps {
  onLogin: () => void;
  onForgotPassword: () => void;
}

export function AdminLogin({ onLogin, onForgotPassword }: AdminLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await adminLogin({ email, password });
      sessionStorage.setItem("adminToken", res.data.access_token);
      onLogin();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      {/* Top Header for Login Page */}
      <header className="pj-header-container">
        <div className="pj-brand">
          <div className="pj-logo-wrapper">
            <img src={icon} alt="Jewellers Paradise" className="pj-logo-icon" />
          </div>
          <span className="pj-brand-name">JEWELLERS PARADISE</span>
        </div>

        <nav className="pj-nav-menu">
          <button className="pj-nav-link active">HOME</button>
          <button className="pj-nav-link">OFFERS</button>
        </nav>

        <div style={{ width: '120px' }}></div>
      </header>

      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title" style={{ fontSize: '32px' }}>Admin Login</h1>
            <p className="auth-subtitle">Welcome back! Please enter your details.</p>
          </div>
          {/* Error Alert */}
          {error && (
            <div className="auth-alert">
              <AlertCircle size={20} color="#ef4444" />
              <p className="auth-alert-text">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-wrapper">
                <Mail size={20} className="input-icon" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@projectj.com"
                  required
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <Lock size={20} className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="form-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="auth-button">
              {isLoading ? "Signing in..." : "Sign In"}
              {!isLoading && <ArrowRight size={20} />}
            </button>

            <div className="auth-link">
              <button type="button" onClick={onForgotPassword}>
                Forgot your password?
              </button>
            </div>
          </form>


        </div>

        {/* Footer */}
        <div className="auth-footer">
          <p className="footer-text">© 2026 JEWELLERS PARADISE. ALL RIGHTS RESERVED.</p>
        </div>
      </div>
    </div>
  );
}
