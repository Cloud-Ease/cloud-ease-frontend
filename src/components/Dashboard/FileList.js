import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../CSS/Dashboard/FileList.css';

function getFileIcon(type) {
  switch (type) {
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

function FileList({ currentPage, totalPages, onPageChange }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [sortOrder, setSortOrder] = useState('name-asc');
  const [selectedUploadFile, setSelectedUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5212/api/File', {
        withCredentials: true,
      });
      setFiles(response.data);
    } catch (error) {
      console.error('Dosyalar alınırken hata oluştu:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFileSelection = (fileId) => {
    if (selectedFiles.includes(fileId)) {
      setSelectedFiles(selectedFiles.filter((id) => id !== fileId));
    } else {
      setSelectedFiles([...selectedFiles, fileId]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedFiles.length === files.length && files.length > 0) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(files.map((file) => file.id));
    }
  };

  const handleSortChange = (e) => setSortOrder(e.target.value);

  const sortedFiles = [...files].sort((a, b) => {
    const [field, order] = sortOrder.split('-');
    if (field === 'name')
      return order === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    if (field === 'date')
      return order === 'asc'
        ? new Date(a.date) - new Date(b.date)
        : new Date(b.date) - new Date(a.date);
    if (field === 'size') return order === 'asc' ? a.size - b.size : b.size - a.size;
    return 0;
  });

  const handleDownloadFile = async (fileId, fileName) => {
    try {
      const response = await axios.get(`http://localhost:5212/api/File/download/${fileId}`, {
        responseType: 'blob',
        withCredentials: true,
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert('Dosya indirilemedi.');
    }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      await axios.delete(`http://localhost:5212/api/File/${fileId}`, {
        withCredentials: true,
      });
      setFiles(files.filter((f) => f.id !== fileId));
      setSelectedFiles(selectedFiles.filter((id) => id !== fileId));
    } catch (error) {
      alert('Dosya silinemedi.');
    }
  };

  const handleBatchDownload = () => {
    alert(`${selectedFiles.length} dosya indirilecek (henüz çoklu indirme eklenmedi)`);
  };

  const handleBatchDelete = async () => {
    for (const fileId of selectedFiles) {
      await handleDeleteFile(fileId);
    }
    setSelectedFiles([]);
  };

  // Yeni: Dosya seçme ve yükleme fonksiyonları
  const handleFileChange = (e) => {
    setSelectedUploadFile(e.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!selectedUploadFile) {
      alert('Lütfen yüklemek için bir dosya seçin.');
      return;
    }
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', selectedUploadFile);

      await axios.post('http://localhost:5212/api/File/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });

      alert('Dosya başarıyla yüklendi.');
      setSelectedUploadFile(null);
      fetchFiles(); // Listeyi güncelle
    } catch (error) {
      alert('Dosya yüklenirken hata oluştu.');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="file-list-container">
      {/* Dosya yükleme alanı */}
      <div className="upload-section">
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleFileUpload} disabled={uploading}>
          {uploading ? 'Yükleniyor...' : 'Dosya Yükle'}
        </button>
      </div>

      {/* Header ve sıralama */}
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

      {/* Dosya listesi */}
      {loading ? (
        <div className="loading-files">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Dosyalar yükleniyor...</p>
        </div>
      ) : files.length === 0 ? (
        <div className="no-files">
          <i className="far fa-folder-open"></i>
          <p>Hiç dosya bulunamadı.</p>
        </div>
      ) : (
        <div className="file-grid">
          {sortedFiles.map((file) => (
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
                <div className="file-name" title={file.name}>
                  {file.name}
                </div>
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
                    handleDeleteFile(file.id);
                  }}
                >
                  <i className="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FileList;
