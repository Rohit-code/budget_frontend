// src/pages/InvoicePage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import InvoiceTable from '../components/InvoiceTable';

const InvoicePage = () => {
  const [projects, setProjects] = useState([]);
  const [budgets, setBudgets] = useState({});

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

  const handleUpdateBudget = (projectId, monthlyBudgets) => {
    setBudgets((prevBudgets) => ({
      ...prevBudgets,
      [projectId]: monthlyBudgets,
    }));
  };

  return (
    <div>
      <h1>Projects and Invoices</h1>
      {projects.map((project) => (
        <div key={project.id}>
          <h2>{project.name}</h2>
          <p>Start Date: {project.startDate}</p>
          <p>End Date: {project.endDate}</p>
          <p>Order Value: {project.orderValue}</p>
          <InvoiceTable 
            projectId={project.id}
            onUpdateBudget={(monthlyBudgets) => handleUpdateBudget(project.id, monthlyBudgets)}
          />
        </div>
      ))}
    </div>
  );
};

export default InvoicePage;
