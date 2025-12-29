/**
 * WordPress Settings API
 * Functions for fetching WordPress site settings
 * 
 * Note: /settings endpoint requires authentication
 * We use the root endpoint instead which is public
 */

import { API_URL } from './client';

/**
 * Fetch site settings (title, description, URL)
 */
export async function getSiteSettings(): Promise<{ title: string; description: string; url: string } | null> {
    try {
        // Use root endpoint which doesn't require auth
        const rootEndpoint = API_URL.replace('/wp/v2', '');
        const response = await fetch(rootEndpoint, {
            cache: 'no-store',
        });
        
        if (!response.ok) {
            throw new Error(`WordPress API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        return {
            title: data.name || 'WordPress Site',
            description: data.description || '',
            url: data.url || ''
        };
    } catch (error) {
        console.error('Error fetching site settings:', error);
        return null;
    }
}
