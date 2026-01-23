import { useState, useEffect } from "react";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { mockAdmin } from "../data/mockData";
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

  // OTP timer
  useEffect(() => {
    if (timer > 0) {
      const i = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(i);
    }
  }, [timer]);

  const sendOtp = () => {
    if (email !== mockAdmin.email) {
      setError("Admin email not found");
      return;
    }

    console.log("Mock OTP:", mockAdmin.otp);
    setTimer(30);
    setStep("otp");
    setError("");
  };

  const verifyOtp = () => {
    if (otp !== mockAdmin.otp) {
      setError("Invalid OTP");
      return;
    }
    setStep("reset");
    setError("");
  };

  const resetPassword = () => {
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    console.log("Password reset success:", password);
    alert("Password reset successful");
    onBack();
  };

  return (
    <div className="max-w-md mx-auto">
      <div
        className="rounded-2xl shadow-xl p-8"
        style={{ backgroundColor: "var(--bg-tertiary)" }}
      >
        <h2 className="text-center mb-6">Forgot Password</h2>

        {error && (
          <p className="text-sm text-center mb-4" style={{ color: "var(--color-error)" }}>
            {error}
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
            />

            <button
              onClick={sendOtp}
              className="w-full py-3 rounded-lg"
              style={{ background: "var(--color-plum)", color: "#fff" }}
            >
              Send OTP
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
            />

            <button
              onClick={verifyOtp}
              className="w-full py-3 rounded-lg"
              style={{
                background:
                  "linear-gradient(to right, var(--color-plum), var(--color-plum-light))",
                color: "#fff",
              }}
            >
              Verify OTP
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
                />

                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="h-full px-4 flex items-center justify-center"
                  style={{ color: "var(--text-muted)" }}
                >
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>




            <button
              onClick={resetPassword}
              className="w-full py-3 rounded-lg"
              style={{
                background:
                  "linear-gradient(to right, var(--color-plum), var(--color-plum-light))",
                color: "#fff",
              }}
            >
              Reset Password
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
