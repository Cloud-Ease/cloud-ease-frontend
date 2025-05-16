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
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
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
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const data = await profileService.getProfile();
      setProfileData(data);

      // Ad ve soyadı ayır
      const fullName = data.fullName || '';
      const nameParts = fullName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      setEditFormData({
        firstName: firstName,
        lastName: lastName,
        email: data.email || '',
        phone: data.phone || '',
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching profile:', err);

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
              firstName: firstName,
              lastName: lastName,
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
      const updatedProfile = await profileService.updateProfile({
        ...profileData,
        firstName: editFormData.firstName,
        lastName: editFormData.lastName,
        phone: editFormData.phone,
      });
      setProfileData(updatedProfile);
      setError(null);
      setIsEditDialogOpen(false);
    } catch (err) {
      setError('Profil güncellenirken bir hata oluştu: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/dashboard-demo');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Navbar isAuthenticated={true} showAuthButtons={false} />
      <Box
        minHeight="100vh"
        width="100%"
        sx={{
          background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
          py: 4,
          px: 2,
        }}
      >
        <Container maxWidth="lg">
          <Box mb={2}>
            <IconButton
              onClick={handleBack}
              sx={{
                color: 'white',
                backgroundColor: 'rgba(255,255,255,0.2)',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.3)',
                },
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          </Box>

          <Paper
            elevation={3}
            sx={{
              borderRadius: 2,
              overflow: 'hidden',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
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
      </Box>

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

      <Footer />
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert onClose={() => setError(null)} severity="error">
          {error}
        </Alert>
      </Snackbar>
    </>
  );
}

export default Profile;
