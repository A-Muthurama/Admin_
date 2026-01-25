import { useState, useEffect } from "react";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import {
  adminForgotPasswordRequest,
  adminForgotPasswordVerify,
  adminForgotPasswordReset,
} from "../api/api";
import "../styles/variables.css";

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
    <div className="max-w-md mx-auto">
      <div
        className="rounded-2xl shadow-xl p-8"
        style={{ backgroundColor: "var(--bg-tertiary)" }}
      >
        <h2 className="text-center mb-6">Forgot Password</h2>

        {error && (
          <p
            className="text-sm text-center mb-4"
            style={{ color: "var(--color-error)" }}
          >
            {error}
          </p>
        )}

        {info && (
          <p
            className="text-sm text-center mb-4"
            style={{ color: "var(--text-muted)" }}
          >
            {info}
          </p>
        )}

        {/* STEP 1: EMAIL */}
        {step === "email" && (
          <>
            <input
              type="email"
              placeholder="Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 mb-4 rounded-lg border bg-white"
              disabled={requesting}
            />

            <button
              onClick={requestOtp}
              className="w-full py-3 rounded-lg"
              style={{ background: "var(--color-plum)", color: "#fff" }}
              disabled={requesting}
            >
              {requesting ? "Sending..." : "Send OTP"}
            </button>
          </>
        )}

        {/* STEP 2: OTP */}
        {step === "otp" && (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-4 py-3 mb-4 rounded-lg border bg-white"
              disabled={verifying}
            />

            <div
              className="flex justify-between items-center mb-4 text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              <span>
                {timer > 0
                  ? `Resend available in ${formatTimer(timer)}`
                  : "You can resend the OTP"}
              </span>
              <button
                type="button"
                onClick={requestOtp}
                disabled={timer > 0 || requesting}
                className="underline"
              >
                {requesting ? "Resending..." : "Resend"}
              </button>
            </div>

            <button
              onClick={verifyOtp}
              className="w-full py-3 rounded-lg"
              style={{
                background:
                  "linear-gradient(to right, var(--color-plum), var(--color-plum-light))",
                color: "#fff",
              }}
              disabled={verifying}
            >
              {verifying ? "Verifying..." : "Verify OTP"}
            </button>
          </>
        )}

        {/* STEP 3: RESET */}
        {step === "reset" && (
          <>
            <div className="mb-4">
              <div className="flex items-center w-full h-12 rounded-lg border bg-white overflow-hidden">
                <input
                  type={show ? "text" : "password"}
                  placeholder="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 h-full px-4 outline-none border-none bg-transparent"
                  disabled={resetting}
                />

                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="h-full px-4 flex items-center justify-center"
                  style={{ color: "var(--text-muted)" }}
                  disabled={resetting}
                >
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
              Use at least 8 characters.
            </p>

            <button
              onClick={resetPassword}
              className="w-full py-3 rounded-lg"
              style={{
                background:
                  "linear-gradient(to right, var(--color-plum), var(--color-plum-light))",
                color: "#fff",
              }}
              disabled={resetting}
            >
              {resetting ? "Resetting..." : "Reset Password"}
            </button>
          </>
        )}

        {/* Back */}
        <button
          onClick={onBack}
          className="mt-6 w-full flex justify-center items-center gap-2 text-sm"
        >
          <ArrowLeft size={14} /> Back to Login
        </button>
      </div>
    </div>
  );
}
