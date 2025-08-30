import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export function AppContextProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [collectionItems, setCollectionItems] = useState(() => {
    try {
      const loggedInUser = localStorage.getItem('userName');
      const key = loggedInUser ? `collectionItems_${loggedInUser}` : 'collectionItems';
      const savedCollection = localStorage.getItem(key);
      return savedCollection ? JSON.parse(savedCollection) : [];
    } catch (error) {
      return [];
    }
  });
  const [shoppingBag, setShoppingBag] = useState(() => {
    try {
      const loggedInUser = localStorage.getItem('userName');
      const key = loggedInUser ? `shoppingBag_${loggedInUser}` : 'shoppingBag';
      const savedBag = localStorage.getItem(key);
      return savedBag ? JSON.parse(savedBag) : [];
    } catch (error) {
      return [];
    }
  });

  const [isScrolled, setIsScrolled] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userName, setUserName] = useState(localStorage.getItem('userName'));

  useEffect(() => {
    const key = userName ? `shoppingBag_${userName}` : 'shoppingBag';
    localStorage.setItem(key, JSON.stringify(shoppingBag));
  }, [shoppingBag, userName]);

  useEffect(() => {
    const key = userName ? `collectionItems_${userName}` : 'collectionItems';
    localStorage.setItem(key, JSON.stringify(collectionItems));
  }, [collectionItems, userName]);

  const login = (newToken, newUserName) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('userName', newUserName);
    setToken(newToken);
    setUserName(newUserName);
    const userShoppingBag = localStorage.getItem(`shoppingBag_${newUserName}`);
    setShoppingBag(userShoppingBag ? JSON.parse(userShoppingBag) : []);
    const userCollection = localStorage.getItem(`collectionItems_${newUserName}`);
    setCollectionItems(userCollection ? JSON.parse(userCollection) : []);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    setToken(null);
    setUserName(null);
    setShoppingBag([]);
    setCollectionItems([]);
  };

  const addToShoppingBag = (product, size, quantity, color) => {
    const existingItem = shoppingBag.find(item =>
      item.id === product.id && item.size === size && item.color === color
    );
    if (existingItem) {
      setShoppingBag(shoppingBag.map(item =>
        item.id === product.id && item.size === size && item.color === color
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setShoppingBag([...shoppingBag, { ...product, size, quantity, color: color || '' }]);
    }
  };

  const addToCollection = (productToAdd) => {
    setCollectionItems(prevItems => {
      const exists = prevItems.some(item => item.id === productToAdd.id);
      if (exists) {
        return prevItems.filter(item => item.id !== productToAdd.id);
      } else {
        return [...prevItems, productToAdd];
      }
    });
  };

  // --- NEW: FUNCTION TO CLEAR THE SHOPPING BAG ---
  const clearShoppingBag = () => {
    setShoppingBag([]); // This will also clear it from localStorage via the useEffect hook
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const value = {
    products,
    setProducts,
    collectionItems,
    setCollectionItems,
    shoppingBag,
    setShoppingBag,
    isScrolled,
    token,
    userName,
    login,
    logout,
    addToShoppingBag,
    addToCollection,
    clearShoppingBag, // <-- Expose the new function
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}