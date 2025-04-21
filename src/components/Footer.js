import React from "react";
import "../CSS/Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-info">
          <h4>Cloud Ease</h4>
          <p>Bulut bilişim dünyasında güvenilir çözüm ortağınız. Kurumsal ve bireysel ihtiyaçlarınız için modern bulut hizmetleri.</p>
          <div className="social-links">
            <a href="#" className="social-link">f</a>
            <a href="#" className="social-link">t</a>
            <a href="#" className="social-link">in</a>
            <a href="#" className="social-link">ig</a>
          </div>
        </div>
        <div className="footer-links">
          <div className="footer-links-column">
            <h4>Ürünler</h4>
            <ul>
              <li><a href="#">Bulut Depolama</a></li>
              <li><a href="#">Yedekleme</a></li>
              <li><a href="#">Senkronizasyon</a></li>
              <li><a href="#">Güvenlik</a></li>
            </ul>
          </div>
          <div className="footer-links-column">
            <h4>Şirket</h4>
            <ul>
              <li><a href="#">Hakkımızda</a></li>
              <li><a href="#">Kariyer</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">İletişim</a></li>
            </ul>
          </div>
          <div className="footer-links-column">
            <h4>Destek</h4>
            <ul>
              <li><a href="#">Yardım Merkezi</a></li>
              <li><a href="#">Sık Sorulan Sorular</a></li>
              <li><a href="#">Gizlilik Politikası</a></li>
              <li><a href="#">Kullanım Şartları</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Cloud Ease. Tüm hakları saklıdır.</p>
      </div>
    </footer>
  );
}

export default Footer; 