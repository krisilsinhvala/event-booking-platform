import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.jsx';
import './index.css';
import 'react-toastify/dist/ReactToastify.css';

const googleClientId =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  import.meta.env.GOOGLE_CLIENT_ID ||
  '381378634837-ekgoiqdsoc61p8fi7kkgna7gndfa5ij1.apps.googleusercontent.com';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={googleClientId}>
      <BrowserRouter>
        <App />
        <ToastContainer position="top-right" autoClose={3500} />
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>
);
