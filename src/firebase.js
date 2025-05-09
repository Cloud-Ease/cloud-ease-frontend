import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

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

// Kullanıcı kaydetme fonksiyonu
export const register = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      const user = userCredential.user;
      console.log('User registered: ', user);

      const token = await user.getIdToken();
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
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();
    console.log('Token:', token);
    return token;
  } catch (error) {
    console.error('Error logging in: ', error.message);
    throw new Error(error.message);
  }
};
