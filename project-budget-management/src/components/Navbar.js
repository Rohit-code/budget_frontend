import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav>
      <ul>
        <li><Link to="/">Budget Management</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;
