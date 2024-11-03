import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/SummarySheet.css'; // Import the CSS file

function SummarySheet() {
  const [summary, setSummary] = useState([]);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await axios.get('http://192.168.1.3:5000/project-summary');
        const summaryData = response.data.map(project => {
          const totalActualExpenses = project.expenses.reduce((sum, expense) => sum + parseFloat(expense.actual || 0), 0);
          const totalBudgetExpenses = project.expenses.reduce((sum, expense) => sum + parseFloat(expense.budget || 0), 0);
          const consumedActual = project.budget - totalActualExpenses;
          const consumedBudget = project.budget - totalBudgetExpenses;

          return {
            ...project,
            totalActual: totalActualExpenses,
            totalBudget: totalBudgetExpenses,
            consumedActual: consumedActual,
            consumedBudget: consumedBudget
          };
        });
        setSummary(summaryData);
      } catch (error) {
        console.error('Error fetching project summary:', error);
      }
    };

    fetchSummary();
  }, []);

  return (
    <div className="p-8 bg-gradient-to-r from-teal-100 to-blue-50 min-h-screen">
      <h2 className="text-3xl font-extrabold text-teal-700 mb-8 text-center">Project Summary</h2>
      <div className="overflow-x-auto shadow-lg rounded-lg">
        <table className="min-w-full bg-white rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-teal-600 text-white">
              <th className="p-4 text-left font-semibold border-b border-gray-200">Project Name</th>
              <th className="p-4 text-left font-semibold border-b border-gray-200">Start Date</th>
              <th className="p-4 text-left font-semibold border-b border-gray-200">End Date</th>
              <th className="p-4 text-left font-semibold border-b border-gray-200">Total Budget</th>
              <th className="p-4 text-left font-semibold border-b border-gray-200">Total Actual</th>
              <th className="p-4 text-left font-semibold border-b border-gray-200">Remaining Actual</th>
              <th className="p-4 text-left font-semibold border-b border-gray-200">Consumed Budget</th>
            </tr>
          </thead>
          <tbody>
            {summary.map((project, index) => (
              <tr
                key={project.id}
                className={`text-gray-700 ${index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}`}
              >
                <td className="p-4 border-b border-gray-200">{project.name}</td>
                <td className="p-4 border-b border-gray-200">{project.start_date}</td>
                <td className="p-4 border-b border-gray-200">{project.end_date}</td>
                <td className="p-4 border-b border-gray-200">Rs.{project.totalBudget}</td>
                <td className="p-4 border-b border-gray-200">Rs.{project.totalActual}</td>
                <td className="p-4 border-b border-gray-200">Rs.{project.consumedActual}</td>
                <td className="p-4 border-b border-gray-200">Rs.{project.consumedBudget}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );  
}

export default SummarySheet;
