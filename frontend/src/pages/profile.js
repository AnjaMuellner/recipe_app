import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { API_BASE_URL } from '../config/apiConfig';
import styles from '../styles/profile.module.css';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You need to log in first.');
        router.push('/login');
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/users/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          alert('Failed to fetch user profile.');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, [router]);

  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.profileHeader}>
        <h1>My Profile</h1>
      </div>
      <div className={styles.profileDetails}>
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>Email:</strong> {user.email}</p>
      </div>
      <div className={styles.buttonWrapper}>
        <button className="button" onClick={() => router.push('/dashboard')}>Back to Dashboard</button>
        <button className="button" onClick={() => {
          localStorage.removeItem('token');
          router.push('/login');
        }}>Logout</button>
      </div>
    </div>
  );
}
