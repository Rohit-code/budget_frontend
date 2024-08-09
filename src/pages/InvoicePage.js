// InvoicePage.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import InvoiceTable from '../components/InvoiceTable';

const InvoicePage = ({ projectId }) => {
  const { projectId: urlProjectId } = useParams();
  const [project, setProject] = useState(null);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/projects/${projectId || urlProjectId}`);
        setProject(response.data);
      } catch (error) {
        console.error('Error fetching project:', error);
      }
    };

    const fetchInvoices = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/invoices?projectId=${projectId || urlProjectId}`);
        setInvoices(response.data);
      } catch (error) {
        console.error('Error fetching invoices:', error);
      }
    };

    fetchProject();
    fetchInvoices();
  }, [projectId, urlProjectId]);

  if (!project) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{project.name} - Invoices</h1>
      <InvoiceTable 
        projectId={project.id} 
        projectStartDate={project.start_date} 
        projectEndDate={project.end_date} 
        invoiceActual={invoices.reduce((acc, invoice) => ({ ...acc, [invoice.month]: invoice.amount }), {})}
        onInvoiceBudgetSave={() => {}}
      />
    </div>
  );
};

export default InvoicePage;
