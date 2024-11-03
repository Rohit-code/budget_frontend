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
          const response = await axios.get(`http://192.168.1.3:5000/projects/financial-year/${fiscalYear}`);
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
    <div className="p-8 min-h-screen bg-gradient-to-br from-teal-50 to-blue-50">
      <h2 className="text-3xl font-extrabold text-teal-700 mb-8 text-center">
        {fiscalYear} Financial Summary
      </h2>
  
      <div className="bg-white shadow-lg rounded-lg p-6 mb-8 max-w-3xl mx-auto">
        <p className="text-xl font-semibold text-gray-700 mb-4">
          Total Budget: <span className="text-teal-600">${summary.totalBudget.toFixed(2)}</span>
        </p>
        <p className="text-xl font-semibold text-gray-700 mb-4">
          Actual Expenses: <span className="text-teal-600">${summary.actualExpenses.toFixed(2)}</span>
        </p>
        <p className="text-xl font-semibold text-gray-700">
          Saved Budget: <span className="text-teal-600">${summary.savedBudget.toFixed(2)}</span>
        </p>
      </div>
  
      <h3 className="text-2xl font-semibold text-teal-600 mb-6 text-center">Projects</h3>
      
      <ul className="space-y-6 max-w-3xl mx-auto">
        {projects.map((project) => (
          <li key={project.id} className="bg-white shadow-md rounded-lg p-6 hover:shadow-xl transition-shadow duration-200">
            <p className="text-lg font-semibold text-gray-700 mb-2">{project.name}</p>
            <p className="text-gray-600 mb-1">
              Start Date: <span className="font-medium">{new Date(project.start_date).toLocaleDateString()}</span>
            </p>
            <p className="text-gray-600 mb-1">
              End Date: <span className="font-medium">{new Date(project.end_date).toLocaleDateString()}</span>
            </p>
            <p className="text-gray-600 mb-1">
              Budget: <span className="text-teal-600 font-medium">${project.budget.toFixed(2)}</span>
            </p>
            <p className="text-gray-600">
              Expenses: <span className="text-teal-600 font-medium">${project.expenses.toFixed(2)}</span>
            </p>
          </li>
        ))}
      </ul>
    </div>
  );  
};

export default FinancialSummary;
