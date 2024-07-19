import React, { useState } from 'react';
import FiscalYearDropdown from './FiscalYearDropdown';
import FinancialSummary from './FinancialSummary';

const FinancialYearSummary = () => {
  const [selectedYear, setSelectedYear] = useState('');

  return (
    <div>
      <h2>Financial Year Summary</h2>
      <FiscalYearDropdown onSelectYear={setSelectedYear} />
      {selectedYear && <FinancialSummary fiscalYear={selectedYear} />}
    </div>
  );
};

export default FinancialYearSummary;
