import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { convertBackendProfileToFrontend, convertFrontendProfileToBackend } from './profileUtils';

// API URL - backend controller'a göre doğru yol
const API_URL = 'https://localhost:7241/api/profile';

// Axios instance oluştur
const axiosInstance = axios.create({
  baseURL: API_URL,
  httpsAgent: {
    rejectUnauthorized: false, // Geliştirme ortamında self-signed sertifikalar için
  },
});

// Request debugging için daha detaylı loglama
axiosInstance.interceptors.request.use((request) => {
  console.log('🚀 API İSTEĞİ GÖNDERİLİYOR:', {
    url: request.url ? `${API_URL}${request.url}` : API_URL,
    method: request.method?.toUpperCase(),
    headers: request.headers,
    data: request.data,
  });

  // Veriyi detaylı logla
  if (request.data) {
    console.log('İSTEK GÖVDE VERİSİ JSON:', JSON.stringify(request.data, null, 2));
  }

  return request;
});

// Axios interceptor ekle
axiosInstance.interceptors.request.use(
  async (config) => {
    let token = localStorage.getItem('token');

    // Eğer localStorage'da token yoksa Firebase'den almayı dene
    if (!token) {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        throw new Error('Kullanıcı oturum açmamış');
      }

      token = await user.getIdToken();

      // Yeni alınan token'ı localStorage'a kaydet
      localStorage.setItem('token', token);
    }

    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Axios response interceptor ekle - daha detaylı yanıt loglaması
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('✅ API YANITI ALINDI:', {
      status: response.status,
      statusText: response.statusText,
      config: {
        url: response.config.url ? `${API_URL}${response.config.url}` : API_URL,
        method: response.config.method?.toUpperCase(),
        headers: response.config.headers,
      },
    });

    // Yanıt verilerini detaylı logla
    if (response.data) {
      console.log('YANIT GÖVDE VERİSİ JSON:', JSON.stringify(response.data, null, 2));
    }

    return response;
  },
  (error) => {
    console.error('❌ API HATASI:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      config: error.config
        ? {
            url: error.config.url ? `${API_URL}${error.config.url}` : API_URL,
            method: error.config.method?.toUpperCase(),
            headers: error.config.headers,
            data: error.config.data,
          }
        : 'Config bilgisi yok',
    });

    if (error.response?.data) {
      console.error('HATA YANIT VERİSİ:', error.response.data);
    }

    return Promise.reject(error);
  }
);

// Add this debugging helper function at the top of the file
const logResponseDetails = (response, source) => {
  console.log(`=== RESPONSE DETAILS (${source}) ===`);
  console.log('Status:', response.status);
  console.log('Headers:', response.headers);
  console.log('Data type:', typeof response.data);

  if (response.data) {
    if (typeof response.data === 'object') {
      console.log('Data keys:', Object.keys(response.data));
      console.log('Data JSON:', JSON.stringify(response.data, null, 2));
    } else if (typeof response.data === 'string') {
      console.log('Data string (first 100 chars):', response.data.substring(0, 100));
      try {
        const parsed = JSON.parse(response.data);
        console.log('Parsed string data:', parsed);
      } catch (e) {
        console.log('Data is not JSON parseable');
      }
    } else {
      console.log('Data:', response.data);
    }
  } else {
    console.log('Data is null or undefined');
  }
};

// Offline mod için yerel profil depolama yardımcıları
const LOCAL_PROFILE_KEY = 'cloud_ease_offline_profile';

const saveProfileLocally = (profileData) => {
  try {
    localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(profileData));
    console.log('Profil verileri yerel depolamaya kaydedildi (offline mod)');
    return true;
  } catch (e) {
    console.error('Yerel depolamaya kaydetme hatası:', e);
    return false;
  }
};

const getLocalProfile = () => {
  try {
    const profile = localStorage.getItem(LOCAL_PROFILE_KEY);
    return profile ? JSON.parse(profile) : null;
  } catch (e) {
    console.error('Yerel depolamadan profil okuma hatası:', e);
    return null;
  }
};

