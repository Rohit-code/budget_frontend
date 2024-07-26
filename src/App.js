import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import AddProjectPage from './pages/AddProjectPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import SummaryPage from './pages/SummaryPage';
import FinancialYearSummary from './pages/FinancialYearSummary';
import Navbar from './components/Navbar';  // Import Navbar

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
        <Navbar projects={projects} financialYears={financialYears} />  {/* Use Navbar component */}
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
