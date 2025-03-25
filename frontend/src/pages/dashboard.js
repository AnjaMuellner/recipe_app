import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function RecipesPage() {
  const [recipes, setRecipes] = useState([]);
  const [predefinedIngredients, setPredefinedIngredients] = useState([]);
  const [userIngredients, setUserIngredients] = useState([]);

  useEffect(() => {
    const fetchRecipes = async () => {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:8000/api/recipes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setRecipes(Array.isArray(data) ? data : []);
    };

    const fetchIngredients = async () => {
      const token = localStorage.getItem('token');
      const response = await fetch('http://127.0.0.1:8000/api/predefined-ingredients', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      console.log('Fetched predefined ingredients:', data.predefined_ingredients); // Add this line
      setPredefinedIngredients(data.predefined_ingredients || []);
      setUserIngredients(data.user_ingredients || []);
    };

    fetchRecipes();
    fetchIngredients();
  }, []);

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
      <h2>Ingredients</h2>
      <ul>
        {predefinedIngredients.concat(userIngredients).map((ingredient, index) => (
          <li key={ingredient.id || index}>
            {ingredient.name} ({ingredient.language}), Translations: {Object.entries(ingredient.translations).map(([lang, translation]) => `${translation} (${lang})`).join(', ')}
          </li>
        ))}
      </ul>
    </div>
  );
}