export const profileService = {
  getProfile: async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      console.log('=== GET PROFILE BAŞLATILIYOR ===');
      console.log('Auth durumu:', !!auth);
      console.log('User durumu:', !!user);

      if (user) {
        console.log('User ID:', user.uid);
        console.log('User email:', user.email);
      }

      // API yapısını basitleştirelim - 404 hatalarından anlaşıldığı gibi userId ile GET çalışmıyor
      // Sadece temel endpoint'i kullanalım
      try {
        console.log(`Basit profil isteği gönderiliyor: ${API_URL}`);

        const response = await axiosInstance.get('');
        console.log('Backend profil yanıtı:', response.data);
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);

        // Add detailed logging
        logResponseDetails(response, 'GET Profile');

        // Ek bir kullanıcı kimliği kontrolü - backendden gelen veri doğru kullanıcıya ait mi?
        const profileData = response.data;
        const profileUserId = profileData.userId || profileData.UserId || '';

        if (profileUserId && profileUserId !== user?.uid) {
          console.warn('⚠️ DİKKAT: Backend farklı bir kullanıcının profilini döndürdü!', {
            expected: user?.uid,
            received: profileUserId,
          });
        }

        // Başarılı yanıtı yerel olarak da saklayalım
        const convertedData = convertBackendProfileToFrontend(response.data);
        saveProfileLocally(convertedData);

        return convertedData;
      } catch (axiosError) {
        console.error('Profil getirme hatası:', axiosError);

        // Veritabanı hatası durumunda yerel depolamadan okuyalım
        const localProfile = getLocalProfile();

        if (localProfile) {
          console.log('⚠️ BACKEND HATASI - Yerel depolamadan profil okundu (offline mod)');
          return localProfile;
        }

        // Eğer yerel depolamada da profil yoksa, varsayılan profil oluşturalım
        if (user) {
          const defaultProfile = {
            firstName: '',
            lastName: '',
            fullName: '',
            email: user.email || '',
            phone: '',
            imageUrl: user.photoURL || '',
            isActive: true,
            createAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
          };

          console.log('⚠️ BACKEND HATASI - Varsayılan profil oluşturuldu (offline mod)');
          saveProfileLocally(defaultProfile);
          return defaultProfile;
        }

        // Alternatif yöntem deneme
        console.log('Alternatif profil getirme yöntemi deneniyor...');
        const token = await user.getIdToken();

        try {
          const alternativeResponse = await fetch(API_URL, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (!alternativeResponse.ok) {
            throw new Error(`API hatası: ${alternativeResponse.status}`);
          }

          const data = await alternativeResponse.json();
          console.log('Alternatif yöntemle alınan veri:', data);

          const convertedData = convertBackendProfileToFrontend(data);
          saveProfileLocally(convertedData);
          return convertedData;
        } catch (fetchError) {
          console.error('Fetch hatası, yerel depolamadan okuma deneniyor', fetchError);
          const localProfile = getLocalProfile();

          if (localProfile) {
            console.log('⚠️ BACKEND HATASI - Yerel depolamadan profil okundu (offline mod)');
            return localProfile;
          }

          throw fetchError;
        }
      }
    } catch (error) {
      console.error('Profil getirilemedi:', error.message);
      console.error('Hata stack:', error.stack);
      throw error;
    }
  },

  updateProfile: async (profileData) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      console.log('=== UPDATE PROFILE BAŞLATILIYOR ===');
      console.log('Frontend profil verisi:', profileData);
      console.log('Auth durumu:', !!auth);
      console.log('User durumu:', !!user);

      if (!user) {
        console.error('Kullanıcı oturum açmamış!');
        throw new Error('Kullanıcı oturum açmamış');
      }

      console.log('User ID:', user.uid);
      console.log('User email:', user.email);

      // **** ÖNEMLİ FİKS ****
      // Backend kodundan tespit edildi: Controller ProfileUpdateDto bekliyor, biz ProfileDto gönderiyoruz
      // ProfileUpdateDto formatına uygun veri oluşturalım

      const backendProfileData = {
        // Sadece ProfileUpdateDto'da bulunan alanları gönderiyoruz
        FirstName: profileData.firstName || '',
        LastName: profileData.lastName || '',
        Phone: profileData.phone || '',
        AvatarUrl: profileData.imageUrl || '',
        // UserId controller tarafından HttpContext.Items'dan alınıyor,
        // o yüzden request body'de göndermemize gerek yok
      };

      console.log('Backend için ProfileUpdateDto formatında veri:', backendProfileData);

      // PUT metodu kullanıyoruz, zira Controller'da HttpPut attribute'u var
      try {
        console.log(`PUT metodu ile profil güncelleme deneniyor: ${API_URL}`);

        const response = await axiosInstance.put('', backendProfileData);

        console.log(`PUT metodu BAŞARILI, yanıt:`, response.data);
        logResponseDetails(response, `PUT Profile Update`);

        // Bir saniye bekleyelim - veritabanı işlemleri için
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Tekrar profil verisini alarak doğrulayalım
        const verifyResponse = await axiosInstance.get('');
        console.log('Doğrulama GET yanıtı:', verifyResponse.data);
        logResponseDetails(verifyResponse, 'Verification GET after update');

        // GET yanıtını karşılaştıralım
        const updatedData = verifyResponse.data;
        const expectedData = {
          FirstName: profileData.firstName,
          LastName: profileData.lastName,
          Phone: profileData.phone,
        };

        console.log('KARŞILAŞTIRMA - Beklenen vs Alınan:', {
          expected: expectedData,
          actual: {
            FirstName: updatedData.FirstName,
            LastName: updatedData.LastName,
            Phone: updatedData.Phone,
          },
          match:
            updatedData.FirstName === expectedData.FirstName &&
            updatedData.LastName === expectedData.LastName &&
            updatedData.Phone === expectedData.Phone,
        });

        const convertedData = convertBackendProfileToFrontend(response.data);
        saveProfileLocally(convertedData);
        return convertedData;
      } catch (error) {
        console.error('Profil güncelleme hatası (backend):', error);

        // Veritabanı hatası - yerel olarak profili güncelleyelim (offline mod)
        console.log('⚠️ BACKEND HATASI - Profil yerel olarak güncelleniyor (offline mod)');

        // Mevcut yerel profili al ve güncelle
        const currentProfile = getLocalProfile() || {
          email: user.email || '',
          isActive: true,
          createAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };

        const updatedProfile = {
          ...currentProfile,
          firstName: profileData.firstName || '',
          lastName: profileData.lastName || '',
          fullName: `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim(),
          phone: profileData.phone || '',
          imageUrl: profileData.imageUrl || currentProfile.imageUrl || '',
        };

        saveProfileLocally(updatedProfile);

        // Başarılı mesajı gösterip offline profili dön
        console.log('Profil yerel olarak güncellendi (offline mod):', updatedProfile);
        return updatedProfile;
      }
    } catch (error) {
      // Hata detaylarını logla
      console.error('Profil güncelleme genel hatası:', error);
      console.error('Hata stack:', error.stack);

      if (error.response) {
        console.error('Profil güncelleme hatası:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
        });

        // Axios hatası için ayrıntılı bilgiyi ekleyelim
        if (error.response.data) {
          const errorData = error.response.data;
          let errorMessage = '';

          if (typeof errorData === 'string') {
            errorMessage = errorData;
          } else if (errorData.errors) {
            // ValidationError durumunda
            errorMessage = JSON.stringify(errorData.errors);
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else {
            errorMessage = JSON.stringify(errorData);
          }

          console.error('Detaylı hata:', errorMessage);
          error.message += ` - ${errorMessage}`;
        }
      } else if (error.request) {
        console.error('Yanıt alınamadı:', error.request);
      } else {
        console.error('Hata:', error.message);
      }
      throw error;
    }
  },

  // Yeni profil oluşturma metodu
  createProfile: async (initialData = {}) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        throw new Error('Kullanıcı oturum açmamış');
      }

      console.log('Profil oluşturulacak kullanıcı:', user.uid);

      // ProfileCreateDto formatına uygun veri gönderelim
      const backendProfileData = {
        FirstName: initialData.firstName || '',
        LastName: initialData.lastName || '',
        Email: initialData.email || user.email || '',
        Phone: initialData.phone || '',
        AvatarUrl: initialData.imageUrl || '',
        // UserId controller tarafından HttpContext.Items'dan alınıyor
      };

      console.log("Backend'e gönderilen ProfileCreateDto verisi:", backendProfileData);

      try {
        console.log(`POST ile profil oluşturma isteği gönderiliyor: ${API_URL}`);
        const response = await axiosInstance.post('', backendProfileData);
        console.log("Backend'den alınan yanıt:", response.data);
        logResponseDetails(response, 'POST Profile Create');

        return convertBackendProfileToFrontend(response.data);
      } catch (error) {
        console.error('Profil oluşturma hatası:', error);
        throw error;
      }
    } catch (error) {
      // Hata detaylarını logla
      console.error('Profil oluşturma genel hatası:', error);

      if (error.response) {
        console.error('Backend yanıt hatası:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
        });

        // Axios hatası için ayrıntılı bilgiyi ekleyelim
        if (error.response.data) {
          const errorData = error.response.data;
          let errorMessage = '';

          if (typeof errorData === 'string') {
            errorMessage = errorData;
          } else if (errorData.errors) {
            // ValidationError durumunda
            errorMessage = JSON.stringify(errorData.errors);
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else {
            errorMessage = JSON.stringify(errorData);
          }

          console.error('Detaylı hata:', errorMessage);
          error.message += ` - ${errorMessage}`;
        }
      } else if (error.request) {
        console.error('Yanıt alınamadı:', error.request);
      } else {
        console.error('Hata:', error.message);
      }
      throw error;
    }
  },
};
