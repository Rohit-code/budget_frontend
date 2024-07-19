import React, { useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../styles/ProjectForm.css';

function ProjectForm({ onProjectAdded }) {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/projects', {
        name,
        start_date: startDate,
        end_date: endDate,
        budget: parseFloat(budget),
      });

      onProjectAdded(response.data);
      setName('');
      setStartDate('');
      setEndDate('');
      setBudget('');
    } catch (error) {
      console.error('Error adding project:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Project Name:</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <label>Start Date:</label>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
      </div>
      <div>
        <label>End Date:</label>
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
      </div>
      <div>
        <label>Budget:</label>
        <input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} required />
      </div>
      <button type="submit">Add Project</button>
    </form>
  );
}

export default ProjectForm;
