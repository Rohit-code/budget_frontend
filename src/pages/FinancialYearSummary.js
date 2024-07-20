import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import '../styles/FinancialYearSummary.css';

const FinancialYearSummary = () => {
  const { year } = useParams();
  const [projectsData, setProjectsData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (year) {
      const fetchProjectsData = async () => {
        try {
          const response = await axios.get(`http://localhost:5000/projects/financial-year/${year}`);
          console.log('Fetched Data:', response.data); // Debug log
          setProjectsData(response.data);
          setError(null);
        } catch (error) {
          console.error('Error fetching projects data for financial year:', error);
          setError('Failed to fetch projects data.');
        }
      };

      fetchProjectsData();
    }
  }, [year]);

  if (!year) return <div>Select a financial year to see the summary.</div>;
  if (error) return <div>{error}</div>;

  const getMonthString = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('default', { month: 'short', year: 'numeric' });
  };

  const getMonthlyExpenses = (expenses) => {
    return Object.entries(expenses).map(([key, value]) => ({
      month: key,
      amount: value
    }));
  };

  return (
    <div>
      <h2>Financial Year Summary for {year}</h2>
      {projectsData.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Month</th>
              <th>Monthly Expenses</th>
            </tr>
          </thead>
          <tbody>
            {projectsData.map(project => {
              const monthlyExpenses = getMonthlyExpenses(project.expenses);
              return monthlyExpenses.map(expense => (
                <tr key={`${project.id}-${expense.month}`}>
                  <td>{project.name}</td>
                  <td>{expense.month}</td>
                  <td>{expense.amount}</td>
                </tr>
              ));
            })}
          </tbody>
        </table>
      ) : (
        <div>No data available for the selected year.</div>
      )}
    </div>
  );
};

export default FinancialYearSummary;
