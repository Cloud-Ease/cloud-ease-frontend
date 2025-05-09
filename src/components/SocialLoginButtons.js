import React from 'react';
import '../CSS/SocialLoginButtons.css';

function SocialLoginButtons({ onSocialLogin, isSignUp = false, isLoading = false }) {
  const buttonText = isSignUp ? 'Kayıt Ol' : 'Giriş Yap';
  const buttonClass = isSignUp ? 'social-signin-btn' : 'social-login-btn';

  return (
    <div className={`social-${isSignUp ? 'signin' : 'login'}`}>
      <button
        className={`${buttonClass} google-btn`}
        onClick={() => onSocialLogin('google')}
        disabled={isLoading}
      >
        <i className="fab fa-google"></i>
        <span className="social-text">Google ile {buttonText}</span>
      </button>
      <button
        className={`${buttonClass} facebook-btn`}
        onClick={() => onSocialLogin('facebook')}
        disabled={isLoading}
      >
        <i className="fab fa-facebook-f"></i>
        <span className="social-text">Facebook ile {buttonText}</span>
      </button>
      <button
        className={`${buttonClass} apple-btn`}
        onClick={() => onSocialLogin('apple')}
        disabled={isLoading}
      >
        <i className="fab fa-apple"></i>
        <span className="social-text">Apple ile {buttonText}</span>
      </button>
    </div>
  );
}

export default SocialLoginButtons;
