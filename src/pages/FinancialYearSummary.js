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
      const fetchedExpenses = response.data.map(expense => ({
        ...expense,
        budget_spent: parseFloat(expense.budget_spent),
        carry_over_budget: parseFloat(expense.carry_over_budget),
      }));
      setExpenses(fetchedExpenses);
      setError(null);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      setError('Error fetching expenses.');
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
      {expenses.length === 0 ? (
        <p>No expenses found for this financial year.</p>
      ) : (
        <table className="expenses-table">
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Budget Spent</th>
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
                <td>Rs.{expense.budget_spent.toFixed(2)}</td>
                <td>Rs.{expense.carry_over_budget.toFixed(2)}</td>
                <td>
                  <table className="inner-expenses-table">
                    <tbody>
                      {expense.expenses ? sortMonths(expense.expenses).map(([month, amount]) => (
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
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default FinancialYearSummary;
