/**
 * Centralized API Configuration
 * 
 * This file contains the base URL for all API endpoints.
 * To change the domain, update the API_BASE_URL constant below.
 * 
 * The URL can also be overridden via the VITE_API_BASE_URL environment variable.
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://talentcueai.com';

/**
 * Helper function to build full API URLs
 * @param endpoint - The API endpoint path (e.g., '/interview/audio/transcribe')
 * @returns The full URL
 */
export function getApiUrl(endpoint: string): string {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
}

/**
 * Export the base URL for direct use if needed
 */
export default API_BASE_URL;

