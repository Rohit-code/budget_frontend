import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/FinancialYearSummary.css';

const FinancialYearSummary = () => {
  const { startYear } = useParams();
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (startYear) {
      fetchFinancialYearSummary(startYear);
    }
  }, [startYear]);

  const fetchFinancialYearSummary = async (startYear) => {
    try {
      const response = await axios.get(`http://localhost:5000/projects/financial-year/${startYear}`);
      const fetchedProjects = response.data.map(project => ({
        ...project,
        budget_spent: parseFloat(project.budget_spent),
        carry_over_budget: parseFloat(project.carry_over_budget),
      }));
      setProjects(fetchedProjects);
      setError(null);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Error fetching projects.');
    }
  };

  const sortMonths = (expenses) => {
    return Object.entries(expenses).sort(([monthA], [monthB]) => {
      const dateA = new Date(Date.parse(monthA + ' 1, ' + startYear));
      const dateB = new Date(Date.parse(monthB + ' 1, ' + startYear));
      return dateA - dateB;
    });
  };

  return (
    <div className="financial-year-summary">
      <h2>Financial Year Summary {startYear}</h2>
      {error && <p>{error}</p>}
      {projects.length === 0 ? (
        <p>No projects found for this financial year.</p>
      ) : (
        projects.map(project => (
          <div key={project.id} className="project-summary">
            <h3>{project.name}</h3>
            <table className="expenses-table">
              <thead>
                <tr>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Budget Spent</th>
                  <th>Carry Over Budget</th>
                  <th>Expenses</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{new Date(project.start_date).toLocaleDateString()}</td>
                  <td>{new Date(project.end_date).toLocaleDateString()}</td>
                  <td>Rs.{project.budget_spent.toFixed(2)}</td>
                  <td>Rs.{project.carry_over_budget.toFixed(2)}</td>
                  <td>
                    <table className="inner-expenses-table">
                      <tbody>
                        {project.expenses ? sortMonths(project.expenses).map(([month, amount]) => (
                          <tr key={month}>
                            <td>{month}</td>
                            <td>Rs.{amount.toFixed(2)}</td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan="2">No expenses</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
};

export default FinancialYearSummary;
