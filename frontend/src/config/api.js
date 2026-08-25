const rawBase = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";
const cleanBase = rawBase.replace(/\/+$/, '');
export const API_BASE = cleanBase.endsWith('/api/v1') ? cleanBase : `${cleanBase}/api/v1`;

