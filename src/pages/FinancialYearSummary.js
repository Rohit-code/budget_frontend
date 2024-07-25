import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/FinancialYearSummary.css';

const FinancialYearSummary = () => {
  const { startYear } = useParams();
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (startYear) {
      fetchFinancialYearSummary(startYear);
    }
  }, [startYear]);

  const fetchFinancialYearSummary = async (startYear) => {
    try {
      const response = await axios.get(`http://localhost:5000/projects/financial-year/${startYear}`);
      setExpenses(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setError('Error fetching expenses.');
    }
  };

  return (
    <div className="financial-year-summary">
      <h2>Financial Year Summary {startYear}</h2>
      {error && <p>{error}</p>}
      {expenses.length === 0 ? (
        <p>No expenses found for this financial year.</p>
      ) : (
        <table className="expenses-table">
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Adjusted Budget</th>
              <th>Carry Over Budget</th>
              <th>Expenses</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map(expense => (
              <tr key={expense.id}>
                <td>{expense.name}</td>
                <td>{new Date(expense.start_date).toLocaleDateString()}</td>
                <td>{new Date(expense.end_date).toLocaleDateString()}</td>
                <td>${expense.adjusted_budget.toFixed(2)}</td>
                <td>${expense.carry_over_budget.toFixed(2)}</td>
                <td>
                  <table className="inner-expenses-table">
                    <tbody>
                      {expense.expenses ? Object.entries(expense.expenses).map(([month, amount]) => (
                        <tr key={month}>
                          <td>{month}</td>
                          <td>${amount.toFixed(2)}</td>
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
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default FinancialYearSummary;
