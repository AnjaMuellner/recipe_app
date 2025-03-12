import '../styles/globals.css';
import { useEffect } from 'react';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    document.body.classList.add('dark-mode');
  }, []);

  return <Component {...pageProps} />;
}

export default MyApp;