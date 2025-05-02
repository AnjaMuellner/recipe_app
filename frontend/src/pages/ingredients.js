import { useIngredients } from '../context/IngredientsContext';
import Link from 'next/link';
import styles from '../styles/IngredientsPage.module.css';
import { useEffect, useState } from 'react';

export default function IngredientsPage() {
  const { ingredients, deleteIngredient, deleteTranslation, isIngredientUsed } = useIngredients();
  const [usedTranslations, setUsedTranslations] = useState({});

  useEffect(() => {
    const checkUsedTranslations = async () => {
      const usedStatus = {};
      for (const ingredient of ingredients) {
        if (ingredient.translations) {
          for (const translation of ingredient.translations) {
            // Check if the specific translation is used
            const isUsed = await isIngredientUsed(translation.id);
            usedStatus[translation.id] = isUsed;
          }
        }
      }
      setUsedTranslations(usedStatus);
    };

    if (ingredients.length > 0) {
      checkUsedTranslations();
    }
  }, [ingredients]);

  const getTranslations = (ingredient) => {
    if (ingredient.translations && ingredient.translations.length > 0) {
      return ingredient.translations.map((translation) => (
        <div key={translation.id} className={styles.translationItem}>
          {translation.name} ({translation.language})
          {usedTranslations[translation.id] === false && (
            <button
              className={styles.translationDeleteButton}
              onClick={() => deleteTranslation(ingredient.id, translation.id)}
            >
              x
            </button>
          )}
        </div>
      ));
    }
    return 'None';
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Ingredients Overview</h1>
      </div>
      <div className={styles.ingredientsList}>
        <ul>
          {Array.isArray(ingredients) && ingredients.length > 0 ? (
            ingredients.map((ingredient) => (
              <li key={ingredient.id} className={styles.ingredientItem}>
                <div className={styles.ingredientName}>
                  <strong>{ingredient.name}</strong> ({ingredient.language})
                </div>
                <div>
                  <strong>Translations:</strong>
                </div>
                <div className={styles.ingredientTranslations}>
                  {getTranslations(ingredient)}
                </div>
                {!usedTranslations[ingredient.id] && (
                  <button
                    className={styles.deleteButton}
                    onClick={() => deleteIngredient(ingredient.id)}
                  >
                    Delete Ingredient
                  </button>
                )}
              </li>
            ))
          ) : (
            <p>No ingredients found.</p>
          )}
        </ul>
      </div>
      <Link href="/dashboard">
        <div className={styles.buttonWrapper}>
          <button className="button">Back to Dashboard</button>
        </div>
      </Link>
    </div>
  );
}