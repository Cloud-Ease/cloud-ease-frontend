import React from 'react';
import ReactDOM from 'react-dom/client';
import './CSS/App.css';
import App from './App';
import { initAuthStateListener } from './firebase';

// Uygulama yüklenirken Firebase Auth durumunu başlat
initAuthStateListener().then(() => {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
