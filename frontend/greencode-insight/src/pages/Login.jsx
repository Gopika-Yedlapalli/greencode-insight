import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import FormError from "../components/FormError";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  const submit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) return;

    setErrorMessage("");
    setLoading(true);

    try {
      await api.post("/auth/login", { email, password });
      navigate("/");
    } catch (err) {
      setErrorMessage(
        err.response?.data?.detail || "Invalid email or password",
      );
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
          onClick={() => navigate("/")}
        >
          ✕
        </button>

        <h1>Sign In</h1>
        <p className="auth-subtitle">Access your account</p>

        <FormError message={errorMessage} />

        <form className="auth-form" onSubmit={submit}>
          <input
            type="email"
            placeholder="Email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrorMessage("");
            }}
            disabled={loading}
          />

          <input
            type="password"
            placeholder="Password"
            required
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrorMessage("");
            }}
            disabled={loading}
          />

          <button
            type="button"
            className="forgot-link"
            onClick={() => navigate("/forgot-password")}
            disabled={loading}
          >
            Forgot password?
          </button>

          <button className="btn primary" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="auth-switch">
          Don’t have an account?
          <button
            type="button"
            className="link-inline"
            onClick={() => navigate("/register")}
            disabled={loading}
          >
            Register
          </button>
        </p>
      </div>
    </div>
  );
}
