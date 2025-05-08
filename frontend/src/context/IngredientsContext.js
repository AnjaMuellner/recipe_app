import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/apiConfig';

const IngredientsContext = createContext();

export const useIngredients = () => useContext(IngredientsContext);

export const IngredientsProvider = ({ children }) => {
  const [ingredients, setIngredients] = useState([]);

  const fetchIngredients = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/ingredients`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to fetch ingredients:", errorData.detail || response.statusText);
        if (response.status === 500) {
          alert("Server error: Please check the backend logs.");
        }
        return;
      }

      const data = await response.json();
      setIngredients(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching ingredients:", error.message);
    }
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

  const createIngredient = async (ingredientData) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/ingredients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(ingredientData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.detail);
        return null;
      }

      const newIngredient = await response.json();
      fetchIngredients(); // Refresh the ingredient list
      return newIngredient;
    } catch (error) {
      console.error('Failed to create ingredient:', error);
      return null;
    }
  };

  const createTranslation = async (ingredientId, translationData) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/ingredients/${ingredientId}/translations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(translationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.detail);
        return null;
      }

      const newTranslation = await response.json();
      fetchIngredients(); // Refresh the ingredient list
      return newTranslation;
    } catch (error) {
      console.error('Failed to create translation:', error);
      return null;
    }
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
        createIngredient,
        createTranslation,
      }}
    >
      {children}
    </IngredientsContext.Provider>
  );
};