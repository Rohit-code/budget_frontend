import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/FinancialYearTable.css';

const FinancialYearTable = () => {
  const [financialYears, setFinancialYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [projectsData, setProjectsData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFinancialYears = async () => {
      try {
        const response = await axios.get('http://localhost:5000/financial-years');
        setFinancialYears(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching financial years:', error);
        setError('Failed to fetch financial years.');
      }
    };

    fetchFinancialYears();
  }, []);

  useEffect(() => {
    if (selectedYear) {
      const fetchProjectsData = async () => {
        try {
          const response = await axios.get(`http://localhost:5000/projects/financial-year/${selectedYear}`);
          setProjectsData(response.data);
          setError(null);
          console.log(response.data); // Debug log
        } catch (error) {
          console.error('Error fetching projects data:', error);
          setError('Failed to fetch projects data.');
        }
      };

      fetchProjectsData();
    }
  }, [selectedYear]);

  return (
    <div className="financial-year-table">
      <h2>Financial Year Table</h2>
      <div className="input-group">
        <label>Select Financial Year:</label>
        <select onChange={(e) => setSelectedYear(e.target.value)} value={selectedYear}>
          <option value="">Select a Year</option>
          {financialYears.map((year) => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>
      {error && <div className="error-message">{error}</div>}
      {selectedYear && projectsData.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Amount Within Year</th>
              <th>Amount Carried Over</th>
            </tr>
          </thead>
          <tbody>
            {projectsData.map((project) => (
              <tr key={project.id}>
                <td>{project.name}</td>
                <td>{new Date(project.start_date).toLocaleDateString()}</td>
                <td>{new Date(project.end_date).toLocaleDateString()}</td>
                <td>{project.amountWithinYear}</td>
                <td>{project.amountCarriedOver}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default FinancialYearTable;
