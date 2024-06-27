import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SummarySheet from '../components/SummarySheet';

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
          const response = await axios.get(`http://localhost:5000/projects/${project.id}/summary`);
          return {
            projectId: project.id,
            projectName: project.name,
            summary: response.data
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
      <h2>Summary</h2>
      {summaryData.length === 0 ? (
        <p>Loading summary...</p>
      ) : (
        summaryData.map(summary => (
          <div key={summary.projectId}>
            <h3>{summary.projectName}</h3>
            <SummarySheet summary={summary.summary} />
          </div>
        ))
      )}
    </div>
  );
}

export default SummaryPage;
