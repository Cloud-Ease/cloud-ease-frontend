import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../CSS/Login.css";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === "checkbox" ? checked : value 
    });
    
    // Clear error when user starts typing
    if (loginError) {
      setLoginError("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError("");
    
    // Simulate network request with timeout
    setTimeout(() => {
      console.log("Login attempt with:", formData);
      // Demo only: In a real app, you would authenticate with a server
      if (formData.email && formData.password) {
        // Successful login simulation
        navigate("/"); // Navigate to homepage for demo
      } else {
        // Failed login simulation
        setLoginError("E-posta veya şifre hatalı. Lütfen bilgilerinizi kontrol edin.");
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleSocialLogin = (provider) => {
    setIsLoading(true);
    console.log(`Login with ${provider}`);
    
    // Simulate social login with timeout
    setTimeout(() => {
      // Redirect to homepage after "successful" social login
      navigate("/");
    }, 1000);
  };

  return (
    <div className="login-container">
      <div className="login-header">
        <div className="logo" onClick={() => navigate("/")}>Cloud Ease</div>
        <button 
          className="back-to-home" 
          onClick={() => navigate("/")}
          aria-label="Ana sayfaya dön"
        >
          <i className="fas fa-arrow-left"></i> Ana Sayfa
        </button>
      </div>
      <div className="login-form-container">
        <div className="login-form-card">
          <h2>Giriş Yap</h2>
          <p className="form-subtitle">Güvenli bulut depolama alanınıza hoş geldiniz</p>
          
          {loginError && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              {loginError}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">E-posta Adresi</label>
              <div className="input-with-icon">
                <i className="fas fa-envelope"></i>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="E-posta adresinizi girin"
                  autoComplete="email"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Şifre</label>
              <div className="input-with-icon">
                <i className="fas fa-lock"></i>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Şifrenizi girin"
                  autoComplete="current-password"
                />
              </div>
            </div>
            
            <div className="form-actions">
              <div className="remember-me">
                <input 
                  type="checkbox" 
                  id="rememberMe" 
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                <label htmlFor="rememberMe">Beni hatırla</label>
              </div>
              <a href="#" className="forgot-password">Şifremi unuttum</a>
            </div>
            
            <button 
              type="submit" 
              className={`login-submit-btn ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading-spinner">
                  <i className="fas fa-circle-notch fa-spin"></i> Giriş yapılıyor...
                </span>
              ) : (
                "Giriş Yap"
              )}
            </button>
          </form>
          
          <div className="login-divider">veya</div>
          
          <div className="social-login">
            <button 
              className="social-login-btn google-btn" 
              onClick={() => handleSocialLogin('google')}
              disabled={isLoading}
            >
              <i className="fab fa-google"></i>
              <span className="social-text">Google ile Giriş Yap</span>
            </button>
            <button 
              className="social-login-btn facebook-btn" 
              onClick={() => handleSocialLogin('facebook')}
              disabled={isLoading}
            >
              <i className="fab fa-facebook-f"></i>
              <span className="social-text">Facebook ile Giriş Yap</span>
            </button>
            <button 
              className="social-login-btn apple-btn" 
              onClick={() => handleSocialLogin('apple')}
              disabled={isLoading}
            >
              <i className="fab fa-apple"></i>
              <span className="social-text">Apple ile Giriş Yap</span>
            </button>
          </div>
          
          <div className="login-footer">
            <p>Hesabınız yok mu? <a href="#" onClick={() => navigate("/signin")}>Hemen Kayıt Ol</a></p>
          </div>
          
          <div className="login-benefits">
            <h4>Cloud Ease'in Avantajları:</h4>
            <ul>
              <li><i className="fas fa-check-circle"></i> Tamamen ücretsiz bulut depolama</li>
              <li><i className="fas fa-check-circle"></i> Dosyalarınızı kategorilere göre düzenleme</li>
              <li><i className="fas fa-check-circle"></i> Uçtan uca şifreleme ile maksimum güvenlik</li>
              <li><i className="fas fa-check-circle"></i> Her cihazdan erişim imkanı</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login; 