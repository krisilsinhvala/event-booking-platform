const configuredApiUrl = import.meta.env.VITE_API_URL || '/api';
const getFullUrl = () => {
  if (!configuredApiUrl || configuredApiUrl.startsWith('/')) {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}${configuredApiUrl || '/api'}`;
    }
    return 'http://localhost:5000/api';
  }
  return configuredApiUrl;
};

const fullUrl = getFullUrl();
const apiUrl = fullUrl.replace(/\/$/, '');
const normalizedApiUrl = apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;
const apiOrigin = normalizedApiUrl.replace(/\/api\/?$/, '');

export { apiOrigin, normalizedApiUrl };
