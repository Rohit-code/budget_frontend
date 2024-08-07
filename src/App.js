import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import AddProjectPage from './pages/AddProjectPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import SummaryPage from './pages/SummaryPage';
import FinancialYearSummary from './pages/FinancialYearSummary';

const ProjectNavigation = ({ projects, financialYears }) => {
  const navigate = useNavigate();

  return (
    <nav>
      <ul>
        <li><Link to="/add-project">Add Project</Link></li>
        <li><Link to="/summary">Summary</Link></li>
        <li>
          <select onChange={(e) => {
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
        <li>
          <select onChange={(e) => {
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

function App() {
  const [projects, setProjects] = useState([]);
  const [financialYears, setFinancialYears] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('http://localhost:5000/projects');
        setProjects(response.data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchFinancialYears = async () => {
      try {
        const response = await axios.get('http://localhost:5000/financial-years');
        setFinancialYears(response.data);
      } catch (error) {
        console.error('Error fetching financial years:', error);
      }
    };

    fetchFinancialYears();
  }, []);

  const handleProjectAdded = (newProject) => {
    setProjects(prevProjects => [...prevProjects, newProject]);
  };

  const handleDeleteProject = async (projectId) => {
    try {
      await axios.delete(`http://localhost:5000/projects/${projectId}`);
      setProjects(prevProjects => prevProjects.filter(project => project.id !== projectId));
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  return (
    <Router>
      <div className="App">
        <h1>Project Budget Management System</h1>
        <ProjectNavigation projects={projects} financialYears={financialYears} />
        <Routes>
          <Route path="/add-project" element={<AddProjectPage onProjectAdded={handleProjectAdded} />} />
          <Route path="/summary" element={<SummaryPage />} />
          <Route path="/project/:projectId" element={<ProjectDetailPage onDeleteProject={handleDeleteProject} />} />
          <Route path="/financial-year-summary/:startYear" element={<FinancialYearSummary />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
