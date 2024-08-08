import React, { useState, useEffect } from 'react';
import axios from 'axios';

const InvoiceTable = ({ projectId, invoiceBudget, onUpdateBudget, isEditable }) => {
  const [localInvoiceBudget, setLocalInvoiceBudget] = useState(invoiceBudget);
  const [isEditing, setIsEditing] = useState(isEditable);

  useEffect(() => {
    setLocalInvoiceBudget(invoiceBudget);
  }, [invoiceBudget]);

  const handleBudgetChange = (month, value) => {
    setLocalInvoiceBudget(prev => ({
      ...prev,
      [month]: parseFloat(value) || 0
    }));
  };



  
  const handleSave = async () => {
    try {
      const response = await axios.post(`http://localhost:5000/projects/${projectId}/invoices`, { invoiceBudget: localInvoiceBudget });
      onUpdateBudget(localInvoiceBudget); // Notify parent component of the update
      setIsEditing(false); // Exit edit mode
      alert('Invoice budget saved successfully!');
    } catch (error) {
      console.error('Error saving invoice budget:', error);
      alert('Error saving invoice budget.');
    }
  };

  const handleCancel = () => {
    setLocalInvoiceBudget(invoiceBudget); // Revert to original invoice budget
    setIsEditing(false); // Exit edit mode
  };

  return (
    <div>
      <h2>Invoice Budgets</h2>
      <table>
        <thead>
          <tr>
            <th>Month</th>
            <th>Invoice Budget</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(localInvoiceBudget).map(month => (
            <tr key={month}>
              <td>{month}</td>
              <td>
                {isEditing ? (
                  <input
                    type="number"
                    value={localInvoiceBudget[month] || 0}
                    onChange={e => handleBudgetChange(month, e.target.value)}
                  />
                ) : (
                  <span>{localInvoiceBudget[month] || 0}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {isEditable && (
        <div>
          {isEditing ? (
            <>
              <button onClick={handleSave}>Save</button>
              <button onClick={handleCancel}>Cancel</button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)}>Edit</button>
          )}
        </div>
      )}
    </div>
  );
};

export default InvoiceTable;
