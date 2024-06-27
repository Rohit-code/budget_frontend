import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
  const [expenses, setExpenses] = useState({});
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

    for (const month of months) {
      const totalBudgetExpenses = categories.reduce((sum, category) => {
        if (category !== 'Cash Outflow') {
          return sum + (parseFloat(newBudget[month]?.[category] || expenses[month]?.[category]?.budget || 0));
        }
        return sum;
      }, 0);

      const totalActualExpenses = categories.reduce((sum, category) => {
        if (category !== 'Cash Outflow') {
          return sum + (parseFloat(newActual[month]?.[category] || expenses[month]?.[category]?.actual || 0));
        }
        return sum;
      }, 0);

      const cashOutflowBudget = parseFloat(newBudget[month]?.['Cash Outflow'] || expenses[month]?.['Cash Outflow']?.budget || 0);
      const cashOutflowActual = parseFloat(newActual[month]?.['Cash Outflow'] || expenses[month]?.['Cash Outflow']?.actual || 0);

      if (totalBudgetExpenses > cashOutflowBudget) {
        alert(`The sum of budget expenses for ${month} exceeds the Cash Outflow budget.`);
        return;
      }

      if (totalActualExpenses > cashOutflowActual) {
        alert(`The sum of actual expenses for ${month} exceeds the Cash Outflow actual.`);
        return;
      }
    }

    try {
      await axios.post(`http://localhost:5000/projects/${projectId}/expenses`, data);
      alert('Expenses saved successfully!');
    } catch (error) {
      console.error('Error saving expenses:', error);
      alert('Error saving expenses.');
    }
  };

  return (
    <div>
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
                        value={newBudget[month]?.[category] || expenses[month]?.[category]?.budget || ''}
                        onChange={e => handleBudgetChange(month, category, e.target.value)}
                      />
                    ) : (
                      <span>{newBudget[month]?.[category] || expenses[month]?.[category]?.budget || ''}</span>
                    )}
                  </td>
                  <td>
                    {isEditable ? (
                      <input
                        type="number"
                        value={newActual[month]?.[category] || expenses[month]?.[category]?.actual || ''}
                        onChange={e => handleActualChange(month, category, e.target.value)}
                      />
                    ) : (
                      <span>{newActual[month]?.[category] || expenses[month]?.[category]?.actual || ''}</span>
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
