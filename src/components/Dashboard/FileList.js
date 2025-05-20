import axios from 'axios';
import { useEffect, useState } from 'react';
import '../../CSS/Dashboard/FileList.css';

// contentType'dan fileType elde etme fonksiyonu
function getFileTypeFromContentType(contentType) {
  if (contentType.startsWith('image/')) {
    return 'photos';
  } else if (contentType.startsWith('audio/')) {
    return 'music';
  } else if (contentType.startsWith('video/')) {
    return 'videos';
  } else if (
    contentType.includes('pdf') ||
    contentType.includes('document') ||
    contentType.includes('text/') ||
    contentType.includes('spreadsheet') ||
    contentType.includes('presentation')
  ) {
    return 'documents';
  } else {
    return 'other';
  }
}

// Dosya boyutunu okunabilir formata çevirme
function formatSizeToReadable(bytes) {
  if (bytes === 0 || bytes === undefined) return '0 B';

  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileIcon(type) {
  switch (type) {
    case 'photos':
      return 'far fa-file-image';
    case 'documents':
      return 'far fa-file-alt';
    case 'music':
      return 'far fa-file-audio';
    case 'videos':
      return 'far fa-file-video';
    default:
      return 'far fa-file';
  }
}

function FileList({
  files = [],
  loading,
  currentPage,
  totalPages,
  onPageChange,
  onFileDelete,
  selectedCategory,
  searchQuery,
}) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [sortOrder, setSortOrder] = useState('name-asc');
  const [deletingFiles, setDeletingFiles] = useState([]);
  const [notification, setNotification] = useState(null);
  const [localFiles, setLocalFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Bildirim gösterme fonksiyonu
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });

    // 3 saniye sonra bildirimi kaldır
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Bildirim göründüğünde otomatik olarak kaldırma
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [notification]);

  // API'den dosyaları çek
  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5212/api/File', {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      // API'den gelen dosyalara fileType alanını ekleyelim
      const filesWithType = response.data.map((file) => {
        return {
          ...file,
          fileType: getFileTypeFromContentType(file.contentType),
          // size bilgisi yoksa varsayılan değer ekleyelim
          size: file.size || 0,
        };
      });

      setLocalFiles(filesWithType);
    } catch (error) {
      console.error('Dosyalar alınırken hata oluştu:', error);
      showNotification('Dosyalar yüklenirken bir hata oluştu.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Sayfa yüklendiğinde dosyaları çek
  useEffect(() => {
    fetchFiles();

    // Dosya yükleme olayını dinle
    const handleFileUploaded = () => {
      fetchFiles();
    };

    window.addEventListener('fileUploaded', handleFileUploaded);

    // Temizleme fonksiyonu
    return () => {
      window.removeEventListener('fileUploaded', handleFileUploaded);
    };
  }, []);

  // Arama sorgusu veya kategori değiştiğinde filtreleme yapılması için
  useEffect(() => {
    // Loglar silindi
  }, [searchQuery, selectedCategory]);

  const toggleFileSelection = (fileId) => {
    const fileObj = localFiles.find((file) => file.id === fileId);
    if (!fileObj) return;

    const alreadySelected = selectedFiles.some((f) => f.id === fileId);
    if (alreadySelected) {
      setSelectedFiles(selectedFiles.filter((f) => f.id !== fileId));
    } else {
      setSelectedFiles([...selectedFiles, fileObj]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedFiles.length === localFiles.length && localFiles.length > 0) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles([...localFiles]);
    }
  };

  const handleSortChange = (e) => setSortOrder(e.target.value);

  // API'den filtrelenmiş dosyaları alalım
  const filteredFiles = localFiles.filter((file) => {
    // Kategori filtresi
    const categoryMatch = selectedCategory === 'all' || file.fileType === selectedCategory;

    // Arama filtresi
    const searchMatch =
      !searchQuery || file.fileName.toLowerCase().includes(searchQuery.toLowerCase());

    return categoryMatch && searchMatch;
  });

  // sortedFiles artık filteredFiles'ı sıralasın
  const sortedFiles = [...filteredFiles].sort((a, b) => {
    const [field, order] = sortOrder.split('-');

    if (field === 'name') {
      return order === 'asc'
        ? a.fileName.localeCompare(b.fileName)
        : b.fileName.localeCompare(a.fileName);
    }

    if (field === 'date') {
      const aDate = new Date(a.uploadedAt);
      const bDate = new Date(b.uploadedAt);
      return order === 'asc' ? aDate - bDate : bDate - aDate;
    }

    if (field === 'size') {
      // Extract numeric value from size string
      const aSize = a.size;
      const bSize = b.size;
      return order === 'asc' ? aSize - bSize : bSize - aSize;
    }

    return 0;
  });

  const handleDownloadFile = async (fileId, fileName) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5212/api/File/download/${fileId}`, {
        responseType: 'blob',
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();

      // İndirme başarılı bildirimi
      showNotification(`${fileName} indirildi.`);
    } catch (error) {
      console.error('Dosya indirme hatası:', error);
      showNotification('Dosya indirilemedi.', 'error');
    }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      setDeletingFiles((prev) => [...prev, fileId]);

      // Silinen dosyanın adını sakla
      const fileName = localFiles.find((f) => f.id === fileId)?.fileName || '';

      // Backend'e silme isteği gönder
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5212/api/File/${fileId}`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // UI güncellemesi
      setLocalFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId));
      setDeletingFiles((prev) => prev.filter((id) => id !== fileId));
      setSelectedFiles((prev) => prev.filter((f) => f.id !== fileId));

      // Başarı bildirimi göster
      showNotification(`${fileName} silindi.`);
    } catch (error) {
      console.error('Dosya silme hatası:', error);
      setDeletingFiles((prev) => prev.filter((id) => id !== fileId));
      showNotification('Dosya silinemedi.', 'error');
    }
  };

  const handleBatchDownload = async () => {
    if (selectedFiles.length === 0) {
      return;
    }

    let successCount = 0;
    for (const file of selectedFiles) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5212/api/File/download/${file.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: 'blob',
        });

        const blob = new Blob([response.data]);
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', file.fileName || 'dosya');
        document.body.appendChild(link);
        link.click();
        link.remove();

        window.URL.revokeObjectURL(url);
        successCount++;
      } catch (error) {
        console.error(`Dosya indirilemedi (${file.fileName}):`, error);
      }
    }

    if (successCount > 0) {
      showNotification(`${successCount} dosya indirildi.`);
    } else {
      showNotification('Dosyalar indirilemedi.', 'error');
    }
  };

  const handleBatchDelete = async () => {
    if (selectedFiles.length === 0) {
      return;
    }

    const fileIds = selectedFiles.map((file) => file.id);
    const count = fileIds.length;
    let successCount = 0;

    setDeletingFiles((prev) => [...prev, ...fileIds]);

    for (const id of fileIds) {
      try {
        // Backend'e silme isteği gönder
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5212/api/File/${id}`, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        successCount++;
      } catch (error) {
        console.error(`Dosya silinemedi (ID: ${id}):`, error);
      }
    }

    // Dosyaları yeniden yükle
    fetchFiles();

    // UI güncellemesi
    setDeletingFiles([]);
    setSelectedFiles([]);

    // Başarı bildirimi göster
    if (successCount > 0) {
      showNotification(`${successCount} dosya silindi.`);
    } else {
      showNotification('Dosyalar silinemedi.', 'error');
    }
  };

  return (
    <div className="file-list-container">
      {notification && (
        <div className={`notification-toast ${notification.type}`}>
          {notification.type === 'success' && <i className="fas fa-check-circle"></i>}
          {notification.type === 'error' && <i className="fas fa-exclamation-circle"></i>}
          {notification.message}
        </div>
      )}

      <div className="file-list-header">
        <div className="file-list-actions">
          <div className="select-all">
            <input
              type="checkbox"
              checked={selectedFiles.length === localFiles.length && localFiles.length > 0}
              onChange={toggleSelectAll}
              id="select-all-checkbox"
            />
            <label htmlFor="select-all-checkbox">Tümünü Seç</label>
          </div>
          {selectedFiles.length > 0 && (
            <div className="batch-actions">
              <button className="download-btn" onClick={handleBatchDownload}>
                <i className="fas fa-download"></i> İndir
              </button>
              <button
                className="delete-btn"
                onClick={handleBatchDelete}
                disabled={deletingFiles.length > 0}
              >
                {deletingFiles.length > 0 ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Siliniyor...
                  </>
                ) : (
                  <>
                    <i className="fas fa-trash-alt"></i> Sil
                  </>
                )}
              </button>
            </div>
          )}
        </div>
        <div className="file-sort">
          <label htmlFor="sort-order">Sırala:</label>
          <select id="sort-order" value={sortOrder} onChange={handleSortChange}>
            <option value="name-asc">İsim (A-Z)</option>
            <option value="name-desc">İsim (Z-A)</option>
            <option value="date-desc">En Yeni</option>
            <option value="date-asc">En Eski</option>
            <option value="size-desc">En Büyük</option>
            <option value="size-asc">En Küçük</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="loading-files">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Dosyalar yükleniyor...</p>
        </div>
      ) : localFiles.length === 0 ? (
        <div className="no-files">
          <i className="far fa-folder-open"></i>
          <p>Hiç dosya bulunamadı.</p>
        </div>
      ) : (
        <div className="file-grid">
          {sortedFiles.map((file) => (
            <div
              key={file.id}
              className={`file-item ${
                selectedFiles.some((f) => f.id === file.id) ? 'selected' : ''
              }`}
              onClick={() => toggleFileSelection(file.id)}
            >
              <div className="file-select">
                <input
                  type="checkbox"
                  checked={selectedFiles.some((f) => f.id === file.id)}
                  onChange={() => {}}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className="file-icon">
                <i className={getFileIcon(file.fileType || 'other')}></i>
              </div>
              <div className="file-info">
                <div className="file-name" title={file.fileName}>
                  {file.fileName}
                </div>
                <div className="file-meta">
                  <span className="file-size">{formatSizeToReadable(file.size)}</span>
                  <span className="file-date">
                    {new Date(file.uploadedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="file-actions">
                <button
                  className="file-action-btn"
                  title="İndir"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadFile(file.id, file.fileName);
                  }}
                >
                  <i className="fas fa-download"></i>
                </button>
                <button
                  className="file-action-btn"
                  title="Sil"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteFile(file.id);
                  }}
                  disabled={deletingFiles.includes(file.id)}
                >
                  {deletingFiles.includes(file.id) ? (
                    <i className="fas fa-spinner fa-spin"></i>
                  ) : (
                    <i className="fas fa-trash-alt"></i>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
            <i className="fas fa-chevron-left"></i>
          </button>
          <span className="page-info">
            Sayfa {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      )}
    </div>
  );
}

export default FileList;
