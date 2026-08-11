/**
 * WordPress Users API
 * Functions for fetching and managing WordPress users
 */

import { WPUser } from '@/types/wordpress';
import { fetchAPI } from './client';

/**
 * Fetch users with optional filtering and pagination
 */
export async function getUsers(params: {
    per_page?: number;
    page?: number;
    orderby?: string;
    order?: 'asc' | 'desc';
} = {}): Promise<WPUser[]> {
    const queryParams = new URLSearchParams();

    if (params.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.orderby) queryParams.append('orderby', params.orderby);
    if (params.order) queryParams.append('order', params.order);

    const query = queryParams.toString();
    return fetchAPI<WPUser[]>(`/wp/v2/users${query ? `?${query}` : ''}`);
}

/**
 * Fetch a single user by ID
 */
export async function getUserById(id: number): Promise<WPUser> {
    return fetchAPI<WPUser>(`/wp/v2/users/${id}`);
}

/**
 * Fetch a single user by slug
 */
export async function getUserBySlug(slug: string): Promise<WPUser | null> {
    const users = await fetchAPI<WPUser[]>(`/users?slug=${slug}`);
    return users.length > 0 ? users[0] : null;
}
