import React, { useState, useEffect } from 'react';
import FileCard from './FileCard';
import '../../CSS/Dashboard/FilesSection.css';

// .NET API entegrasyon noktaları
const API_BASE_URL = 'https://localhost:5001/api';
const FILES_ENDPOINT = `${API_BASE_URL}/file`;
// const SEARCH_ENDPOINT = `${API_BASE_URL}/files/search`;
// const FILTER_ENDPOINT = `${API_BASE_URL}/files/filter`;

function FilesSection() {
  const [files, setFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [loading, setLoading] = useState(true);

  // Dosyaları .NET backend'den yükleme
  useEffect(() => {
    async function fetchFiles() {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken'); // Firebase veya başka token

        const params = new URLSearchParams();

        if (filterCategory !== 'all') {
          params.append('category', filterCategory);
        }

        if (searchTerm) {
          params.append('search', searchTerm);
        }

        params.append('sortBy', sortBy);

        let endpoint = FILES_ENDPOINT;
        if (params.toString()) {
          endpoint += `?${params.toString()}`;
        }

        const response = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Dosyalar yüklenemedi');
        }

        const data = await response.json();
        setFiles(data); // API'den gelen JSON dizisi
      } catch (error) {
        console.error('Dosya yükleme hatası:', error);
        setFiles([]);
      } finally {
        setLoading(false);
      }
    }

    fetchFiles();
    // Geçici olarak örnek veri göster
    // Bu kısım backend entegrasyonu tamamlandığında kaldırılacak
    setTimeout(() => {
      const dummyFiles = [
        {
          id: '1',
          name: 'proje-sunum.pdf',
          type: 'pdf',
          size: 2500000,
          uploadDate: '2023-06-15T10:30:00',
          isStarred: true,
          category: 'document',
        },
        {
          id: '2',
          name: 'profil-fotoğrafı.jpg',
          type: 'image',
          size: 1200000,
          uploadDate: '2023-07-20T14:45:00',
          isStarred: false,
          category: 'image',
        },
        {
          id: '3',
          name: 'finansal-rapor-2023.xlsx',
          type: 'spreadsheet',
          size: 4500000,
          uploadDate: '2023-08-05T09:15:00',
          isStarred: true,
          category: 'document',
        },
        {
          id: '4',
          name: 'toplantı-kaydı.mp3',
          type: 'audio',
          size: 8700000,
          uploadDate: '2023-08-10T16:20:00',
          isStarred: false,
          category: 'media',
        },
        {
          id: '5',
          name: 'ürün-tanıtım.mp4',
          type: 'video',
          size: 15000000,
          uploadDate: '2023-08-12T11:10:00',
          isStarred: false,
          category: 'media',
        },
      ];

      // Arama filtrelemesi uygula
      let filteredFiles = dummyFiles;

      if (searchTerm) {
        filteredFiles = filteredFiles.filter((file) =>
          file.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Kategori filtrelemesi uygula
      if (filterCategory !== 'all') {
        filteredFiles = filteredFiles.filter((file) => file.category === filterCategory);
      }

      // Sıralama uygula
      filteredFiles.sort((a, b) => {
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        } else if (sortBy === 'date') {
          return new Date(b.uploadDate) - new Date(a.uploadDate);
        } else if (sortBy === 'size') {
          return b.size - a.size;
        }
        return 0;
      });

      setFiles(filteredFiles);
      setLoading(false);
    }, 1000); // 1 saniye simüle edilmiş yükleme süresi
  }, [searchTerm, filterCategory, sortBy]);

  const handleDelete = (fileId) => {
    // Dosyayı listeden kaldır
    setFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId));
    // Not: Gerçek backend entegrasyonunda, dosya silme API çağrısı FileCard bileşeni içinde gerçekleştirilecek
  };

  const handleStar = (fileId) => {
    // Dosyanın yıldız durumunu güncelle
    setFiles((prevFiles) =>
      prevFiles.map((file) => (file.id === fileId ? { ...file, isStarred: !file.isStarred } : file))
    );
    // Not: Gerçek backend entegrasyonunda, yıldız güncelleme API çağrısı FileCard bileşeni içinde gerçekleştirilecek
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryFilter = (e) => {
    setFilterCategory(e.target.value);
  };

  const handleSort = (e) => {
    setSortBy(e.target.value);
  };

  // Dosya arama işlevi
  // const searchFiles = async (term) => {
  //   if (!term) {
  //     // Arama terimi yoksa tüm dosyaları göster
  //     fetchFiles();
  //     return;
  //   }
  //
  //   try {
  //     setLoading(true);
  //     const token = localStorage.getItem('authToken');
  //
  //     const response = await fetch(`${SEARCH_ENDPOINT}?query=${encodeURIComponent(term)}`, {
  //       headers: {
  //         'Authorization': `Bearer ${token}`
  //       }
  //     });
  //
  //     if (!response.ok) {
  //       throw new Error('Arama yapılamadı');
  //     }
  //
  //     const data = await response.json();
  //     setFiles(data);
  //   } catch (error) {
  //     console.error('Arama hatası:', error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <div className="files-section">
      <div className="files-header">
        <h2>Dosyalarım</h2>

        <div className="files-controls">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Dosya ara..."
              value={searchTerm}
              onChange={handleSearch}
            />
            <i className="fas fa-search"></i>
          </div>

          <div className="filter-controls">
            <select
              value={filterCategory}
              onChange={handleCategoryFilter}
              className="category-filter"
            >
              <option value="all">Tüm Kategoriler</option>
              <option value="document">Dokümanlar</option>
              <option value="image">Resimler</option>
              <option value="media">Medya</option>
            </select>

            <select value={sortBy} onChange={handleSort} className="sort-by">
              <option value="name">İsme Göre</option>
              <option value="date">Tarihe Göre</option>
              <option value="size">Boyuta Göre</option>
            </select>
          </div>
        </div>
      </div>

      <div className="files-grid">
        {loading ? (
          <div className="loading-indicator">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Dosyalar yükleniyor...</p>
          </div>
        ) : files.length > 0 ? (
          files.map((file) => (
            <FileCard key={file.id} file={file} onDelete={handleDelete} onStar={handleStar} />
          ))
        ) : (
          <div className="no-files-message">
            <i className="fas fa-folder-open"></i>
            <p>Dosya bulunamadı</p>
            <p className="no-files-hint">
              {searchTerm || filterCategory !== 'all'
                ? 'Arama kriterlerinizi değiştirmeyi deneyin'
                : 'Dosyalarınızı burada görüntülemek için yükleyin'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default FilesSection;
