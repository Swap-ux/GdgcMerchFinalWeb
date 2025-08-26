import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import NavListItem from './NavListItem';
import navListData from '../data/navListData';
import './Header.css';


function Header() {
  const { collectionItems, shoppingBag, isScrolled } = useContext(AppContext);

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <Link to="/" className="navbar-brand">
          <img 
            src="/images/gdgc-logo.png" 
            alt="GDGC" 
            className="navbar-logo" 
          />
        </Link>

        <nav className="nav">
          <ul className="nav-list">
            {navListData.map(nav => (
              <NavListItem 
                key={nav.id} 
                nav={nav} 
                isScrolled={isScrolled}
              />
            ))}
          </ul>
        </nav>

        <div className="user-items">
          <Link to="/collection" className="icon">
            <i className="bi bi-heart-fill"></i>
            <span className="like">{collectionItems.length}</span>
          </Link>
          
          <Link to="/shopping-bag" className="icon">
            <i className="bi bi-bag-fill"></i>
            <span className="bag">{shoppingBag.length}</span>
          </Link>

          
        </div>
      </div>
    </header>
  );
}

export default Header;
