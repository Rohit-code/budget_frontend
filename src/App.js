import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import AddProjectPage from './pages/AddProjectPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import SummaryPage from './pages/SummaryPage';

import FinancialYearSummary from './components/FinancialYearSummary'; // Import the new component

import './App.css';
import axios from 'axios';

function App() {
  const [projects, setProjects] = useState([]);

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
        <nav>
          <ul>
            <li><Link to="/add-project">Add Project</Link></li>
            <li><Link to="/summary">Summary</Link></li>
            <li>
              <select onChange={(e) => {
                const projectId = e.target.value;
                if (projectId) {
                  window.location.href = `/project/${projectId}`;
                }
              }}>
                <option value="">Select a project</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            </li>
          </ul>
        </nav>
        <Routes>
          <Route path="/add-project" element={<AddProjectPage onProjectAdded={handleProjectAdded} />} />
          <Route path="/summary" element={<SummaryPage />} />
          <Route path="/project/:projectId" element={<ProjectDetailPage onDeleteProject={handleDeleteProject} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
