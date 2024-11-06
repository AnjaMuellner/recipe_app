import sqlite3

conn = sqlite3.connect("recipe_database.db")

cursor = conn.cursor()

cursor.execute('''
CREATE TABLE IF NOT EXISTS recipes (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    instructions TEXT,
    pictures TEXT,
    thumbnail TEXT,
    prep_time TEXT,
    cook_time TEXT,
    wait_time TEXT,
    baking_pan TEXT CHECK(status IN ("springform pan", "loaf pan", "baking sheet") OR status IS NULL),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    last_cooked_at TEXT,
    source TEXT,
    special_cooking_tools TEXT,
    user_id INTEGER NOT NULL,
    username TEXT NOT NULL,
    category TEXT
)
''')

cursor.execute('''
CREATE TABLE ingredients (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL
)
''')

cursor.execute('''
CREATE TABLE recipe_ingredients (
    recipe_id INTEGER,
    ingredient_id INTEGER,
    quantity REAL,
    FOREIGN KEY (recipe_id) REFERENCES recipes(id),
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id),
    PRIMARY KEY (recipe_id, ingredient_id)
)
''')

# cursor.execute('''
# INSERT INTO recipes (name, ingredients, instructions) VALUES (
#     'Pancakes',
#     'Flour, Eggs, Milk, Sugar, Baking Powder',
#     'Mix ingredients, cook on a griddle.'
# )
# ''')


# Commit the changes
conn.commit()

# Query the database
cursor.execute('SELECT * FROM recipes')
rows = cursor.fetchall()

# Print the results
for row in rows:
    print(row)

# Close the connection
conn.close()