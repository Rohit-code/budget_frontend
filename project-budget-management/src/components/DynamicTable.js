import React, { useState } from 'react';
import TableRow from './TableRow';
import axios from 'axios';
import styles from './DynamicTable.module.css';

const months = [
  'Apr-24', 'May-24', 'Jun-24', 'Jul-24', 'Aug-24', 'Sep-24', 
  'Oct-24', 'Nov-24', 'Dec-24', 'Jan-25', 'Feb-25', 'Mar-25'
];

const expenseCategories = [
  'Cash Outflow', 'Travel Desk', 'Accommodation', 'Site Travel',
  'Food', 'DP Vendor', 'DC Vendor', 'Flying Vendor', 'Consultant',
  'Special', 'Misc'
];

function DynamicTable() {
  const [data, setData] = useState({});

  const handleInputChange = (month, category, type, value) => {
    setData(prevData => ({
      ...prevData,
      [month]: {
        ...prevData[month],
        [category]: {
          ...prevData[month]?.[category],
          [type]: value
        }
      }
    }));
  };

  const handleSubmit = () => {
    axios.post('http://localhost:5000/save-budget', data)
      .then(response => {
        console.log('Data saved:', response.data);
      })
      .catch(error => {
        console.error('There was an error saving the data!', error);
      });
  };

  return (
    <div className={styles.tableContainer}>
      <h2 className={styles.tableTitle}>Budget Management</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Month</th>
            {expenseCategories.map(category => (
              <React.Fragment key={category}>
                <th>{category} Budget</th>
                <th>{category} Actual</th>
              </React.Fragment>
            ))}
          </tr>
        </thead>
        <tbody>
          {months.map(month => (
            <TableRow 
              key={month} 
              month={month} 
              categories={expenseCategories} 
              data={data[month] || {}} 
              onChange={handleInputChange} 
            />
          ))}
        </tbody>
      </table>
      <button className={styles.saveButton} onClick={handleSubmit}>Save</button>
    </div>
  );
}

export default DynamicTable;
