import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Invoice.css';

const Invoice = () => {
  const [projects, setProjects] = useState({});
  const [editData, setEditData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        console.log('Fetching invoices...');
        const response = await axios.get('http://localhost:5000/invoices');
        console.log('API response:', response.data);
        setProjects(response.data);

        const initialEditData = {};
        Object.keys(response.data).forEach(projectId => {
          initialEditData[projectId] = response.data[projectId].expenses || {};
        });
        setEditData(initialEditData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching invoices:', error);
        setError('Failed to fetch invoices');
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const generateMonthsArray = (start, end) => {
    const months = [];
    const startDate = new Date(start);
    const endDate = new Date(end);

    let currentDate = startDate;

    while (currentDate <= endDate) {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const monthYear = `${year}-${month}`;
      months.push(monthYear);
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return months;
  };

  const handleInputChange = (projectId, month, field, value) => {
    setEditData(prevState => ({
      ...prevState,
      [projectId]: {
        ...prevState[projectId],
        [month]: {
          ...prevState[projectId]?.[month],
          [field]: value
        }
      }
    }));
  };

  const handleSave = async (projectId) => {
    const projectEdits = editData[projectId] || {};
    console.log('Saving project edits:', projectEdits);

    const updates = [];
    for (const month in projectEdits) {
      const { budget, actual } = projectEdits[month];
      if (budget < 0 || actual < 0) {
        setError('Budget and actual values must be positive');
        return;
      }

      updates.push({ month, budget, actual });
    }

    try {
      const url = `http://localhost:5000/invoices/${projectId}`;
      console.log('API URL:', url);
      console.log('Updates:', updates);
      await axios.put(url, { expenses: updates });

      setProjects(prevState => ({
        ...prevState,
        [projectId]: {
          ...prevState[projectId],
          expenses: {
            ...prevState[projectId].expenses,
            ...projectEdits
          }
        }
      }));
      setError('');
    } catch (error) {
      console.error('Error saving invoice:', error);
      setError('Failed to save invoice');
    }

    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const calculateTotalBudget = (project) => {
    return Object.values(project.expenses || {}).reduce((total, { budget }) => total + (parseFloat(budget) || 0), 0).toFixed(2);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div>
      {Object.keys(projects).length === 0 ? (
        <div>No invoices found</div>
      ) : (
        Object.keys(projects).map(projectId => {
          const project = projects[projectId];
          const months = generateMonthsArray(project.start_date, project.end_date);

          return (
            <div key={projectId} className="invoice-table-container">
              <h3 className="project-name">{project.name}</h3>
              <table>
                <thead>
                  <tr>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Order Value</th>
                    {months.map(month => (
                      <th key={month} colSpan="2">{new Date(month).toLocaleString('default', { month: 'short', year: 'numeric' })}</th>
                    ))}
                  </tr>
                  <tr>
                    <th></th>
                    <th></th>
                    <th></th>
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
                    <td>{new Date(project.start_date).toLocaleDateString()}</td>
                    <td>{new Date(project.end_date).toLocaleDateString()}</td>
                    <td>{project.order_value}</td>
                    {months.map(month => (
                      <React.Fragment key={month}>
                        <td>
                          <input
                            type="number"
                            value={editData[projectId]?.[month]?.budget || project.expenses[month]?.budget || ''}
                            onChange={e => handleInputChange(projectId, month, 'budget', e.target.value)}
                            disabled={!isEditing}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={editData[projectId]?.[month]?.actual || project.expenses[month]?.actual || ''}
                            onChange={e => handleInputChange(projectId, month, 'actual', e.target.value)}
                            disabled={!isEditing}
                          />
                        </td>
                      </React.Fragment>
                    ))}
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={months.length * 2 + 3}>
                      <div className="total-budget">
                        Total Budget: {calculateTotalBudget(project)}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={months.length * 2 + 3}>
                      {isEditing ? (
                        <button className="save-button" onClick={() => handleSave(projectId)}>Save</button>
                      ) : (
                        <button className="edit-button" onClick={handleEdit}>Edit</button>
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          );
        })
      )}
    </div>
  );
};

export default Invoice;
