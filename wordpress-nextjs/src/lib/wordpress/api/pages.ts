/**
 * WordPress Pages API
 * Functions for fetching and managing WordPress pages
 */

import { WPPage } from '@/types/wordpress';
import { fetchAPI } from './client';

/**
 * Fetch pages with optional filtering and pagination
 */
export async function getPages(params: {
    per_page?: number;
    page?: number;
    parent?: number;
    orderby?: string;
    order?: 'asc' | 'desc';
} = {}): Promise<WPPage[]> {
    const queryParams = new URLSearchParams();

    if (params.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.parent !== undefined) queryParams.append('parent', params.parent.toString());
    if (params.orderby) queryParams.append('orderby', params.orderby);
    if (params.order) queryParams.append('order', params.order);

    queryParams.append('_embed', '1');

    const query = queryParams.toString();
    return fetchAPI<WPPage[]>(`/wp/v2/pages${query ? `?${query}` : ''}`);
}

/**
 * Fetch a single page by slug
 */
export async function getPageBySlug(slug: string): Promise<WPPage | null> {
    const pages = await fetchAPI<WPPage[]>(`/wp/v2/pages?slug=${slug}&_embed=1`);
    return pages.length > 0 ? pages[0] : null;
}

/**
 * Fetch a single page by ID
 */
export async function getPageById(id: number): Promise<WPPage> {
    return fetchAPI<WPPage>(`/wp/v2/pages/${id}?_embed=1`);
}
