import React, { useState, useEffect } from 'react';
import '../CSS/Dashboard/Dashboard.css';
import DashboardHeader from '../components/Dashboard/DashboardHeader';
import FileList from '../components/Dashboard/FileList';

// .NET Backend API entegrasyonu için gerekli URL'ler
// const API_BASE_URL = 'https://api.example.com/api'; // .NET backend API URL
// const FILES_ENDPOINT = `${API_BASE_URL}/files`; // Dosyaları getiren endpoint
// const CATEGORIES_ENDPOINT = `${API_BASE_URL}/categories`; // Kategorileri getiren endpoint

function Dashboard() {
  // Sayfalandırma ve filtreleme durumları
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [filteredFiles, setFilteredFiles] = useState([]);
  // API'den gelecek toplam dosya sayısı
  // const [totalFileCount, setTotalFileCount] = useState(0);
  
  const filesPerPage = 8;
  
  // Dosyaları filtrele - kategoriye ve arama sorgusuna göre
  useEffect(() => {
    setLoading(true);
    
    // API isteği burada yapılacak
    // async function fetchFiles() {
    //   try {
    //     // Sayfalama, sıralama ve filtreleme parametreleri
    //     const queryParams = new URLSearchParams({
    //       pageNumber: currentPage,
    //       pageSize: filesPerPage,
    //       category: selectedCategory === 'all' ? '' : selectedCategory,
    //       searchTerm: searchQuery,
    //     });
    //
    //     // .NET backend'e istek
    //     const response = await fetch(`${FILES_ENDPOINT}?${queryParams}`);
    //     
    //     if (!response.ok) {
    //       throw new Error('API yanıt vermedi');
    //     }
    //
    //     const data = await response.json();
    //     
    //     // API'den gelen veriyi state'e atama
    //     setFilteredFiles(data.items);
    //     setTotalFileCount(data.totalCount);
    //     
    //     // Eğer mevcut sayfa toplam sayfadan fazlaysa, ilk sayfaya dön
    //     const maxPage = Math.ceil(data.totalCount / filesPerPage);
    //     if (currentPage > maxPage && maxPage > 0) {
    //       setCurrentPage(1);
    //     }
    //   } catch (error) {
    //     console.error('Dosyalar yüklenirken hata oluştu:', error);
    //     // Hata durumunda kullanıcıya bildirim göster
    //     // alert('Dosyalar yüklenirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.');
    //   } finally {
    //     setLoading(false);
    //   }
    // }
    //
    // fetchFiles();

    // Simülasyon - gerçek uygulamada yukarıdaki fetchFiles fonksiyonu kullanılacak
    setTimeout(() => {
      setFilteredFiles([]);
      setLoading(false);
    }, 600);
    
  }, [selectedCategory, searchQuery, currentPage]);
  
  // Sayfa değiştirme işleyicisi
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Sayfa değiştiğinde sayfanın üstüne kaydır
    window.scrollTo(0, 0);
    
    // Sayfa değiştiğinde API'ye yeni istek atılacak
    // useEffect hook'u içindeki bağımlılık dizisine currentPage eklendiği için
    // sayfa değiştiğinde otomatik olarak yeni istek yapılacak
  };
  
  // Mevcut sayfada gösterilecek dosyaları hesapla
  // .NET backend'de sayfalama yapılacağı için bu hesaplamalar backend'de yapılacak
  // Burada sadece UI için gerekli hesaplamaları yapıyoruz
  const totalPages = Math.ceil(filteredFiles.length / filesPerPage);
  
  // Kategori değişikliği işleyicisi
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Kategori değiştiğinde ilk sayfaya dön
    
    // Kategori değiştiğinde API'ye yeni istek atılacak
    // useEffect hook'u içindeki bağımlılık dizisine selectedCategory eklendiği için
    // kategori değiştiğinde otomatik olarak yeni istek yapılacak
  };
  
  // Arama işleyicisi
  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1); // Arama yapıldığında ilk sayfaya dön
    
    // Arama yapıldığında API'ye yeni istek atılacak
    // useEffect hook'u içindeki bağımlılık dizisine searchQuery eklendiği için
    // arama terimi değiştiğinde otomatik olarak yeni istek yapılacak
  };
  
  return (
    <div className="dashboard-container">
      <DashboardHeader 
        onCategoryChange={handleCategoryChange} 
        onSearch={handleSearch}
      />
      <main className="dashboard-content">
        <FileList 
          files={filteredFiles}
          loading={loading}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </main>
    </div>
  );
}

export default Dashboard; 