import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Navbar.css';

function Navbar() {
  return (
    <nav className='navbar'>
      <ul>
        <li><Link to="/">Budget Management</Link></li>
        <li><Link to="/add-project">Add Project</Link></li>
        <li><Link to="/summary">Summary</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;
