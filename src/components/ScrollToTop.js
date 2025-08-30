import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  // Get the current location's pathname from React Router
  const { pathname } = useLocation();

  // Use an effect that triggers whenever the pathname changes
  useEffect(() => {
    // Scroll the window to the top left corner
    window.scrollTo(0, 0);
  }, [pathname]); // Dependency array ensures this runs on every route change

  // This component doesn't render anything, it just performs an action
  return null;
}

export default ScrollToTop;