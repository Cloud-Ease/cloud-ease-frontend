import { getAuth } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '../components/Dashboard/DashboardHeader';
import '../CSS/Dashboard/Dashboard.css';
import '../CSS/Profile.css';
import { profileService } from '../services/profileService';

function Profile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfileData();
  }, [refreshKey]);

  const fetchProfileData = async () => {
    try {
      console.log('Profil bilgileri yükleniyor...');
      setLoading(true);
      const data = await profileService.getProfile();
      console.log('Alınan profil verileri:', data);

      if (!data || !data.email) {
        console.warn('Profil verileri boş veya eksik geldi:', data);
      }

      setProfileData(data);

      // Form verilerini güncelle
      setEditFormData({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phone: data.phone || '',
      });

      setError(null);
    } catch (err) {
      console.error('Error fetching profile:', err);
      console.error('Hata detayları:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        stack: err.stack,
      });

      // Eğer 404 hatası alırsak yeni profil oluşturmayı deneyelim
      if (err.response?.status === 404) {
        try {
          console.log('Profil bulunamadı, yeni profil oluşturuluyor...');
          // Kullanıcı bilgilerini alalım
          const auth = getAuth();
          const user = auth.currentUser;

          if (user) {
            // Firebase kullanıcı bilgisi
            console.log('Mevcut kullanıcı bilgileri:', {
              uid: user.uid,
              displayName: user.displayName,
              email: user.email,
              photoURL: user.photoURL,
            });

            // Ad ve soyadı ayır
            const displayName = user.displayName || '';
            const nameParts = displayName.split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';

            console.log('ProfileService.createProfile() çağrılıyor...');
            console.log('Profil oluşturma verileri:', {
              firstName,
              lastName,
              email: user.email,
              imageUrl: user.photoURL,
            });

            // Yeni profil oluştur
            const newProfile = await profileService.createProfile({
              firstName: firstName,
              lastName: lastName,
              email: user.email,
              imageUrl: user.photoURL || '',
              phone: '',
            });

            console.log('Oluşturulan profil:', newProfile);

            setProfileData(newProfile);
            setEditFormData({
              firstName: newProfile.firstName || '',
              lastName: newProfile.lastName || '',
              email: newProfile.email || '',
              phone: newProfile.phone || '',
            });
            setError(null);
          } else {
            setError('Kullanıcı oturum açmamış');
          }
        } catch (createErr) {
          console.error('Profil oluşturma detaylı hata:', createErr);

          // Detaylı hata mesajını gösterelim
          let errorMsg = 'Profil oluşturulurken bir hata oluştu: ';

          if (createErr.response && createErr.response.data) {
            // Sunucudan gelen hata mesajı varsa göster
            if (typeof createErr.response.data === 'string') {
              errorMsg += createErr.response.data;
            } else if (createErr.response.data.message) {
              errorMsg += createErr.response.data.message;
            } else {
              errorMsg += JSON.stringify(createErr.response.data);
            }
          } else {
            errorMsg += createErr.message;
          }

          setError(errorMsg);
          showNotification(errorMsg, 'error');
        }
      } else {
        const errorMsg = 'Profil bilgileri yüklenirken bir hata oluştu: ' + err.message;
        setError(errorMsg);
        showNotification(errorMsg, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditButtonClick = () => {
    setIsEditDialogOpen(true);
  };

  const handleEditDialogClose = () => {
    setIsEditDialogOpen(false);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleProfileUpdate = async () => {
    try {
      setLoading(true);

      console.log('=== PROFİL GÜNCELLEME BAŞLATILIYOR ===');
      console.log('Profil verilerini güncelliyorum:', {
        firstName: editFormData.firstName,
        lastName: editFormData.lastName,
        phone: editFormData.phone,
        imageUrl: profileData?.imageUrl || '',
        email: profileData?.email || '',
      });

      // Include all relevant data for the update
      const updatedProfile = await profileService.updateProfile({
        firstName: editFormData.firstName,
        lastName: editFormData.lastName,
        phone: editFormData.phone,
        imageUrl: profileData?.imageUrl || '',
        email: profileData?.email || '',
      });

      console.log('Güncellenmiş profil döndü:', updatedProfile);

      // Update profile data with the returned data from the backend
      setProfileData(updatedProfile);

      // Also reset the form data to match the updated profile
      setEditFormData({
        firstName: updatedProfile.firstName || '',
        lastName: updatedProfile.lastName || '',
        email: updatedProfile.email || '',
        phone: updatedProfile.phone || '',
      });

      setError(null);
      setIsEditDialogOpen(false);
      showNotification('Profil başarıyla güncellendi');

      // Force a refresh after update to ensure we have the latest data
      setRefreshKey((prevKey) => prevKey + 1);
    } catch (err) {
      console.error('===== PROFİL GÜNCELLEME HATASI =====');
      console.error('Profil güncelleme hatası:', err);
      console.error('Hata detayları:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        stack: err.stack,
      });
      const errorMsg = 'Profil güncellenirken bir hata oluştu: ' + err.message;
      setError(errorMsg);
      showNotification(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Dashboard header için arama ve kategori değişikliğini handle eden sahte fonksiyonlar
  const handleCategoryChange = () => {};
  const handleSearch = () => {};
  const handleFileUpload = () => {};

  // Eğer profil verisi yüklenmemişse veya hata varsa uygun mesajı göster
  if (loading && !profileData) {
    return (
      <div className="dashboard-container">
        <DashboardHeader
          onCategoryChange={handleCategoryChange}
          onSearch={handleSearch}
          onFileUpload={handleFileUpload}
          showCategories={false}
          isProfilePage={true}
        />
        <div className="dashboard-content">
          <div className="loading-files">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Profil bilgileri yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  // Eğer profil verisi yoksa ve yükleme de tamamlandıysa hata durumunu göster
  if (!profileData && !loading) {
    return (
      <div className="dashboard-container">
        <DashboardHeader
          onCategoryChange={handleCategoryChange}
          onSearch={handleSearch}
          onFileUpload={handleFileUpload}
          showCategories={false}
          isProfilePage={true}
        />
        <div className="dashboard-content">
          <div className="profile-error-container">
            <div className="profile-error-card">
              <i className="fas fa-exclamation-circle"></i>
              <h2>Profil Yüklenemedi</h2>
              <p>{error || 'Profil bilgileri yüklenirken bir hata oluştu.'}</p>
              <button
                className="profile-refresh-btn"
                onClick={() => setRefreshKey((prev) => prev + 1)}
              >
                <i className="fas fa-sync-alt"></i> Yeniden Dene
              </button>

              <div className="create-profile-form">
                <h3>Profil Oluştur</h3>
                <div className="profile-form-group">
                  <label htmlFor="firstName">Ad</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={editFormData.firstName}
                    onChange={handleEditFormChange}
                  />
                </div>
                <div className="profile-form-group">
                  <label htmlFor="lastName">Soyad</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={editFormData.lastName}
                    onChange={handleEditFormChange}
                  />
                </div>
                <div className="profile-form-group">
                  <label htmlFor="phone">Telefon</label>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={editFormData.phone}
                    onChange={handleEditFormChange}
                  />
                </div>
                <button className="profile-update-btn" onClick={handleProfileUpdate}>
                  {loading ? <i className="fas fa-spinner fa-spin"></i> : null}
                  Profil Oluştur
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <DashboardHeader
        onCategoryChange={handleCategoryChange}
        onSearch={handleSearch}
        onFileUpload={handleFileUpload}
        showCategories={false}
        isProfilePage={true}
      />
      <div className="dashboard-content">
        <div className="profile-content">
          <div className="profile-card">
            <div className="profile-header-section">
              <div className="profile-avatar">
                {profileData?.imageUrl ? (
                  <img src={profileData.imageUrl} alt={profileData.fullName} />
                ) : (
                  <div className="profile-avatar-placeholder">
                    {profileData?.firstName?.charAt(0) || ''}
                    {profileData?.lastName?.charAt(0) || ''}
                  </div>
                )}
              </div>
              <div className="profile-header-info">
                <h2>{profileData?.fullName}</h2>
                <p>{profileData?.email}</p>
                <button className="profile-edit-btn" onClick={handleEditButtonClick}>
                  <i className="fas fa-edit"></i> Profili Düzenle
                </button>
              </div>
            </div>

            <div className="profile-details">
              <div className="profile-details-section">
                <h3>Kişisel Bilgiler</h3>
                <div className="profile-detail-item">
                  <span className="profile-detail-label">Ad:</span>
                  <span className="profile-detail-value">
                    {profileData?.firstName || 'Belirtilmemiş'}
                  </span>
                </div>
                <div className="profile-detail-item">
                  <span className="profile-detail-label">Soyad:</span>
                  <span className="profile-detail-value">
                    {profileData?.lastName || 'Belirtilmemiş'}
                  </span>
                </div>
                <div className="profile-detail-item">
                  <span className="profile-detail-label">E-posta:</span>
                  <span className="profile-detail-value">
                    {profileData?.email || 'Belirtilmemiş'}
                  </span>
                </div>
                <div className="profile-detail-item">
                  <span className="profile-detail-label">Telefon:</span>
                  <span className="profile-detail-value">
                    {profileData?.phone || 'Belirtilmemiş'}
                  </span>
                </div>
              </div>

              <div className="profile-details-section">
                <h3>Hesap Bilgileri</h3>
                <div className="profile-detail-item">
                  <span className="profile-detail-label">Hesap Durumu:</span>
                  <span
                    className={`profile-detail-value ${
                      profileData?.isActive ? 'active-status' : 'inactive-status'
                    }`}
                  >
                    {profileData?.isActive ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
                <div className="profile-detail-item">
                  <span className="profile-detail-label">Üyelik Tarihi:</span>
                  <span className="profile-detail-value">
                    {profileData?.createAt
                      ? new Date(profileData.createAt).toLocaleDateString('tr-TR')
                      : 'Belirtilmemiş'}
                  </span>
                </div>
                <div className="profile-detail-item">
                  <span className="profile-detail-label">Son Giriş:</span>
                  <span className="profile-detail-value">
                    {profileData?.lastLoginAt
                      ? new Date(profileData.lastLoginAt).toLocaleDateString('tr-TR')
                      : 'Belirtilmemiş'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profil Düzenleme Modal */}
      {isEditDialogOpen && (
        <div className="profile-edit-modal">
          <div className="profile-edit-modal-content">
            <div className="profile-edit-modal-header">
              <h3>Profil Bilgilerini Düzenle</h3>
              <button className="modal-close-btn" onClick={handleEditDialogClose}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="profile-edit-form">
              <div className="form-group">
                <label htmlFor="editFirstName">Ad</label>
                <input
                  type="text"
                  id="editFirstName"
                  name="firstName"
                  value={editFormData.firstName}
                  onChange={handleEditFormChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="editLastName">Soyad</label>
                <input
                  type="text"
                  id="editLastName"
                  name="lastName"
                  value={editFormData.lastName}
                  onChange={handleEditFormChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="editEmail">E-posta</label>
                <input
                  type="email"
                  id="editEmail"
                  name="email"
                  value={editFormData.email}
                  onChange={handleEditFormChange}
                  disabled
                />
              </div>
              <div className="form-group">
                <label htmlFor="editPhone">Telefon</label>
                <input
                  type="text"
                  id="editPhone"
                  name="phone"
                  value={editFormData.phone}
                  onChange={handleEditFormChange}
                />
              </div>
            </div>
            <div className="profile-edit-modal-actions">
              <button className="cancel-btn" onClick={handleEditDialogClose}>
                İptal
              </button>
              <button className="save-btn" onClick={handleProfileUpdate} disabled={loading}>
                {loading ? <i className="fas fa-spinner fa-spin"></i> : null}
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bildirim Toast */}
      {notification && (
        <div className={`notification-toast ${notification.type}`}>
          {notification.type === 'success' && <i className="fas fa-check-circle"></i>}
          {notification.type === 'error' && <i className="fas fa-exclamation-circle"></i>}
          {notification.message}
        </div>
      )}
    </div>
  );
}

export default Profile;
