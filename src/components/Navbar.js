import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../CSS/Navbar.css';
import { logout } from '../firebase';

function Navbar({ showAuthButtons = true, showHomeButton = false }) {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Sayfa yüklendiğinde ve değişikliklerde token kontrolü yapılıyor
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
    };

    // Sayfa yüklendiğinde ve her render'da kontrol et
    checkAuthStatus();

    // Custom auth event'i dinle
    const handleAuthEvent = (event) => {
      setIsLoggedIn(event.detail.isAuthenticated);
    };
    window.addEventListener('authStateChanged', handleAuthEvent);

    // Storage değişikliklerini dinle (farklı pencereler için)
    window.addEventListener('storage', checkAuthStatus);

    // Token değişikliklerini düzenli olarak kontrol et
    const tokenCheckInterval = setInterval(checkAuthStatus, 5000); // 5 saniyede bir

    return () => {
      window.removeEventListener('storage', checkAuthStatus);
      window.removeEventListener('authStateChanged', handleAuthEvent);
      clearInterval(tokenCheckInterval);
    };
  }, []);

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleSignUpClick = () => {
    navigate('/signin');
  };

  const handleLogoClick = () => {
    if (isLoggedIn) {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleLogoutClick = async () => {
    try {
      // Firebase çıkış işlemi
      await logout();

      // Token'ı localStorage'dan manuel olarak temizleyelim (emin olmak için)
      localStorage.removeItem('token');

      // Kullanıcı çıkış durumunu güncelle
      setIsLoggedIn(false);

      // Auth state event yayınla (diğer bileşenleri haberdar etmek için)
      const authEvent = new CustomEvent('authStateChanged', {
        detail: { isAuthenticated: false },
      });
      window.dispatchEvent(authEvent);

      // Giriş sayfasına yönlendir
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);

      // Hata olsa bile token'ı temizle ve giriş sayfasına yönlendir
      localStorage.removeItem('token');
      setIsLoggedIn(false);

      // Auth state event yayınla (diğer bileşenleri haberdar etmek için)
      const authEvent = new CustomEvent('authStateChanged', {
        detail: { isAuthenticated: false },
      });
      window.dispatchEvent(authEvent);

      navigate('/login');
    }
  };

  return (
    <nav className="navbar">
      <div className="logo" onClick={handleLogoClick} role="button" tabIndex={0}>
        <span className="cloud-icon"></span> Cloud Ease
      </div>
      {showAuthButtons && (
        <div className="auth-buttons">
          {isLoggedIn ? (
            <>
              <button className="profile-btn" onClick={handleProfileClick} type="button">
                Profil
              </button>
              <button className="logout-btn" onClick={handleLogoutClick} type="button">
                Çıkış Yap
              </button>
            </>
          ) : (
            <>
              <button className="login-btn" onClick={handleLoginClick} type="button">
                Giriş Yap
              </button>
              <button className="register-btn" onClick={handleSignUpClick} type="button">
                Kayıt Ol
              </button>
            </>
          )}
        </div>
      )}
      {showHomeButton && (
        <div className="auth-buttons">
          <button className="home-btn" onClick={handleHomeClick} type="button">
            Anasayfaya Dön
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
