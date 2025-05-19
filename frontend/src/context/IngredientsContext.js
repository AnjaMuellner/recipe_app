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
    try {
      // Parse and validate ingredientId
      const parsedId = parseInt(ingredientId, 10);
      if (isNaN(parsedId) || parsedId <= 0) {
        console.error(`Invalid ingredientId: ${ingredientId}`);
        return false;
      }

      const response = await fetch(`${API_BASE_URL}/api/recipes/filter/by-ingredient?ingredient_id=${parsedId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        return Array.isArray(data) && data.length > 0;
      } else {
        const errorText = await response.text();
        console.error(`Failed to check if ingredient ${parsedId} is used:`, response.statusText, errorText);
        return false;
      }
    } catch (error) {
      console.error(`Error checking if ingredient ${ingredientId} is used:`, error);
      return false;
    }
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

  const getRecipesByIngredient = async (ingredientId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/recipes/by-ingredient?ingredient_id=${ingredientId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`Recipes for ingredient ${ingredientId}:`, data); // Debug log
        return data;
      } else {
        console.error("Failed to fetch recipes by ingredient:", response.statusText);
        return [];
      }
    } catch (error) {
      console.error("Error fetching recipes by ingredient:", error);
      return [];
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
        getRecipesByIngredient, // Add this to the context
      }}
    >
      {children}
    </IngredientsContext.Provider>
  );
};