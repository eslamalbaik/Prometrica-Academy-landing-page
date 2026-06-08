import axios from 'axios';
import i18n from '@/i18n';

// API origin is env-driven for production; falls back to local dev.
const API_ORIGIN = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');

export const api = axios.create({
  baseURL: `${API_ORIGIN}/api`,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof localStorage !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  // Tell the backend which language to return validation/error messages in.
  const lang = (i18n.language || 'en').slice(0, 2);
  config.headers['X-Locale'] = lang === 'ar' ? 'ar' : 'en';
  return config;
});

// Do not clear auth storage here — AuthContext validates the session via GET /user.
api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
);
