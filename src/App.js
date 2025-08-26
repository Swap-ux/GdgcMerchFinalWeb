import React, { useEffect, useContext } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppContextProvider, AppContext } from './context/AppContext';
import Header from './components/Header';
import Footer from './components/Footer';

import Home from './pages/Home';
import ProductDetail from './pages/ProductDetails';
import Collection from './pages/Collection';
import ShoppingBag from './pages/ShoppingBag';

// App content inside context
function AppContent() {
  const { products, setProducts } = useContext(AppContext);

  useEffect(() => {
    // Fetch products on app load
    fetchProductsGlobally();
  }, []);

  const fetchProductsGlobally = async () => {
    if (products.length > 0) return; // Don't fetch if already loaded
    
    try {
      const response = await fetch('http://localhost:3001/products');
      const data = await response.json();
      
      if (data && data.length > 0) {
        const productsWithActive = data.map((product, index) => ({
          ...product,
          active: index === 0,
          sizes: product.sizes || ["XS", "S", "M", "L", "XL"],
          colors: product.colors || ["Black", "White", "Grey"]
        }));
        setProducts(productsWithActive);
        console.log('Products loaded globally:', productsWithActive);
      }
    } catch (error) {
      console.error('Error fetching products globally, using fallback:', error);
      // Fallback data
      const fallbackProducts = [
    {
      "id": 1,
      "title": "GDGC Hoodie " ,
      "subtitle": "Early Bird Sale Live",
      "description": "Stay warm and stylish with our exclusive GDGC collection featuring premium fabrics and contemporary designs.",
      "backgroundImage": "/images/background-model1.png",
      "thumbnails": [
    "/images/hoodie-1.png" 
  ],
      
      "number": "01",
      "active": true,
      "price": 749,
      "originalPrice": 999,
      "discount": 25,
      "category": "",
      "sizes": [ "S", "M", "L", "XL"],
      "colors": ["Black", "Navy", "Grey"],
      "inStock": true,
      "featured": true,
      "season": ""
    },
    {
      "id": 2,
      "title": "GDGC T-shirt",
      "subtitle": "Early Bird Sale Live",
      "description": "Brighten up your wardrobe with our fresh GDGC Tshirt collection. Light fabrics and comforts await.",
      "backgroundImage": "/images/background-model2.png",
        "thumbnails": [
    "/images/hoodie-2.png" 
  ],
      "number": "02",
      "active": false,
      "price": 279,
      "originalPrice": 349,
      "discount": 20,
      "category": "",
      "sizes": [ "S", "M", "L", "XL"],
      "colors": ["black", "Yellow", "Green"],
      "inStock": true,
      "featured": true,
      "season": ""
    },
    {
      "id": 3,
      "title": "GDGC Mousepad",
      "subtitle": "Early Bird Sale Live",
      "description": "Get ready for amazing mouse grip and washable mouse pad from GDGC .",
      "backgroundImage": "/images/background-model3.png",
      "number": "03",
      "active": false,
      "price": 140,
      "originalPrice": 200,
      "discount": 30,
      "category": "",
      "sizes": [ "S", "M", "L"],
      "colors": ["White", "Blue", "Coral"],
      "inStock": true,
      "featured": true,
      "season": ""
    }
  ];
      setProducts(fallbackProducts);
      console.log('Fallback products loaded:', fallbackProducts);
    }
  };

  return (
    <div className="App">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/collection" element={<Collection />} />
        <Route path="/shopping-bag" element={<ShoppingBag />} />
      </Routes>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContextProvider>
        <AppContent />
      </AppContextProvider>
    </BrowserRouter>
  );
}

export default App;
