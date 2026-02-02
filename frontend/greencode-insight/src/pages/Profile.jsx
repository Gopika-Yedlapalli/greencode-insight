import { useEffect, useState } from "react";
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

export default function Profile() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    role: "",
    experience_level: "",
    preferred_languages: [],
  });

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => {
        const {
          first_name,
          last_name,
          email,
          role,
          experience_level,
          preferred_languages,
        } = res.data;

        setForm({
          first_name,
          last_name,
          email,
          role: role || "",
          experience_level: experience_level || "",
          preferred_languages: preferred_languages || [],
        });
      })
      .catch(() => navigate("/login"));
  }, [navigate]);

  const getPasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;

    if (score <= 1) return "weak";
    if (score === 2) return "fair";
    if (score === 3) return "good";
    return "strong";
  };

  const toggleLanguage = (lang) => {
    setForm((prev) => ({
      ...prev,
      preferred_languages: prev.preferred_languages.includes(lang)
        ? prev.preferred_languages.filter((l) => l !== lang)
        : [...prev.preferred_languages, lang].slice(0, 3),
    }));
  };

  const saveProfile = async () => {
    setErrorMessage("");

    if (
      !form.first_name.trim() ||
      !form.last_name.trim() ||
      !form.email.trim()
    ) {
      setErrorMessage("First name, last name, and email are required");
      return;
    }

    try {
      await api.put("/auth/profile", form);
      setSuccessMessage("Profile updated successfully");
      setSuccessOpen(true);
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || "Profile update failed");
    }
  };

  const changePassword = async () => {
    setErrorMessage("");

    if (!oldPassword || !newPassword || !confirmPassword) {
      setErrorMessage("All password fields are required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    try {
      await api.post("/auth/change-password", {
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });

      setSuccessMessage("Password changed successfully. Please log in again.");
      setSuccessOpen(true);

      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || "Password change failed");
    }
  };

  const deleteAccount = async () => {
    try {
      await api.delete("/auth/delete-account");
      navigate("/");
    } catch {
      setErrorMessage("Failed to delete account");
    }
  };

  return (
    <div className="auth">
      <div className="auth-card profile-card">
        <button
          type="button"
          className="card-close"
          aria-label="Close"
          onClick={() => navigate("/")}
        >
          ✕
        </button>

        <h1>My Profile</h1>

        <FormError message={errorMessage} />

        <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
          <section className="profile-section">
            <h3>Profile Details</h3>

            <div className="form-row">
              <input
                placeholder="First Name *"
                value={form.first_name}
                onChange={(e) =>
                  setForm({ ...form, first_name: e.target.value })
                }
              />
              <input
                placeholder="Last Name *"
                value={form.last_name}
                onChange={(e) =>
                  setForm({ ...form, last_name: e.target.value })
                }
              />
            </div>

            <input
              type="email"
              placeholder="Email *"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            <FormDropdown
              label="Select Role"
              value={form.role}
              options={ROLES}
              onSelect={(val) => setForm((prev) => ({ ...prev, role: val }))}
            />

            <FormDropdown
              label="Experience Level"
              value={form.experience_level}
              options={LEVELS}
              onSelect={(val) =>
                setForm((prev) => ({ ...prev, experience_level: val }))
              }
            />

            <div className="chip-group">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  className={`chip ${
                    form.preferred_languages.includes(lang) ? "active" : ""
                  }`}
                  onClick={() => toggleLanguage(lang)}
                >
                  {lang}
                </button>
              ))}
            </div>

            <button type="button" className="btn primary" onClick={saveProfile}>
              Save
            </button>
          </section>

          <section className="profile-section">
            <h3>Change Password</h3>

            <input
              type="password"
              placeholder="Old Password"
              onChange={(e) => setOldPassword(e.target.value)}
            />

            <input
              type="password"
              placeholder="New Password"
              onChange={(e) => setNewPassword(e.target.value)}
            />

            {newPassword && (
              <div
                className={`password-strength ${getPasswordStrength(newPassword)}`}
              >
                Password strength:{" "}
                <strong>{getPasswordStrength(newPassword)}</strong>
              </div>
            )}

            <input
              type="password"
              placeholder="Confirm New Password"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <button
              type="button"
              className="btn primary"
              onClick={changePassword}
            >
              Save
            </button>
          </section>

          <section className="profile-section">
            <h3>Delete Account</h3>
            <button
              type="button"
              className="btn danger-btn"
              onClick={() => setDeleteConfirmOpen(true)}
            >
              Delete Account
            </button>
          </section>
        </form>
      </div>

      <SuccessModal
        open={successOpen}
        title="Success"
        message={successMessage}
        buttonText="OK"
        onClose={() => setSuccessOpen(false)}
      />

      <SuccessModal
        open={deleteConfirmOpen}
        title="Confirm Deletion"
        message="Are you sure you want to delete your account? This action cannot be undone."
        buttonText="Yes"
        secondaryButtonText="Cancel"
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={deleteAccount}
      />
    </div>
  );
}
