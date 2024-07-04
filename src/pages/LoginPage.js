import React from 'react';
import Login from '../components/Login';


const LoginPage = ({ handleLogin }) => {
  return (
    <div>
      <Login onLogin={handleLogin} />
    </div>
  );
};

export default LoginPage;
