import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/apiConfig';

const IngredientsContext = createContext();

export const useIngredients = () => useContext(IngredientsContext);

export const IngredientsProvider = ({ children }) => {
  const [predefinedIngredients, setPredefinedIngredients] = useState([]);
  const [userIngredients, setUserIngredients] = useState([]);

  const fetchIngredients = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/predefined-ingredients`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
  
    setPredefinedIngredients(data.predefined_ingredients || []);
    setUserIngredients(data.user_ingredients || []);
  };

  const deleteIngredient = async (ingredientId) => {
    const token = localStorage.getItem('token');
    await fetch(`${API_BASE_URL}/api/ingredients/${ingredientId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    // Refresh the ingredient list after deletion
    fetchIngredients();
  };

  const deleteTranslation = async (ingredientId, translationId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/ingredients/${ingredientId}/translations/${translationId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
  
      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.detail); // Show error message to the user
        return;
      }
  
      // Refresh the ingredient list after deletion
      fetchIngredients();
    } catch (error) {
      console.error("Failed to delete translation:", error);
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  return (
    <IngredientsContext.Provider
      value={{
        predefinedIngredients,
        userIngredients,
        fetchIngredients,
        deleteIngredient,
        deleteTranslation,
      }}
    >
      {children}
    </IngredientsContext.Provider>
  );
};