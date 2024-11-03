// src/components/ProjectForm.js
import React, { useState } from 'react';
import axios from 'axios';
import 'react-datepicker/dist/react-datepicker.css';

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
      const response = await axios.post('http://192.168.1.3:5000/projects', {
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-gray-700 font-semibold mb-2">Project Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>
      <div>
        <label className="block text-gray-700 font-semibold mb-2">Start Date:</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>
      <div>
        <label className="block text-gray-700 font-semibold mb-2">End Date:</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>
      <div>
        <label className="block text-gray-700 font-semibold mb-2">Budget:</label>
        <input
          type="number"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>
      <div>
        <label className="block text-gray-700 font-semibold mb-2">Order Value:</label>
        <input
          type="number"
          value={orderValue}
          onChange={(e) => setOrderValue(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>
      {error && <div className="text-red-500 font-semibold">{error}</div>}
      <button
        type="submit"
        className="w-full bg-teal-500 text-white font-semibold py-2 px-4 rounded-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-400"
      >
        Add Project
      </button>
    </form>
  );
}

export default ProjectForm;
