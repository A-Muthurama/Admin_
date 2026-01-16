// Import necessary libraries and styles
import { useState } from "react";
import { ShieldCheck, AlertCircle, Mail } from "lucide-react";
import "../styles/variables.css";

// Define the props for the AdminLogin component
interface AdminLoginProps {
  onLogin: () => void;
  onForgotPassword: () => void;
}

// Define the possible login steps
type LoginStep = "credentials" | "otp";

export function AdminLogin({ onLogin, onForgotPassword }: AdminLoginProps) {
  // State variables for managing login steps, credentials, OTP, and errors
  const [step, setStep] = useState<LoginStep>("credentials");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");

  // Handle submission of credentials
  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Demo admin credentials
    if (username === "admin" && password === "admin123") {
      // Generate OTP
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(newOtp);
      console.log("Generated OTP:", newOtp); // For demo purposes
      setStep("otp");
    } else {
      setError("Invalid username or password");
    }
  };

  // Handle changes in OTP input fields
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  // Handle backspace navigation in OTP fields
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  // Handle submission of OTP
  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const enteredOtp = otp.join("");

    if (enteredOtp === generatedOtp) {
      onLogin();
    } else {
      setError("Invalid OTP. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      const firstInput = document.getElementById("otp-0");
      firstInput?.focus();
    }
  };

  // Handle navigation back to credentials step
  const handleBackToCredentials = () => {
    setStep("credentials");
    setOtp(["", "", "", "", "", ""]);
    setError("");
  };

  return (
    <div
      className="max-w-md mx-auto"
      style={{ backgroundColor: "var(--bg-primary)", borderRadius: "1rem" }} // Added rounded corners
    >
      {/* Login Card */}
      <div
        className="rounded-2xl shadow-xl p-8"
        style={{
          backgroundColor: "var(--bg-tertiary)",
          boxShadow: "var(--card-shadow)",
          borderRadius: "1rem", // Ensure rounded corners
        }}
      >
        {/* Logo Section */}
        <div className="flex justify-center mb-6">
          <div
            className="p-4 rounded-full"
            style={{ background: "var(--color-plum-light)" }}
          >
            <ShieldCheck
              className="w-8 h-8"
              style={{ color: "var(--color-white)" }}
            />
          </div>
        </div>

        {/* Title and Description */}
        <h2
          className="text-center mb-2"
          style={{ color: "var(--text-secondary)" }}
        >
          Admin Login
        </h2>
        <p className="text-center mb-6" style={{ color: "var(--text-muted)" }}>
          {step === "credentials"
            ? "Secure access to admin dashboard"
            : "Enter the OTP sent to your device"}
        </p>

        {/* Error Message */}
        {error && (
          <div
            className="border rounded-lg p-3 mb-4 flex items-start gap-2"
            style={{
              backgroundColor: "var(--color-error)",
              borderColor: "var(--border-color)",
            }}
          >
            <AlertCircle
              className="w-5 h-5 flex-shrink-0 mt-0.5"
              style={{ color: "var(--color-white)" }}
            />
            <p className="text-sm" style={{ color: "var(--color-white)" }}>
              {error}
            </p>
          </div>
        )}

        {/* Credentials Form */}
        {step === "credentials" ? (
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <div>
              <label
                className="block text-sm mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
                className="w-full px-4 py-3 rounded-lg border bg-white"
                style={{
                  borderColor: "var(--border-color)",
                  transition: "var(--transition-smooth)",
                }}
              />
            </div>

            <div>
              <label
                className="block text-sm mb-2"
                style={{ color: "var(--text-primary)" }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={`\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022`}
                required
                className="w-full px-4 py-3 rounded-lg border bg-white"
                style={{
                  borderColor: "var(--border-color)",
                  transition: "var(--transition-smooth)",
                }}
              />
            </div>
            <div className="text-right">
            <button
              type="button"
              onClick={onForgotPassword}
              style={{
                color: "var(--color-plum)",
                fontSize: "0.875rem",
                textDecoration: "underline",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                      }}
                          >
                Forgot password?
              </button>
            </div>


            <button
              type="submit"
              className="w-full py-3 rounded-lg flex items-center justify-center gap-2"
              style={{
                background:
                  "linear-gradient(to right, var(--color-plum), var(--color-plum-light))",
                color: "var(--color-white)",
                transition: "var(--transition-smooth)",
              }}
            >
              <ShieldCheck className="w-5 h-5" />
              Continue to OTP
            </button>
          </form>
        ) : (
          // OTP Form
          <form onSubmit={handleOtpSubmit} className="space-y-6">
            <div className="flex justify-center mb-4">
              <Mail
                className="w-12 h-12"
                style={{ color: "var(--color-plum-light)" }}
              />
            </div>

            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className="w-12 h-12 text-center rounded-lg border-2 bg-white"
                  style={{
                    borderColor: "var(--border-color)",
                    transition: "var(--transition-smooth)",
                  }}
                  autoFocus={index === 0}
                />
              ))}
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg flex items-center justify-center gap-2"
              style={{
                background:
                  "linear-gradient(to right, var(--color-plum), var(--color-plum-light))",
                color: "var(--color-white)",
                transition: "var(--transition-smooth)",
              }}
            >
              <ShieldCheck className="w-5 h-5" />
              Verify & Login
            </button>

            <button
              type="button"
              onClick={handleBackToCredentials}
              className="w-full py-3 rounded-lg"
              style={{
                color: "var(--text-muted)",
                backgroundColor: "var(--bg-secondary)",
                transition: "var(--transition-smooth)",
              }}
            >
              Back to Login
            </button>
          </form>
        )}

        {/* Demo Credentials Section */}
        <div
          className="mt-6 p-4 rounded-lg"
          style={{ backgroundColor: "var(--bg-accent)" }}
        >
          <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>
            Demo Credentials:
          </p>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            Username: admin
          </p>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            Password: admin123
          </p>
          {step === "otp" && (
            <p
              className="text-xs mt-2"
              style={{ color: "var(--text-secondary)" }}
            >
              OTP: {generatedOtp} (Check console)
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
