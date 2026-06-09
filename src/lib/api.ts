import axios from 'axios';
import i18n from '@/i18n';

// API origin is env-driven for production; falls back to local dev.
const API_ORIGIN = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_ORIGIN || 'http://127.0.0.1:8000').replace(/\/$/, '');

/** Generate or retrieve a persistent browser device fingerprint (UUID v4). */
function getDeviceId(): string {
  const KEY = 'prometrica_device_id';
  if (typeof localStorage === 'undefined') return '';
  let id = localStorage.getItem(KEY);
  if (!id) {
    // crypto.randomUUID is available in all modern browsers
    id = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    localStorage.setItem(KEY, id);
  }
  return id;
}

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
  // Persistent device fingerprint — used by backend to enforce single-device access per course.
  const deviceId = getDeviceId();
  if (deviceId) config.headers['X-Device-ID'] = deviceId;

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
