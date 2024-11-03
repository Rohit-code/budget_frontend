import React from 'react';
import ProjectForm from '../components/ProjectForm';

function AddProjectPage({ onProjectAdded }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-100 to-blue-50 p-6">
      <div className="w-full max-w-lg bg-white shadow-2xl rounded-lg p-8">
        <h2 className="text-3xl font-extrabold text-teal-700 mb-6 text-center">
          Add New Project
        </h2>
        <ProjectForm onProjectAdded={onProjectAdded} />
      </div>
    </div>
  );
}

export default AddProjectPage;
