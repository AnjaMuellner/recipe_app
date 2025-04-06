import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useIngredients } from '../context/IngredientsContext';
import { API_BASE_URL } from '../config/apiConfig';

export default function RecipesPage() {
  const { predefinedIngredients, userIngredients } = useIngredients();
  const [recipes, setRecipes] = useState([]);

  useEffect(() => {
    const fetchRecipes = async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/recipes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setRecipes(Array.isArray(data) ? data : []);
    };

    fetchRecipes();
  }, []);

  const getTranslations = (ingredient) => {
    if (ingredient.translations && ingredient.translations.length > 0) {
      return ingredient.translations
        .map((translation) => `${translation.name} (${translation.language})`)
        .join(', ');
    }
    if (ingredient.translations) {
      return Object.entries(ingredient.translations)
        .map(([lang, name]) => `${name} (${lang})`)
        .join(', ');
    }
    return 'None';
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>My Recipes</h1>
      <ul>
        {Array.isArray(recipes) && recipes.map((recipe) => (
          <li key={recipe.id}>{recipe.title}</li>
        ))}
      </ul>
      <Link href="/add_recipe">
        <button className="button">Add Recipe</button>
      </Link>
      <Link href="/ingredients">
        <button className="button">View Ingredients</button>
      </Link>
    </div>
  );
}