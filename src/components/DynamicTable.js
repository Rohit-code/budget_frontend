import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/DynamicTable.css'

const categories = [
  'Cash Outflow', 'Travel Desk', 'Accommodation', 'Site Travel',
  'Food', 'DP Vendor', 'DC Vendor', 'Flying Vendor',
  'Consultant', 'Special', 'Miscellaneous'
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

  const handleBudgetChange = (month, category, value) => {
    setNewBudget(prev => ({
      ...prev,
      [month]: {
        ...prev[month],
        [category]: value
      }
    }));
  };

  const handleActualChange = (month, category, value) => {
    setNewActual(prev => ({
      ...prev,
      [month]: {
        ...prev[month],
        [category]: value
      }
    }));
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

  return (
    <div>
      <h2>Expenses for the Project </h2>
      <table>
        <thead>
          <tr>
            <th>Month</th>
            {categories.map(category => (
              <React.Fragment key={category}>
                <th>{category} Budget</th>
                <th>{category} Actual</th>
              </React.Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          {months.map(month => (
            <tr key={month}>
              <td>{month}</td>
              {categories.map(category => (
                <React.Fragment key={category}>
                  <td>
                    {isEditable ? (
                      <input
                        type="number"
                        value={newBudget[month]?.[category] || expenses.find(exp => exp.month === month && exp.category === category)?.budget || ''}
                        onChange={e => handleBudgetChange(month, category, e.target.value)}
                      />
                    ) : (
                      <span>{newBudget[month]?.[category] || expenses.find(exp => exp.month === month && exp.category === category)?.budget || ''}</span>
                    )}
                  </td>
                  <td>
                    {isEditable ? (
                      <input
                        type="number"
                        value={newActual[month]?.[category] || expenses.find(exp => exp.month === month && exp.category === category)?.actual || ''}
                        onChange={e => handleActualChange(month, category, e.target.value)}
                      />
                    ) : (
                      <span>{newActual[month]?.[category] || expenses.find(exp => exp.month === month && exp.category === category)?.actual || ''}</span>
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
