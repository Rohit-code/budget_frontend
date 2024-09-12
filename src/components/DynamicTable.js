import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

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
  const [invoiceActual, setInvoiceActual] = useState({});
  const [months, setMonths] = useState(generateMonthsArray(projectStartDate, projectEndDate));
  const [isEditable, setIsEditable] = useState(false);
  const [projectBudget, setProjectBudget] = useState(0);

  // Recalculate months and reset states when projectId, projectStartDate, or projectEndDate change
  useEffect(() => {
    const newMonths = generateMonthsArray(projectStartDate, projectEndDate);
    setMonths(newMonths);

    // Reset budget, actuals, and other state variables when project changes
    setNewBudget({});
    setNewActual({});
    setInvoiceBudget({});
    setInvoiceActual({});
    setExpenses([]);
    setProjectBudget(0);
  }, [projectId, projectStartDate, projectEndDate]);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const projectResponse = await axios.get(`http://192.168.1.120:5000/projects/${projectId}`);
        setProjectBudget(projectResponse.data.budget);

        const expensesResponse = await axios.get(`http://192.168.1.120:5000/projects/${projectId}/expenses`);
        const budgetData = {};
        const actualData = {};

        months.forEach(month => {
          budgetData[month] = {};
          actualData[month] = {};
          categories.forEach(category => {
            budgetData[month][category] = 0;  // Initialize with default value
            actualData[month][category] = 0;  // Initialize with default value
          });
        });

        expensesResponse.data.forEach(expense => {
          const { month, category, budget, actual } = expense;
        
          // Check if month exists in budgetData and actualData, initialize if not
          if (!budgetData[month]) {
            budgetData[month] = {};
          }
          if (!actualData[month]) {
            actualData[month] = {};
          }
        
          // Now it's safe to set the category values
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

        const combinedInvoiceActual = invoiceResponse.data.reduce((acc, invoice) => {
          Object.keys(invoice.invoice_actual).forEach(month => {
            if (!acc[month]) acc[month] = 0;
            acc[month] += parseFloat(invoice.invoice_actual[month]) || 0;
          });
          return acc;
        }, {});

        setInvoiceBudget(combinedInvoiceBudget);
        setInvoiceActual(combinedInvoiceActual);
      } catch (error) {
        console.error('Error fetching project data:', error);
      }
    };

    fetchProjectData();
  }, [projectId, months]); // Add 'months' as a dependency to ensure data is fetched when months change

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

  const handleDeleteProject = async () => {
    const firstConfirmation = window.confirm('Are you sure you want to delete this project? This action cannot be undone.');
    if (!firstConfirmation) return;

    const secondConfirmation = window.confirm('This is your last chance! Do you really want to delete this project?');
    if (!secondConfirmation) return;

    try {
      await axios.delete(`http://192.168.1.120:5000/projects/${projectId}`);
      alert('Project deleted successfully!');
      // You might want to redirect the user or reset the component state here
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Error deleting project.');
    }
  };

  const calculateCashOutflow = (month, type) => {
    const expensesForMonth = type === 'budget' ? newBudget : newActual;
    return categories.reduce((sum, category) => {
      const value = expensesForMonth[month]?.[category] || 0;
      return sum + value;
    }, 0);
  };

  const exportToExcel = () => {
    // Create the header and rows for the Excel file
    const dataToExport = [
      ['Category', ...months.flatMap(month => [`${month} Budget`, `${month} Actual`])],
      ['Invoice Plan', ...months.flatMap(month => [invoiceBudget[month] || 0, invoiceActual[month] || 0])],
      ['Cash Outflow', ...months.flatMap(month => [calculateCashOutflow(month, 'budget'), calculateCashOutflow(month, 'actual')])]
    ];

    categories.forEach(category => {
      const row = [category];
      months.forEach(month => {
        row.push(newBudget[month]?.[category] || 0);
        row.push(newActual[month]?.[category] || 0);
      });
      dataToExport.push(row);
    });

    // Convert the data to a worksheet
    const ws = XLSX.utils.aoa_to_sheet(dataToExport);

    // Create a new workbook and append the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Expenses');

    // Save the workbook to file
    XLSX.writeFile(wb, 'Expenses.xlsx');
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
          <tr style={{ backgroundColor: '#e0f7fa' }}>
            <td>Invoice Plan</td>
            {months.map(month => (
              <React.Fragment key={month}>
                <td>{invoiceBudget[month] || 0}</td>
                <td>{invoiceActual[month] || 0}</td>
              </React.Fragment>
            ))}
          </tr>
          <tr style={{ backgroundColor: '#e0f7fa' }}>
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
                <React.Fragment key={`${category}-${month}`}>
                  <td>
                    {isEditable ? (
                      <input
                        type="number"
                        value={newBudget[month]?.[category] || 0}
                        onChange={(e) => handleBudgetChange(month, category, e.target.value)}
                      />
                    ) : (
                      newBudget[month]?.[category] || 0
                    )}
                  </td>
                  <td>
                    {isEditable ? (
                      <input
                        type="number"
                        value={newActual[month]?.[category] || 0}
                        onChange={(e) => handleActualChange(month, category, e.target.value)}
                      />
                    ) : (
                      newActual[month]?.[category] || 0
                    )}
                  </td>
                </React.Fragment>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={() => setIsEditable(!isEditable)}>
        {isEditable ? 'Cancel' : 'Edit'}
      </button>
      {isEditable && <button onClick={handleSave}>Save</button>}
      <button onClick={exportToExcel}>Export to Excel</button>
      <button onClick={handleDeleteProject} style={{ backgroundColor: 'red', color: 'white' }}>Delete Project</button>
    </div>
  );
};

export default DynamicTable;
