import { useIngredients } from '../context/IngredientsContext';
import Link from 'next/link';
import styles from '../styles/IngredientsPage.module.css';

export default function IngredientsPage() {
  const { predefinedIngredients, userIngredients, deleteIngredient, deleteTranslation } = useIngredients();

  const getTranslations = (ingredient, isUserAdded) => {
    if (ingredient.translations && ingredient.translations.length > 0) {
      return ingredient.translations.map((translation) => (
        <div key={translation.id} className={styles.translationItem}>
          {translation.name} ({translation.language})
          {isUserAdded && (
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
        <h2>Predefined Ingredients</h2>
        <ul>
          {predefinedIngredients.map((ingredient) => (
            <li key={ingredient.id} className={styles.ingredientItem}>
              <div className={styles.ingredientName}>
                <strong>{ingredient.name}</strong> ({ingredient.language})
              </div>
              <div>
                <strong>Translations:</strong>
              </div>
              <div className={styles.ingredientTranslations}>
                {getTranslations(ingredient, false)} {/* Predefined ingredients cannot be deleted */}
              </div>
            </li>
          ))}
        </ul>
        <h2>User-Added Ingredients</h2>
        <ul>
          {userIngredients.map((ingredient) => (
            <li key={ingredient.id} className={styles.ingredientItem}>
              <div className={styles.ingredientName}>
                <strong>{ingredient.name}</strong> ({ingredient.language})
              </div>
              <div>
                <strong>Translations:</strong>
              </div>
              <div className={styles.ingredientTranslations}>
                {getTranslations(ingredient, true)} {/* User-added ingredients can have deletable translations */}
              </div>
              <button
                className={styles.deleteButton}
                onClick={() => deleteIngredient(ingredient.id)}
              >
                Delete Ingredient
              </button>
            </li>
          ))}
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