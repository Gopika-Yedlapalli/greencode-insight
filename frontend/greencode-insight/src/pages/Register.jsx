import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import FormError from "../components/FormError";
import SuccessModal from "../components/SuccessModal";

const LANGUAGES = ["Java", "Python", "JavaScript", "C++", "Go", "Rust"];
const ROLES = ["Student", "Developer", "Software Engineer"];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];

function FormDropdown({ label, value, options, onSelect, disabled }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="form-dropdown">
      <button
        type="button"
        className="form-dropdown-trigger"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
      >
        {value || label}
      </button>

      {open && (
        <div className="form-dropdown-menu">
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onSelect(opt);
                setOpen(false);
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_password: "",
    role: "",
    experience_level: "",
    preferred_languages: [],
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    setErrors((prev) => ({ ...prev, [name]: false }));
    setErrorMessage("");
  };

  const toggleLanguage = (lang) => {
    setForm((prev) => {
      if (prev.preferred_languages.includes(lang)) {
        return {
          ...prev,
          preferred_languages: prev.preferred_languages.filter(
            (l) => l !== lang,
          ),
        };
      }
      if (prev.preferred_languages.length >= 3) return prev;
      return {
        ...prev,
        preferred_languages: [...prev.preferred_languages, lang],
      };
    });
  };

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

  const passwordStrength = getPasswordStrength(form.password);

  useEffect(() => {
    if (!successOpen) return;

    const timer = setTimeout(() => {
      navigate("/login");
    }, 3000);

    return () => clearTimeout(timer);
  }, [successOpen, navigate]);

  const submit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!form.first_name.trim()) newErrors.first_name = true;
    if (!form.last_name.trim()) newErrors.last_name = true;
    if (!form.email.trim()) newErrors.email = true;
    if (!form.password) newErrors.password = true;
    if (!form.confirm_password) newErrors.confirm_password = true;

    if (
      form.password &&
      form.confirm_password &&
      form.password !== form.confirm_password
    ) {
      setErrorMessage("Passwords do not match");
      setErrors({ confirm_password: true });
      return;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setErrorMessage("");
    setLoading(true);

    try {
      await api.post("/auth/register", form);
      setSuccessOpen(true);
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || "Registration failed");
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

        <h1>Create Account</h1>
        <p className="auth-subtitle">Join GreenCode Insight</p>
        <FormError message={errorMessage} />

        <form className="auth-form" onSubmit={submit}>
          <div className="form-row">
            <input
              name="first_name"
              placeholder="First Name"
              required
              className={errors.first_name ? "input-error" : ""}
              onChange={handleChange}
              disabled={loading}
            />
            <input
              name="last_name"
              placeholder="Last Name"
              required
              className={errors.last_name ? "input-error" : ""}
              onChange={handleChange}
              disabled={loading}
            />
          </div>

          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            className={errors.email ? "input-error" : ""}
            onChange={handleChange}
            disabled={loading}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            className={errors.password ? "input-error" : ""}
            onChange={handleChange}
            disabled={loading}
          />

          {form.password && (
            <div className={`password-strength ${passwordStrength.className}`}>
              Password strength: <strong>{passwordStrength.label}</strong>
            </div>
          )}

          <input
            type="password"
            name="confirm_password"
            placeholder="Confirm Password"
            required
            className={errors.confirm_password ? "input-error" : ""}
            onChange={handleChange}
            disabled={loading}
          />

          <FormDropdown
            label="Select Role"
            value={form.role}
            options={ROLES}
            disabled={loading}
            onSelect={(val) => setForm((prev) => ({ ...prev, role: val }))}
          />
          <FormDropdown
            label="Experience Level"
            value={form.experience_level}
            options={LEVELS}
            disabled={loading}
            onSelect={(val) =>
              setForm((prev) => ({ ...prev, experience_level: val }))
            }
          />

          <div className="multi-select">
            <p className="hint">Preferred Languages (up to 3)</p>
            <div className="chip-group">
              {LANGUAGES.map((lang) => (
                <button
                  type="button"
                  key={lang}
                  className={`chip ${
                    form.preferred_languages.includes(lang) ? "active" : ""
                  }`}
                  onClick={() => toggleLanguage(lang)}
                  disabled={loading}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <button className="btn primary" type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?
          <button
            type="button"
            className="link-inline"
            onClick={() => navigate("/login")}
            disabled={loading}
          >
            Sign in
          </button>
        </p>
      </div>

      <SuccessModal
        open={successOpen}
        title="Account Created"
        message="Your account has been created successfully. You can now sign in."
        buttonText="Sign In"
        onClose={() => navigate("/login")}
      />
    </div>
  );
}
