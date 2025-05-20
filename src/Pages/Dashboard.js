import axios from 'axios';
import { useEffect, useState } from 'react';
import '../CSS/Dashboard/Dashboard.css';
import DashboardHeader from '../components/Dashboard/DashboardHeader';
import FileList from '../components/Dashboard/FileList';

// .NET Backend API entegrasyonu için gerekli URL'ler
// const API_BASE_URL = 'https://api.example.com/api'; // .NET backend API URL
// const FILES_ENDPOINT = `${API_BASE_URL}/files`; // Dosyaları getiren endpoint
// const CATEGORIES_ENDPOINT = `${API_BASE_URL}/categories`; // Kategorileri getiren endpoint

// Dosya uzantısına göre dosya tipini belirle
function getFileTypeFromFileName(fileName) {
  const ext = fileName.split('.').pop().toLowerCase();

  // Resim dosyaları
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico', 'tiff'].includes(ext)) {
    return 'photos';
  }

  // Doküman dosyaları
  if (
    ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'rtf', 'odt'].includes(ext)
  ) {
    return 'documents';
  }

  // Müzik dosyaları
  if (['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a', 'wma'].includes(ext)) {
    return 'music';
  }

  // Video dosyaları
  if (['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', 'mpeg'].includes(ext)) {
    return 'videos';
  }

  // Diğer dosya tipleri
  return 'other';
}

function Dashboard() {
  // Sayfalandırma ve filtreleme durumları
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const filesPerPage = 8;

  // Arama işlemi yapıldığında console'a yazarak debug yapalım
  useEffect(() => {
    // Loglar silindi
  }, [searchQuery]);

  // Dosya yükleme işlemini yönet
  const handleFileUpload = async (file) => {
    try {
      setLoading(true);
      // Form verisi oluştur
      const formData = new FormData();
      formData.append('file', file);

      // Dosya tipini belirle ve form verisine ekle
      const fileType = getFileTypeFromFileName(file.name);
      formData.append('fileType', fileType);

      // Kullanıcı jetonu (token) ile birlikte dosyayı gönder
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5212/api/File/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      // FileList bileşeninin dosyaları yeniden yüklemesini sağlayacak bir olay tetikle
      const fileUploadEvent = new CustomEvent('fileUploaded');
      window.dispatchEvent(fileUploadEvent);

      setLoading(false);

      return {
        id: response.data.id,
        fileName: file.name,
      };
    } catch (error) {
      console.error('Dosya yükleme hatası:', error);
      setLoading(false);
      throw error;
    }
  };

  // Dosya silme işlemini yönet
  const handleFileDelete = (fileId) => {
    // Bu fonksiyon artık kullanılmıyor, FileList bileşeni kendi içinde silme işlemini gerçekleştiriyor
    return true;
  };

  // Sayfa değiştirme işleyicisi
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Sayfa değiştiğinde sayfanın üstüne kaydır
    window.scrollTo(0, 0);
  };

  // Kategori değişikliği işleyicisi
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Kategori değiştiğinde ilk sayfaya dön
  };

  // Arama işleyicisi
  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1); // Arama yapıldığında ilk sayfaya dön
  };

  return (
    <div className="dashboard-container">
      <DashboardHeader
        onCategoryChange={handleCategoryChange}
        onSearch={handleSearch}
        onFileUpload={handleFileUpload}
      />
      <main className="dashboard-content">
        <FileList
          loading={loading}
          currentPage={currentPage}
          totalPages={1} // API'den gelen sayfalama bilgisine göre güncellenecek
          onPageChange={handlePageChange}
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
        />
      </main>
    </div>
  );
}

export default Dashboard;
