import React, { createContext, useContext, useState, useEffect } from 'react';

const IngredientsContext = createContext();

export const useIngredients = () => useContext(IngredientsContext);

export const IngredientsProvider = ({ children }) => {
  const [predefinedIngredients, setPredefinedIngredients] = useState([]);
  const [userIngredients, setUserIngredients] = useState([]);

  const fetchIngredients = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('http://127.0.0.1:8000/api/predefined-ingredients', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    setPredefinedIngredients(data.predefined_ingredients || []);
    setUserIngredients(data.user_ingredients || []);
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  return (
    <IngredientsContext.Provider value={{ predefinedIngredients, userIngredients, fetchIngredients }}>
      {children}
    </IngredientsContext.Provider>
  );
};