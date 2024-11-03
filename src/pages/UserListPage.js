// src/pages/UserListPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UserListPage = () => {
  const [users, setUsers] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem('role');
    setUserRole(role);

    const fetchUsers = async () => {
      try {
        const response = await axios.get('http://192.168.1.3:5000/users', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId) => {
    if (userRole !== 'admin' && userRole !== 'PMO') {
      alert('You do not have permission to delete users.');
      return;
    }

    try {
      await axios.delete(`http://192.168.1.3:5000/users/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setUsers(users.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  return (
    <div className="container mx-auto p-8 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">User List</h2>
      
      {(userRole === 'admin' || userRole === 'PMO') && (
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => navigate('/add-user')}
            className="bg-blue-500 text-white py-2 px-4 rounded"
          >
            Add New User
          </button>
        </div>
      )}

      <div className="overflow-x-auto shadow-md rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full bg-white rounded-lg">
          <thead>
            <tr className="bg-indigo-600 text-white text-left">
              <th className="py-4 px-6 font-semibold text-lg text-center">Name</th>
              <th className="py-4 px-6 font-semibold text-lg text-center">Department</th>
              <th className="py-4 px-6 font-semibold text-lg text-center">Email</th>
              <th className="py-4 px-6 font-semibold text-lg text-center">Role</th>
              {(userRole === 'admin' || userRole === 'PMO') && <th className="py-4 px-6 font-semibold text-lg text-center">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user.id} className={`text-center border-b transition-colors duration-150 ${index % 2 === 0 ? 'bg-gray-100' : 'bg-white'} hover:bg-indigo-100`}>
                <td className="py-4 px-6 text-gray-800 text-base">{user.name}</td>
                <td className="py-4 px-6 text-gray-800 text-base">{user.dept}</td>
                <td className="py-4 px-6 text-gray-800 text-base">{user.emailid}</td>
                <td className="py-4 px-6 text-gray-800 text-base capitalize">{user.role}</td>
                {(userRole === 'admin' || userRole === 'PMO') && (
                  <td className="py-4 px-6">
                    <button onClick={() => handleDeleteUser(user.id)} className="text-red-500 hover:text-red-700 font-semibold bg-red-100 rounded-full px-3 py-1 transition-colors duration-150">Delete</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserListPage;
