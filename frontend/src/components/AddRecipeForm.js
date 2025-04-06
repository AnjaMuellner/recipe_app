import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import styles from './AddRecipeForm.module.css';
import { useIngredients } from '../context/IngredientsContext';
import { API_BASE_URL } from '../config/apiConfig';
import { marked } from 'marked';

export default function AddRecipeForm() {
  const { fetchIngredients } = useIngredients();
  const [newRecipe, setNewRecipe] = useState({
    title: '',
    ingredients: [{ name: '', quantity: '', unit: '' }],
    servings: '',
    servings_unit: '',
    special_equipment: '',
    instructions: '',
    thumbnail_url: '',
    images_url: '',
    source: '',
    prep_time: '',
    cook_time: '',
    rest_time: ''
  });

  const [ingredientName, setIngredientName] = useState('');
  const [ingredientQuantity, setIngredientQuantity] = useState('');
  const [ingredientUnit, setIngredientUnit] = useState('');
  const [existingIngredientId, setExistingIngredientId] = useState('');
  const [isTranslation, setIsTranslation] = useState(false);
  const [ingredientList, setIngredientList] = useState([]);
  const [filteredIngredients, setFilteredIngredients] = useState([]);
  const [showAddIngredientPopup, setShowAddIngredientPopup] = useState(false);
  const [newIngredientLanguage, setNewIngredientLanguage] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);

  const router = useRouter();

  useEffect(() => {
    const fetchIngredients = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }
      const response = await fetch(`${API_BASE_URL}/api/predefined-ingredients`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched predefined ingredients:', data.predefined_ingredients);
        setIngredientList([...data.predefined_ingredients || [], ...data.user_ingredients || []]);
      } else {
        console.error('Failed to fetch ingredients:', response.statusText);
      }
    };

    fetchIngredients();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRecipe({ ...newRecipe, [name]: value });
  };

  const handleIngredientChange = (index, e) => {
    const { name, value } = e.target;
    const updatedIngredients = [...newRecipe.ingredients];
    updatedIngredients[index][name] = value || null;
    setNewRecipe({ ...newRecipe, ingredients: updatedIngredients });

    if (name === 'name') {
      setFilteredIngredients(
        ingredientList.filter((ingredient) =>
          ingredient.name.toLowerCase().includes(value.toLowerCase())
        )
      );
    }
  };

  const handleAddIngredientField = () => {
    setNewRecipe({
      ...newRecipe,
      ingredients: [...newRecipe.ingredients, { name: '', quantity: '', unit: '' }]
    });
  };

  const handleRemoveIngredientField = (index) => {
    const updatedIngredients = [...newRecipe.ingredients];
    updatedIngredients.splice(index, 1);
    setNewRecipe({ ...newRecipe, ingredients: updatedIngredients });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setThumbnailFile(file);
    } else {
      alert('Please select a valid image file.');
    }
  };

  const handleImageFilesChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    if (validFiles.length !== files.length) {
      alert('Some files were not images and were not added.');
    }
    setImageFiles([...imageFiles, ...validFiles]);
  };

  const handleRemoveImageFile = (index) => {
    const updatedFiles = [...imageFiles];
    updatedFiles.splice(index, 1);
    setImageFiles(updatedFiles);
  };

  const handleInstructionsChange = (e) => {
    setNewRecipe({ ...newRecipe, instructions: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }

    // Validate ingredients
    const validIngredients = newRecipe.ingredients.every(
      (ingredient) => ingredient.name.trim() !== ""
    );
    if (!validIngredients) {
        alert("Each ingredient must have a name.");
        return;
    }

    // Replace empty strings in 'unit' with null
    const sanitizedIngredients = newRecipe.ingredients.map(ingredient => ({
      ...ingredient,
      quantity: ingredient.quantity ? parseFloat(ingredient.quantity) : null, // Ensure quantity is a number
      unit: ingredient.unit.trim() === '' ? null : ingredient.unit // Ensure unit is null or a string
    }));

    console.log('Sanitized Ingredients JSON:', JSON.stringify(sanitizedIngredients));

    const formData = new FormData();
    formData.append('title', newRecipe.title);
    formData.append('ingredients', JSON.stringify(sanitizedIngredients));
    formData.append('servings', newRecipe.servings);
    formData.append('servings_unit', newRecipe.servings_unit);
    
    // Ensure instructions are sent as a string
    const instructionsString = newRecipe.instructions.trim();

    // Remove empty fields from the form data
    if (newRecipe.special_equipment.trim()) {
      formData.append('special_equipment', newRecipe.special_equipment);
    }
    if (newRecipe.prep_time) {
      formData.append('prep_time', newRecipe.prep_time);
    }
    if (newRecipe.cook_time) {
      formData.append('cook_time', newRecipe.cook_time);
    }
    if (newRecipe.rest_time) {
      formData.append('rest_time', newRecipe.rest_time);
    }

    // Append instructions as a string
    formData.append('instructions', instructionsString);

    // Only append thumbnail if a file is selected
    if (thumbnailFile) {
      formData.append('thumbnail', thumbnailFile);
    }
    
    imageFiles.forEach((file, index) => {
      formData.append(`images_url_${index}`, file);
    });
    formData.append('source', newRecipe.source);

    // Ensure required fields are included
    if (!newRecipe.title.trim()) {
      alert('Title is required.');
      return;
    }

    if (!newRecipe.instructions.trim()) {
      alert('Instructions are required.');
      return;
    }

    if (!newRecipe.ingredients.length || !newRecipe.ingredients[0].name.trim()) {
      alert('At least one ingredient with a valid name is required.');
      return;
    }

    console.log('Servings Unit:', newRecipe.servings_unit);

    const response = await fetch(`${API_BASE_URL}/api/recipes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (response.ok) {
      router.push('/dashboard');
    } else {
      console.error('Failed to add recipe:', response.statusText);
    }
  };

  const handleAddNewIngredient = async () => {
    console.log('handleAddNewIngredient called');
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }
  
    const url = isTranslation ? `${API_BASE_URL}/api/ingredients/${existingIngredientId}/translations` : `${API_BASE_URL}/api/ingredients`;
    const method = 'POST';
    const body = JSON.stringify({ name: ingredientName, language: newIngredientLanguage });
  
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: body
    });
  
    if (response.ok) {
      const newIngredient = await response.json();
      setIngredientList([...ingredientList, newIngredient]);
      setShowAddIngredientPopup(false);
      setIngredientName('');
      setNewIngredientLanguage('');
      setExistingIngredientId('');
      setIsTranslation(false);
      fetchIngredients();
    } else {
      console.error('Failed to add new ingredient:', response.statusText);
    }
  };

  const handleSelectIngredient = (e) => {
    if (e.target.value === 'Add New Ingredient') {
      setIngredientName(e.target.value);
      setShowAddIngredientPopup(true);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGroup}>
        <label htmlFor="title">Title <span className={styles.required}>*</span></label>
        <input type="text" id="title" name="title" value={newRecipe.title} onChange={handleInputChange} placeholder="Title" required />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="ingredients">Ingredients <span className={styles.required}>*</span></label>
        {newRecipe.ingredients.map((ingredient, index) => (
          <div key={index} className={styles.ingredientInput}>
            <input
              type="number"
              name="quantity"
              value={ingredient.quantity}
              onChange={(e) => handleIngredientChange(index, e)}
              placeholder="Quantity"
              className={styles.quantityInput}
            />
            <input
              type="text"
              name="unit"
              value={ingredient.unit}
              onChange={(e) => handleIngredientChange(index, e)}
              placeholder="Unit"
              className={styles.unitInput}
            />
            <input
              type="text"
              name="name"
              value={ingredient.name}
              onChange={(e) => handleIngredientChange(index, e)}
              placeholder="Ingredient Name"
              list="ingredient-options"
              onSelect={handleSelectIngredient}
            />
            <datalist id="ingredient-options">
              {filteredIngredients.map((ingredient) => (
                <option key={ingredient.id} value={ingredient.name} />
              ))}
              <option value="Add New Ingredient">Add New Ingredient</option>
            </datalist>
            <button type="button" onClick={() => handleRemoveIngredientField(index)} className={styles.removeButton}>x</button>
          </div>
        ))}
        <button type="button" onClick={handleAddIngredientField} className={styles.addButton}>+ Ingredient</button>
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="servings">Servings <span className={styles.required}>*</span></label>
        <input type="number" id="servings" name="servings" value={newRecipe.servings} onChange={handleInputChange} placeholder="Servings" />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="servings_unit">Servings Unit <span className={styles.required}>*</span></label>
        <select
          id="servings_unit"
          name="servings_unit"
          value={newRecipe.servings_unit}
          onChange={handleInputChange}
          required
        >
          <option value="">Select Servings Unit</option>
          <option value="NUMBER">Number</option>
          <option value="SPRINGFORM">Springform</option>
          <option value="BAKING_TRAY">Baking Tray</option>
        </select>
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="special_equipment">Special Equipment</label>
        <textarea
          id="special_equipment"
          name="special_equipment"
          value={newRecipe.special_equipment}
          onChange={handleInputChange}
          onInput={(e) => {
            e.target.style.height = 'auto';
            e.target.style.height = `${e.target.scrollHeight}px`;
          }}
          placeholder="Special Equipment"
          rows="1"
          className={styles.specialEquipment}
        />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="instructions">Instructions <span className={styles.required}>*</span></label>
        <textarea
          id="instructions"
          name="instructions"
          value={newRecipe.instructions}
          onChange={handleInstructionsChange}
          placeholder="Write your instructions in markdown"
          required
          className={styles.instructionsField}
          rows="10"
        />
        <div className={styles.markdownPreview}>
          <h3>Preview:</h3>
          <div dangerouslySetInnerHTML={{ __html: marked(newRecipe.instructions || '') }} />
        </div>
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="source">Source</label>
        <input type="text" id="source" name="source" value={newRecipe.source} onChange={handleInputChange} placeholder="Source" />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="prep_time">Prep Time (minutes)</label>
        <input type="number" id="prep_time" name="prep_time" value={newRecipe.prep_time} onChange={handleInputChange} placeholder="Prep Time (minutes)" />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="cook_time">Cook Time (minutes)</label>
        <input type="number" id="cook_time" name="cook_time" value={newRecipe.cook_time} onChange={handleInputChange} placeholder="Cook Time (minutes)" />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="rest_time">Rest Time (minutes)</label>
        <input type="number" id="rest_time" name="rest_time" value={newRecipe.rest_time} onChange={handleInputChange} placeholder="Rest Time (minutes)" />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="thumbnail">Thumbnail</label>
        <div className={styles.fileInputWrapper}>
          <button type="button" className={styles.fileInputButton}>Choose File</button>
          <input type="file" id="thumbnail" name="thumbnail" onChange={handleFileChange} accept="image/*" />
        </div>
        {thumbnailFile && (
          <div className={styles.fileList}>
            <div className={styles.fileListItem}>
              <span>{thumbnailFile.name}</span>
              <button type="button" onClick={() => setThumbnailFile(null)}>x</button>
            </div>
          </div>
        )}
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="images">Additional Images</label>
        <div className={styles.fileInputWrapper}>
          <button type="button" className={styles.fileInputButton}>Choose Files</button>
          <input type="file" id="images" name="images" onChange={handleImageFilesChange} multiple accept="image/*" />
        </div>
        {imageFiles.length > 0 && (
          <div className={styles.fileList}>
            {imageFiles.map((file, index) => (
              <div key={index} className={styles.fileListItem}>
                <span>{file.name}</span>
                <button type="button" onClick={() => handleRemoveImageFile(index)}>x</button>
              </div>
            ))}
          </div>
        )}
      </div>
      <button type="submit" className="button">Add Recipe</button>

      {showAddIngredientPopup && (
        <div className={styles.popup}>
          <h3>Add New Ingredient</h3>
          <label htmlFor="newIngredientName">Ingredient Name <span className={styles.required}>*</span></label>
          <input
            type="text"
            id="newIngredientName"
            value={ingredientName}
            onChange={(e) => setIngredientName(e.target.value)}
            placeholder="Ingredient Name"
            required
          />
          <label htmlFor="newIngredientLanguage">Language <span className={styles.required}>*</span></label>
          <input
            type="text"
            id="newIngredientLanguage"
            value={newIngredientLanguage}
            onChange={(e) => setNewIngredientLanguage(e.target.value)}
            placeholder="Language"
            required
          />
          <label htmlFor="existingIngredient">Existing Ingredient</label>
          <select
            id="existingIngredient"
            value={existingIngredientId}
            onChange={(e) => setExistingIngredientId(e.target.value)}
            disabled={!isTranslation}
            required={isTranslation}
          >
            <option value="">Select Ingredient</option>
            {ingredientList.map((ingredient) => (
              <option key={ingredient.id} value={ingredient.id}>
                {ingredient.name}
              </option>
            ))}
          </select>
          <label>
            <input
              type="checkbox"
              checked={isTranslation}
              onChange={(e) => setIsTranslation(e.target.checked)}
            />
            Is this a translation of an existing ingredient?
          </label>
          <button type="button" onClick={handleAddNewIngredient}>Add Ingredient</button>
          <button type="button" onClick={() => setShowAddIngredientPopup(false)}>Cancel</button>
        </div>
      )}
    </form>
  );
}