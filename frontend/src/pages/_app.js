import { IngredientsProvider } from '../context/IngredientsContext';
import '../styles/globals.css';
import { useEffect } from 'react';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    document.body.classList.add('dark-mode');
  }, []);

  return (
    <IngredientsProvider>
      <Component {...pageProps} />
    </IngredientsProvider>
  );
}

export default MyApp;