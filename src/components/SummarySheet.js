import React, { useEffect, useState } from 'react';
import axios from 'axios';

function SummarySheet() {
  const [summary, setSummary] = useState([]);

  useEffect(() => {
    const fetchSummary = async () => {
      const response = await axios.get('http://localhost:5000/project-summary');
      const summaryData = response.data.map(project => {
        const totalActualExpenses = Object.values(project.expenses).reduce((sum, expense) => sum + (expense.actual || 0), 0);
        const totalBudgetExpenses = Object.values(project.expenses).reduce((sum, expense) => sum + (expense.budget || 0), 0);
        return {
          ...project,
          consumed_actual: project.budget - totalActualExpenses,
          consumed_budget: project.budget - totalBudgetExpenses
        };
      });
      setSummary(summaryData);
    };

    fetchSummary();
  }, []);

  return (
    <div>
      <h2>Project Summary</h2>
      <table border="1">
        <thead>
          <tr>
            <th>Project Name</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Total Budget</th>
            <th>Total Actual</th>
            <th>Consumed Actual</th>
            <th>Consumed Budget</th>
          </tr>
        </thead>
        <tbody>
          {summary.map((project) => (
            <tr key={project.id}>
              <td>{project.name}</td>
              <td>{project.start_date}</td>
              <td>{project.end_date}</td>
              <td>{project.budget}</td>
              <td>{project.total_actual}</td>
              <td>{project.consumed_actual}</td>
              <td>{project.consumed_budget}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SummarySheet;
