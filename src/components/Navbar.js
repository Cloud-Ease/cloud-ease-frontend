import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../CSS/Navbar.css';
import { logout } from '../firebase';

function Navbar({ showAuthButtons = true }) {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Sayfa yüklendiğinde ve değişikliklerde token kontrolü yapılıyor
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
      console.log('Navbar auth status checked:', !!token ? 'Logged in' : 'Not logged in');
    };

    // Sayfa yüklendiğinde ve her render'da kontrol et
    checkAuthStatus();

    // Custom auth event'i dinle
    const handleAuthEvent = (event) => {
      console.log('Navbar received auth event:', event.detail);
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
    console.log('Login button clicked, navigating to /login');
    navigate('/login');
  };

  const handleSignUpClick = () => {
    console.log('Sign up button clicked, navigating to /signin');
    navigate('/signin');
  };

  const handleLogoClick = () => {
    if (isLoggedIn) {
      console.log('Logo clicked, user is logged in, navigating to /dashboard-demo');
      navigate('/dashboard-demo');
    } else {
      console.log('Logo clicked, navigating to /');
      navigate('/');
    }
  };

  const handleProfileClick = () => {
    console.log('Profile button clicked, navigating to /profile');
    navigate('/profile');
  };

  const handleLogoutClick = async () => {
    console.log('Logout button clicked');
    try {
      // Firebase çıkış işlemi
      const success = await logout();
      console.log('Firebase logout result:', success ? 'Success' : 'Failed');

      // Token'ı localStorage'dan manuel olarak temizleyelim (emin olmak için)
      localStorage.removeItem('token');
      console.log('Token removed from localStorage');

      // Kullanıcı çıkış durumunu güncelle
      setIsLoggedIn(false);

      // Auth state event yayınla (diğer bileşenleri haberdar etmek için)
      const authEvent = new CustomEvent('authStateChanged', {
        detail: { isAuthenticated: false },
      });
      window.dispatchEvent(authEvent);
      console.log('Auth state change event dispatched');

      // Giriş sayfasına yönlendir
      navigate('/login');
      console.log('Navigated to login page');
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
        Cloud Ease
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
    </nav>
  );
}

export default Navbar;
