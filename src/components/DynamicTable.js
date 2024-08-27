import React, { useState, useEffect } from 'react';
import axios from 'axios';

const categories = [
  'Travel Desk', 'Accommodation', 'Site Travel', 'Food',
  'DP Vendor', 'DC Vendor', 'Flying Vendor', 'Consultant',
  'Special', 'Miscellaneous'
];

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

const DynamicTable = ({ projectId, projectStartDate, projectEndDate }) => {
  const [expenses, setExpenses] = useState([]);
  const [newBudget, setNewBudget] = useState({});
  const [newActual, setNewActual] = useState({});
  const [invoiceBudget, setInvoiceBudget] = useState({});
  const [months, setMonths] = useState(generateMonthsArray(projectStartDate, projectEndDate));
  const [isEditable, setIsEditable] = useState(false);
  const [projectBudget, setProjectBudget] = useState(0);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const projectResponse = await axios.get(`http://192.168.1.120:5000/projects/${projectId}`);
        setProjectBudget(projectResponse.data.budget);

        const expensesResponse = await axios.get(`http://192.168.1.120:5000/projects/${projectId}/expenses`);
        const budgetData = {};
        const actualData = {};

        expensesResponse.data.forEach(expense => {
          const { month, category, budget, actual } = expense;
          if (!budgetData[month]) budgetData[month] = {};
          if (!actualData[month]) actualData[month] = {};
          budgetData[month][category] = parseFloat(budget) || 0;
          actualData[month][category] = parseFloat(actual) || 0;
        });

        setNewBudget(budgetData);
        setNewActual(actualData);
        setExpenses(expensesResponse.data);

        const invoiceResponse = await axios.get(`http://192.168.1.120:5000/projects/${projectId}/invoices`);
        const combinedInvoiceBudget = invoiceResponse.data.reduce((acc, invoice) => {
          Object.keys(invoice.invoice_budget).forEach(month => {
            if (!acc[month]) acc[month] = 0;
            acc[month] += parseFloat(invoice.invoice_budget[month]) || 0;
          });
          return acc;
        }, {});
        setInvoiceBudget(combinedInvoiceBudget);
        setMonths(generateMonthsArray(projectStartDate, projectEndDate));
      } catch (error) {
        console.error('Error fetching project data:', error);
      }
    };

    fetchProjectData();
  }, [projectId, projectStartDate, projectEndDate]);

  const handleBudgetChange = (month, category, value) => {
    setNewBudget(prev => ({
      ...prev,
      [month]: {
        ...prev[month],
        [category]: parseFloat(value) || 0
      }
    }));
  };

  const handleActualChange = (month, category, value) => {
    setNewActual(prev => ({
      ...prev,
      [month]: {
        ...prev[month],
        [category]: parseFloat(value) || 0
      }
    }));
  };

  const handleSave = async () => {
    let totalActualExpenses = Object.values(newActual).reduce((monthAcc, month) => {
      return monthAcc + Object.values(month).reduce((catAcc, value) => catAcc + value, 0);
    }, 0);

    if (totalActualExpenses > projectBudget) {
      const proceed = window.confirm(`The total actual expenses exceed the project budget of ${projectBudget}. Do you still want to save the expenses?`);
      if (!proceed) return;
    }

    const data = { newBudget, newActual, invoiceBudget };

    try {
      await axios.post(`http://192.168.1.120:5000/projects/${projectId}/expenses`, data);
      alert('Expenses saved successfully!');
      setIsEditable(false);
    } catch (error) {
      console.error('Error saving expenses:', error);
      alert('Error saving expenses.');
    }
  };

  const calculateSum = (data, type) => {
    return months.reduce((sum, month) => {
      return sum + categories.reduce((catSum, category) => {
        const value = data[month]?.[category] || 0;
        return catSum + value;
      }, 0);
    }, 0);
  };

  const calculateCashOutflow = (month, type) => {
    const expensesForMonth = type === 'budget' ? newBudget : newActual;
    return categories.reduce((sum, category) => {
      const value = expensesForMonth[month]?.[category] || 0;
      return sum + value;
    }, 0);
  };

  return (
    <div>
      <h2>Expenses for the Project</h2>
      <table>
        <thead>
          <tr>
            <th rowSpan="2">Category</th>
            {months.map(month => (
              <th key={month} colSpan="2">{month}</th>
            ))}
          </tr>
          <tr>
            {months.map(month => (
              <React.Fragment key={month}>
                <th>Budget</th>
                <th>Actual</th>
              </React.Fragment>
            ))}
          </tr>
          <tr style={{ backgroundColor: '#e0f7fa', fontWeight: 'bold' }}>
            <td>Invoice Plan</td>
            {months.map(month => (
              <td key={month} colSpan="2">
                {invoiceBudget[month] || 0}
              </td>
            ))}
          </tr>
          <tr style={{ backgroundColor: '#e0f7fa', fontWeight: 'bold' }}>
            <td>Cash Outflow</td>
            {months.map(month => (
              <React.Fragment key={month}>
                <td>{calculateCashOutflow(month, 'budget')}</td>
                <td>{calculateCashOutflow(month, 'actual')}</td>
              </React.Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          {categories.map(category => (
            <tr key={category}>
              <td>{category}</td>
              {months.map(month => (
                <React.Fragment key={month}>
                  <td>
                    {isEditable ? (
                      <input
                        type="number"
                        value={newBudget[month]?.[category] || 0}
                        onChange={e => handleBudgetChange(month, category, e.target.value)}
                      />
                    ) : (
                      <span>{newBudget[month]?.[category] || 0}</span>
                    )}
                  </td>
                  <td>
                    {isEditable ? (
                      <input
                        type="number"
                        value={newActual[month]?.[category] || 0}
                        onChange={e => handleActualChange(month, category, e.target.value)}
                      />
                    ) : (
                      <span>{newActual[month]?.[category] || 0}</span>
                    )}
                  </td>
                </React.Fragment>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={handleSave} disabled={!isEditable}>Save</button>
      <button onClick={() => setIsEditable(!isEditable)}>{isEditable ? 'Cancel' : 'Edit'}</button>
    </div>
  );
};

export default DynamicTable;
