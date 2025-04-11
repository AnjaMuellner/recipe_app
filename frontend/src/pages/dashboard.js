import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useIngredients } from '../context/IngredientsContext';
import { API_BASE_URL } from '../config/apiConfig';
import styles from '../styles/dashboard.module.css';

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
      console.log('Fetched recipes:', data); // Debug log to inspect fetched recipes
      setRecipes(Array.isArray(data) ? data : []);
    };

    fetchRecipes();
  }, []);

  const handleProfileClick = () => {
    // Redirect to the profile page or show a dropdown
    console.log('Profile button clicked');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header} style={{ display: 'flex', alignItems: 'center' }}>
        <h1 style={{ marginRight: 'auto' }}>Recipes</h1>
        <button className={styles.profileButton} onClick={handleProfileClick}>
          Profile
        </button>
      </div>
      <div className={styles.recipeGrid}>
        {Array.isArray(recipes) && recipes.map((recipe) => {
          console.log('Recipe thumbnail_url:', recipe.thumbnail_url); // Debug log for thumbnail_url
          return (
            <Link key={recipe.id} href={`/recipes/${recipe.id}`} className={styles.recipeLink}>
              <div className={styles.recipeWidget}>
                <img
                  src={
                    recipe.thumbnail_url
                      ? `${API_BASE_URL}${recipe.thumbnail_url}` // Prepend API_BASE_URL to the relative thumbnail URL
                      : (recipe.images_url && recipe.images_url.length > 0 && recipe.images_url[0]) || // Use the first image if no thumbnail
                        '/default-recipe-image.jpg' // Fallback image
                  }
                  alt={recipe.title}
                  onError={(e) => {
                    console.error('Image failed to load:', e.target.src); // Debug log for failed image
                    e.target.src = '/default-recipe-image.jpg'; // Fallback on error
                  }}
                />
                <h3 className={styles.recipeTitle}>{recipe.title}</h3>
              </div>
            </Link>
          );
        })}
      </div>
      <div className={styles.buttonWrapper}>
        <Link href="/ingredients">
          <button className="button">View Ingredients</button>
        </Link>
        <Link href="/add_recipe">
          <button className="button">Add Recipe</button>
        </Link>
      </div>
    </div>
  );
}