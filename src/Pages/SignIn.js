import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../CSS/SignIn.css";

function SignIn() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [signupError, setSignupError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: "Şifrenizi girin"
  });

  const checkPasswordStrength = (password) => {
    if (!password) {
      return { score: 0, message: "Şifrenizi girin" };
    }

    let score = 0;
    let feedback = "";

    // Check length
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;

    // Check for numbers
    if (/\d/.test(password)) score += 1;

    // Check for special characters
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;

    // Check for uppercase and lowercase
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;

    // Give feedback based on score
    switch(true) {
      case (score <= 1):
        feedback = "Zayıf";
        break;
      case (score <= 3):
        feedback = "Orta";
        break;
      case (score <= 4):
        feedback = "İyi";
        break;
      case (score >= 5):
        feedback = "Güçlü";
        break;
      default:
        feedback = "Şifrenizi girin";
    }

    return { score, message: feedback };
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === "checkbox" ? checked : value 
    });
    
    // Clear error when user starts typing
    if (signupError) {
      setSignupError("");
    }

    // Check password strength
    if (name === "password") {
      setPasswordStrength(checkPasswordStrength(value));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (formData.password !== formData.confirmPassword) {
      setSignupError("Şifreler eşleşmiyor!");
      setIsLoading(false);
      return;
    }

    if (passwordStrength.score < 3) {
      setSignupError("Lütfen daha güçlü bir şifre seçin.");
      setIsLoading(false);
      return;
    }
    
    // Simulate network request with timeout
    setTimeout(() => {
      console.log("Registration attempt with:", formData);
      // Demo only: In a real app, you would send this data to your backend
      navigate("/login");
      setIsLoading(false);
    }, 1500);
  };

  const handleSocialSignIn = (provider) => {
    setIsLoading(true);
    console.log(`Sign in with ${provider}`);
    
    // Simulate social signup with timeout
    setTimeout(() => {
      navigate("/");
    }, 1000);
  };

  return (
    <div className="signin-container">
      <div className="signin-header">
        <div className="logo" onClick={() => navigate("/")}>Cloud Ease</div>
        <button 
          className="back-to-home" 
          onClick={() => navigate("/")}
          aria-label="Ana sayfaya dön"
        >
          <i className="fas fa-arrow-left"></i> Ana Sayfa
        </button>
      </div>
      <div className="signin-form-container">
        <div className="signin-form-card">
          <h2>Kayıt Ol</h2>
          <p className="form-subtitle">Ücretsiz bulut depolama için hesap oluşturun</p>
          
          {signupError && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              {signupError}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="signin-form">
            <div className="form-group">
              <label htmlFor="fullName">Ad Soyad</label>
              <div className="input-with-icon">
                <i className="fas fa-user"></i>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  placeholder="Adınızı ve soyadınızı girin"
                  autoComplete="name"
                />
              </div>
            </div>
            
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
                  minLength="8"
                  autoComplete="new-password"
                />
              </div>
              <div className="password-strength">
                <div className="strength-meter">
                  <div 
                    className={`strength-progress strength-${passwordStrength.score >= 5 ? 5 : passwordStrength.score}`}
                    style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                  ></div>
                </div>
                <div className="strength-text">{passwordStrength.message}</div>
              </div>
              <small className="password-hint">
                <i className="fas fa-info-circle"></i> En az 8 karakter, büyük-küçük harf, rakam ve özel karakter içermeli
              </small>
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Şifre Tekrar</label>
              <div className="input-with-icon">
                <i className="fas fa-lock"></i>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Şifrenizi tekrar girin"
                  autoComplete="new-password"
                />
              </div>
              {formData.password && formData.confirmPassword && (
                <div className={`password-match ${formData.password === formData.confirmPassword ? 'match' : 'no-match'}`}>
                  {formData.password === formData.confirmPassword ? (
                    <><i className="fas fa-check-circle"></i> Şifreler eşleşiyor</>
                  ) : (
                    <><i className="fas fa-times-circle"></i> Şifreler eşleşmiyor</>
                  )}
                </div>
              )}
            </div>
            
            <div className="form-terms">
              <input 
                type="checkbox" 
                id="termsAccepted" 
                name="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleChange}
                required
              />
              <label htmlFor="termsAccepted">
                <span>Kullanım koşullarını ve gizlilik politikasını kabul ediyorum</span>
              </label>
            </div>
            
            <button 
              type="submit" 
              className={`signin-submit-btn ${isLoading ? 'loading' : ''}`}
              disabled={!formData.termsAccepted || isLoading}
            >
              {isLoading ? (
                <span className="loading-spinner">
                  <i className="fas fa-circle-notch fa-spin"></i> Kayıt yapılıyor...
                </span>
              ) : (
                "Kayıt Ol"
              )}
            </button>
          </form>
          
          <div className="signin-divider">veya</div>
          
          <div className="social-signin">
            <button 
              className="social-signin-btn google-btn" 
              onClick={() => handleSocialSignIn('google')}
              disabled={isLoading}
            >
              <i className="fab fa-google"></i>
              <span className="social-text">Google ile Kayıt Ol</span>
            </button>
            <button 
              className="social-signin-btn facebook-btn" 
              onClick={() => handleSocialSignIn('facebook')}
              disabled={isLoading}
            >
              <i className="fab fa-facebook-f"></i>
              <span className="social-text">Facebook ile Kayıt Ol</span>
            </button>
            <button 
              className="social-signin-btn apple-btn" 
              onClick={() => handleSocialSignIn('apple')}
              disabled={isLoading}
            >
              <i className="fab fa-apple"></i>
              <span className="social-text">Apple ile Kayıt Ol</span>
            </button>
          </div>
          
          <div className="benefits-container">
            <h4>Kayıt Olun ve Hemen Başlayın</h4>
            <ul className="benefits-list">
              <li><i className="fas fa-check-circle"></i> Sınırsız dosya depolama</li>
              <li><i className="fas fa-check-circle"></i> Akıllı dosya organizasyonu</li>
              <li><i className="fas fa-check-circle"></i> Her cihazda senkronizasyon</li>
              <li><i className="fas fa-check-circle"></i> Gelişmiş güvenlik özellikleri</li>
            </ul>
          </div>
          
          <div className="legal-info">
            Kayıt olarak <a href="#">Kullanım Şartları</a> ve <a href="#">Gizlilik Politikası</a>'nı kabul etmiş olursunuz.
          </div>
          
          <div className="signin-footer">
            <p>Zaten bir hesabınız var mı? <a href="#" onClick={() => navigate("/login")}>Giriş Yap</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignIn; 