import React, { useState } from 'react';
import '../../CSS/Dashboard/FileList.css';

// Dosya tiplerine göre simge belirlemek için yardımcı fonksiyon
function getFileIcon(type) {
  switch(type) {
    case 'image':
      return 'far fa-file-image';
    case 'document':
      return 'far fa-file-alt';
    case 'audio':
      return 'far fa-file-audio';
    case 'video':
      return 'far fa-file-video';
    default:
      return 'far fa-file';
  }
}

function FileList({ files, loading, currentPage, totalPages, onPageChange }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [sortOrder, setSortOrder] = useState('name-asc');

  const toggleFileSelection = (fileId) => {
    if (selectedFiles.includes(fileId)) {
      setSelectedFiles(selectedFiles.filter(id => id !== fileId));
    } else {
      setSelectedFiles([...selectedFiles, fileId]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedFiles.length === files.length && files.length > 0) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(files.map(file => file.id));
    }
  };

  const handleSortChange = (e) => {
    setSortOrder(e.target.value);
  };

  // Dosyaları sıralama
  const sortedFiles = [...files].sort((a, b) => {
    const [field, order] = sortOrder.split('-');
    
    if (field === 'name') {
      return order === 'asc' 
        ? a.name.localeCompare(b.name) 
        : b.name.localeCompare(a.name);
    } else if (field === 'date') {
      return order === 'asc' 
        ? new Date(a.date) - new Date(b.date) 
        : new Date(b.date) - new Date(a.date);
    } else if (field === 'size') {
      return order === 'asc' 
        ? a.size - b.size 
        : b.size - a.size;
    }
    return 0;
  });

  const handleDownloadFile = (fileId, fileName) => {
    // Gerçek uygulamada burada dosya indirme işlemi yapılır
    alert(`İndiriliyor: ${fileName}`);
  };

  const handleDeleteFile = (fileId, fileName) => {
    // Gerçek uygulamada burada dosya silme işlemi yapılır
    alert(`Siliniyor: ${fileName}`);
    // Silinen dosyayı seçili dosyalardan kaldır
    setSelectedFiles(selectedFiles.filter(id => id !== fileId));
  };

  const handleBatchDownload = () => {
    // Gerçek uygulamada burada toplu indirme işlemi yapılır
    alert(`${selectedFiles.length} dosya indiriliyor`);
  };

  const handleBatchDelete = () => {
    // Gerçek uygulamada burada toplu silme işlemi yapılır
    alert(`${selectedFiles.length} dosya siliniyor`);
    setSelectedFiles([]);
  };

  // Sayfa numaralarını oluştur
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="file-list-container">
      <div className="file-list-header">
        <div className="file-list-actions">
          <div className="select-all">
            <input 
              type="checkbox" 
              checked={selectedFiles.length === files.length && files.length > 0}
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
              <button className="delete-btn" onClick={handleBatchDelete}>
                <i className="fas fa-trash-alt"></i> Sil
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
      
      {loading ? (
        <div className="loading-files">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Dosyalarınız yükleniyor...</p>
        </div>
      ) : files.length === 0 ? (
        <div className="no-files">
          <i className="far fa-folder-open"></i>
          <p>Hiç dosya bulunamadı.</p>
          <button className="upload-btn" onClick={() => document.querySelector('input[type="file"]').click()}>
            <i className="fas fa-upload"></i> Dosya Yükle
          </button>
        </div>
      ) : (
        <>
          <div className="file-grid">
            {sortedFiles.map(file => (
              <div 
                key={file.id} 
                className={`file-item ${selectedFiles.includes(file.id) ? 'selected' : ''}`}
                onClick={() => toggleFileSelection(file.id)}
              >
                <div className="file-select">
                  <input 
                    type="checkbox" 
                    checked={selectedFiles.includes(file.id)}
                    onChange={() => {}}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                
                <div className="file-icon">
                  <i className={getFileIcon(file.type)}></i>
                </div>
                
                <div className="file-info">
                  <div className="file-name" title={file.name}>{file.name}</div>
                  <div className="file-meta">
                    <span className="file-size">{file.size} KB</span>
                    <span className="file-date">{new Date(file.date).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="file-actions">
                  <button 
                    className="file-action-btn" 
                    title="İndir"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadFile(file.id, file.name);
                    }}
                  >
                    <i className="fas fa-download"></i>
                  </button>
                  <button 
                    className="file-action-btn" 
                    title="Sil"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFile(file.id, file.name);
                    }}
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                  <button 
                    className="file-action-btn" 
                    title="Daha Fazla"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <i className="fas fa-ellipsis-v"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="pagination">
            <button 
              className="pagination-btn prev" 
              disabled={currentPage === 1}
              onClick={() => onPageChange(currentPage - 1)}
            >
              <i className="fas fa-chevron-left"></i> Önceki
            </button>
            
            <div className="pagination-pages">
              {pageNumbers.map(page => (
                <button 
                  key={page}
                  className={`pagination-page ${currentPage === page ? 'active' : ''}`}
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button 
              className="pagination-btn next" 
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(currentPage + 1)}
            >
              Sonraki <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default FileList; 