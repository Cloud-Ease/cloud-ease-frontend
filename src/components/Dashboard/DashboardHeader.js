import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../CSS/Dashboard/DashboardHeader.css';

// .NET API entegrasyon noktaları
// const API_BASE_URL = 'https://api.example.com/api';
// const UPLOAD_ENDPOINT = `${API_BASE_URL}/files/upload`;
// const USER_ENDPOINT = `${API_BASE_URL}/users/profile`;
// const LOGOUT_ENDPOINT = `${API_BASE_URL}/auth/logout`;
// const CATEGORIES_ENDPOINT = `${API_BASE_URL}/categories`;

function DashboardHeader({ onCategoryChange, onSearch }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const fileInputRef = useRef(null);

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

  const handleLogout = () => {
    // .NET backend'e logout isteği
    // async function logoutUser() {
    //   try {
    //     // Kullanıcı jetonu (token) ile birlikte isteği gönder
    //     const token = localStorage.getItem('authToken');
    //     const response = await fetch(LOGOUT_ENDPOINT, {
    //       method: 'POST',
    //       headers: {
    //         'Authorization': `Bearer ${token}`,
    //         'Content-Type': 'application/json'
    //       }
    //     });
    //
    //     if (!response.ok) {
    //       throw new Error('Çıkış yapılırken bir hata oluştu');
    //     }
    //
    //     // Jetonları ve kullanıcı bilgilerini temizle
    //     localStorage.removeItem('authToken');
    //     localStorage.removeItem('refreshToken');
    //     localStorage.removeItem('userInfo');
    //
    //     // Giriş sayfasına yönlendir
    //     navigate('/login');
    //   } catch (error) {
    //     console.error('Çıkış yapılırken hata:', error);
    //     // Hata durumunda da en azından yerel depolamayı temizle ve giriş sayfasına yönlendir
    //     localStorage.removeItem('authToken');
    //     localStorage.removeItem('refreshToken');
    //     localStorage.removeItem('userInfo');
    //     navigate('/login');
    //   }
    // }
    //
    // logoutUser();

    // Geçici olarak sadece yönlendirme yapacağız
    navigate('/login');
  };

  const handleUserMenuToggle = () => {
    setShowUserDropdown(!showUserDropdown);
  };

  const handleFileUploadClick = () => {
    // Dosya seçiciyi açar
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // .NET backend'e dosya yükleme
      // async function uploadFile(file) {
      //   try {
      //     // Form verisi oluştur
      //     const formData = new FormData();
      //     formData.append('file', file);
      //
      //     // Kullanıcı jetonu (token) ile birlikte dosyayı gönder
      //     const token = localStorage.getItem('authToken');
      //     const response = await fetch(UPLOAD_ENDPOINT, {
      //       method: 'POST',
      //       headers: {
      //         'Authorization': `Bearer ${token}`
      //       },
      //       body: formData
      //     });
      //
      //     if (!response.ok) {
      //       throw new Error('Dosya yüklenirken bir hata oluştu');
      //     }
      //
      //     const result = await response.json();
      //     alert(`Dosya başarıyla yüklendi: ${result.fileName}`);
      //
      //     // Dosya listesini yenilemek için bir callback çağrılabilir
      //     // onFileUploaded();
      //   } catch (error) {
      //     console.error('Dosya yükleme hatası:', error);
      //     alert(`Dosya yüklenirken bir hata oluştu: ${error.message}`);
      //   }
      // }
      //
      // uploadFile(selectedFile);

      // Geçici olarak sadece bildirim gösterelim
      alert(`Dosya seçildi: ${selectedFile.name}`);
      // Formu sıfırla
      e.target.value = null;
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
          <button className="upload-btn" onClick={handleFileUploadClick}>
            <i className="fas fa-upload"></i> Dosya Yükle
          </button>
          <div className="user-menu">
            <div className="user-avatar" onClick={handleUserMenuToggle}>
              {/* Burada kullanıcı avatarı gösterilecek */}
              {/* userInfo && userInfo.avatar ? <img src={userInfo.avatar} alt="User" /> : <span>{userInfo ? userInfo.initials : 'KK'}</span> */}
              <span>KK</span>
            </div>
            {showUserDropdown && (
              <div className="user-dropdown">
                <ul>
                  <li><a onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>Profil</a></li>
                  <li><a href="#settings">Ayarlar</a></li>
                  <li><button onClick={handleLogout}>Çıkış</button></li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

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
    </header>
  );
}

export default DashboardHeader;
