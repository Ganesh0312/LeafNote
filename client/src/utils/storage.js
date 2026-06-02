/**
 * storage.js — Safe localStorage utility
 *
 * All methods are SSR-safe (Next.js runs code on the server where
 * `window` / `localStorage` are not available). Every function
 * checks for the browser environment before touching localStorage.
 */

const isBrowser = typeof window !== 'undefined';

// ─── Generic helpers ──────────────────────────────────────────────────────────

/**
 * Get a raw string value from localStorage.
 * @param {string} key
 * @returns {string | null}
 */
export const getItem = (key) => {
  if (!isBrowser) return null;
  return localStorage.getItem(key);
};

/**
 * Set a raw string value in localStorage.
 * @param {string} key
 * @param {string} value
 */
export const setItem = (key, value) => {
  if (!isBrowser) return;
  localStorage.setItem(key, value);
};

/**
 * Remove a key from localStorage.
 * @param {string} key
 */
export const removeItem = (key) => {
  if (!isBrowser) return;
  localStorage.removeItem(key);
};

/**
 * Clear ALL keys from localStorage.
 * Use with caution — wipes everything including third-party keys.
 */
export const clearStorage = () => {
  if (!isBrowser) return;
  localStorage.clear();
};

// ─── JSON helpers ─────────────────────────────────────────────────────────────

/**
 * Get a JSON-parsed value from localStorage.
 * Returns `null` if the key is missing or the value is not valid JSON.
 * @template T
 * @param {string} key
 * @returns {T | null}
 */
export const getJSON = (key) => {
  const raw = getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

/**
 * JSON-stringify a value and store it in localStorage.
 * @param {string} key
 * @param {*} value
 */
export const setJSON = (key, value) => {
  setItem(key, JSON.stringify(value));
};

// ─── App-specific shortcuts ───────────────────────────────────────────────────

/** Storage keys — centralised to avoid typos across the app */
export const STORAGE_KEYS = {
  TOKEN: 'token',
  THEME: 'theme',
  USER:  'user',
};

// Auth token
export const getToken  = ()      => getItem(STORAGE_KEYS.TOKEN);
export const setToken  = (token) => setItem(STORAGE_KEYS.TOKEN, token);
export const removeToken = ()    => removeItem(STORAGE_KEYS.TOKEN);

// Theme preference
export const getTheme  = ()      => getItem(STORAGE_KEYS.THEME);
export const setTheme  = (theme) => setItem(STORAGE_KEYS.THEME, theme);

// Cached user object (optional — primary source of truth is AuthContext)
export const getCachedUser  = ()     => getJSON(STORAGE_KEYS.USER);
export const setCachedUser  = (user) => setJSON(STORAGE_KEYS.USER, user);
export const removeCachedUser = ()   => removeItem(STORAGE_KEYS.USER);

/**
 * Clear all auth-related keys in one call (used on logout).
 */
export const clearAuth = () => {
  removeToken();
  removeCachedUser();
};
