/**
 * Production API Configuration for SchemeSathi AI
 */
export const API_BASE_URL = (import.meta.env.VITE_BACKEND_URL || 'https://schemesathi-ai-backend.onrender.com').replace(/\/+$/, '');

export default API_BASE_URL;
