import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FiscalYearDropdown = ({ onSelectYear }) => {
  const [fiscalYears, setFiscalYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');

  useEffect(() => {
    const fetchFiscalYears = async () => {
      try {
        const response = await axios.get('http://localhost:5000/fiscal-years');
        setFiscalYears(response.data);
      } catch (error) {
        console.error('Error fetching fiscal years:', error);
      }
    };

    fetchFiscalYears();
  }, []);

  const handleChange = (event) => {
    const year = event.target.value;
    setSelectedYear(year);
    onSelectYear(year);
  };

  return (
    <select value={selectedYear} onChange={handleChange}>
      <option value="" disabled>Select Fiscal Year</option>
      {fiscalYears.map(year => (
        <option key={year} value={year}>{year}</option>
      ))}
    </select>
  );
};

export default FiscalYearDropdown;
