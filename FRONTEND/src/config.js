/** Normalized backend base URL (no trailing slash). */
const raw = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const API_URL = String(raw).trim().replace(/\/+$/, '');
