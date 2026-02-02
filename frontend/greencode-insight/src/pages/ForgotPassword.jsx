import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import FormError from "../components/FormError";
import SuccessModal from "../components/SuccessModal";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!successOpen) return;

    const timer = setTimeout(() => {
      navigate("/verify-otp", { state: { email } });
    }, 2000);

    return () => clearTimeout(timer);
  }, [successOpen, navigate, email]);

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setErrorMessage("");

    try {
      await api.post("/auth/forgot-password", { email });
      setSuccessOpen(true);
    } catch (err) {
      setErrorMessage(err.response?.data?.detail);
    } finally {
      setLoading(false);
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

        <h1>Reset Password</h1>
        <p className="auth-subtitle">We’ll send you an OTP</p>

        <FormError message={errorMessage} />

        <form className="auth-form" onSubmit={submit}>
          <input
            type="email"
            placeholder="Email"
            required
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          <button className="btn primary" type="submit" disabled={loading}>
            Send OTP
          </button>
        </form>
      </div>

      <SuccessModal
        open={successOpen}
        title="OTP Sent"
        message="An OTP has been sent to your registered email."
        buttonText="Verify OTP"
        onClose={() => navigate("/verify-otp", { state: { email } })}
      />
    </div>
  );
}
