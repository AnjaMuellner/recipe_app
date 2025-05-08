import { useIngredients } from '../context/IngredientsContext';
import Link from 'next/link';
import styles from '../styles/ingredients.module.css';
import { useEffect, useState } from 'react';

export default function IngredientsPage() {
  const { ingredients, deleteIngredient, deleteTranslation, isIngredientUsed, createIngredient, createTranslation } = useIngredients();
  const [usedTranslations, setUsedTranslations] = useState({});
  const [newIngredient, setNewIngredient] = useState({ name: '', language: '' });
  const [newTranslation, setNewTranslation] = useState({ name: '', language: '' });
  const [showTranslationForm, setShowTranslationForm] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  const handleAddIngredient = async () => {
    if (!newIngredient.name || !newIngredient.language) {
      alert('Please provide both name and language for the ingredient.');
      return;
    }
    await createIngredient(newIngredient);
    setNewIngredient({ name: '', language: '' });
  };

  const handleAddTranslation = async (ingredientId) => {
    if (!newTranslation.name || !newTranslation.language) {
      alert('Please provide both name and language for the translation.');
      return;
    }
    await createTranslation(ingredientId, newTranslation);
    setNewTranslation({ name: '', language: '' });
    setShowTranslationForm(null);
  };

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

  const filteredIngredients = ingredients.filter((ingredient) =>
    ingredient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ingredient.translations?.some((translation) =>
      translation.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Ingredients Overview</h1>
        <input
          type="text"
          className={styles.searchField}
          placeholder="Search ingredients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className={styles.addIngredientSection}>
        <h2>Add New Ingredient</h2>
        <input
          type="text"
          className={styles.addIngredientField}
          placeholder="Name"
          value={newIngredient.name}
          onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
        />
        <input
          type="text"
          className={styles.addIngredientField}
          placeholder="Language"
          value={newIngredient.language}
          onChange={(e) => setNewIngredient({ ...newIngredient, language: e.target.value })}
        />
        <button
          className={styles.addIngredientButton}
          onClick={handleAddIngredient}
        >
          Add Ingredient
        </button>
      </div>
      <div className={styles.ingredientsList}>
        <ul>
          {filteredIngredients.length > 0 ? (
            filteredIngredients.map((ingredient) => (
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
                <button
                  type="button"
                  onClick={() => setShowTranslationForm(ingredient.id)}
                  className={styles.addIngredientButton}
                >
                  + Add Translation
                </button>
                {showTranslationForm === ingredient.id && (
                  <div className={styles.translationForm}>
                    <input
                      type="text"
                      className={styles.translationField}
                      placeholder="Translation Name"
                      value={newTranslation.name}
                      onChange={(e) => setNewTranslation({ ...newTranslation, name: e.target.value })}
                    />
                    <input
                      type="text"
                      className={styles.translationField}
                      placeholder="Language"
                      value={newTranslation.language}
                      onChange={(e) => setNewTranslation({ ...newTranslation, language: e.target.value })}
                    />
                    <div className={styles.translationButtons}>
                      <button
                        type="button"
                        onClick={() => setShowTranslationForm(null)}
                        className={styles.cancelButton}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAddTranslation(ingredient.id)}
                        className={styles.addButton}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )}
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