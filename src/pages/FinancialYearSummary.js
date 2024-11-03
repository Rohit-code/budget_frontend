import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const FinancialYearSummary = () => {
  const { year } = useParams();  // Use useParams to get the route parameter
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFinancialYearSummary = async (selectedYear) => {
      try {
        const response = await axios.get(`http://192.168.1.3:5000/projects/financial-year/${selectedYear}`);
        const fetchedProjects = response.data.map(project => ({
          ...project,
          budget_spent: parseFloat(project.budget_spent),
          carry_over_budget: parseFloat(project.carry_over_budget),
        }));
        setProjects(fetchedProjects);
        setError(null);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setError('Error fetching projects.');
      }
    };

    if (year) {  // Use the year from the URL parameters
      fetchFinancialYearSummary(year);  // Fetch projects for the selected year
    }
  }, [year]);

  const sortMonths = (expenses) => {
    return Object.entries(expenses).sort(([monthA], [monthB]) => {
      const dateA = new Date(Date.parse(monthA + ' 1, ' + year));
      const dateB = new Date(Date.parse(monthB + ' 1, ' + year));
      return dateA - dateB;
    });
  };

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-teal-100 via-blue-100 to-indigo-100 flex flex-col items-center">
      <h2 className="text-3xl font-extrabold text-teal-700 mb-8">
        Financial Year Summary of {year}
      </h2>
      {error && <p className="text-red-500 text-lg font-semibold mb-4">{error}</p>}
      {projects.length === 0 ? (
        <p className="text-gray-600 text-lg">No projects found for this financial year.</p>
      ) : (
        projects.map((project) => (
          <div key={project.id} className="w-full max-w-4xl bg-white shadow-xl rounded-lg p-8 mb-8 transition-transform transform hover:scale-105">
            <h3 className="text-2xl font-semibold text-teal-600 mb-4">{project.name}</h3>
            <table className="w-full text-left border-collapse rounded-lg overflow-hidden shadow-md">
              <thead>
                <tr className="bg-teal-200 text-gray-700 font-semibold">
                  <th className="p-3 border border-gray-300">Start Date</th>
                  <th className="p-3 border border-gray-300">End Date</th>
                  <th className="p-3 border border-gray-300">Budget Spent</th>
                  <th className="p-3 border border-gray-300">Carry Over Budget</th>
                  <th className="p-3 border border-gray-300">Expenses</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-gray-50 text-gray-800">
                  <td className="p-3 border border-gray-300">{new Date(project.start_date).toLocaleDateString()}</td>
                  <td className="p-3 border border-gray-300">{new Date(project.end_date).toLocaleDateString()}</td>
                  <td className="p-3 border border-gray-300">Rs.{project.budget_spent.toFixed(2)}</td>
                  <td className="p-3 border border-gray-300">Rs.{project.carry_over_budget.toFixed(2)}</td>
                  <td className="p-3 border border-gray-300">
                    <table className="w-full border-collapse">
                      <tbody>
                        {project.expenses ? sortMonths(project.expenses).map(([month, amount]) => (
                          <tr key={month} className="bg-white hover:bg-gray-100 transition-colors duration-200">
                            <td className="p-2 border border-gray-300 text-gray-700">{month}</td>
                            <td className="p-2 border border-gray-300 text-gray-700">Rs.{amount.toFixed(2)}</td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan="2" className="p-2 text-gray-500 text-center">No expenses</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );  
};

export default FinancialYearSummary;
