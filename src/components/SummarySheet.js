import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/SummarySheet.css'; // Import the CSS file

function SummarySheet() {
  const [summary, setSummary] = useState([]);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await axios.get('http://localhost:5000/project-summary');
        const summaryData = response.data.map(project => {
          const totalActualExpenses = project.expenses.reduce((sum, expense) => sum + parseFloat(expense.actual || 0), 0);
          const totalBudgetExpenses = project.expenses.reduce((sum, expense) => sum + parseFloat(expense.budget || 0), 0);
          const consumedActual = project.budget - totalActualExpenses;
          const consumedBudget = project.budget - totalBudgetExpenses;

          return {
            ...project,
            totalActual: totalActualExpenses,
            totalBudget: totalBudgetExpenses,
            consumedActual: consumedActual,
            consumedBudget: consumedBudget
          };
        });
        setSummary(summaryData);
      } catch (error) {
        console.error('Error fetching project summary:', error);
      }
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
            <th>Remaining Actual</th>
            <th>Consumed Budget</th>
          </tr>
        </thead>
        <tbody>
          {summary.map((project) => (
            <tr key={project.id}>
              <td>{project.name}</td>
              <td>{project.start_date}</td>
              <td>{project.end_date}</td>
              <td>{project.totalBudget}</td>
              <td>{project.totalActual}</td>
              <td>{project.consumedActual}</td>
              <td>{project.consumedBudget}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SummarySheet;
