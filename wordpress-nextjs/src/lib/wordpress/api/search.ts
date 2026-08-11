/**
 * WordPress Search API
 * Functions for searching WordPress content
 */

import { WPPost, WPPage } from '@/types/wordpress';
import { fetchAPI } from './client';

/**
 * Search posts and/or pages
 */
export async function searchContent(query: string, type: 'post' | 'page' | 'any' = 'any'): Promise<(WPPost | WPPage)[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('search', query);
    queryParams.append('_embed', '1');

    if (type !== 'any') {
        queryParams.append('type', type);
    }

    const searchQuery = queryParams.toString();

    if (type === 'post') {
        return fetchAPI<WPPost[]>(`/posts?${searchQuery}`);
    } else if (type === 'page') {
        return fetchAPI<WPPage[]>(`/wp/v2/pages?${searchQuery}`);
    } else {
        // Search both posts and pages
        const [posts, pages] = await Promise.all([
            fetchAPI<WPPost[]>(`/wp/v2/posts?${searchQuery}`),
            fetchAPI<WPPage[]>(`/wp/v2/pages?${searchQuery}`)
        ]);
        return [...posts, ...pages];
    }
}
