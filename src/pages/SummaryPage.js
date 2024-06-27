import React, { useEffect, useState } from 'react';
import axios from 'axios';

function SummaryPage() {
  const [projects, setProjects] = useState([]);
  const [summaryData, setSummaryData] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('http://localhost:5000/projects');
        setProjects(response.data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        const summaries = await Promise.all(projects.map(async (project) => {
          const responseSummary = await axios.get(`http://localhost:5000/projects/${project.id}/summary`);
          const responseProject = await axios.get(`http://localhost:5000/projects/${project.id}`);
          
          return {
            projectId: project.id,
            projectName: project.name,
            start_date: responseProject.data.start_date,
            end_date: responseProject.data.end_date,
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
    <div>
      <h1>Project Budget Management System</h1>
      <h2>Summary</h2>
      <select>
        <option value="">Select a project</option>
        {projects.map(project => (
          <option key={project.id} value={project.id}>{project.name}</option>
        ))}
      </select>
      <h3>Summary</h3>
      <table border="1">
        <thead>
          <tr>
            <th>Project Name</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Total Budget</th>
            <th>Total Actual</th>
            <th>Consumed Actual</th>
            <th>Consumed Budget</th>
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
              <td>{summary.summary.consumedBudget}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SummaryPage;
