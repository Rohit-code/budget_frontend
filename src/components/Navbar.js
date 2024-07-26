import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';  // Import CSS for styling

const Navbar = ({ projects, financialYears }) => {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <ul className="navbar-list">
        <li className="navbar-item"><Link to="/add-project" className="navbar-link">Add Project</Link></li>
        <li className="navbar-item"><Link to="/summary" className="navbar-link">Summary</Link></li>
        <li className="navbar-item">
          <select className="navbar-select" onChange={(e) => {
            const projectId = e.target.value;
            if (projectId) {
              navigate(`/project/${projectId}`);
            }
          }}>
            <option value="">Select a project</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
        </li>
        <li className="navbar-item">
          <select className="navbar-select" onChange={(e) => {
            const year = e.target.value;
            if (year) {
              navigate(`/financial-year-summary/${year}`);
            }
          }}>
            <option value="">Select a financial year</option>
            {financialYears.map(year => (
              <option key={year.financial_year} value={year.financial_year}>{year.financial_year}</option>
            ))}
          </select>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
