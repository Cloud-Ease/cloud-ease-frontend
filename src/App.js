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

import React, { useState } from "react";
import "./CSS/App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Pages
import Homepage from "./pages/Homepage";
import Login from "./pages/Login";
import SignIn from "./pages/SignIn";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";

function App() {
  // Geçici olarak true yapıyoruz
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // Korumalı route bileşeni
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };
  
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signin" element={<SignIn />} />
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
          {/* Dashboard demosu için temporary route */}
          <Route path="/dashboard-demo" element={<Dashboard />} />
          {/* Fallback route redirects to homepage */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
