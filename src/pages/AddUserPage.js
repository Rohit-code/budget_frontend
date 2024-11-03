// src/pages/AddUserPage.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddUserPage = () => {
  const [newUser, setNewUser] = useState({ name: '', dept: '', emailid: '', password: '', role: '' });
  const navigate = useNavigate();

  const handleAddUser = async () => {
    try {
      await axios.post(
        'http://192.168.1.3:5000/add-user',
        newUser,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      navigate('/users');
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-gray-100 to-gray-300">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center text-gray-700 mb-6">Add New User</h2>
        <div className="space-y-4">
          <input 
            type="text" 
            placeholder="Name" 
            value={newUser.name} 
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} 
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300" 
          />
          <input 
            type="text" 
            placeholder="Department" 
            value={newUser.dept} 
            onChange={(e) => setNewUser({ ...newUser, dept: e.target.value })} 
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300" 
          />
          <input 
            type="email" 
            placeholder="Email" 
            value={newUser.emailid} 
            onChange={(e) => setNewUser({ ...newUser, emailid: e.target.value })} 
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300" 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={newUser.password} 
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} 
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300" 
          />
          <select 
            value={newUser.role} 
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} 
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300" 
          >
            <option value="">Select Role</option>
            <option value="PMO">PMO</option>
            <option value="manager">Manager</option>
            <option value="user">User</option>
          </select>
          <button 
            onClick={handleAddUser} 
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-md font-medium transition duration-200"
          >
            Add User
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddUserPage;
