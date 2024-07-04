import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../components/Login';
import Register from '../components/Register';


const PublicRoutes = ({ handleLogin }) => (
  <Routes>
    <Route path="/login" element={<Login onLogin={handleLogin} />} />
    <Route path="/register" element={<Register />} />
    <Route path="*" element={<Login onLogin={handleLogin} />} /> {/* Default route */}
  </Routes>
);

export default PublicRoutes;

