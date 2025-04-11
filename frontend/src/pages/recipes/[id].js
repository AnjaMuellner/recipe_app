import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { API_BASE_URL } from '../../config/apiConfig';
import styles from './recipeDetails.module.css';

export default function RecipeDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [recipe, setRecipe] = useState(null);
  const [diameter, setDiameter] = useState(recipe?.servings?.diameter || 28); // Default to 28 cm
  const [servings, setServings] = useState(recipe?.servings || 1); // Default to 1 for "number"
  const [trayDimensions, setTrayDimensions] = useState({
    width: recipe?.servings?.width || 30, // Default width
    length: recipe?.servings?.length || 20, // Default length
  });

  useEffect(() => {
    if (!id) return; // Ensure `id` is available

    const fetchRecipe = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found. Please log in.');
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/recipes/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          console.error(`Failed to fetch recipe: ${response.status} ${response.statusText}`);
          return;
        }

        const data = await response.json();
        console.log('Fetched recipe:', data); // Debug log to inspect the recipe object
        setRecipe(data);
      } catch (error) {
        console.error('Error fetching recipe:', error);
      }
    };

    fetchRecipe();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete the recipe "${recipe.title}"?`)) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/recipes/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          alert('Recipe deleted successfully.');
          router.push('/dashboard'); // Redirect to the dashboard after deletion
        } else {
          const errorData = await response.json();
          alert(errorData.detail || 'Failed to delete recipe.');
        }
      } catch (error) {
        console.error('Error deleting recipe:', error);
        alert('An error occurred while deleting the recipe.');
      }
    }
  };

  if (!recipe) {
    return <p>Loading...</p>;
  }

  const { prep_time, cook_time, rest_time, total_time, thumbnail_url, images_url, special_equipment } = recipe;
  const showTotalTime = (prep_time && cook_time) || (prep_time && rest_time) || (cook_time && rest_time);

  console.log('Images URL:', images_url); // Debug log to check the images array
  console.log('Thumbnail URL:', thumbnail_url); // Debug log to check the thumbnail URL

  const adjustIngredients = (ingredient) => {
    if (recipe.servings_unit.toLowerCase() === 'springform' && recipe.servings?.diameter) {
      const scaleFactor = (diameter / recipe.servings.diameter) ** 2; // Scale by area ratio
      return (ingredient.quantity * scaleFactor).toFixed(2); // Adjust and round to 2 decimals
    } else if (recipe.servings_unit.toLowerCase() === 'number') {
      const scaleFactor = servings / recipe.servings; // Scale by number ratio
      return (ingredient.quantity * scaleFactor).toFixed(2);
    } else if (recipe.servings_unit.toLowerCase() === 'baking tray' && recipe.servings?.width && recipe.servings?.length) {
      const scaleFactor = (trayDimensions.width * trayDimensions.length) / (recipe.servings.width * recipe.servings.length); // Scale by area ratio
      return (ingredient.quantity * scaleFactor).toFixed(2);
    }
    return ingredient.quantity; // No adjustment
  };

  return (
    <div className={styles.container}>
      <div className={styles.recipeDetails}>
        <h1 className={styles.title}>{recipe.title}</h1>
        <div className={styles.timeInfo}>
          {prep_time && <span><strong>Prep:</strong> {prep_time} min</span>}
          {prep_time && cook_time && <span className={styles.timeGap}>|</span>}
          {cook_time && <span><strong>Cook:</strong> {cook_time} min</span>}
          {cook_time && rest_time && <span className={styles.timeGap}>|</span>}
          {rest_time && <span><strong>Rest:</strong> {rest_time} min</span>}
          {showTotalTime && <span className={styles.timeGap}>|</span>}
          {showTotalTime && <span><strong>Total:</strong> {total_time} min</span>}
        </div>
        {thumbnail_url && (
          <img
            src={
              recipe.thumbnail_url
                ? `${API_BASE_URL}${recipe.thumbnail_url}` // Prepend API_BASE_URL to the relative thumbnail URL
                : '/default-recipe-image.jpg' // Fallback image
            }
            alt={`${recipe.title} Thumbnail`}
            className={styles.thumbnail} // Apply thumbnail style
            onError={(e) => {
              e.target.src = '/default-recipe-image.jpg'; // Fallback on error
            }}
          />
        )}
        {images_url && images_url.length > 0 && (
          <div className={styles.images}>
            {images_url.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`Image ${index + 1}`}
                className={styles.image} // Apply image style
              />
            ))}
          </div>
        )}
        <div className={styles.info}>
          <p>
            <strong>Servings:</strong>{' '}
            {recipe.servings_unit.toLowerCase() === 'number' ? (
              <>
                <input
                  type="number"
                  value={servings}
                  onChange={(e) => setServings(Number(e.target.value))}
                  className={styles.diameterInput} // Reuse the same input style
                />
              </>
            ) : recipe.servings_unit.toLowerCase() === 'baking tray' && recipe.servings?.width && recipe.servings?.length ? (
              <>
                <input
                  type="number"
                  value={trayDimensions.width}
                  onChange={(e) => setTrayDimensions({ ...trayDimensions, width: Number(e.target.value) })}
                  className={styles.diameterInput} // Reuse the same input style
                />
                <span> x </span>
                <input
                  type="number"
                  value={trayDimensions.length}
                  onChange={(e) => setTrayDimensions({ ...trayDimensions, length: Number(e.target.value) })}
                  className={styles.diameterInput} // Reuse the same input style
                />
                <span> cm Baking Tray</span>
              </>
            ) : recipe.servings_unit.toLowerCase() === 'springform' && recipe.servings?.diameter ? (
              <>
                <input
                  type="number"
                  value={diameter}
                  onChange={(e) => setDiameter(Number(e.target.value))}
                  className={styles.diameterInput} // Reuse the same input style
                />
                <span> cm ⌀ Springform</span>
              </>
            ) : (
              'N/A'
            )}
          </p>
          {special_equipment && special_equipment.length > 0 && special_equipment.some(equipment => equipment.trim() !== '') && (
            <p><strong>Special Equipment:</strong> {special_equipment.join(', ')}</p>
          )}
        </div>
        <h2 className={styles.sectionTitle}>Ingredients</h2>
        <ul className={styles.ingredientsList}>
          {recipe.ingredients?.map((ingredient, index) => (
            <li key={index} className={styles.ingredientItem}>
              {adjustIngredients(ingredient)} {ingredient.unit || ''} {ingredient.name}
            </li>
          )) || <p>No ingredients available.</p>}
        </ul>
        <h2 className={styles.sectionTitle}>Instructions</h2>
        <p className={styles.instructions}>{recipe.instructions}</p>
        <button onClick={handleDelete} className={styles.deleteButton}>
          Delete Recipe
        </button>
      </div>
    </div>
  );
}
