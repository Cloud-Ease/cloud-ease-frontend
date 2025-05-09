import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import '../../CSS/Dashboard/FileCard.css';

// .NET API entegrasyon noktaları
// const API_BASE_URL = 'https://api.example.com/api';
// const FILE_ENDPOINT = `${API_BASE_URL}/files`;
// const DOWNLOAD_ENDPOINT = `${API_BASE_URL}/files/download`;
// const DELETE_ENDPOINT = `${API_BASE_URL}/files/delete`;
// const STAR_ENDPOINT = `${API_BASE_URL}/files/star`;

function FileCard({ file, onDelete, onStar }) {
  const [showOptions, setShowOptions] = useState(false);

  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  const handleDownload = () => {
    // .NET backend'den dosya indirme
    // async function downloadFile() {
    //   try {
    //     const token = localStorage.getItem('authToken');
    //     // İndirme isteği gönder
    //     const response = await fetch(`${DOWNLOAD_ENDPOINT}/${file.id}`, {
    //       headers: {
    //         'Authorization': `Bearer ${token}`
    //       }
    //     });
    //
    //     if (!response.ok) {
    //       throw new Error('Dosya indirilemedi');
    //     }
    //
    //     // Dosyayı blob olarak al
    //     const blob = await response.blob();
    //
    //     // İndirme linkini oluştur
    //     const url = window.URL.createObjectURL(blob);
    //     const a = document.createElement('a');
    //     a.href = url;
    //     a.download = file.name;
    //     document.body.appendChild(a);
    //     a.click();
    //
    //     // Temizlik yap
    //     window.URL.revokeObjectURL(url);
    //     document.body.removeChild(a);
    //   } catch (error) {
    //     console.error('Dosya indirme hatası:', error);
    //     alert(`Dosya indirilemedi: ${error.message}`);
    //   }
    // }
    //
    // downloadFile();

    // Geçici olarak sadece bildirim gösterelim
    alert(`${file.name} dosyası indirilecek`);
  };

  const handleDelete = () => {
    // .NET backend'den dosya silme
    // async function deleteFile() {
    //   try {
    //     const token = localStorage.getItem('authToken');
    //     const response = await fetch(`${DELETE_ENDPOINT}/${file.id}`, {
    //       method: 'DELETE',
    //       headers: {
    //         'Authorization': `Bearer ${token}`
    //       }
    //     });
    //
    //     if (!response.ok) {
    //       throw new Error('Dosya silinemedi');
    //     }
    //
    //     // Silme işlemi başarılı, UI'ı güncelle
    //     onDelete(file.id);
    //   } catch (error) {
    //     console.error('Dosya silme hatası:', error);
    //     alert(`Dosya silinemedi: ${error.message}`);
    //   }
    // }
    //
    // // Silme işlemi için onay iste
    // if (window.confirm(`${file.name} dosyasını silmek istediğinize emin misiniz?`)) {
    //   deleteFile();
    // }

    // Geçici olarak sadece callback çağıralım
    if (window.confirm(`${file.name} dosyasını silmek istediğinize emin misiniz?`)) {
      onDelete(file.id);
    }
  };

  const handleStar = () => {
    // .NET backend'de dosya yıldızlama/işaretleme
    // async function toggleStar() {
    //   try {
    //     const token = localStorage.getItem('authToken');
    //     const response = await fetch(`${STAR_ENDPOINT}/${file.id}`, {
    //       method: 'POST',
    //       headers: {
    //         'Authorization': `Bearer ${token}`,
    //         'Content-Type': 'application/json'
    //       },
    //       body: JSON.stringify({
    //         isStarred: !file.isStarred
    //       })
    //     });
    //
    //     if (!response.ok) {
    //       throw new Error('Dosya işaretlenemedi');
    //     }
    //
    //     // İşlem başarılı, UI'ı güncelle
    //     onStar(file.id);
    //   } catch (error) {
    //     console.error('Dosya işaretleme hatası:', error);
    //     alert(`Dosya işaretlenemedi: ${error.message}`);
    //   }
    // }
    //
    // toggleStar();

    // Geçici olarak sadece callback çağıralım
    onStar(file.id);
  };

  // Dosya tipi simgeleri (ikon)
  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'image':
        return <i className="fas fa-file-image"></i>;
      case 'document':
        return <i className="fas fa-file-word"></i>;
      case 'pdf':
        return <i className="fas fa-file-pdf"></i>;
      case 'spreadsheet':
        return <i className="fas fa-file-excel"></i>;
      case 'audio':
        return <i className="fas fa-file-audio"></i>;
      case 'video':
        return <i className="fas fa-file-video"></i>;
      default:
        return <i className="fas fa-file"></i>;
    }
  };

  // Dosya boyutu formatlama
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Tarih formatlama
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true, locale: tr });
  };

  return (
    <div className="file-card">
      <div className="file-card-header">
        <div className="file-icon">{getFileIcon(file.type)}</div>
        <div className="file-options">
          <button
            className={`star-button ${file.isStarred ? 'starred' : ''}`}
            onClick={handleStar}
            title={file.isStarred ? 'İşareti kaldır' : 'İşaretle'}
          >
            <i className={`fas ${file.isStarred ? 'fa-star' : 'fa-star'}`}></i>
          </button>
          <button className="options-button" onClick={toggleOptions}>
            <i className="fas fa-ellipsis-v"></i>
          </button>
          {showOptions && (
            <div className="options-dropdown">
              <button onClick={handleDownload}>
                <i className="fas fa-download"></i> İndir
              </button>
              <button onClick={handleDelete} className="delete-option">
                <i className="fas fa-trash-alt"></i> Sil
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="file-info">
        <h3 className="file-name">{file.name}</h3>
        <div className="file-details">
          <span className="file-size">{formatFileSize(file.size)}</span>
          <span className="file-date">{formatDate(file.uploadDate)}</span>
        </div>
      </div>
    </div>
  );
}

export default FileCard;
