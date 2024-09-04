import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [name, setName] = useState('');
  const [dept, setDept] = useState('');
  const [emailid, setEmailId] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 9 || !/[!@#$%^&*(),.?":{}|<>]/g.test(password)) {
      alert('Password must be at least 9 characters long and contain one special character');
      return;
    }
    try {
      await axios.post('http://192.168.1.120:5000/register', { name, dept, emailid, password });
      navigate('/login');
    } catch (error) {
      console.error('Error registering:', error);
      alert('Error registering');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register</h2>
      <div>
        <label>Name:</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <label>Department:</label>
        <input type="text" value={dept} onChange={(e) => setDept(e.target.value)} required />
      </div>
      <div>
        <label>Email:</label>
        <input type="email" value={emailid} onChange={(e) => setEmailId(e.target.value)} required />
      </div>
      <div>
        <label>Password:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      <button type="submit">Register</button>
    </form>
  );
};

export default Register;
