/**
 * WordPress Settings API
 * Functions for fetching WordPress site settings
 * 
 * Note: /settings endpoint requires authentication
 * We use the root endpoint instead which is public
 */

import { API_URL } from './client';

export type WPCustomSettings = {
    google_analytics_id?: string;
    google_tag_manager_id?: string;
    facebook_url?: string;
    instagram_url?: string;
    youtube_url?: string;
    tiktok_url?: string;
    x_url?: string;
    linkedin_url?: string;
};

function getApiRootEndpoint(): string {
    return API_URL.replace(/\/wp\/v2\/?$/, '');
}

/**
 * Fetch site settings (title, description, URL)
 */
export async function getSiteSettings(): Promise<{ title: string; description: string; url: string } | null> {
    try {
        // Use root endpoint which doesn't require auth
        const rootEndpoint = getApiRootEndpoint();
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

/**
 * Fetch custom site settings from WP custom REST API.
 * Endpoint: /custom/v1/settings (public)
 */
export async function getCustomSettings(): Promise<WPCustomSettings | null> {
    try {
        const rootEndpoint = getApiRootEndpoint();
        const response = await fetch(`${rootEndpoint}/custom/v1/settings`, {
            next: { revalidate: 300 },
        });

        if (!response.ok) {
            throw new Error(`WordPress custom settings API error: ${response.status}`);
        }

        const data = (await response.json()) as WPCustomSettings;
        return data ?? null;
    } catch (error) {
        console.error('Error fetching custom settings:', error);
        return null;
    }
}
