/**
 * WordPress API Client
 * Core client configuration and fetch utilities
 */

const API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || process.env.WORDPRESS_API_URL || '';

/**
 * Construct full API URL from endpoint
 */
export const getAPIUrl = (endpoint: string): string => {
    return `${API_URL}${endpoint}`;
};

/**
 * Generic fetch wrapper with error handling and authentication
 */
export async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = getAPIUrl(endpoint);

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    // Add authentication if credentials are provided
    if (process.env.WORDPRESS_AUTH_USERNAME && process.env.WORDPRESS_AUTH_PASSWORD) {
        const credentials = Buffer.from(
            `${process.env.WORDPRESS_AUTH_USERNAME}:${process.env.WORDPRESS_AUTH_PASSWORD}`
        ).toString('base64');
        headers['Authorization'] = `Basic ${credentials}`;
    }

    const response = await fetch(url, {
        ...options,
        headers: {
            ...headers,
            ...(options.headers as Record<string, string>),
        },
        // Disable cache in development for immediate updates
        // Change to { revalidate: 60 } in production
        cache: 'no-store',
    });

    if (!response.ok) {
        throw new Error(`WordPress API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

/**
 * Export API_URL for use in other modules
 */
export { API_URL };
