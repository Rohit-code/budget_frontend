import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/DynamicTable.css';
import InvoiceTable from './InvoiceTable';

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
  const [months, setMonths] = useState(generateMonthsArray(projectStartDate, projectEndDate));
  const [isEditable, setIsEditable] = useState(false);
  const [projectBudget, setProjectBudget] = useState(0);
  const [invoiceBudget, setInvoiceBudget] = useState({});

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const projectResponse = await axios.get(`http://localhost:5000/projects/${projectId}`);
        setProjectBudget(projectResponse.data.budget);

        const expensesResponse = await axios.get(`http://localhost:5000/projects/${projectId}/expenses`);
        console.log('Fetched expenses response:', expensesResponse.data);

        const budgetData = {};
        const actualData = {};

        expensesResponse.data.forEach(expense => {
          const { month, category, budget, actual } = expense;
          if (!budgetData[month]) budgetData[month] = {};
          if (!actualData[month]) actualData[month] = {};
          budgetData[month][category] = parseFloat(budget) || 0;
          actualData[month][category] = parseFloat(actual) || 0;
        });

        console.log('Parsed budget data:', budgetData);
        console.log('Parsed actual data:', actualData);
        setNewBudget(budgetData);
        setNewActual(actualData);
        setExpenses(expensesResponse.data);
        setMonths(generateMonthsArray(projectStartDate, projectEndDate));
      } catch (error) {
        console.error('Error fetching project data:', error);
      }
    };

    fetchProjectData();

    setNewBudget({});
    setNewActual({});
  }, [projectId, projectStartDate, projectEndDate]);

  const handleInvoiceBudgetChange = (month, value) => {
    setInvoiceBudget(prev => ({
      ...prev,
      [month]: parseFloat(value) || 0
    }));
  };

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
      await axios.post(`http://localhost:5000/projects/${projectId}/expenses`, data);
      alert('Expenses saved successfully!');
      setIsEditable(false);
    } catch (error) {
      console.error('Error saving expenses:', error);
      alert('Error saving expenses.');
    }
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
      <InvoiceTable 
        projectId={projectId} 
        invoiceBudget={invoiceBudget} 
        onUpdateBudget={setInvoiceBudget} 
        isEditable={isEditable}
      />
      <table>
        <thead>
          <tr>
            <th>Month</th>
            <th>Invoice Budget</th>
            <th>Invoice Actual</th>
          </tr>
        </thead>
        <tbody>
          {months.map(month => (
            <tr key={month}>
              <td>{month}</td>
              <td>
                {isEditable ? (
                  <input
                    type="number"
                    value={invoiceBudget[month] || 0}
                    onChange={e => handleInvoiceBudgetChange(month, e.target.value)}
                  />
                ) : (
                  <span>{invoiceBudget[month] || 0}</span>
                )}
              </td>
              <td>{calculateCashOutflow(month, 'actual')}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>Detailed Expenses</h2>
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
