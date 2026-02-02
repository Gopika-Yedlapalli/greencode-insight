import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { api } from "../services/api";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
    setOpen(false);
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="nav-container">
        <div className="logo">GreenCode Insight</div>

        <nav className="nav-links">
          <Link to="/">Home</Link>
          <a href="#features">How it works</a>
          <a href="#">About</a>
          <Link to="/contact">Contact</Link>

          {user ? (
            <div className="profile-wrapper" ref={dropdownRef}>
              <button
                className="signup-btn profile-trigger profile-icon"
                onClick={() => setOpen((v) => !v)}
              >
                {user.first_name?.charAt(0).toUpperCase()}
              </button>

              {open && (
                <div className="profile-dropdown">
                  <button
                    onClick={() => {
                      setOpen(false);
                      navigate("/profile");
                    }}
                  >
                    View Profile
                  </button>

                  <button className="danger" onClick={logout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="signup-btn">
              Sign In / Sign Up
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
