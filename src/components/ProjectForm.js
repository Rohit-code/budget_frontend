// src/components/ProjectForm.js
import React, { useState } from 'react';
import axios from 'axios';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/ProjectForm.css';

function ProjectForm({ onProjectAdded }) {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');
  const [orderValue, setOrderValue] = useState('');
  const [error, setError] = useState(''); // Added state for error message

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form fields
    if (!name || !startDate || !endDate || !budget || !orderValue) {
      setError('All fields are required.');
      return;
    }

    // Clear error message if all fields are filled
    setError('');

    try {
      const response = await axios.post('http://192.168.1.120:5000/projects', {
        name,
        start_date: startDate,
        end_date: endDate,
        budget: parseFloat(budget),
        order_value: parseFloat(orderValue)
      });

      onProjectAdded(response.data);
      setName('');
      setStartDate('');
      setEndDate('');
      setBudget('');
      setOrderValue('');
    } catch (error) {
      console.error('Error adding project:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Project Name:</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label>Start Date:</label>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
      </div>
      <div>
        <label>End Date:</label>
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      </div>
      <div>
        <label>Budget:</label>
        <input type="number" value={orderValue} onChange={(e) => setOrderValue(e.target.value)} />
      </div>
      <div>
        <label>Order Value:</label>
        <input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} />
      </div>
      {error && <div className="error-message">{error}</div>} {/* Display error message */}
      <button type="submit">Add Project</button>
    </form>
  );
}

export default ProjectForm;
