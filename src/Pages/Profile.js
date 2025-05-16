import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Avatar,
  Box,
  Button,
  Paper,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import '../CSS/Dashboard/Dashboard.css';
import '../CSS/Profile.css';
import { profileService } from '../services/profileService';
import { getAuth } from 'firebase/auth';

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
  const [showDebug, setShowDebug] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfileData();
  }, [refreshKey]);

  const fetchProfileData = async () => {
    try {
      console.log('Profil bilgileri yükleniyor...');
      console.log('ProfileService.getProfile() çağrılıyor...');

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
        }
      } else {
        setError('Profil bilgileri yüklenirken bir hata oluştu: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditDialogOpen = () => {
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
      setError('Profil güncellenirken bir hata oluştu: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  // Add a safeguard for null profile data
  if (!profileData) {
    return (
      <div className="profile-container">
        <div className="profile-header">
          <button className="back-to-dashboard" onClick={handleBack}>
            <ArrowBackIcon /> Panele Dön
          </button>
          <h1>Kullanıcı Profili</h1>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => setRefreshKey((prevKey) => prevKey + 1)}
            style={{ marginLeft: 'auto' }}
          >
            Profili Yenile
          </Button>
        </div>

        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            <Typography variant="h6" color="error" gutterBottom>
              Profil bilgileri yüklenemedi
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setRefreshKey((prevKey) => prevKey + 1)}
              sx={{ mt: 2 }}
            >
              Yeniden Dene
            </Button>

            {/* Add a form to manually create a profile */}
            <Box sx={{ mt: 4, pt: 4, borderTop: '1px solid #eee' }}>
              <Typography variant="h6" gutterBottom>
                Profil Oluştur
              </Typography>
              <TextField
                fullWidth
                label="Ad"
                name="firstName"
                value={editFormData.firstName}
                onChange={handleEditFormChange}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Soyad"
                name="lastName"
                value={editFormData.lastName}
                onChange={handleEditFormChange}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Telefon"
                name="phone"
                value={editFormData.phone}
                onChange={handleEditFormChange}
                margin="normal"
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleProfileUpdate}
                sx={{ mt: 2 }}
              >
                Profil Oluştur
              </Button>
            </Box>
          </Paper>
        </Container>

        {/* Debug Panel - Hidden by default */}
        <Container maxWidth="lg" sx={{ my: 2 }}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => setShowDebug(!showDebug)}
            size="small"
          >
            {showDebug ? 'Hata Ayıklama Panelini Gizle' : 'Hata Ayıklama Panelini Göster'}
          </Button>

          {showDebug && (
            <Paper elevation={2} sx={{ p: 3, mt: 2, backgroundColor: '#f5f5f5' }}>
              <Typography variant="h6" gutterBottom>
                Hata Ayıklama Bilgileri
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Hata:</strong> {error || 'Yok'}
              </Typography>
              <Typography variant="body2" gutterBottom>
                <strong>Form Verileri:</strong>
              </Typography>
              <pre
                style={{
                  whiteSpace: 'pre-wrap',
                  backgroundColor: '#eee',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                }}
              >
                {JSON.stringify(editFormData, null, 2)}
              </pre>
            </Paper>
          )}
        </Container>

        <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
          <Alert onClose={() => setError(null)} severity="error">
            {error}
          </Alert>
        </Snackbar>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <button className="back-to-dashboard" onClick={handleBack}>
          <ArrowBackIcon /> Panele Dön
        </button>
        <h1>Kullanıcı Profili</h1>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => setRefreshKey((prevKey) => prevKey + 1)}
          style={{ marginLeft: 'auto' }}
        >
          Profili Yenile
        </Button>
      </div>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper
          elevation={3}
          sx={{
            borderRadius: 2,
            overflow: 'hidden',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Box
            sx={{
              background: 'linear-gradient(45deg, #1976D2 30%, #2196F3 90%)',
              p: 4,
              color: 'white',
              position: 'relative',
            }}
          >
            <Grid container spacing={3} alignItems="center">
              <Grid item>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    border: '4px solid white',
                  }}
                  src={profileData?.imageUrl}
                  alt={profileData?.fullName}
                />
              </Grid>
              <Grid item xs>
                <Typography variant="h4" gutterBottom>
                  {profileData?.fullName}
                </Typography>
                <Typography variant="subtitle1">{profileData?.email}</Typography>
              </Grid>
              <Grid item>
                <IconButton onClick={handleEditDialogOpen} sx={{ color: 'white' }}>
                  <EditIcon />
                </IconButton>
              </Grid>
            </Grid>
          </Box>

          <Box p={4}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom color="primary">
                  Profil Bilgileri
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body1" gutterBottom>
                    <strong>Ad Soyad:</strong> {profileData?.fullName}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>E-posta:</strong> {profileData?.email}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Telefon:</strong> {profileData?.phone || 'Belirtilmemiş'}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom color="primary">
                  Hesap Bilgileri
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body1" gutterBottom>
                    <strong>Hesap Durumu:</strong>{' '}
                    <span style={{ color: profileData?.isActive ? 'green' : 'red' }}>
                      {profileData?.isActive ? 'Aktif' : 'Pasif'}
                    </span>
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Üyelik Tarihi:</strong>{' '}
                    {profileData?.createAt
                      ? new Date(profileData.createAt).toLocaleDateString('tr-TR')
                      : 'Belirtilmemiş'}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    <strong>Son Giriş:</strong>{' '}
                    {profileData?.lastLoginAt
                      ? new Date(profileData.lastLoginAt).toLocaleDateString('tr-TR')
                      : 'Belirtilmemiş'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>

      {/* Debug Panel - Hidden by default */}
      <Container maxWidth="lg" sx={{ my: 2 }}>
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => setShowDebug(!showDebug)}
          size="small"
        >
          {showDebug ? 'Hata Ayıklama Panelini Gizle' : 'Hata Ayıklama Panelini Göster'}
        </Button>

        {showDebug && (
          <Paper elevation={2} sx={{ p: 3, mt: 2, backgroundColor: '#f5f5f5' }}>
            <Typography variant="h6" gutterBottom>
              Profil Veri Yapısı (Hata Ayıklama)
            </Typography>
            <pre
              style={{
                whiteSpace: 'pre-wrap',
                backgroundColor: '#eee',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '0.8rem',
                maxHeight: '300px',
                overflow: 'auto',
              }}
            >
              {JSON.stringify(profileData, null, 2)}
            </pre>
          </Paper>
        )}
      </Container>

      {/* Profil Düzenleme Dialog */}
      <Dialog open={isEditDialogOpen} onClose={handleEditDialogClose}>
        <DialogTitle>Profil Bilgilerini Düzenle</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Ad"
              name="firstName"
              value={editFormData.firstName}
              onChange={handleEditFormChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Soyad"
              name="lastName"
              value={editFormData.lastName}
              onChange={handleEditFormChange}
              margin="normal"
            />
            <TextField
              fullWidth
              label="E-posta"
              name="email"
              value={editFormData.email}
              onChange={handleEditFormChange}
              margin="normal"
              disabled
            />
            <TextField
              fullWidth
              label="Telefon"
              name="phone"
              value={editFormData.phone}
              onChange={handleEditFormChange}
              margin="normal"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditDialogClose}>İptal</Button>
          <Button onClick={handleProfileUpdate} variant="contained" color="primary">
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default Profile;
