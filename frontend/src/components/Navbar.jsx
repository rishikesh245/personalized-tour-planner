import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { MapPin, LayoutDashboard, LogOut, Compass, Menu, X } from "lucide-react";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, [location]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <nav className={`luxury-navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="nav-container">
        {/* BRAND LOGO */}
        <Link to="/" className="nav-logo" onClick={() => setMobileMenuOpen(false)}>
          <div className="logo-icon-wrap">
            <Compass className="logo-icon" size={22} />
          </div>
          <div className="logo-text-group">
            <span className="brand-name">TOURAI</span>
            <span className="brand-tagline">BESPOKE EXPEDITIONS</span>
          </div>
        </Link>

        {/* DESKTOP NAV LINKS */}
        <div className="nav-links">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
          >
            <LayoutDashboard size={16} />
            <span>Dashboard</span>
          </Link>
          <Link 
            to="/create-trip" 
            className={`nav-link ${location.pathname === "/create-trip" ? "active" : ""}`}
          >
            <MapPin size={16} />
            <span>Plan Journey</span>
          </Link>

          {!isLoggedIn ? (
            <Link to="/login" className="login-nav-btn">
              Sign In
            </Link>
          ) : (
            <button onClick={handleLogout} className="logout-nav-btn" title="Sign out of account">
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          )}
        </div>

        {/* MOBILE MENU TOGGLE */}
        <button 
          className="mobile-toggle-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <Link 
            to="/" 
            className={`mobile-nav-link ${location.pathname === "/" ? "active" : ""}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </Link>
          <Link 
            to="/create-trip" 
            className={`mobile-nav-link ${location.pathname === "/create-trip" ? "active" : ""}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <MapPin size={18} />
            <span>Plan Journey</span>
          </Link>
          <div className="mobile-divider" />
          {!isLoggedIn ? (
            <Link 
              to="/login" 
              className="mobile-login-btn"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sign In
            </Link>
          ) : (
            <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="mobile-logout-btn">
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
