import { useState, useEffect } from "react";
import { Eye, EyeOff, ArrowLeft, Mail, Lock, ShieldAlert } from "lucide-react";
import {
  adminForgotPasswordRequest,
  adminForgotPasswordVerify,
  adminForgotPasswordReset,
} from "../api/api";
import { Footer } from "./Footer";
import icon from "../assets/icon.png";
import "../styles/auth.css";

interface ForgotPasswordProps {
  onBack: () => void;
}

export function ForgotPassword({ onBack }: ForgotPasswordProps) {
  type Step = "email" | "otp" | "reset";
  const [step, setStep] = useState<Step>("email");

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [timer, setTimer] = useState(0);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const [requesting, setRequesting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resetting, setResetting] = useState(false);

  const [resetToken, setResetToken] = useState<string | null>(null);

  // OTP timer
  useEffect(() => {
    if (timer > 0) {
      const i = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(i);
    }
  }, [timer]);

  const requestOtp = async () => {
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Please enter your email");
      return;
    }

    setRequesting(true);
    setError("");
    setInfo("");
    try {
      const res = await adminForgotPasswordRequest({ email: trimmed });
      setInfo(res.data.message);
      setTimer(res.data.cooldownSeconds ?? 30);
      setStep("otp");
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Failed to request OTP");
    } finally {
      setRequesting(false);
    }
  };

  const verifyOtp = async () => {
    const trimmedEmail = email.trim();
    const trimmedOtp = otp.trim();
    if (!trimmedOtp) {
      setError("Please enter the OTP");
      return;
    }

    setVerifying(true);
    setError("");
    setInfo("");
    try {
      const res = await adminForgotPasswordVerify({
        email: trimmedEmail,
        otp: trimmedOtp,
      });
      setResetToken(res.data.reset_token);
      setStep("reset");
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Invalid OTP");
    } finally {
      setVerifying(false);
    }
  };

  const resetPassword = async () => {
    if (!resetToken) {
      setError("Missing reset token. Please verify OTP again.");
      setStep("otp");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setResetting(true);
    setError("");
    setInfo("");
    try {
      const res = await adminForgotPasswordReset({
        reset_token: resetToken,
        password,
      });
      alert(res.data.message ?? "Password reset successful");
      onBack();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Failed to reset password");
    } finally {
      setResetting(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div className="auth-page-wrapper">
      {/* Top Header for Forgot Password Page */}
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
          {/* Internal Header Small */}
          <div className="auth-header" style={{ marginBottom: '32px' }}>
            <h2 className="auth-title" style={{ fontSize: '30px' }}>Security Recovery</h2>
            <p className="auth-subtitle">
              {step === 'email' && "Identify your portal access email"}
              {step === 'otp' && "Verification code sent to email"}
              {step === 'reset' && "Create a new secure secret"}
            </p>
          </div>

          {error && (
            <div className="auth-alert" style={{ color: 'var(--color-error)', background: '#fffafa', padding: '15px', borderRadius: '12px', marginBottom: '20px', fontSize: '14px', border: '1px solid #fee2e2', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldAlert size={18} />
              <span>{error}</span>
            </div>
          )}

          {info && (
            <div className="auth-alert" style={{ color: 'var(--color-plum)', background: '#f8f8ff', padding: '15px', borderRadius: '12px', marginBottom: '20px', fontSize: '14px', border: '1px solid #e2e2ff', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Mail size={18} />
              <span>{info}</span>
            </div>
          )}

          {/* STEP 1: EMAIL */}
          {step === "email" && (
            <div className="auth-form">
              <div className="form-group">
                <label className="form-label">Administrator Email</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" size={18} />
                  <input
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input"
                    disabled={requesting}
                    required
                  />
                </div>
              </div>

              <button
                onClick={requestOtp}
                className="auth-button"
                disabled={requesting}
              >
                {requesting ? "Sending..." : "Request OTP"}
              </button>
            </div>
          )}

          {/* STEP 2: OTP */}
          {step === "otp" && (
            <div className="auth-form">
              <div className="form-group">
                <label className="form-label">Verification Code</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input
                    type="text"
                    placeholder="6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="form-input"
                    disabled={verifying}
                    required
                    style={{ textAlign: 'center', letterSpacing: '0.4em', fontWeight: 'bold' }}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400">
                  {timer > 0 ? `Resend in ${formatTimer(timer)}` : "Didn't receive code?"}
                </span>
                <button
                  type="button"
                  onClick={requestOtp}
                  disabled={timer > 0 || requesting}
                  className="text-[var(--color-plum)] font-bold hover:underline disabled:opacity-30"
                >
                  {requesting ? "Sending..." : "Resend"}
                </button>
              </div>

              <button
                onClick={verifyOtp}
                className="auth-button"
                disabled={verifying}
              >
                {verifying ? "Verifying..." : "Verify OTP"}
              </button>
            </div>
          )}

          {/* STEP 3: RESET */}
          {step === "reset" && (
            <div className="auth-form">
              <div className="form-group">
                <label className="form-label">New Password</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input
                    type={show ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input"
                    disabled={resetting}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="password-toggle"
                    disabled={resetting}
                  >
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                onClick={resetPassword}
                className="auth-button"
                disabled={resetting}
              >
                {resetting ? "Resetting..." : "Update Password"}
              </button>
            </div>
          )}

          {/* Back */}
          <div className="auth-footer-help">
            <button onClick={onBack}>
              <ArrowLeft size={14} /> Back to Login
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="auth-footer">
          <p className="footer-text">© 2026 JEWELLERS PARADISE. ALL RIGHTS RESERVED.</p>
        </div>
      </div>
    </div>
  );
}
