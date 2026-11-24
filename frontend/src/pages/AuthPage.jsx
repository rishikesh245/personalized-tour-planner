import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Plane,
  Compass,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  MapPin,
  Star,
  ChevronLeft
} from "lucide-react";
import { loginUser, registerUser } from "../services/authService";
import "./Auth.css";

// Curated high-definition travel backgrounds
const WALLPAPERS = [
  {
    id: "alpine",
    name: "🏔️ Alps Glow",
    url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: "tropical",
    name: "🏝️ Bali Beach",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop"
  },
  {
    id: "kyoto",
    name: "⛩️ Kyoto Lights",
    url: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: "santorini",
    name: "🏛️ Santorini",
    url: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=2000&auto=format&fit=crop"
  }
];

// Highlight destinations for showcase
const DESTINATIONS = [
  { flag: "🗼", name: "Paris", country: "France", rating: "4.9" },
  { flag: "⛩️", name: "Tokyo", country: "Japan", rating: "5.0" },
  { flag: "🏝️", name: "Bali", country: "Indonesia", rating: "4.8" }
];

export default function AuthPage({ initialMode = "login" }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState(initialMode);
  const [currentBg, setCurrentBg] = useState(0);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alertInfo, setAlertInfo] = useState(null);

  // Sync mode when initialMode prop changes
  useEffect(() => {
    setMode(initialMode);
    setAlertInfo(null);
  }, [initialMode]);

  // Password strength calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, text: "Too weak", color: "#64748b", width: "0%" };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score, text: "Weak", color: "#f43f5e", width: "25%" };
    if (score === 2 || score === 3) return { score, text: "Good", color: "#f59e0b", width: "60%" };
    if (score === 4) return { score, text: "Strong", color: "#3b82f6", width: "85%" };
    return { score, text: "Adventure Ready", color: "#10b981", width: "100%" };
  };

  const strength = getPasswordStrength(formData.password);

  const handleInputChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    if (alertInfo) setAlertInfo(null);
  };

  const switchMode = (targetMode) => {
    if (mode === targetMode) return;
    setMode(targetMode);
    setAlertInfo(null);
    navigate(targetMode === "login" ? "/login" : "/register", { replace: true });
  };

  // 1-Click Demo Traveler fill
  const handleDemoFill = () => {
    if (mode === "login") {
      setFormData({
        name: "",
        email: "traveler@tour-ai.com",
        password: "adventure2026",
        confirmPassword: ""
      });
    } else {
      setFormData({
        name: "Alex Traveler",
        email: "alex.explorer@tour-ai.com",
        password: "adventure2026",
        confirmPassword: "adventure2026"
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlertInfo(null);

    // Validation
    if (mode === "register") {
      if (!formData.name.trim()) {
        setAlertInfo({ type: "error", message: "Please enter your full name." });
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setAlertInfo({ type: "error", message: "Passwords do not match." });
        return;
      }
      if (formData.password.length < 6) {
        setAlertInfo({ type: "error", message: "Password should be at least 6 characters." });
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === "login") {
        const data = await loginUser({
          email: formData.email,
          password: formData.password
        });
        localStorage.setItem("token", data.token);
        setAlertInfo({ type: "success", message: "Login successful! Directing to dashboard..." });
        setTimeout(() => {
          navigate("/");
        }, 800);
      } else {
        await registerUser({
          name: formData.name,
          email: formData.email,
          password: formData.password
        });
        setAlertInfo({
          type: "success",
          message: "Registration successful! You can now log in."
        });
        setTimeout(() => {
          switchMode("login");
        }, 1400);
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        (mode === "login" ? "Invalid email or password. Please try again." : "Registration failed. Please try again.");
      setAlertInfo({ type: "error", message: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      {/* Dynamic Background Image Layer */}
      <div
        className="auth-bg-layer"
        style={{ backgroundImage: `url('${WALLPAPERS[currentBg].url}')` }}
      />
      <div className="auth-overlay" />

      {/* Back to Home Button */}
      <Link to="/" className="home-nav-link" title="Return to Dashboard">
        <ChevronLeft size={18} />
        <span>Home</span>
      </Link>

      {/* Dynamic Wallpaper Switcher */}
      <div className="wallpaper-switcher" title="Change Background Theme">
        <div className="wallpaper-label">
          <ImageIcon size={14} />
          <span>Scene:</span>
        </div>
        {WALLPAPERS.map((wp, idx) => (
          <button
            key={wp.id}
            className={`wallpaper-btn ${currentBg === idx ? "active" : ""}`}
            onClick={() => setCurrentBg(idx)}
          >
            {wp.name}
          </button>
        ))}
      </div>

      {/* Main Glass Card Container */}
      <div className="auth-container">
        {/* Left Showcase (Desktop) */}
        <div className="auth-showcase">
          <div>
            <div className="showcase-brand">
              <div className="brand-icon-wrapper" style={{ background: "#263C32" }}>
                <Compass size={22} color="#C4A46D" />
              </div>
              <span className="brand-name" style={{ fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: "2px" }}>TOURAI</span>
              <span className="brand-badge" style={{ background: "#C4A46D", color: "#FFFFFF" }}>BESPOKE</span>
            </div>

            <div className="showcase-hero">
              <div className="showcase-tag">
                <Sparkles size={14} color="#C4A46D" />
                <span>Bespoke Travel Concierge</span>
              </div>
              <h2 className="showcase-title">
                Curated Expeditions & <br /><span>Artisanal Journeys</span>
              </h2>
              <p className="showcase-desc">
                Design bespoke multi-city circuits, discover secluded boutique retreats, and manage your luxury travel portfolio with real-time financial clarity.
              </p>
            </div>

            {/* Floating Destination Cards */}
            <div className="floating-cards-list">
              {DESTINATIONS.map((dest, i) => (
                <div key={i} className="floating-card">
                  <div className="floating-card-left">
                    <span className="card-flag">{dest.flag}</span>
                    <div>
                      <div className="card-destination">{dest.name}</div>
                      <div className="card-country">{dest.country}</div>
                    </div>
                  </div>
                  <div className="card-rating">
                    <Star size={13} fill="#fbbf24" />
                    <span>{dest.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="showcase-footer">
            <div className="stat-item">
              <h4>120+</h4>
              <p>Destinations</p>
            </div>
            <div className="stat-item">
              <h4>15k+</h4>
              <p>Trips Planned</p>
            </div>
            <div className="stat-item">
              <h4>4.9 ★</h4>
              <p>Traveler Score</p>
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="auth-form-panel">
          {/* Animated Tab Switcher */}
          <div className="auth-tabs-container">
            <div className={`tab-indicator ${mode === "register" ? "register" : ""}`} />
            <button
              type="button"
              className={`auth-tab-btn ${mode === "login" ? "active" : ""}`}
              onClick={() => switchMode("login")}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`auth-tab-btn ${mode === "register" ? "active" : ""}`}
              onClick={() => switchMode("register")}
            >
              Create Account
            </button>
          </div>

          {/* Form Header */}
          <div className="auth-form-header">
            <h1 className="auth-heading">
              {mode === "login" ? "Welcome Back ✈️" : "Begin Your Journey 🌍"}
            </h1>
            <p className="auth-subheading">
              {mode === "login"
                ? "Enter your credentials to continue your adventures"
                : "Join TourAI and unlock custom AI-generated itineraries"}
            </p>
          </div>

          {/* Alert Box */}
          {alertInfo && (
            <div className={`auth-alert ${alertInfo.type}`}>
              {alertInfo.type === "error" ? (
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
              ) : (
                <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: 1 }} />
              )}
              <span>{alertInfo.message}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            {mode === "register" && (
              <div className="auth-input-group">
                <label className="auth-input-label">Full Name</label>
                <div className="auth-input-box">
                  <User size={18} className="auth-input-icon" />
                  <input
                    name="name"
                    type="text"
                    placeholder="e.g. John Doe"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            )}

            <div className="auth-input-group">
              <label className="auth-input-label">Email Address</label>
              <div className="auth-input-box">
                <Mail size={18} className="auth-input-icon" />
                <input
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="auth-input-group">
              <label className="auth-input-label">Password</label>
              <div className="auth-input-box">
                <Lock size={18} className="auth-input-icon" />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Real-time Password Strength Meter on Register */}
              {mode === "register" && formData.password.length > 0 && (
                <div className="password-strength-wrap">
                  <div className="strength-bar-bg">
                    <div
                      className="strength-bar-fill"
                      style={{
                        width: strength.width,
                        backgroundColor: strength.color
                      }}
                    />
                  </div>
                  <div className="strength-text">
                    <span>Password Strength</span>
                    <span className="strength-score" style={{ color: strength.color }}>
                      {strength.text}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {mode === "register" && (
              <div className="auth-input-group">
                <label className="auth-input-label">Confirm Password</label>
                <div className="auth-input-box">
                  <ShieldCheck size={18} className="auth-input-icon" />
                  <input
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            )}

            {/* Quick Demo Fill Button */}
            <button
              type="button"
              className="demo-fill-btn"
              onClick={handleDemoFill}
              title="Fill in sample credentials for quick testing"
            >
              <Sparkles size={14} color="#C4A46D" />
              <span>Autofill Demo Concierge</span>
            </button>

            {/* Submit Button */}
            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <div className="auth-spinner" />
              ) : (
                <>
                  <span>{mode === "login" ? "Sign In to TourAI" : "Create Member Account"}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Footer toggle prompt */}
          <div className="auth-form-footer">
            {mode === "login" ? (
              <p>
                Don't have an account yet?{" "}
                <button
                  type="button"
                  className="auth-switch-link"
                  onClick={() => switchMode("register")}
                >
                  Create one now
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <button
                  type="button"
                  className="auth-switch-link"
                  onClick={() => switchMode("login")}
                >
                  Sign in here
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
