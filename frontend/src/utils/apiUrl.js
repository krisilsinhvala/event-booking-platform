const configuredApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const apiUrl = configuredApiUrl.replace(/\/$/, '');
const normalizedApiUrl = apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;
const apiOrigin = normalizedApiUrl.replace(/\/api\/?$/, '');

export { apiOrigin, normalizedApiUrl };
