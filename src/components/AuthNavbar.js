// src/components/AuthNavbar.js
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const AuthNavbar = () => {
  const location = useLocation();

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-white text-3xl font-bold tracking-wide hover:text-gray-200 transition duration-300">
            Budget Management
          </h1>
        </div>
        <div className="flex items-center space-x-6">
          {/* Conditionally render Login link */}
          {location.pathname !== '/login' && (
            <Link
              to="/login"
              className="text-white hover:bg-blue-500 bg-blue-700 px-5 py-2 rounded-full font-semibold transition-all duration-200 shadow-lg hover:shadow-blue-400/50"
            >
              Login
            </Link>
          )}
          {/* Conditionally render Register link */}
          {location.pathname !== '/register' && (
            <Link
              to="/register"
              className="text-white hover:bg-green-500 bg-green-700 px-5 py-2 rounded-full font-semibold transition-all duration-200 shadow-lg hover:shadow-green-400/50"
            >
              Register
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default AuthNavbar;
