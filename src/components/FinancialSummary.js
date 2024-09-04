import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FinancialSummary = ({ fiscalYear }) => {
  const [projects, setProjects] = useState([]);
  const [summary, setSummary] = useState({
    totalBudget: 0,
    actualExpenses: 0,
    savedBudget: 0
  });

  useEffect(() => {
    const fetchProjects = async () => {
      if (fiscalYear) {
        try {
          const response = await axios.get(`http://192.168.1.120:5000/projects/financial-year/${fiscalYear}`);
          const projects = response.data;
          setProjects(projects);

          // Calculate the summary
          let totalBudget = 0;
          let actualExpenses = 0;

          projects.forEach(project => {
            totalBudget += parseFloat(project.budget);
            actualExpenses += parseFloat(project.expenses); // Assuming 'expenses' is a field in your database
          });

          setSummary({
            totalBudget,
            actualExpenses,
            savedBudget: totalBudget - actualExpenses
          });

        } catch (error) {
          console.error('Error fetching projects for fiscal year:', error);
        }
      }
    };

    fetchProjects();
  }, [fiscalYear]);

  return (
    <div>
      <h2>{fiscalYear} Financial Summary</h2>
      <p>Total Budget: ${summary.totalBudget.toFixed(2)}</p>
      <p>Actual Expenses: ${summary.actualExpenses.toFixed(2)}</p>
      <p>Saved Budget: ${summary.savedBudget.toFixed(2)}</p>

      <h3>Projects</h3>
      <ul>
        {projects.map(project => (
          <li key={project.id}>
            {project.name} (Start Date: {project.start_date}, End Date: {project.end_date}, Budget: ${project.budget}, Expenses: ${project.expenses})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FinancialSummary;
