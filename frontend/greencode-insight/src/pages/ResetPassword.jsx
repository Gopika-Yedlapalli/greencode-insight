import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import FormError from "../components/FormError";
import SuccessModal from "../components/SuccessModal";

export default function ResetPassword() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const email = state?.email;
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);

  const getPasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;

    if (score <= 1) return { label: "Weak", className: "weak" };
    if (score === 2) return { label: "Fair", className: "fair" };
    if (score === 3) return { label: "Good", className: "good" };
    return { label: "Strong", className: "strong" };
  };

  const passwordStrength = getPasswordStrength(password);

  useEffect(() => {
    if (!successOpen) return;

    const timer = setTimeout(() => {
      navigate("/login");
    }, 2000);

    return () => clearTimeout(timer);
  }, [successOpen, navigate]);

  const submit = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setErrorMessage("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    setErrorMessage("");

    try {
      await api.post("/auth/reset-password", {
        email,
        new_password: password,
        confirm_password: confirmPassword,
      });
      setSuccessOpen(true);
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || "Password reset failed");
    }
  };

  return (
    <div className="auth">
      <div className="auth-card">
        <button
          type="button"
          className="card-close"
          aria-label="Close"
          onClick={() => navigate("/login")}
        >
          ✕
        </button>

        <h1>Set New Password</h1>
        <p className="auth-subtitle">Choose a strong new password</p>

        <FormError message={errorMessage} />

        <form className="auth-form" onSubmit={submit} noValidate>
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrorMessage("");
            }}
          />

          {password && (
            <div className={`password-strength ${passwordStrength.className}`}>
              Password strength: <strong>{passwordStrength.label}</strong>
            </div>
          )}

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setErrorMessage("");
            }}
          />

          <button className="btn primary" type="submit">
            Reset Password
          </button>
        </form>
      </div>

      <SuccessModal
        open={successOpen}
        title="Password Updated"
        message="Your password has been reset successfully. Please log in with your new password."
        buttonText="Sign In"
        onClose={() => navigate("/login")}
      />
    </div>
  );
}
