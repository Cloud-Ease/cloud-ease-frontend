import { getAuth } from 'firebase/auth';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../CSS/Dashboard/DashboardHeader.css';
import { logout } from '../../firebase'; // Firebase logout fonksiyonunu import et

// .NET API entegrasyon noktaları
// const API_BASE_URL = 'https://api.example.com/api';
// const UPLOAD_ENDPOINT = `${API_BASE_URL}/files/upload`;
// const USER_ENDPOINT = `${API_BASE_URL}/users/profile`;
// const LOGOUT_ENDPOINT = `${API_BASE_URL}/auth/logout`;
// const CATEGORIES_ENDPOINT = `${API_BASE_URL}/categories`;

function DashboardHeader({
  onCategoryChange,
  onSearch,
  onFileUpload,
  showCategories = true,
  isProfilePage = false,
}) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  // .NET backend'den kategorileri çekme
  // const [categories, setCategories] = useState([]);
  // useEffect(() => {
  //   async function fetchCategories() {
  //     try {
  //       const response = await fetch(CATEGORIES_ENDPOINT);
  //       if (!response.ok) {
  //         throw new Error('API yanıt vermedi');
  //       }
  //       const data = await response.json();
  //       // API'den gelen kategorileri burada işleyelim
  //       // Her zaman 'all' kategorisini de ekleyelim
  //       setCategories([
  //         { id: 'all', name: 'Tümü' },
  //         ...data.map(category => ({
  //           id: category.id,
  //           name: category.name
  //         }))
  //       ]);
  //     } catch (error) {
  //       console.error('Kategoriler yüklenirken hata oluştu:', error);
  //       // Hata durumunda varsayılan kategorileri kullanalım
  //       setCategories([
  //         { id: 'all', name: 'Tümü' },
  //         { id: 'photos', name: 'Fotoğraflar' },
  //         { id: 'documents', name: 'Dökümanlar' },
  //         { id: 'music', name: 'Müzik' },
  //         { id: 'videos', name: 'Videolar' },
  //         { id: 'other', name: 'Diğer' }
  //       ]);
  //     }
  //   }
  //   fetchCategories();
  // }, []);

  // Geçici olarak statik kategori listesi kullanacağız
  const categories = [
    { id: 'all', name: 'Tümü' },
    { id: 'photos', name: 'Fotoğraflar' },
    { id: 'documents', name: 'Dökümanlar' },
    { id: 'music', name: 'Müzik' },
    { id: 'videos', name: 'Videolar' },
    { id: 'other', name: 'Diğer' },
  ];

  // Firebase'den kullanıcı bilgilerini al
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      // Kullanıcı bilgilerini state'e kaydet
      setUserInfo({
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        uid: user.uid,
      });

      // Kullanıcı adından initials oluştur
      const names = (user.displayName || '').split(' ');
      const initials =
        names.length > 0
          ? names
              .map((name) => name.charAt(0))
              .join('')
              .toUpperCase()
              .substring(0, 2)
          : 'KK';

      setUserInfo((prev) => ({
        ...prev,
        initials,
      }));
    }
  }, []);

  const handleCategoryClick = (categoryId) => {
    setActiveCategory(categoryId);
    onCategoryChange(categoryId);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleLogout = async () => {
    console.log('Dashboard header: logout butonu tıklandı');

    try {
      // Firebase logout fonksiyonunu çağır
      const success = await logout();
      console.log('Firebase logout sonucu:', success ? 'Başarılı' : 'Başarısız');

      // Token'ı manuel olarak temizle
      localStorage.removeItem('token');
      console.log("Token localStorage'dan temizlendi");

      // Login sayfasına yönlendir
      navigate('/login');
    } catch (error) {
      console.error('Çıkış yapma hatası:', error);

      // Hata olsa bile token'ı temizle ve login sayfasına yönlendir
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  const handleUserMenuToggle = () => {
    setShowUserDropdown(!showUserDropdown);
  };

  const handleFileUploadClick = () => {
    // Dosya seçiciyi açar
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setIsUploading(true);

      try {
        // Dosyayı Dashboard bileşenine gönder
        await onFileUpload(selectedFile);

        // Yükleme tamamlandı
        setIsUploading(false);

        // Input'u sıfırla
        e.target.value = null;
      } catch (error) {
        console.error('Dosya yükleme hatası:', error);
        setIsUploading(false);
        e.target.value = null;
      }
    }
  };

  // .NET backend'den kullanıcı bilgilerini alma
  // const [userInfo, setUserInfo] = useState(null);
  // useEffect(() => {
  //   async function fetchUserInfo() {
  //     try {
  //       const token = localStorage.getItem('authToken');
  //       const response = await fetch(USER_ENDPOINT, {
  //         headers: {
  //           'Authorization': `Bearer ${token}`
  //         }
  //       });
  //
  //       if (!response.ok) {
  //         throw new Error('Kullanıcı bilgileri alınamadı');
  //       }
  //
  //       const data = await response.json();
  //       setUserInfo(data);
  //     } catch (error) {
  //       console.error('Kullanıcı bilgileri yüklenirken hata:', error);
  //     }
  //   }
  //
  //   fetchUserInfo();
  // }, []);

  return (
    <header className="dashboard-header">
      <div className="dashboard-header-top">
        <div className="dashboard-logo" onClick={() => navigate('/')}>
          Cloud Ease
        </div>

        <form className="dashboard-search-bar" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder="Dosyalarınızda arayın..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <button type="submit" className="search-btn">
            <i className="fas fa-search"></i>
          </button>
        </form>

        <div className="dashboard-actions">
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          {isProfilePage ? (
            <button className="back-to-dashboard-btn" onClick={() => navigate('/dashboard')}>
              <i className="fas fa-arrow-left"></i> Panele Dön
            </button>
          ) : (
            <button className="upload-btn" onClick={handleFileUploadClick} disabled={isUploading}>
              {isUploading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Yükleniyor...
                </>
              ) : (
                <>
                  <i className="fas fa-upload"></i> Dosya Yükle
                </>
              )}
            </button>
          )}

          <div className="user-menu">
            <div className="user-avatar" onClick={handleUserMenuToggle}>
              {userInfo && userInfo.photoURL ? (
                <img src={userInfo.photoURL} alt={userInfo.displayName || 'User'} />
              ) : (
                <span>{userInfo ? userInfo.initials : 'KK'}</span>
              )}
            </div>
            {showUserDropdown && (
              <div className="user-dropdown">
                <ul>
                  <li>
                    <a onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
                      Profil
                    </a>
                  </li>
                  <li>
                    <button onClick={handleLogout}>Çıkış</button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {showCategories && (
        <nav className="dashboard-categories">
          <ul>
            {categories.map((category) => (
              <li key={category.id}>
                <button
                  className={activeCategory === category.id ? 'active' : ''}
                  onClick={() => handleCategoryClick(category.id)}
                >
                  {category.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}

export default DashboardHeader;
