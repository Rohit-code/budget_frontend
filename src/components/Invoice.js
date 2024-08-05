import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Invoice.css';

const Invoice = () => {
  const [projects, setProjects] = useState({});

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await axios.get('http://localhost:5000/invoices');
        setProjects(response.data);
      } catch (error) {
        console.error('Error fetching invoices:', error);
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
      const monthYear = currentDate.toLocaleString('default', { month: 'short', year: 'numeric' });
      months.push(monthYear);
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return months;
  };

  return (
    <div>
      <h2>Invoices</h2>
      {Object.keys(projects).map(projectId => {
        const project = projects[projectId];
        const months = generateMonthsArray(project.start_date, project.end_date);

        return (
          <div key={projectId} className="invoice-table-container">
            <h3>{project.name}</h3>
            <table>
              <thead>
                <tr>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Order Value</th>
                  {months.map(month => (
                    <th key={month} colSpan="2">{month}</th>
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
                  <td>{project.start_date}</td>
                  <td>{project.end_date}</td>
                  <td>{project.order_value}</td>
                  {months.map(month => (
                    <React.Fragment key={month}>
                      <td>{project.expenses[month]?.budget || '-'}</td>
                      <td>{project.expenses[month]?.actual || '-'}</td>
                    </React.Fragment>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
};

export default Invoice;
