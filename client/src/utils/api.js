/**
 * api.js — Axios instance with request & response interceptors
 *
 * Usage anywhere in the app:
 *   import api from '@/utils/api';
 *   const data = await api.get('/subjects');
 *   const data = await api.post('/subjects', { name: 'JS' });
 *
 * The interceptors handle:
 *   - Attaching the JWT token from localStorage on every request
 *   - Unwrapping response.data so callers get the payload directly
 *   - Normalising error messages so every catch block gets a plain Error
 *   - Auto-removing the stale token on 401 Unauthorized
 */

import axios from 'axios';
import { getToken, removeToken } from './storage';

// ─── Create instance ──────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 s — prevents requests hanging indefinitely
});

// ─── Request interceptor ──────────────────────────────────────────────────────
// Runs before every outgoing request.
// Reads the JWT token from localStorage and attaches it as a Bearer header.

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor ─────────────────────────────────────────────────────
// Runs after every response (success or error).
//
// On SUCCESS  → return response.data (the actual payload)
// On ERROR    → normalise to a plain JS Error with a human-readable message
//               and clear auth token on 401

api.interceptors.response.use(
  // ✅ 2xx responses — unwrap the data layer
  (response) => response.data,

  // ❌ Non-2xx responses
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      // 401 Unauthorized — token is invalid or expired
      if (status === 401) {
        removeToken();
        // Do NOT hard-redirect here; AuthContext will react to the missing token
      }

      // Prefer the server's message, fall back to HTTP status text
      const message =
        data?.message || data?.error || error.response.statusText || 'Request failed';

      return Promise.reject(new Error(message));
    }

    // Network error / timeout / CORS block
    if (error.request) {
      return Promise.reject(new Error('Network error — no response from server'));
    }

    // Axios config error
    return Promise.reject(new Error(error.message || 'Unexpected error'));
  }
);

export default api;
