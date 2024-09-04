import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/SummaryPage.css';

function SummaryPage() {
  const [projects, setProjects] = useState([]);
  const [summaryData, setSummaryData] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('http://192.168.1.120:5000/projects');
        setProjects(response.data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        const summaries = await Promise.all(projects.map(async (project) => {
          const responseSummary = await axios.get(`http://192.168.1.120:5000/projects/${project.id}/summary`);
          const responseProject = await axios.get(`http://192.168.1.120:5000/projects/${project.id}`);
          
          return {
            projectId: project.id,
            projectName: project.name,
            start_date: formatDate(responseProject.data.start_date),
            end_date: formatDate(responseProject.data.end_date),
            summary: responseSummary.data
          };
        }));
        setSummaryData(summaries);
      } catch (error) {
        console.error('Error fetching summary data:', error);
      }
    };

    if (projects.length > 0) {
      fetchSummaryData();
    }
  }, [projects]);

  return (
    <div className="summary-page-container">
      <h1>Project Budget Management System</h1>
      <h2>Summary</h2>
      <table>
        <thead>
          <tr>
            <th>Project Name</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Total Budget</th>
            <th>Total Actual</th>
            <th>Remaining Actual</th>
          </tr>
        </thead>
        <tbody>
          {summaryData.map((summary) => (
            <tr key={summary.projectId}>
              <td>{summary.projectName}</td>
              <td>{summary.start_date}</td>
              <td>{summary.end_date}</td>
              <td>{summary.summary.totalBudget}</td>
              <td>{summary.summary.consumedActual}</td>
              <td>{summary.summary.remainingActual}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SummaryPage;
