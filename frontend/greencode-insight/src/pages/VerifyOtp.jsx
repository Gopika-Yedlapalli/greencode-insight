import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import FormError from "../components/FormError";
import SuccessModal from "../components/SuccessModal";

const OTP_LENGTH = 6;

export default function VerifyOtp() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const email = state?.email;

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [errorMessage, setErrorMessage] = useState("");
  const [successOpen, setSuccessOpen] = useState(false);

  const inputsRef = useRef([]);
  const isOtpComplete = otp.every((digit) => digit !== "");

  useEffect(() => {
    if (!successOpen) return;

    const timer = setTimeout(() => {
      navigate("/reset-password", { state: { email } });
    }, 2000);

    return () => clearTimeout(timer);
  }, [successOpen, navigate, email]);

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const nextOtp = [...otp];
    nextOtp[index] = value;
    setOtp(nextOtp);
    setErrorMessage("");

    if (value && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").slice(0, OTP_LENGTH);
    if (!/^\d+$/.test(pasted)) return;

    const nextOtp = pasted.split("");
    setOtp([...nextOtp, ...Array(OTP_LENGTH - nextOtp.length).fill("")]);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!isOtpComplete) return;

    try {
      await api.post("/auth/verify-otp", {
        email,
        otp: otp.join(""),
      });
      setSuccessOpen(true);
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || "Invalid or expired OTP");
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

        <h1>Verify OTP</h1>
        <p className="auth-subtitle">
          Enter the 6-digit code sent to your email
        </p>

        <FormError message={errorMessage} />

        <form className="auth-form" onSubmit={submit} noValidate>
          <div className="otp-container" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputsRef.current[index] = el)}
                className="otp-input"
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
              />
            ))}
          </div>

          <button
            className="btn primary"
            type="submit"
            disabled={!isOtpComplete}
          >
            Verify OTP
          </button>
        </form>
      </div>

      <SuccessModal
        open={successOpen}
        title="OTP Verified"
        message="OTP verified successfully."
        buttonText="Continue"
        onClose={() => navigate("/reset-password", { state: { email } })}
      />
    </div>
  );
}
