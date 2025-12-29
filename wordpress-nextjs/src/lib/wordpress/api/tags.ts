/**
 * WordPress Tags API
 * Functions for fetching and managing WordPress tags
 */

import { WPTag } from '@/types/wordpress';
import { fetchAPI } from './client';

/**
 * Fetch tags with optional filtering and pagination
 */
export async function getTags(params: {
    per_page?: number;
    page?: number;
    orderby?: string;
    order?: 'asc' | 'desc';
} = {}): Promise<WPTag[]> {
    const queryParams = new URLSearchParams();

    if (params.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.orderby) queryParams.append('orderby', params.orderby);
    if (params.order) queryParams.append('order', params.order);

    const query = queryParams.toString();
    return fetchAPI<WPTag[]>(`/wp/v2/tags${query ? `?${query}` : ''}`);
}

/**
 * Fetch a single tag by ID
 */
export async function getTagById(id: number): Promise<WPTag> {
    return fetchAPI<WPTag>(`/wp/v2/tags/${id}`);
}

/**
 * Fetch a single tag by slug
 */
export async function getTagBySlug(slug: string): Promise<WPTag | null> {
    const tags = await fetchAPI<WPTag[]>(`/wp/v2/tags?slug=${slug}`);
    return tags.length > 0 ? tags[0] : null;
}
