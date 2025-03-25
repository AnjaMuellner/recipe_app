import { useRouter } from 'next/router';
import RegisterForm from '../components/RegisterForm';

export default function RegisterPage() {
  const router = useRouter();

  const handleRegister = (data) => {
    console.log('Registration successful:', data);

    // Store the token in local storage
    localStorage.setItem('token', data.access_token);

    // Redirect to the login page
    router.push('/dashboard');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center' }}>
      <RegisterForm onRegister={handleRegister} />
    </div>
  );
}