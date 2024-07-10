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

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/projects/${projectId}/expenses`);
        setExpenses(response.data);
      } catch (error) {
        console.error('Error fetching expenses:', error);
      }
    };

    fetchExpenses();
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
                      <span>{newBudget[category]?.[month] || 0}</span>
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
                      <span>{newActual[category]?.[month] || 0}</span>
                    )}
                  </td>
                </React.Fragment>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={handleAddMonth} disabled={!isEditable}>Add Month</button>
      <button onClick={handleSave} disabled={!isEditable}>Save</button>
      <button onClick={() => setIsEditable(!isEditable)}>{isEditable ? 'Cancel' : 'Edit'}</button>
    </div>
  );
};

export default DynamicTable;
