import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DynamicTable from '../components/DynamicTable';
import '../styles/ProjectDetailPage.css';

function ProjectDetailPage({ onDeleteProject }) {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await axios.get(`http://192.168.1.120:5000/projects/${projectId}`);
        setProject(response.data);
      } catch (error) {
        setError(error.response ? error.response.data.error : 'Error fetching project');
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const handleDelete = async () => {
    await onDeleteProject(projectId);
    navigate('/summary');
  };

  return (
    <div className="project-detail-container">
      {error ? (
        <p>{error}</p>
      ) : project ? (
        <>
          <h2>Project: {project.name}</h2>
          <div className="detail-info">
            <p>Start Date: {project.start_date}</p>
            <p>End Date: {project.end_date}</p>
          </div>
          <DynamicTable
            projectId={project.id}
            projectStartDate={project.start_date}
            projectEndDate={project.end_date}
          />
          <button onClick={handleDelete}>Delete Project</button>
        </>
      ) : (
        <p>Loading project details...</p>
      )}
    </div>
  );
}

export default ProjectDetailPage;
