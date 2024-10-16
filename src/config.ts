const getApiBaseUrl = () => {
  if (import.meta.env.MODE === 'production') {
    return '/api'; // This will work on Vercel
  }
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
};

export const API_BASE_URL = getApiBaseUrl();
