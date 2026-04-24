import axios from 'axios';

/**
 * Axios instance for API requests
 * Uses environment variable EXPO_PUBLIC_API_BASE_URL
 * Falls back to http://localhost:8000 if not set
 */
const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  timeout: 10000, // 10 segundos
});

export default api;
