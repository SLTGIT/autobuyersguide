/**
 * WordPress Categories API
 * Functions for fetching and managing WordPress categories
 */

import { WPCategory } from '@/types/wordpress';
import { fetchAPI } from './client';

/**
 * Fetch categories with optional filtering and pagination
 */
export async function getCategories(params: {
    per_page?: number;
    page?: number;
    parent?: number;
    orderby?: string;
    order?: 'asc' | 'desc';
} = {}): Promise<WPCategory[]> {
    const queryParams = new URLSearchParams();

    if (params.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.parent !== undefined) queryParams.append('parent', params.parent.toString());
    if (params.orderby) queryParams.append('orderby', params.orderby);
    if (params.order) queryParams.append('order', params.order);

    const query = queryParams.toString();
    return fetchAPI<WPCategory[]>(`/wp/v2/categories${query ? `?${query}` : ''}`);
}

/**
 * Fetch a single category by ID
 */
export async function getCategoryById(id: number): Promise<WPCategory> {
    return fetchAPI<WPCategory>(`/wp/v2/categories/${id}`);
}

/**
 * Fetch a single category by slug
 */
export async function getCategoryBySlug(slug: string): Promise<WPCategory | null> {
    const categories = await fetchAPI<WPCategory[]>(`/wp/v2/categories?slug=${slug}`);
    return categories.length > 0 ? categories[0] : null;
}
