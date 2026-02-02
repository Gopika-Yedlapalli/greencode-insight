import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

export default function Contact() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => {
        setUser(res.data);
        setForm((f) => ({
          ...f,
          name: res.data.first_name || "",
          email: res.data.email,
        }));
      })
      .catch(() => setUser(null));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.name || !form.message || (!user && !form.email)) {
      setError("All fields are required.");
      return;
    }

    try {
      setLoading(true);
      await api.post("/contact", form);

      setShowSuccess(true);
      setForm((f) => ({ ...f, message: "" }));
    } catch (err) {
      setError("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      <form onSubmit={submit} className="contact-form">
        <button
          type="button"
          className="card-close"
          aria-label="Close"
          onClick={() => navigate("/")}
        >
          ✕
        </button>

        <h1>Get in Touch</h1>

        {error && <div className="form-error">{error}</div>}

        <label>
          Name
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Email
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            disabled={!!user}
          />
        </label>

        <label>
          Message
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            required
          />
        </label>

        <button type="submit" className="btn primary" disabled={loading}>
          {loading ? "Sending..." : "Send Message"}
        </button>
      </form>

      {showSuccess && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>Message Sent</h2>
            <p>
              Thank you for reaching out.
              <br />
              Our team has received your message and will get back to you
              shortly.
            </p>

            <div className="modal-actions">
              <button
                className="btn primary"
                onClick={() => setShowSuccess(false)}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
