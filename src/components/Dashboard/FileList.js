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

function FileList() {
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
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5212/api/File', {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      setFiles(response.data);
    } catch (error) {
      console.error('Dosyalar alınırken hata oluştu:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFileSelection = (fileId) => {
    const fileObj = files.find((file) => file.id === fileId);
    if (!fileObj) return;

    const alreadySelected = selectedFiles.some((f) => f.id === fileId);
    if (alreadySelected) {
      setSelectedFiles(selectedFiles.filter((f) => f.id !== fileId));
    } else {
      setSelectedFiles([...selectedFiles, fileObj]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedFiles.length === files.length && files.length > 0) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(files);
    }
  };

  const handleSortChange = (e) => setSortOrder(e.target.value);

  const sortedFiles = [...files].sort((a, b) => {
    const [field, order] = sortOrder.split('-');

    const getSafeValue = (obj, key) => {
      return obj?.[key] ?? '';
    };

    if (field === 'name') {
      const aName = getSafeValue(a, 'fileName');
      const bName = getSafeValue(b, 'fileName');
      return order === 'asc' ? aName.localeCompare(bName) : bName.localeCompare(aName);
    }

    if (field === 'date') {
      const aDate = new Date(getSafeValue(a, 'uploadedAt'));
      const bDate = new Date(getSafeValue(b, 'uploadedAt'));
      return order === 'asc' ? aDate - bDate : bDate - aDate;
    }

    if (field === 'size') {
      const aSize = getSafeValue(a, 'size');
      const bSize = getSafeValue(b, 'size');
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
    } catch (error) {
      alert('Dosya indirilemedi.');
    }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5212/api/File/${fileId}`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFiles(files.filter((f) => f.id !== fileId));
      setSelectedFiles(selectedFiles.filter((f) => f.id !== fileId));
    } catch (error) {
      alert('Dosya silinemedi.');
    }
  };

  const handleBatchDownload = async () => {
    if (selectedFiles.length === 0) {
      alert('İndirilecek dosya seçilmedi.');
      return;
    }

    const token = localStorage.getItem('token');

    for (const file of selectedFiles) {
      try {
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
      } catch (error) {
        console.error(`Dosya indirilemedi (${file.fileName}):`, error);
      }
    }

    alert(`${selectedFiles.length} dosya indirildi.`);
  };

  const handleBatchDelete = async () => {
    for (const file of selectedFiles) {
      await handleDeleteFile(file.id);
    }
    setSelectedFiles([]);
  };

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

      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5212/api/File/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      alert('Dosya başarıyla yüklendi.');
      setSelectedUploadFile(null);
      fetchFiles();
    } catch (error) {
      alert('Dosya yüklenirken hata oluştu.');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="file-list-container">
      <div className="upload-section">
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleFileUpload} disabled={uploading}>
          {uploading ? 'Yükleniyor...' : 'Dosya Yükle'}
        </button>
      </div>

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
                <i className={getFileIcon(file.type)}></i>
              </div>
              <div className="file-info">
                <div className="file-name" title={file.fileName}>
                  {file.fileName}
                </div>
                <div className="file-meta">
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
