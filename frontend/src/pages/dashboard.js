import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useIngredients } from '../context/IngredientsContext';
import { API_BASE_URL } from '../config/apiConfig';
import styles from '../styles/dashboard.module.css';
import { useRouter } from 'next/router';

export default function RecipesPage() {
  const { predefinedIngredients, userIngredients } = useIngredients();
  const [recipes, setRecipes] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchRecipes = async () => {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/recipes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      console.log('Fetched recipes:', data);
      setRecipes(Array.isArray(data) ? data : []);
    };

    fetchRecipes();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header} style={{ display: 'flex', alignItems: 'center' }}>
        <h1 style={{ marginRight: 'auto' }}>Recipes</h1>
        <button className={styles.profileButton} onClick={() => router.push('/profile')}>
          Profile
        </button>
      </div>
      <div className={styles.recipeGrid}>
        {Array.isArray(recipes) && recipes.map((recipe) => {
          console.log('Recipe thumbnail_url:', recipe.thumbnail_url);
          return (
            <Link key={recipe.id} href={`/recipes/${recipe.id}`} className={styles.recipeLink}>
              <div className={styles.recipeWidget}>
                <img
                  src={
                    recipe.thumbnail_url
                      ? `${API_BASE_URL}${recipe.thumbnail_url}`
                      : (recipe.images_url && recipe.images_url.length > 0 && recipe.images_url[0]) ||
                        '/default-recipe-image.jpg'
                  }
                  alt={recipe.title}
                  onError={(e) => {
                    console.error('Image failed to load:', e.target.src);
                    e.target.src = '/default-recipe-image.jpg';
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