/**
 * Centralized API configuration for SmartHire.
 * In development: defaults to 'http://localhost:5000'.
 * In production: reads VITE_API_BASE_URL (e.g. 'https://smarthire-api.onrender.com').
 */
export const API_BASE_URL: string = (
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
).replace(/\/+$/, '');

/**
 * Builds a full API URL given a relative path.
 * Example: buildApiUrl('/api/auth/login') -> 'https://smarthire-api.onrender.com/api/auth/login'
 */
export const buildApiUrl = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
};
