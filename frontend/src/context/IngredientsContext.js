import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/apiConfig';

const IngredientsContext = createContext();

export const useIngredients = () => useContext(IngredientsContext);

export const IngredientsProvider = ({ children }) => {
  const [ingredients, setIngredients] = useState([]);

  const fetchIngredients = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/ingredients`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();

    // Ensure data is an array before setting it
    setIngredients(Array.isArray(data) ? data : []);
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
        alert(errorData.detail);
        return;
      }

      // Refresh the ingredient list after deletion
      fetchIngredients();
    } catch (error) {
      console.error("Failed to delete translation:", error);
    }
  };

  const isIngredientUsed = async (ingredientId) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/api/recipes?ingredient_id=${ingredientId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (response.ok) {
      const data = await response.json();
      return data.length > 0;
    }
    console.error("Failed to check if ingredient is used:", response.statusText);
    return false;
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  return (
    <IngredientsContext.Provider
      value={{
        ingredients,
        fetchIngredients,
        deleteIngredient,
        deleteTranslation,
        isIngredientUsed,
      }}
    >
      {children}
    </IngredientsContext.Provider>
  );
};