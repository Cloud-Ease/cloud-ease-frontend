import '../CSS/SocialLoginButtons.css';

function SocialLoginButtons({ onSocialLogin, isSignUp = false, isLoading = false }) {
  const buttonText = isSignUp ? 'Kayıt Ol' : 'Giriş Yap';

  // Use the same CSS class for both login and signup to ensure consistency
  const containerClass = 'social-signin';
  const buttonClass = 'social-signin-btn';

  return (
    <div className={containerClass}>
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
