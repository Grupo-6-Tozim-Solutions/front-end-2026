import axios from 'axios';

/**
 * Axios instance for API requests
 * Uses environment variable EXPO_PUBLIC_API_BASE_URL
 * Falls back to http://localhost:8000 if not set
 */
const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  timeout: 60000, // 60 segundos para suportar upload de áudio
});

export default api;
