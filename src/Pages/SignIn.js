import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../CSS/SignIn.css';
import Navbar from '../components/Navbar';
import FormInput from '../components/FormInput';
import SocialLoginButtons from '../components/SocialLoginButtons';
import BenefitsList from '../components/BenefitsList';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';
import { register } from '../firebase';
import { getAuth } from 'firebase/auth';

function SignIn() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [signupError, setSignupError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: 'Şifrenizi girin',
  });

  const checkPasswordStrength = (password) => {
    if (!password) {
      return { score: 0, message: 'Şifrenizi girin' };
    }

    let score = 0;
    let feedback = '';

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
    switch (true) {
      case score <= 1:
        feedback = 'Zayıf';
        break;
      case score <= 3:
        feedback = 'Orta';
        break;
      case score <= 4:
        feedback = 'İyi';
        break;
      case score >= 5:
        feedback = 'Güçlü';
        break;
      default:
        feedback = 'Şifrenizi girin';
    }

    return { score, message: feedback };
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });

    // Clear error when user starts typing
    if (signupError) {
      setSignupError('');
    }

    // Check password strength
    if (name === 'password') {
      setPasswordStrength(checkPasswordStrength(value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setSignupError('Şifreler eşleşmiyor!');
      setIsLoading(false);
      return;
    }

    if (passwordStrength.score < 3) {
      setSignupError('Lütfen daha güçlü bir şifre seçin.');
      setIsLoading(false);
      return;
    }

    try {
      // Firebase'den gelen token'ı alıyoruz
      const token = await register(formData.email, formData.password);
      console.log('Firebase token alındı:', token ? 'Token var' : 'Token yok');
      console.log('Token uzunluğu:', token ? token.length : 0);
      console.log('Token başlangıç:', token ? token.substring(0, 20) + '...' : 'Yok');

      // Token'ı localStorage'a kaydediyoruz
      localStorage.setItem('token', token);
      console.log("Token localStorage'a kaydedildi");

      // Auth state event yayınla
      const authEvent = new CustomEvent('authStateChanged', {
        detail: { isAuthenticated: true },
      });
      window.dispatchEvent(authEvent);
      console.log('Auth state event yayınlandı');

      // Profil oluştur
      const auth = getAuth();
      if (auth.currentUser) {
        try {
          // Ad ve soyadı ayır
          const nameParts = formData.fullName.split(' ');
          const firstName = nameParts[0] || '';
          const lastName = nameParts.slice(1).join(' ') || '';

          // Backende gönderilecek veriyi tam olarak backend DTO'ya göre hazırla
          // ProfileCreateDto { FirstName, LastName, Phone, AvatarUrl, Email }
          const profileData = {
            UserId: auth.currentUser.uid,
            FirstName: firstName,
            LastName: lastName,
            Email: formData.email,
            Phone: '',
            AvatarUrl: '',
          };

          console.log('Profil oluşturma verisi:', profileData);
          console.log('JSON olarak:', JSON.stringify(profileData, null, 2));

          // Backend'e profil oluşturma isteği gönder
          const response = await fetch('https://localhost:7241/api/profile', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify(profileData),
          });

          if (!response.ok) {
            let errorMessage = '';
            try {
              const errorData = await response.json();
              errorMessage = JSON.stringify(errorData);
            } catch (e) {
              // Eğer JSON olarak parse edilemezse, text olarak al
              errorMessage = await response.text();
            }

            console.error(`Profil oluşturulurken hata: ${response.status}`, errorMessage);
            console.error('Request Headers:', {
              Authorization: `Bearer ${token.substring(0, 10)}...`,
              'Content-Type': 'application/json',
            });
            console.error('Request Body:', JSON.stringify(profileData));
            throw new Error(`Profil oluşturulurken hata: ${response.status} - ${errorMessage}`);
          }

          const responseData = await response.json();
          console.log('Oluşturulan profil yanıtı:', responseData);
          console.log('JSON olarak yanıt:', JSON.stringify(responseData, null, 2));
          console.log('Profil başarıyla oluşturuldu');
        } catch (profileError) {
          console.error('Profil oluşturma hatası:', profileError);
          // Profil oluşturmada hata olsa bile devam ediyoruz
        }
      }

      // Token kaydedildiğinden emin olmak için kontrol et
      setTimeout(() => {
        if (localStorage.getItem('token')) {
          console.log("Token başarıyla kaydedildi, dashboard'a yönlendiriliyor...");
          window.location.href = '/dashboard-demo'; // URL'yi doğrudan değiştir
        } else {
          console.error('Token kaydedilemedi!');
          setSignupError('Kayıt işlemi tamamlanamadı. Lütfen tekrar deneyin.');
          setIsLoading(false);
        }
      }, 100);
    } catch (error) {
      console.error(error);
      setSignupError('Kayıt başarısız: ' + error.message);
      setIsLoading(false);
    }
  };

  const handleSocialSignIn = (provider) => {
    setIsLoading(true);
    console.log(`Sign in with ${provider}`);

    // Simulate social signup with timeout
    setTimeout(() => {
      try {
        // Simüle edilmiş token
        const simulatedToken =
          'simulated_social_token_' + Math.random().toString(36).substring(2, 15);

        // Token'ı localStorage'a kaydet
        localStorage.setItem('token', simulatedToken);

        // Auth state event yayınla
        const authEvent = new CustomEvent('authStateChanged', {
          detail: { isAuthenticated: true },
        });
        window.dispatchEvent(authEvent);
        console.log('Auth state event yayınlandı');

        console.log("Sosyal kayıt başarılı, token kaydedildi, dashboard'a yönlendiriliyor...");

        window.location.href = '/dashboard-demo'; // URL'yi doğrudan değiştir
      } catch (error) {
        console.error('Sosyal kayıt hatası:', error);
        setSignupError('Sosyal kayıt işlemi başarısız oldu. Lütfen tekrar deneyin.');
        setIsLoading(false);
      }
    }, 1000);
  };

  const benefitsList = [
    'Sınırsız dosya depolama',
    'Akıllı dosya organizasyonu',
    'Her cihazda senkronizasyon',
    'Gelişmiş güvenlik özellikleri',
  ];

  return (
    <div className="signin-container">
      <div className="signin-header">
        <button className="back-to-home" onClick={() => navigate('/')} aria-label="Ana sayfaya dön">
          <i className="fas fa-arrow-left"></i> Ana Sayfaya Dön
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
            <FormInput
              label="Ad Soyad"
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required={true}
              placeholder="Adınızı ve soyadınızı girin"
              autoComplete="name"
              icon="fas fa-user"
            />

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
              <PasswordStrengthMeter
                score={passwordStrength.score}
                message={passwordStrength.message}
              />
              <small className="password-hint">
                <i className="fas fa-info-circle"></i> En az 8 karakter, büyük-küçük harf, rakam ve
                özel karakter içermeli
              </small>
            </div>

            <FormInput
              label="Şifre Tekrar"
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required={true}
              placeholder="Şifrenizi tekrar girin"
              autoComplete="new-password"
              icon="fas fa-lock"
              errorMessage={
                formData.password &&
                formData.confirmPassword &&
                formData.password !== formData.confirmPassword
                  ? 'Şifreler eşleşmiyor'
                  : ''
              }
            />

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
                'Kayıt Ol'
              )}
            </button>
          </form>

          <div className="signin-divider">veya</div>

          <SocialLoginButtons
            onSocialLogin={handleSocialSignIn}
            isSignUp={true}
            isLoading={isLoading}
          />

          <BenefitsList
            title="Kayıt Olun ve Hemen Başlayın"
            benefits={benefitsList}
            className="benefits-container"
          />

          <div className="legal-info">
            Kayıt olarak <a href="#">Kullanım Şartları</a> ve <a href="#">Gizlilik Politikası</a>'nı
            kabul etmiş olursunuz.
          </div>

          <div className="signin-footer">
            <p>
              Zaten bir hesabınız var mı?{' '}
              <a href="#" onClick={() => navigate('/login')}>
                Giriş Yap
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
