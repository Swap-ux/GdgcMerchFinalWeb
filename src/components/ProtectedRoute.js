import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Navigate, useLocation } from 'react-router-dom';

function ProtectedRoute({ children }) {
  // Get the token from the context to check for login status
  const { token } = useContext(AppContext);
  const location = useLocation();

  // If the user is not logged in, redirect them to the /login page
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If the user is logged in, show the child component (the protected page)
  return children;
}

export default ProtectedRoute;