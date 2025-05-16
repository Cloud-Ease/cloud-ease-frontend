/**
=========================================================
* Material Kit 2 React - v2.1.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-kit-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import React, { useState, useEffect } from 'react';
import './CSS/App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import Homepage from './Pages/Homepage';
import Login from './Pages/Login';
import SignIn from './Pages/SignIn';
import Dashboard from './Pages/Dashboard';
import Profile from './Pages/Profile';

function App() {
  // Token'a göre kimlik doğrulama durumunu belirle
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('token') ? true : false;
  });

  // Token değişikliklerini izle
  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('token');
      setIsAuthenticated(!!token);
      console.log(
        'Auth status checked from App.js:',
        !!token ? 'Authenticated' : 'Not authenticated'
      );
    };

    // Sayfa yüklendiğinde kontrol et
    checkAuthStatus();

    // localStorage değişikliklerini dinle
    window.addEventListener('storage', checkAuthStatus);

    // Custom auth event'i dinle
    const handleAuthEvent = (event) => {
      console.log('Auth event received:', event.detail);
      setIsAuthenticated(event.detail.isAuthenticated);
    };
    window.addEventListener('authStateChanged', handleAuthEvent);

    // Manuel token kontrolü için zamanlanmış görev
    const tokenCheckInterval = setInterval(() => {
      checkAuthStatus();
    }, 60000); // Her bir dakikada bir token kontrolü

    // Component unmount olduğunda event listener'ları ve interval'ı temizle
    return () => {
      window.removeEventListener('storage', checkAuthStatus);
      window.removeEventListener('authStateChanged', handleAuthEvent);
      clearInterval(tokenCheckInterval);
    };
  }, []);

  // Korumalı route bileşeni
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  // Login/Signup sayfasına yönlendirme - kullanıcı giriş yapmışsa dashboard'a yönlendir
  const AuthRoute = ({ children }) => {
    if (isAuthenticated) {
      return <Navigate to="/dashboard-demo" replace />;
    }
    return children;
  };

  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route
            path="/"
            element={isAuthenticated ? <Navigate to="/dashboard-demo" /> : <Homepage />}
          />
          <Route
            path="/login"
            element={
              <AuthRoute>
                <Login />
              </AuthRoute>
            }
          />
          <Route
            path="/signin"
            element={
              <AuthRoute>
                <SignIn />
              </AuthRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard-demo"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          {/* Fallback route redirects to homepage */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
