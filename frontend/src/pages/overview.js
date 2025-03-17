import { useEffect, useState } from 'react';

export default function UsersPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/users')
      .then(response => response.json())
      .then(data => setUsers(data));
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Users</h1>
      {users.map(user => (
        <div key={user.id} style={{ marginBottom: '20px' }}>
          <h2>{user.username} ({user.email})</h2>
          <h3>Recipes:</h3>
          <ul>
            {user.recipes?.map(recipe => (
              <li key={recipe.id}>{recipe.title}</li>
            ))}
          </ul>
          <h3>Comments:</h3>
          <ul>
            {user.comments?.map(comment => (
              <li key={comment.id}>{comment.content}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}