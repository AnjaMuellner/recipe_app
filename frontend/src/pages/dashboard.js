import { useEffect, useState } from 'react';

export default function RecipesPage() {
  const [recipes, setRecipes] = useState([]);
  const [predefinedIngredients, setPredefinedIngredients] = useState([]);
  const [userIngredients, setUserIngredients] = useState([]);
  const [newRecipe, setNewRecipe] = useState({
    title: '',
    ingredients: '',
    servings: '',
    servings_unit: '',
    special_equipment: '',
    instructions: '',
    thumbnail_url: '',
    images_url: '',
    source: '',
    prep_time: '',
    cook_time: '',
    waiting_time: '',
    total_time: ''
  });

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRecipe({ ...newRecipe, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const response = await fetch('http://127.0.0.1:8000/api/recipes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(newRecipe)
    });
    if (response.ok) {
      const addedRecipe = await response.json();
      setRecipes([...recipes, addedRecipe]);
      setNewRecipe({
        title: '',
        ingredients: '',
        servings: '',
        servings_unit: '',
        special_equipment: '',
        instructions: '',
        thumbnail_url: '',
        images_url: '',
        source: '',
        prep_time: '',
        cook_time: '',
        waiting_time: '',
        total_time: ''
      });
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>My Recipes</h1>
      <ul>
        {Array.isArray(recipes) && recipes.map((recipe) => (
          <li key={recipe.id}>{recipe.title}</li>
        ))}
      </ul>
      <h2>Add New Recipe</h2>
      <form onSubmit={handleSubmit}>
        {/* ...existing form fields... */}
        <button type="submit" className="button">Add Recipe</button>
      </form>
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