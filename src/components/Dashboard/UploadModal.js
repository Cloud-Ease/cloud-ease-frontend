import React, { useState, useRef } from 'react';
import '../../CSS/Dashboard/UploadModal.css';

// .NET API entegrasyon noktaları
// const API_BASE_URL = 'https://api.example.com/api';
 const UPLOAD_ENDPOINT = 'http://localhost:5212/api/File/upload';
// const FOLDER_UPLOAD_ENDPOINT = `${API_BASE_URL}/files/upload-folder`;

function UploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  // Drag & drop işlemleri
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);

    if (e.dataTransfer.items) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  // Dosya seçme işlemleri
  const handleFileSelect = (e) => {
    handleFiles(Array.from(e.target.files));
  };

  const handleFolderSelect = (e) => {
    handleFiles(Array.from(e.target.files));
  };

  const handleFiles = (selectedFiles) => {
    if (!selectedFiles.length) return;

    // Mevcut dosyalara ekle ve her dosya için ilerleme durumu oluştur
    const newFiles = [...files];
    const newProgress = { ...uploadProgress };

    for (const file of selectedFiles) {
      // Zaten eklenmemiş ise ekle
      if (!files.some((f) => f.name === file.name && f.size === file.size)) {
        newFiles.push(file);
        newProgress[file.name] = 0;
      }
    }

    setFiles(newFiles);
    setUploadProgress(newProgress);
  };

  // Dosya kaldırma işlemi
  const removeFile = (fileName) => {
    setFiles(files.filter((file) => file.name !== fileName));

    // İlerleme durumunu da güncelle
    const newProgress = { ...uploadProgress };
    delete newProgress[fileName];
    setUploadProgress(newProgress);
  };

  // Dosya yükleme işlemi
  const uploadFiles = async () => {
    if (files.length === 0) return;

    setUploading(true);

    // .NET Backend entegrasyonu için dosya yükleme fonksiyonu
     try {
    const token = localStorage.getItem("authToken");

    const uploadPromises = files.map((file) => {
      const formData = new FormData();
      formData.append("file", file); // DTO'daki isme uygun!

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "http://localhost:5212/api/File/upload", true);
        if (token) {
          xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        }

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            setUploadProgress((prev) => ({
              ...prev,
              [file.name]: percentComplete,
            }));
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(xhr.response);
          } else {
            reject(new Error(`Dosya yükleme hatası: ${xhr.statusText}`));
          }
        };

        xhr.onerror = () => {
          reject(new Error("Dosya yüklenirken ağ hatası oluştu"));
        };

        xhr.send(formData);
      });
    });

    await Promise.all(uploadPromises);
    onUploadSuccess();
    resetAndClose();
  } catch (error) {
    console.error("Yükleme hatası:", error);
    setUploading(false);
    alert("Dosya yükleme sırasında bir hata oluştu. Lütfen tekrar deneyin.");
  }
  };

  // Yükleme işlemini simüle et (Backend entegrasyonu tamamlanana kadar)
  const simulateUpload = () => {
    // Her bir dosya için sahte ilerleme oluştur
    files.forEach((file) => {
      let progress = 0;

      const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 10) + 5;

        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);

          // Tüm dosyalar %100 olduğunda yüklemeyi tamamla
          const allDone = Object.values(uploadProgress).every((p) => p >= 100);

          if (allDone) {
            setTimeout(() => {
              onUploadSuccess();
              resetAndClose();
            }, 500);
          }
        }

        setUploadProgress((prev) => ({
          ...prev,
          [file.name]: progress,
        }));
      }, 300);
    });
  };

  // Modal durumunu sıfırlama ve kapatma
  const resetAndClose = () => {
    setFiles([]);
    setUploading(false);
    setUploadProgress({});
    onClose();
  };

  // Dosya boyutunu formatla
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="upload-modal-overlay">
      <div className="upload-modal">
        <div className="upload-modal-header">
          <h2>Dosya Yükle</h2>
          <button className="close-button" onClick={resetAndClose}>
            ×
          </button>
        </div>

        <div
          className={`upload-drop-area ${dragOver ? 'drag-over' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="upload-icon">
            <i className="fas fa-cloud-upload-alt"></i>
          </div>

          <p>Dosyaları sürükleyip bırakın veya</p>

          <div className="upload-buttons">
            <button
              className="choose-file-btn"
              onClick={() => fileInputRef.current.click()}
              disabled={uploading}
            >
              Dosya Seç
            </button>

            <button
              className="choose-folder-btn"
              onClick={() => folderInputRef.current.click()}
              disabled={uploading}
            >
              Klasör Seç
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            multiple
            disabled={uploading}
          />

          <input
            type="file"
            ref={folderInputRef}
            onChange={handleFolderSelect}
            style={{ display: 'none' }}
            webkitdirectory="true"
            directory="true"
            multiple
            disabled={uploading}
          />
        </div>

        {files.length > 0 && (
          <div className="selected-files">
            <h3>Seçilen Dosyalar</h3>

            <div className="file-list">
              {files.map((file) => (
                <div key={file.name} className="file-item">
                  <div className="file-info">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">{formatFileSize(file.size)}</span>
                  </div>

                  <div className="file-actions">
                    {uploadProgress[file.name] > 0 && (
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${uploadProgress[file.name]}%` }}
                        ></div>
                        <span className="progress-text">{uploadProgress[file.name]}%</span>
                      </div>
                    )}

                    {!uploading && (
                      <button className="remove-file-btn" onClick={() => removeFile(file.name)}>
                        <i className="fas fa-times"></i>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="upload-modal-footer">
          <button className="cancel-btn" onClick={resetAndClose} disabled={uploading}>
            İptal
          </button>

          <button
            className={`upload-btn ${files.length === 0 ? 'disabled' : ''}`}
            onClick={uploadFiles}
            disabled={files.length === 0 || uploading}
          >
            {uploading ? 'Yükleniyor...' : 'Yükle'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default UploadModal;
