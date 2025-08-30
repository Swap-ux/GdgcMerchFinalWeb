import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import NavListItem from './NavListItem';
import './Header.css';

function Header() {
  const { collectionItems, shoppingBag, isScrolled, userName, logout } = useContext(AppContext);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const profileRef = useRef(null);

  // Function to navigate to the login page
  function handleLoginClick() {
    navigate('/login');
  }

  // Function to handle logout
  function handleLogout() {
    logout();
    setDropdownOpen(false); // Close dropdown on logout
    navigate('/'); // Navigate to home on logout
  }

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileRef]);


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

       

        <div className="user-items">
          <Link to="/collection" className="icon">
            <i className="bi bi-heart-fill"></i>
            {collectionItems.length > 0 && <span className="like">{collectionItems.length}</span>}
          </Link>
          
          <Link to="/shopping-bag" className="icon">
            <i className="bi bi-bag-fill"></i>
            {shoppingBag.length > 0 && <span className="bag">{shoppingBag.length}</span>}
          </Link>

          {userName ? (
            <div className="pbox" ref={profileRef}>
              <div className="Ava" onClick={() => setDropdownOpen(!isDropdownOpen)}>
                {userName.charAt(0).toUpperCase()}
              </div>
              {isDropdownOpen && (
                <div className="dropdown">
                  {/* --- UPDATED: "My Account" now links to "/my-orders" --- */}
                  <Link to="/my-orders" onClick={() => setDropdownOpen(false)}>My Orders</Link>
                  <a href="#" onClick={handleLogout} className="logout">Logout</a>
                </div>
              )}
            </div>
          ) : (
            <button className="login-button" onClick={handleLoginClick}>
              Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;