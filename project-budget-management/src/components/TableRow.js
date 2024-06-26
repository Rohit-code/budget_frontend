import React from 'react';

function TableRow({ month, categories, data, onChange }) {
  return (
    <tr>
      <td>{month}</td>
      {categories.map(category => (
        <React.Fragment key={category}>
          <td>
            <input 
              type="number" 
              value={data[category]?.budget || ''} 
              onChange={(e) => onChange(month, category, 'budget', e.target.value)} 
            />
          </td>
          <td>
            <input 
              type="number" 
              value={data[category]?.actual || ''} 
              onChange={(e) => onChange(month, category, 'actual', e.target.value)} 
            />
          </td>
        </React.Fragment>
      ))}
    </tr>
  );
}

export default TableRow;
