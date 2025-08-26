import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export function AppContextProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [collectionItems, setCollectionItems] = useState([]);
  const [shoppingBag, setShoppingBag] = useState([]);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Add to collection
  const addToCollection = (product) => {
    const isAlreadyInCollection = collectionItems.find(item => item.id === product.id);
    
    if (isAlreadyInCollection) {
      setCollectionItems(collectionItems.filter(item => item.id !== product.id));
    } else {
      setCollectionItems([...collectionItems, product]);
    }
  };

  // Add to shopping bag
const addToShoppingBag = (product, size, quantity, color) => {
  console.log('Adding to shopping bag:', { product, size, quantity, color });
  
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


  const contextValue = {
    products,
    setProducts,
    collectionItems,
    shoppingBag,
    isScrolled,
    addToCollection,
    addToShoppingBag,
    setShoppingBag,
    setCollectionItems
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}
