import React from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Box,
  Button,
  Paper,
  IconButton,
  Divider,
} from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Profile() {
  return (
    <>
      <Navbar isAuthenticated={true} showAuthButtons={false} />
      <Box
        minHeight="100vh"
        width="100%"
        sx={{
          background: "linear-gradient(135deg, #2196F3 0%, #1976D2 100%)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "grid",
          placeItems: "center",
          py: { xs: 2, md: 4 },
          px: { xs: 1, md: 2 },
        }}
      >
        <Container maxWidth="lg">
          <Grid container justifyContent="center">
            <Grid item xs={12} md={10} lg={8}>
              <Paper 
                elevation={3}
                sx={{
                  borderRadius: 2,
                  overflow: 'hidden',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                {/* Header Section */}
                <Box
                  sx={{
                    background: 'linear-gradient(45deg, #1976D2 30%, #2196F3 90%)',
                    p: { xs: 2, md: 4 },
                    color: 'white',
                    position: 'relative',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      alignItems: 'center',
                      gap: 3,
                    }}
                  >
                    <Avatar
                      sx={{
                        width: { xs: 100, md: 120 },
                        height: { xs: 100, md: 120 },
                        border: '4px solid white',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                      }}
                      src="https://i.pravatar.cc/300"
                      alt="Profile Picture"
                    />
                    <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                      <Typography variant="h4" component="h1" gutterBottom>
                        John Doe
                      </Typography>
                      <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                        john.doe@example.com
                      </Typography>
                    </Box>
                    <IconButton
                      sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        backgroundColor: 'rgba(255,255,255,0.2)',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.3)',
                        },
                      }}
                    >
                      <EditIcon sx={{ color: 'white' }} />
                    </IconButton>
                  </Box>
                </Box>

                <CardContent sx={{ p: { xs: 2, md: 4 } }}>
                  <Grid container spacing={3}>
                    {/* Personal Information */}
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" fontWeight="bold" mb={2} color="primary">
                        Kişisel Bilgiler
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <LocationOnIcon color="primary" />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Konum
                            </Typography>
                            <Typography variant="body1">New York, USA</Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <PhoneIcon color="primary" />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Telefon
                            </Typography>
                            <Typography variant="body1">+1 234 567 890</Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <EmailIcon color="primary" />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              E-posta
                            </Typography>
                            <Typography variant="body1">john.doe@example.com</Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Grid>

                    {/* Account Settings */}
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" fontWeight="bold" mb={2} color="primary">
                        Hesap Ayarları
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <CalendarTodayIcon color="primary" />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Üyelik Tarihi
                            </Typography>
                            <Typography variant="body1">January 2024</Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <AccessTimeIcon color="primary" />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Son Giriş
                            </Typography>
                            <Typography variant="body1">Today at 10:30 AM</Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <VerifiedUserIcon color="primary" />
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Hesap Durumu
                            </Typography>
                            <Typography variant="body1" color="success.main">
                              Aktif
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 3 }} />

                  {/* Action Buttons */}
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      gap: 2,
                      flexDirection: { xs: 'column', sm: 'row' }
                    }}
                  >
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      startIcon={<EditIcon />}
                      sx={{
                        minWidth: { xs: '100%', sm: '200px' },
                        py: 1.5,
                      }}
                    >
                      Profili Düzenle
                    </Button>
                    <Button
                      variant="outlined"
                      color="primary"
                      size="large"
                      sx={{
                        minWidth: { xs: '100%', sm: '200px' },
                        py: 1.5,
                      }}
                    >
                      Şifre Değiştir
                    </Button>
                  </Box>
                </CardContent>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
      <Footer />
    </>
  );
}

export default Profile; 