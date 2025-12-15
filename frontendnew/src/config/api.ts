// In development, use relative paths to leverage Vite proxy
// In production, use the full API URL
export const API_BASE_URL = import.meta.env.DEV 
  ? '' // Use relative paths in dev (Vite proxy handles it)
  : (import.meta.env.VITE_API_BASE_URL || 'https://talentcueai.com');

/**
 * @param endpoint 
 * @returns 
 */

export function getApiUrl(endpoint: string): string {

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
  
}

export default API_BASE_URL;
