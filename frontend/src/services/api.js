import axios from 'axios';
import { normalizedApiUrl } from '../utils/apiUrl';

const api = axios.create({
  baseURL: normalizedApiUrl
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('eventoraToken');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  } else {
    config.headers['Content-Type'] = 'application/json';
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('eventoraToken');
      localStorage.removeItem('eventoraUser');
    }

    return Promise.reject(error);
  }
);

export default api;
