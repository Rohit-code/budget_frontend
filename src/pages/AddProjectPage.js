import React from 'react';
import ProjectForm from '../components/ProjectForm';

function AddProjectPage({ onProjectAdded }) {
  return (
    <div>
      <h2>Add New Project</h2>
      <ProjectForm onProjectAdded={onProjectAdded} />
    </div>
  );
}

export default AddProjectPage;
