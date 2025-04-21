import React from "react";
import { useNavigate } from "react-router-dom";
import "../CSS/Navbar.css";

function Navbar({ showAuthButtons = true }) {
  const navigate = useNavigate();
  
  const handleLoginClick = () => {
    console.log("Login button clicked, navigating to /login");
    navigate("/login");
  };
  
  const handleSignUpClick = () => {
    console.log("Sign up button clicked, navigating to /signin");
    navigate("/signin");
  };
  
  const handleLogoClick = () => {
    console.log("Logo clicked, navigating to /");
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="logo" onClick={handleLogoClick} role="button" tabIndex={0}>Cloud Ease</div>
      {showAuthButtons && (
        <div className="auth-buttons">
          <button 
            className="login-btn" 
            onClick={handleLoginClick}
            type="button"
          >
            Giriş Yap
          </button>
          <button 
            className="register-btn" 
            onClick={handleSignUpClick}
            type="button"
          >
            Kayıt Ol
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar; 