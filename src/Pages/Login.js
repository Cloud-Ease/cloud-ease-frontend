import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, loginAndGetToken } from '../firebase';
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
      console.log('Login başlatılıyor...');

      // Firebase login fonksiyonunu çağır
      const token = await loginAndGetToken(formData.email, formData.password);
      console.log('Login başarılı, token alındı');

      // Başarılı giriş → doğrudan yönlendir
      console.log("Dashboard'a yönlendiriliyor...");
      // navigate('/dashboard-demo');

      // Doğrudan URL değiştirme
      window.location.href = '/dashboard-demo';
    } catch (error) {
      console.error('Giriş hatası:', error.message);
      setLoginError('E-posta veya şifre hatalı ya da bağlantı hatası.');
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    setIsLoading(true);
    console.log(`Login with ${provider}`);

    // Simulate social login with timeout
    setTimeout(() => {
      try {
        // Simüle edilmiş token
        const simulatedToken =
          'simulated_social_token_' + Math.random().toString(36).substring(2, 15);

        // Token'ı localStorage'a kaydet
        localStorage.setItem('token', simulatedToken);
        console.log('Sosyal giriş başarılı, token kaydedildi');

        // Auth state event yayınla
        const authEvent = new CustomEvent('authStateChanged', {
          detail: { isAuthenticated: true },
        });
        window.dispatchEvent(authEvent);
        console.log('Auth state event yayınlandı');

        // Redirect to dashboard after "successful" social login
        console.log("Dashboard'a yönlendiriliyor...");

        // setIsLoading(false); // Burayı kaldıralım, yönlendirme yapılacak

        // navigate fonksiyonunu doğrudan çağıralım
        window.location.href = '/dashboard-demo'; // Doğrudan URL değiştirme
      } catch (error) {
        console.error('Sosyal giriş hatası:', error);
        setLoginError('Sosyal giriş sırasında bir hata oluştu. Lütfen tekrar deneyin.');
        setIsLoading(false);
      }
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
