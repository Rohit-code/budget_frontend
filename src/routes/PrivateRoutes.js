import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AddProjectPage from '../pages/AddProjectPage';
import ProjectDetailPage from '../pages/ProjectDetailPage';
import SummaryPage from '../pages/SummaryPage';

const PrivateRoutes = ({ handleProjectAdded, handleDeleteProject }) => {
  return (
    <Routes>
      <Route path="/add-project" element={<AddProjectPage onProjectAdded={handleProjectAdded} />} />
      <Route path="/summary" element={<SummaryPage />} />
      <Route path="/project/:projectId" element={<ProjectDetailPage onDeleteProject={handleDeleteProject} />} />
      <Route path="*" element={<Navigate to="/summary" />} /> {/* Default route after login */}
    </Routes>
  );
};

export default PrivateRoutes;
