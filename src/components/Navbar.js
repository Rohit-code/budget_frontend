// Navbar.js
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const Navbar = ({ projects, financialYears, onYearChange, onInvoiceProjectChange }) => {
  const { userRole, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleProjectChange = (e) => {
    const projectId = e.target.value;
    if (projectId) {
      navigate(`/project/${projectId}`);
      e.target.value = '';  // Reset the dropdown
    }
  };

  const handleYearChange = (e) => {
    const year = e.target.value;
    if (year) {
      onYearChange(year);
      navigate(`/financial-year-summary/${year}`);
      e.target.value = '';
    }
  };

  const handleInvoiceProjectChange = (e) => {
    const projectId = e.target.value;
    if (projectId) {
      onInvoiceProjectChange(projectId);
      navigate(`/invoice/${projectId}`);
      e.target.value = '';
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg py-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-6">
          
          {/* Add Project Link for Admin and PMO */}
          {(userRole === 'admin' || userRole === 'PMO') && (
            <Link to="/add-project" className="text-white hover:bg-blue-700 px-3 py-1.5 rounded-lg transition duration-300 font-semibold shadow-md transform hover:scale-105 text-[1rem]">
              Add Project
            </Link>
          )}
          
          {/* Summary Link for All Roles */}
          <Link to="/summary" className="text-white hover:bg-blue-700 px-3 py-1.5 rounded-lg transition duration-300 font-semibold shadow-md transform hover:scale-105 text-[1rem]">
            Summary
          </Link>
          
          {/* Project Selection Dropdown */}
          <select
            className="bg-blue-500 text-white px-3 py-1.5 rounded-lg font-semibold transition duration-300 shadow-md transform hover:scale-105 focus:outline-none focus:ring focus:ring-blue-300 text-[0.9rem]"
            onChange={handleProjectChange}
            style={{ width: '12rem' }}
          >
            <option value="">Select a project</option>
            {projects.map(project => (
              <option key={project.id} value={project.id} className="text-gray-800">{project.name}</option>
            ))}
          </select>
          
          {/* Financial Year Selection Dropdown */}
          <select
            className="bg-blue-500 text-white px-3 py-1.5 rounded-lg font-semibold transition duration-300 shadow-md transform hover:scale-105 focus:outline-none focus:ring focus:ring-blue-300 text-[0.9rem]"
            onChange={handleYearChange}
            style={{ width: '12rem' }}
          >
            <option value="">Select a financial year</option>
            {financialYears.map(year => (
              <option key={year.financial_year} value={year.financial_year} className="text-gray-800">{year.financial_year}</option>
            ))}
          </select>
          
          {/* Invoice Project Selection Dropdown */}
          <select
            className="bg-blue-500 text-white px-3 py-1.5 rounded-lg font-semibold transition duration-300 shadow-md transform hover:scale-105 focus:outline-none focus:ring focus:ring-blue-300 text-[0.9rem]"
            onChange={handleInvoiceProjectChange}
            style={{ width: '12rem' }}
          >
            <option value="">Invoice for a Project</option>
            {projects.map(project => (
              <option key={project.id} value={project.id} className="text-gray-800">{project.name}</option>
            ))}
          </select>
          
          {/* User List Link for Admin and PMO */}
          {(userRole === 'admin' || userRole === 'PMO') && (
            <Link to="/user-list" className="text-white hover:bg-blue-700 px-3 py-1.5 rounded-lg transition duration-300 font-semibold shadow-md transform hover:scale-105 text-[1rem]">
              User List
            </Link>
          )}
        </div>
        
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-3 py-1.5 rounded-lg font-semibold transition duration-300 shadow-md transform hover:scale-105 hover:bg-red-600 focus:outline-none focus:ring focus:ring-red-300 text-[1rem]"
          style={{ minWidth: '6rem' }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}  

export default Navbar;
