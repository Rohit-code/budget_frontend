import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Invoice.css';

const generateMonthsArray = (start, end) => {
  const months = [];
  const startDate = new Date(start);
  const endDate = new Date(end);
  
  let currentDate = startDate;
  
  while (currentDate <= endDate) {
    const monthYear = currentDate.toLocaleString('default', { month: 'short', year: 'numeric' });
    months.push(monthYear);
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return months;
};

const Invoice = () => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('http://localhost:5000/projects');
        setProjects(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (isLoading) {
    return <p>Loading projects...</p>;
  }

  if (!projects.length) {
    return <p>No projects available.</p>;
  }

  const allMonths = projects.reduce((acc, project) => {
    const projectMonths = generateMonthsArray(project.start_date, project.end_date);
    return [...new Set([...acc, ...projectMonths])];
  }, []).sort();

  return (
    <div>
      <h2>Projects Invoice</h2>
      <table>
        <thead>
          <tr>
            <th>Project Name</th>
            {allMonths.map(month => (
              <th key={month} colSpan="2">{month}</th>
            ))}
          </tr>
          <tr>
            {allMonths.map(month => (
              <React.Fragment key={month}>
                <th>Budget</th>
                <th>Actual</th>
              </React.Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          {projects.map(project => (
            <tr key={project.id}>
              <td>{project.name}</td>
              {allMonths.map(month => {
                const expense = project.expenses.find(e => e.month === month) || {};
                return (
                  <React.Fragment key={month}>
                    <td>{expense.budget || '-'}</td>
                    <td>{expense.actual || '-'}</td>
                  </React.Fragment>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Invoice;
