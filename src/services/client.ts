import axios from 'axios';

/**
 * Axios instance for API requests.
 * Uses EXPO_PUBLIC_API_BASE_URL and falls back to localhost.
 */
const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.0.108:8000',
  timeout: 120000,
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
});

export default api;
