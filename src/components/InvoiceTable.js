import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/InvoiceTable.css'; // Ensure to import the CSS file

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

const InvoiceTable = ({ projectId, projectStartDate, projectEndDate, onInvoiceBudgetSave }) => {
  const [localInvoiceBudget, setLocalInvoiceBudget] = useState({});
  const [invoiceActual, setInvoiceActual] = useState({});
  const [months, setMonths] = useState(generateMonthsArray(projectStartDate, projectEndDate));
  const [isEditing, setIsEditing] = useState(false);
  const [initialOrderValue, setInitialOrderValue] = useState(0);
  const [originalInvoiceBudget, setOriginalInvoiceBudget] = useState({});
  const [originalInvoiceActual, setOriginalInvoiceActual] = useState({});
  const [totalBudget, setTotalBudget] = useState(0);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const projectResponse = await axios.get(`http://localhost:5000/projects/${projectId}`);
        const projectData = projectResponse.data;
        setInitialOrderValue(parseFloat(projectData.budget) || 0);
        const initialBudget = parseFloat(projectData.order_value) || 0;
        setTotalBudget(initialBudget);

        // Fetch invoice data
        const invoiceResponse = await axios.get(`http://localhost:5000/projects/${projectId}/invoices`);
        const invoiceData = invoiceResponse.data[0] || {}; // Assuming there's only one invoice record

        const fetchedInvoiceBudget = invoiceData.invoice_budget || {};
        const fetchedInvoiceActual = invoiceData.invoice_actual || {};

        setOriginalInvoiceBudget(fetchedInvoiceBudget);
        setOriginalInvoiceActual(fetchedInvoiceActual);

        setLocalInvoiceBudget(fetchedInvoiceBudget);
        setInvoiceActual(fetchedInvoiceActual);

        setTotalBudget(initialBudget - Object.values(fetchedInvoiceBudget).reduce((a, b) => a + b, 0));
      } catch (error) {
        console.error('Error fetching project or invoice data:', error);
      }
    };

    fetchProjectData();
  }, [projectId]);

  const handleBudgetChange = (month, value) => {
    const newBudgetValue = parseFloat(value) || 0;
    const currentMonthBudget = localInvoiceBudget[month] || 0;

    // Calculate the remaining budget
    const newTotalBudget = totalBudget + currentMonthBudget - newBudgetValue;

    if (newTotalBudget >= 0) {
      setLocalInvoiceBudget(prev => ({
        ...prev,
        [month]: newBudgetValue
      }));
      setTotalBudget(newTotalBudget);
    } else {
      alert("Total budget exceeded!");
    }
  };

  const handleActualChange = (month, value) => {
    setInvoiceActual(prev => ({
      ...prev,
      [month]: parseFloat(value) || 0
    }));
  };

  const handleSave = async () => {
    try {
      await axios.post(`http://localhost:5000/projects/${projectId}/invoices`, { invoiceBudget: localInvoiceBudget, invoiceActual });
      onInvoiceBudgetSave(localInvoiceBudget);
      setIsEditing(false);
      alert('Invoice budget and actual saved successfully!');
    } catch (error) {
      console.error('Error saving invoice budget and actual:', error);
      alert('Error saving invoice budget and actual.');
    }
  };

  const handleCancel = () => {
    setLocalInvoiceBudget(originalInvoiceBudget);
    setInvoiceActual(originalInvoiceActual);
    setIsEditing(false);
  };

  return (
    <div className="invoice-table-container">
      <div className="invoice-table-header">
        <h2>Invoice Budgets</h2>
        <p>Order Value: Rs. {initialOrderValue.toFixed(2)}</p>
        <div className="remaining-budget">
          <p>Total Remaining Budget: Rs. {totalBudget.toFixed(2)}</p>
        </div>
      </div>
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
              <td>
                {isEditing ? (
                  <input
                    type="number"
                    value={invoiceActual[month] || 0}
                    onChange={e => handleActualChange(month, e.target.value)}
                  />
                ) : (
                  <span>{invoiceActual[month] || 0}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="invoice-table-buttons">
        {isEditing ? (
          <div>
            <button onClick={handleSave}>Save</button>
            <button onClick={handleCancel}>Cancel</button>
          </div>
        ) : (
          <button onClick={() => setIsEditing(true)}>Edit</button>
        )}
      </div>
    </div>
  );
};

export default InvoiceTable;
