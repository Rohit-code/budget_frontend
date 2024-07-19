import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/DynamicTable.css';

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
  const [error, setError] = useState('');
  const [projectBudget, setProjectBudget] = useState(0);

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
          // Correctly assign the month and category fields
          const { month, category, budget, actual } = { 
            month: expense.category, 
            category: expense.month, 
            budget: expense.budget, 
            actual: expense.actual 
          };
          if (!budgetData[category]) budgetData[category] = {};
          if (!actualData[category]) actualData[category] = {};
          budgetData[category][month] = parseFloat(budget) || 0;
          actualData[category][month] = parseFloat(actual) || 0;
        });

        console.log('Parsed budget data:', budgetData);
        console.log('Parsed actual data:', actualData);
        setNewBudget(budgetData);
        setNewActual(actualData);
      } catch (error) {
        console.error('Error fetching project data:', error);
      }
    };

    fetchProjectData();
  }, [projectId]);

  const handleBudgetChange = (category, month, value) => {
    setNewBudget(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [month]: parseFloat(value) || 0
      }
    }));
  };

  const handleActualChange = (category, month, value) => {
    setNewActual(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [month]: parseFloat(value) || 0
      }
    }));
  };

  const handleAddMonth = () => {
    const lastMonth = months[months.length - 1];
    const lastDate = new Date(lastMonth.split(' ').reverse().join('-'));
    lastDate.setMonth(lastDate.getMonth() + 1);
    const newMonth = lastDate.toLocaleString('default', { month: 'short', year: 'numeric' });

    if (lastDate <= new Date(projectEndDate)) {
      setMonths(prev => [...prev, newMonth]);
    } else {
      alert('Cannot add month beyond the project end date');
    }
  };

  const handleSave = async () => {
    // Calculate total actual expenses
    let totalActualExpenses = 0;

    categories.forEach(category => {
      months.forEach(month => {
        totalActualExpenses += newActual[category]?.[month] || 0;
      });
    });

    if (totalActualExpenses > projectBudget) {
      setError(`The total actual expenses exceed the project budget of ${projectBudget}.`);
      return;
    }

    // If validation passes, clear the error and proceed with saving
    setError('');
    const data = { newBudget, newActual };

    try {
      await axios.post(`http://localhost:5000/projects/${projectId}/expenses`, data);
      alert('Expenses saved successfully!');
      // Optionally, you can update state or perform other actions after successful save
    } catch (error) {
      console.error('Error saving expenses:', error);
      alert('Error saving expenses.');
    }
  };

  const calculateCashOutflow = (month, type) => {
    const expensesForMonth = type === 'budget' ? newBudget : newActual;
    return categories.reduce((sum, category) => {
      const value = expensesForMonth[category]?.[month] || 0;
      return sum + value;
    }, 0);
  };

  return (
    <div>
      <h2>Expenses for the Project</h2>
      {error && <p className="error">{error}</p>}
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
          <tr>
            <td>Cash Outflow</td>
            {months.map(month => (
              <React.Fragment key={month}>
                <td>{calculateCashOutflow(month, 'budget')}</td>
                <td>{calculateCashOutflow(month, 'actual')}</td>
              </React.Fragment>
            ))}
          </tr>
          {categories.map(category => (
            <tr key={category}>
              <td>{category}</td>
              {months.map(month => (
                <React.Fragment key={month}>
                  <td>
                    {isEditable ? (
                      <input
                        type="number"
                        value={newBudget[category]?.[month] || 0}
                        onChange={e => handleBudgetChange(category, month, e.target.value)}
                      />
                    ) : (
                      <span>{newBudget[category]?.[month] || expenses.find(e => e.category === category && e.month === month)?.budget || 0}</span>
                    )}
                  </td>
                  <td>
                    {isEditable ? (
                      <input
                        type="number"
                        value={newActual[category]?.[month] || 0}
                        onChange={e => handleActualChange(category, month, e.target.value)}
                      />
                    ) : (
                      <span>{newActual[category]?.[month] || expenses.find(e => e.category === category && e.month === month)?.actual || 0}</span>
                    )}
                  </td>
                </React.Fragment>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {/* <button onClick={handleAddMonth}>Add Month</button> */}
      <button onClick={handleSave}>Save</button>
      <button onClick={() => setIsEditable(!isEditable)}>{isEditable ? 'Done' : 'Edit'}</button>
    </div>
  );
};

export default DynamicTable;
