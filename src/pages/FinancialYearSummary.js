import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FinancialYearSummary = ({ year }) => {
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    if (year) {
      const [startYear, endYear] = year.split('/');
      const fetchExpenses = async () => {
        try {
          const response = await axios.get(`http://localhost:5000/projects/financial-year/${startYear}/${endYear}`);
          setExpenses(response.data);
        } catch (error) {
          console.error('Error fetching expenses:', error);
        }
      };

      fetchExpenses();
    }
  }, [year]);

  const getExpensesByYearPart = (startYear, endYear) => {
    const startYearPart = {};
    const endYearPart = {};

    expenses.forEach(expense => {
      const monthYear = expense.month.split(' ');
      const month = monthYear[0];
      const expenseYear = monthYear[1];

      if (expenseYear === startYear && ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].includes(month)) {
        startYearPart[expense.month] = expense.total_expense;
      } else if (expenseYear === endYear && ['Jan', 'Feb', 'Mar'].includes(month)) {
        endYearPart[expense.month] = expense.total_expense;
      }
    });

    return { startYearPart, endYearPart };
  };

  const renderTable = (expenses) => (
    <table>
      <thead>
        <tr>
          <th>Month</th>
          <th>Total Actual Expenses</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(expenses).map(([month, total]) => (
          <tr key={month}>
            <td>{month}</td>
            <td>{total.toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  if (!year) {
    return <div>Please select a financial year.</div>;
  }

  const { startYearPart, endYearPart } = getExpensesByYearPart(year.split('/')[0], year.split('/')[1]);

  return (
    <div>
      <h2>Financial Year Summary</h2>
      {year && (
        <div>
          <h3>Financial Year {year.split('/')[0]} (April to December)</h3>
          {renderTable(startYearPart)}
          <h3>Financial Year {year.split('/')[1]} (January to March)</h3>
          {renderTable(endYearPart)}
        </div>
      )}
    </div>
  );
};

export default FinancialYearSummary;
