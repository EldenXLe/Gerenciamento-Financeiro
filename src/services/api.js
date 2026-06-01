import axios from 'axios';

// Axios instance configured — ready for real backend integration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://api.financeflow.app',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ff_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ff_auth');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
