import { GoogleLogin } from '@react-oauth/google';
import { Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { googleLogin } from '../../services/authService';

function GoogleIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

function GoogleAuthButton({ mode = 'login' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const clientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    import.meta.env.GOOGLE_CLIENT_ID ||
    '381378634837-ekgoiqdsoc61p8fi7kkgna7gndfa5ij1.apps.googleusercontent.com';
  const isConfigured = Boolean(
    clientId && clientId.trim() && !clientId.includes('your_google_client_id')
  );

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      toast.error('Google authentication did not return a valid credential.');
      return;
    }

    setIsLoading(true);
    try {
      const data = await googleLogin(credentialResponse.credential);

      localStorage.setItem('eventoraToken', data.token);
      localStorage.setItem('eventoraUser', JSON.stringify(data.user));
      window.dispatchEvent(new Event('storage'));

      toast.success(`Welcome to Eventora, ${data.user.name || 'friend'}!`);

      const destination =
        location.state?.from || (data.user.role === 'admin' ? '/admin' : '/dashboard');
      navigate(destination);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        'Unable to complete Google authentication. Please check your credentials and try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleFailure = () => {
    toast.info('Google sign-in was closed or cancelled.');
  };

  if (isLoading) {
    return (
      <button
        type="button"
        disabled
        className="flex w-full items-center justify-center gap-2.5 rounded-full border border-ink/15 bg-sand/30 py-3 text-sm font-semibold text-ink/70 shadow-xs cursor-wait"
      >
        <Loader2 className="h-4 w-4 animate-spin text-coral" />
        <span>Signing in with Google...</span>
      </button>
    );
  }

  if (!isConfigured) {
    return (
      <button
        type="button"
        onClick={() =>
          toast.info(
            'Google Sign-In is ready! Please configure your Google Client ID in frontend/.env (VITE_GOOGLE_CLIENT_ID).'
          )
        }
        className="flex w-full items-center justify-center gap-3 rounded-full border border-ink/15 bg-white py-3 px-4 text-sm font-semibold text-ink shadow-xs transition hover:border-ink/30 hover:bg-sand/20 active:scale-[0.99]"
      >
        <GoogleIcon />
        <span>Continue with Google</span>
      </button>
    );
  }

  return (
    <div className="flex w-full justify-center overflow-hidden rounded-full [&>div]:w-full [&_iframe]:!w-full [&_iframe]:!mx-auto">
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleFailure}
        text={mode === 'register' ? 'signup_with' : 'continue_with'}
        shape="pill"
        size="large"
        theme="outline"
        width="100%"
      />
    </div>
  );
}

export default GoogleAuthButton;
