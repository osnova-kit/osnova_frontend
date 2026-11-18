export const API_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:8000/api/v1';
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
export const API_DOCS_URL = `${API_ORIGIN}/docs`;

export const GITHUB_BACKEND_URL = 'https://github.com/osnova-kit/osnova_backend';
export const GITHUB_FRONTEND_URL = 'https://github.com/osnova-kit/osnova_frontend';

export const PRIVACY_POLICY_PATH = '/privacy';
