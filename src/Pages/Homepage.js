import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../CSS/Homepage.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BenefitsList from '../components/BenefitsList';

function Homepage() {
  const navigate = useNavigate();

  const handleSignUpClick = () => {
    console.log('Sign up button clicked, navigating to /signin');
    navigate('/signin');
  };

  const storageFeatures = [
    'Veri Depolama - Güvenli ve hızlı bulut depolama hizmetleriyle verilerinize her an, her yerden erişim sağlayın.',
    'Güvenlik - En son teknolojilerle korunan verileriniz, güçlü şifreleme sistemlerimizle her zaman güvende.',
    'Hız - Yüksek performanslı sunucularımız sayesinde verilerinize hızlı erişim ve kesintisiz hizmet.',
  ];

  const storageCategories = [
    'Fotoğraflar - Özel anlarınızı tarih, konum ve yüz tanıma özellikleriyle düzenleyin, albümler oluşturun.',
    'Videolar - Yüksek kalitede video dosyalarınızı saklayın, anında paylaşın ve çevrimiçi izleyin.',
    'Dökümanlar - İş veya eğitim dosyalarınızı düzenleyin, taramalar yapın ve içeriğe göre sınıflandırın.',
    'Müzik - Müzik koleksiyonunuzu sanatçı, albüm veya tür bazında düzenleyin ve her yerden erişin.',
  ];

  return (
    <div className="home-container">
      <header className="header">
        <Navbar />
        <div className="hero">
          <h1>Bulut Çözümlerinde Yeni Nesil Platform</h1>
          <p>
            Cloud Ease ile verilerinizi güvenle saklayın, işlerinizi kolayca yönetin ve bulut
            bilişimin tüm avantajlarından yararlanın.
          </p>
          <button className="hero-btn" onClick={handleSignUpClick} type="button">
            HEMEN BAŞLA
          </button>
        </div>
      </header>
      <main className="content">
        <div className="welcome-card">
          <h2>Cloud Ease'e Hoş Geldiniz</h2>
          <p>
            Kurumsal ve bireysel bulut bilişim çözümleriyle işlerinizi kolaylaştırıyoruz. Modern ve
            güvenli altyapımızla verileriniz 7/24 güvende.
          </p>

          <div className="features">
            <div className="feature">
              <div className="feature-icon">☁️</div>
              <h3>Veri Depolama</h3>
              <p>
                Güvenli ve hızlı bulut depolama hizmetleriyle verilerinize her an, her yerden erişim
                sağlayın.
              </p>
            </div>
            <div className="feature">
              <div className="feature-icon">🔒</div>
              <h3>Güvenlik</h3>
              <p>
                En son teknolojilerle korunan verileriniz, güçlü şifreleme sistemlerimizle her zaman
                güvende.
              </p>
            </div>
            <div className="feature">
              <div className="feature-icon">⚡</div>
              <h3>Hız</h3>
              <p>
                Yüksek performanslı sunucularımız sayesinde verilerinize hızlı erişim ve kesintisiz
                hizmet.
              </p>
            </div>
          </div>

          <div className="project-description">
            <h3>Dosyalarınız İçin Akıllı Depolama Çözümü</h3>
            <p className="project-text">
              Cloud Ease, tüm dijital dosyalarınızı kategorilerine göre düzenleyip depolamanızı
              sağlayan tamamen ücretsiz bir bulut depolama platformudur. Fotoğraflarınız,
              videolarınız, belgeleriniz ve diğer tüm dosyalarınız için akıllı kategorilendirme
              sistemimiz sayesinde verilerinize hızlıca erişebilirsiniz.
            </p>

            <div className="storage-categories">
              <div className="category-item">
                <div className="category-icon">📷</div>
                <h4>Fotoğraflar</h4>
                <p>
                  Özel anlarınızı tarih, konum ve yüz tanıma özellikleriyle düzenleyin, albümler
                  oluşturun.
                </p>
              </div>
              <div className="category-item">
                <div className="category-icon">🎬</div>
                <h4>Videolar</h4>
                <p>
                  Yüksek kalitede video dosyalarınızı saklayın, anında paylaşın ve çevrimiçi
                  izleyin.
                </p>
              </div>
              <div className="category-item">
                <div className="category-icon">📄</div>
                <h4>Dökümanlar</h4>
                <p>
                  İş veya eğitim dosyalarınızı düzenleyin, taramalar yapın ve içeriğe göre
                  sınıflandırın.
                </p>
              </div>
              <div className="category-item">
                <div className="category-icon">🎵</div>
                <h4>Müzik</h4>
                <p>
                  Müzik koleksiyonunuzu sanatçı, albüm veya tür bazında düzenleyin ve her yerden
                  erişin.
                </p>
              </div>
            </div>

            <div className="security-info">
              <h3>Verileriniz Güvende</h3>
              <p>
                Cloud Ease, dosyalarınızı uçtan uca şifreleme teknolojisiyle korur. Verileriniz hem
                iletim sırasında hem de depolama sürecinde en gelişmiş güvenlik protokolleriyle
                korunur. İki faktörlü kimlik doğrulama, güvenli sunucu altyapısı ve düzenli güvenlik
                denetimleriyle verileriniz sadece sizin kontrolünüzde kalır.
              </p>
              <p className="pricing-highlight">
                <strong>Tamamen Ücretsiz:</strong> Cloud Ease'in tüm özellikleri herkes için
                ücretsizdir. Gizli ücretler, premium planlar veya kota sınırlamaları yoktur.
                Verilerinizi istediğiniz kadar depolayın.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Homepage;
