import React from 'react';
import { Link } from 'react-router-dom';


function NavListItem({ nav, isScrolled }) {
  return (
    <li className="nav-item">
      <Link 
        to={nav.link} 
        className={`nav-link ${nav.current ? 'active' : ''}`}
      >
        {nav.name}
      </Link>
    </li>
  );
}

export default NavListItem;
