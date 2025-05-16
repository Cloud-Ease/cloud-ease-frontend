import axios from 'axios';
import { getAuth } from 'firebase/auth';

// API URL - backend controller'a göre doğru yol
const API_URL = 'https://localhost:7241/api/profile';

// Axios instance oluştur
const axiosInstance = axios.create({
  baseURL: API_URL,
  httpsAgent: {
    rejectUnauthorized: false, // Geliştirme ortamında self-signed sertifikalar için
  },
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

// Axios response interceptor ekle
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.message);
    return Promise.reject(error);
  }
);

export const profileService = {
  getProfile: async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      // Eğer firebase oturumu yoksa ama localStorage'da token varsa
      if (!user) {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Kullanıcı oturum açmamış');
        }

        // Token'dan userId'yi çıkaralım (JWT decode)
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        const userId = payload.user_id || payload.sub;

        if (!userId) {
          throw new Error('Token geçersiz veya kullanıcı kimliği bulunamadı');
        }

        // Token'la doğrudan istek yapalım
        const response = await axios.get(`${API_URL}/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          httpsAgent: {
            rejectUnauthorized: false, // Geliştirme ortamında self-signed sertifikalar için
          },
        });

        const profileData = response.data;
        return {
          fullName: `${profileData.firstName} ${profileData.lastName}`.trim(),
          email: profileData.email,
          phone: profileData.phone,
          imageUrl: profileData.imageUrl,
          isActive: profileData.isActive,
          createAt: profileData.createdAt,
          lastLoginAt: profileData.lastLoginAt,
        };
      }

      // Firebase kullanıcısı varsa normal akışı devam ettir
      // GET isteğinde kullanıcı ID'sini URL'e ekleyelim
      const response = await axiosInstance.get(`/${user.uid}`);

      // Backend'den gelen veriyi frontend formatına çevirelim
      const profileData = response.data;
      return {
        fullName: `${profileData.firstName} ${profileData.lastName}`.trim(),
        email: profileData.email,
        phone: profileData.phone,
        imageUrl: profileData.imageUrl,
        isActive: profileData.isActive,
        createAt: profileData.createdAt,
        lastLoginAt: profileData.lastLoginAt,
      };
    } catch (error) {
      // 404 hatası alırsak, profil bulunamadı anlamına gelir
      console.error('Profil getirilemedi:', error.message);
      throw error;
    }
  },

  updateProfile: async (profileData) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      // PUT isteğinde kullanıcı ID'sini URL'e ekleyelim
      const response = await axiosInstance.put('', {
        FirstName: profileData.firstName,
        LastName: profileData.lastName,
        Phone: profileData.phone || '',
        AvatarUrl: profileData.imageUrl || '',
      });

      // Backend'den gelen veriyi frontend formatına çevirelim
      const updatedProfile = response.data;
      return {
        fullName: `${updatedProfile.firstName || ''} ${updatedProfile.lastName || ''}`.trim(),
        email: updatedProfile.email || '',
        phone: updatedProfile.phone || '',
        imageUrl: updatedProfile.imageUrl || '',
        isActive: updatedProfile.isActive || false,
        createAt: updatedProfile.createdAt || new Date().toISOString(),
        lastLoginAt: updatedProfile.lastLoginAt || new Date().toISOString(),
      };
    } catch (error) {
      // Hata detaylarını logla
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

      // Tam adı ad ve soyad olarak bölelim
      const fullName = initialData.fullName || '';
      const nameParts = fullName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Backend'de ProfileDto içindeki alanları tam olarak eşleştir
      // ValidationError'dan kaçınmak için required alanları boş string olarak gönderiyoruz
      const profileData = {
        UserId: user.uid,
        FirstName: firstName,
        LastName: lastName,
        Email: user.email,
        Phone: initialData.phone || '', // null yerine boş string
        AvatarUrl: initialData.imageUrl || '', // null yerine boş string
      };

      console.log("Backend'e gönderilen profil verileri:", profileData);

      const response = await axiosInstance.post('', profileData);

      console.log("Backend'den alınan yanıt:", response.data);

      // Backend'den gelen veriyi frontend formatına çevirelim
      const createdProfile = response.data;

      return {
        firstName: createdProfile.firstName,
        lastName: createdProfile.lastName,
        email: createdProfile.email || '',
        phone: createdProfile.phone || '',
        imageUrl: createdProfile.imageUrl || '',
        isActive: createdProfile.isActive || false,
        createAt: createdProfile.createdAt || new Date().toISOString(),
        lastLoginAt: createdProfile.lastLoginAt || new Date().toISOString(),
      };
    } catch (error) {
      // Hata detaylarını logla
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
