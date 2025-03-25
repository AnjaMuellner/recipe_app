import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import styles from './AddRecipeForm.module.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

export default function AddRecipeForm() {
  const [newRecipe, setNewRecipe] = useState({
    title: '',
    ingredients: [{ name: '', amount: '', unit: '' }],
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

  const [ingredientName, setIngredientName] = useState('');
  const [ingredientAmount, setIngredientAmount] = useState('');
  const [ingredientUnit, setIngredientUnit] = useState('');
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
      const response = await fetch('http://127.0.0.1:8000/api/predefined-ingredients', {
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
    updatedIngredients[index][name] = value;
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
      ingredients: [...newRecipe.ingredients, { name: '', amount: '', unit: '' }]
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

  const handleInstructionsChange = (value) => {
    setNewRecipe({ ...newRecipe, instructions: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }

    const formData = new FormData();
    formData.append('title', newRecipe.title);
    formData.append('ingredients', JSON.stringify(newRecipe.ingredients));
    formData.append('servings', newRecipe.servings);
    formData.append('servings_unit', newRecipe.servings_unit);
    formData.append('special_equipment', newRecipe.special_equipment);
    formData.append('instructions', newRecipe.instructions);
    formData.append('thumbnail', thumbnailFile); // Append the file
    imageFiles.forEach((file, index) => {
      formData.append(`images_url_${index}`, file); // Append each image file
    });
    formData.append('source', newRecipe.source);
    formData.append('prep_time', newRecipe.prep_time);
    formData.append('cook_time', newRecipe.cook_time);
    formData.append('waiting_time', newRecipe.waiting_time);
    formData.append('total_time', newRecipe.total_time);

    const response = await fetch('http://127.0.0.1:8000/api/recipes', {
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
    const response = await fetch('http://127.0.0.1:8000/api/ingredients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name: ingredientName, language: newIngredientLanguage })
    });
    if (response.ok) {
      const newIngredient = await response.json();
      setIngredientList([...ingredientList, newIngredient]);
      setShowAddIngredientPopup(false);
      setIngredientName('');
      setNewIngredientLanguage('');
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
              name="amount"
              value={ingredient.amount}
              onChange={(e) => handleIngredientChange(index, e)}
              placeholder="Amount"
              className={styles.amountInput}
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
        <label htmlFor="servings_unit">Servings Unit</label>
        <input type="text" id="servings_unit" name="servings_unit" value={newRecipe.servings_unit} onChange={handleInputChange} placeholder="Servings Unit" />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="special_equipment">Special Equipment</label>
        <textarea id="special_equipment" name="special_equipment" value={newRecipe.special_equipment} onChange={handleInputChange} placeholder="Special Equipment" />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="instructions">Instructions <span className={styles.required}>*</span></label>
        <ReactQuill
          value={newRecipe.instructions}
          onChange={handleInstructionsChange}
          placeholder="Instructions"
          required
          className={styles.instructionsField} // Apply the CSS class here
          style={{ color: 'black', backgroundColor: 'white' }} // Inline styles for the editor
        />
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
        <label htmlFor="waiting_time">Waiting Time (minutes)</label>
        <input type="number" id="waiting_time" name="waiting_time" value={newRecipe.waiting_time} onChange={handleInputChange} placeholder="Waiting Time (minutes)" />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="total_time">Total Time (minutes)</label>
        <input type="number" id="total_time" name="total_time" value={newRecipe.total_time} onChange={handleInputChange} placeholder="Total Time (minutes)" />
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
        <label htmlFor="newIngredientName">Ingredient Name</label>
        <input
          type="text"
          id="newIngredientName"
          value={ingredientName}
          onChange={(e) => setIngredientName(e.target.value)}
          placeholder="Ingredient Name"
        />
        <label htmlFor="newIngredientLanguage">Language</label>
        <input
          type="text"
          id="newIngredientLanguage"
          value={newIngredientLanguage}
          onChange={(e) => setNewIngredientLanguage(e.target.value)}
          placeholder="Language"
        />
        <button type="button" onClick={handleAddNewIngredient}>Add Ingredient</button>
        <button type="button" onClick={() => setShowAddIngredientPopup(false)}>Cancel</button>
      </div>
    )}
    </form>
  );
}