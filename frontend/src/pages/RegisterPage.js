import { useRouter } from 'next/router';
import RegisterForm from '../components/RegisterForm';

export default function RegisterPage() {
  const router = useRouter();

  const handleRegister = (data) => {
    console.log('Registration successful:', data);

    // Redirect to the login page
    router.push('/login');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', textAlign: 'center' }}>
      <RegisterForm onRegister={handleRegister} />
    </div>
  );
}