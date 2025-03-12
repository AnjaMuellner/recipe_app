import { useRouter } from 'next/router';
import LoginForm from '../components/LoginForm';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = (token) => {
    // Store the token in local storage
    localStorage.setItem('token', token);

    // Redirect to the home page
    router.push('/');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center' }}>
      <LoginForm onLogin={handleLogin} />
    </div>
  );
}