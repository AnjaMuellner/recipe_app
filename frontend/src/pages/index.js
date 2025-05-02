import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [message, setMessage] = useState('');

  useEffect(() => {
      fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}`)
      .then(response => response.json())
      .then(data => setMessage(data.message));
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center' }}>
      <h1 style={{ marginBottom: '20px' }}>{message}</h1>
      <div style={{ display: 'flex', gap: '10px' }}>
        <Link href="/login" legacyBehavior>
          <button className="button">Login</button>
        </Link>
        <Link href="/register" legacyBehavior>
          <button className="button">Register</button>
        </Link>
      </div>
    </div>
  );
}