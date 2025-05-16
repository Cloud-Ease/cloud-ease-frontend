import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyCKh4Oe-TF8fgEtmK91GbKLd-pqkKZRFWk',
  authDomain: 'cloud-ease-auth.firebaseapp.com',
  projectId: 'cloud-ease-auth',
  appId: '1:1059401056774:web:f34ab712a55f3e83e73987',
};

// Firebase uygulamasını başlatıyoruz
const app = initializeApp(firebaseConfig);

// auth nesnesini alıyoruz ve dışa aktarıyoruz
export const auth = getAuth(app);

// Auth durumunu izle
export const initAuthStateListener = () => {
  console.log('Auth state listener başlatılıyor...');
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Kullanıcı oturum açmış durumda
        try {
          // Her oturum yenilemede token güncelle
          const token = await user.getIdToken(true);
          localStorage.setItem('token', token);
          console.log('Auth state: Kullanıcı oturumu aktif, token güncellendi');

          // Kimlik doğrulama durumunu custom event ile tüm uygulamaya bildir
          const authEvent = new CustomEvent('authStateChanged', {
            detail: { isAuthenticated: true },
          });
          window.dispatchEvent(authEvent);

          resolve(user);
        } catch (error) {
          console.error('Token yenileme hatası:', error);
          localStorage.removeItem('token'); // Hata durumunda token'ı temizle
          resolve(null);
        }
      } else {
        // Kullanıcı oturum açmamış, localStorage'dan token'ı temizle
        if (localStorage.getItem('token')) {
          localStorage.removeItem('token');

          // Kimlik doğrulama durumunu custom event ile tüm uygulamaya bildir
          const authEvent = new CustomEvent('authStateChanged', {
            detail: { isAuthenticated: false },
          });
          window.dispatchEvent(authEvent);
        }
        console.log('Auth state: Kullanıcı oturumu yok');
        resolve(null);
      }

      // Dinleyiciyi temizle (sadece bir kez çalışması için)
      unsubscribe();
    });
  });
};

// Sayfa yüklendiğinde ve düzenli aralıklarla kimlik doğrulama durumunu kontrol et
initAuthStateListener();
setInterval(() => {
  const auth = getAuth();
  if (auth.currentUser) {
    console.log('Periyodik token kontrolü ve yenileme...');
    auth.currentUser
      .getIdToken(true)
      .then((token) => {
        localStorage.setItem('token', token);
      })
      .catch((error) => {
        console.error('Periyodik token yenileme hatası:', error);
      });
  }
}, 10 * 60 * 1000); // 10 dakikada bir kontrol et

// Kullanıcı kaydetme fonksiyonu
export const register = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      const user = userCredential.user;
      console.log('User registered: ', user);

      const token = await user.getIdToken();
      // Token'ı localStorage'a kaydet
      localStorage.setItem('token', token);
      return token;
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error('Error registering user: ', errorCode, errorMessage);
      throw new Error(errorMessage);
    });
};

// Kullanıcı giriş yapıp token almak için fonksiyon
export const loginAndGetToken = async (email, password) => {
  console.log('Firebase login başlatıldı');
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();
    console.log('Token alındı');

    // Token'ı localStorage'a kaydet
    localStorage.setItem('token', token);
    console.log("Token localStorage'a kaydedildi");

    // Auth state değişikliği event'i yayınla
    const authEvent = new CustomEvent('authStateChanged', {
      detail: { isAuthenticated: true },
    });
    window.dispatchEvent(authEvent);
    console.log('Auth state event yayınlandı');

    return token;
  } catch (error) {
    console.error('Login hatası detayı:', error);

    // Auth state değişikliği event'i yayınla (başarısız giriş)
    try {
      const authEvent = new CustomEvent('authStateChanged', {
        detail: { isAuthenticated: false },
      });
      window.dispatchEvent(authEvent);
    } catch (eventError) {
      console.error('Event gönderme hatası:', eventError);
    }

    throw new Error(error.message);
  }
};

// Kullanıcı çıkış yapma fonksiyonu
export const logout = async () => {
  console.log('Firebase logout başlatıldı');
  try {
    // Önce token'ı temizle (Firebase oturumu kapanmasa bile bu işlemi yapalım)
    localStorage.removeItem('token');
    console.log("Token localStorage'dan temizlendi");

    // Aktif kullanıcı var mı kontrol et
    const auth = getAuth();
    if (!auth.currentUser) {
      console.log('Aktif kullanıcı yok, oturum zaten kapalı');
      return true;
    }

    // Firebase oturumunu kapat
    await signOut(auth);
    console.log('Firebase oturumu kapatıldı');

    // Auth state değişikliği event'i yayınla
    const authEvent = new CustomEvent('authStateChanged', {
      detail: { isAuthenticated: false },
    });
    window.dispatchEvent(authEvent);
    console.log('Auth state event yayınlandı');

    return true;
  } catch (error) {
    console.error('Çıkış yapma hatası detayı:', error);

    // Hata olsa bile token'ı temizlemeye çalış
    localStorage.removeItem('token');

    // Hata olsa bile event göndermeyi dene
    try {
      const authEvent = new CustomEvent('authStateChanged', {
        detail: { isAuthenticated: false },
      });
      window.dispatchEvent(authEvent);
    } catch (eventError) {
      console.error('Event gönderme hatası:', eventError);
    }

    return false;
  }
};
