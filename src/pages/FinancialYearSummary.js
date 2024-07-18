import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FinancialYearSummary = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [summary, setSummary] = useState([]);

  const fetchSummary = async () => {
    try {
      const response = await axios.get('http://localhost:5000/projects/completed', {
        params: {
          start_date: startDate,
          end_date: endDate
        }
      });
      setSummary(response.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  return (
    <div>
      <h2>Financial Year Summary</h2>
      <div>
        <label>Start Date:</label>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
      </div>
      <div>
        <label>End Date:</label>
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      </div>
      <button onClick={fetchSummary}>Get Summary</button>
      {summary.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Completion Date</th>
              <th>Total Budget</th>
              <th>Actual Expenses</th>
              <th>Saved Budget</th>
              <th>Carried Over Budget</th>
            </tr>
          </thead>
          <tbody>
            {summary.map((item, index) => (
              <tr key={index}>
                <td>{item.projectName}</td>
                <td>{item.completionDate}</td>
                <td>{item.totalBudget}</td>
                <td>{item.actualExpenses}</td>
                <td>{item.savedBudget}</td>
                <td>{item.carriedOverBudget}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default FinancialYearSummary;
