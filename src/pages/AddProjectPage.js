// /src/pages/AddProjectPage.js
import React from 'react';
import ProjectForm from '../components/ProjectForm';
import '../styles/AddProjectPage.css';

function AddProjectPage({ onProjectAdded }) {
  return (
    <div className="add-project-container">
      <h2>Add New Project</h2>
      <ProjectForm onProjectAdded={onProjectAdded} />
    </div>
  );
}

export default AddProjectPage;
