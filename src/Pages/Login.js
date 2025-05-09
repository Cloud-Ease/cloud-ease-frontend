import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../CSS/Login.css';
import Navbar from '../components/Navbar';
import FormInput from '../components/FormInput';
import SocialLoginButtons from '../components/SocialLoginButtons';
import BenefitsList from '../components/BenefitsList';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });

    // Clear error when user starts typing
    if (loginError) {
      setLoginError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError('');

    try {
      // 🔐 Firebase ile giriş yap
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      // 🔑 Firebase token al
      const token = await userCredential.user.getIdToken();

      // ✅ İstersen token'ı localStorage'a kaydet (isteğe bağlı)
      localStorage.setItem('token', token);

      // ✅ Başarılı giriş → yönlendir
      navigate('/dashboard-demo');
    } catch (error) {
      console.error('Giriş hatası:', error.message);
      setLoginError('E-posta veya şifre hatalı ya da bağlantı hatası.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    setIsLoading(true);
    console.log(`Login with ${provider}`);

    // Simulate social login with timeout
    setTimeout(() => {
      // Redirect to dashboard after "successful" social login
      navigate('/dashboard-demo');
    }, 1000);
  };

  const benefitsList = [
    'Tamamen ücretsiz bulut depolama',
    'Dosyalarınızı kategorilere göre düzenleme',
    'Uçtan uca şifreleme ile maksimum güvenlik',
    'Her cihazdan erişim imkanı',
  ];

  return (
    <div className="login-container">
      <div className="login-header">
        <Navbar showAuthButtons={false} />
        <button className="back-to-home" onClick={() => navigate('/')} aria-label="Ana sayfaya dön">
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
            <FormInput
              label="E-posta Adresi"
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required={true}
              placeholder="E-posta adresinizi girin"
              autoComplete="email"
              icon="fas fa-envelope"
            />

            <FormInput
              label="Şifre"
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required={true}
              placeholder="Şifrenizi girin"
              autoComplete="current-password"
              icon="fas fa-lock"
            />

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
              <a href="#" className="forgot-password">
                Şifremi unuttum
              </a>
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
                'Giriş Yap'
              )}
            </button>
          </form>

          <div className="login-divider">veya</div>

          <SocialLoginButtons
            onSocialLogin={handleSocialLogin}
            isSignUp={false}
            isLoading={isLoading}
          />

          <div className="login-footer">
            <p>
              Hesabınız yok mu?{' '}
              <a href="#" onClick={() => navigate('/signin')}>
                Hemen Kayıt Ol
              </a>
            </p>
          </div>

          <BenefitsList
            title="Cloud Ease'in Avantajları:"
            benefits={benefitsList}
            className="login-benefits"
          />
        </div>
      </div>
    </div>
  );
}

export default Login;
