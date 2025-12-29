/**
 * WordPress Posts API
 * Functions for fetching and managing WordPress posts
 */

import { WPPost } from '@/types/wordpress';
import { fetchAPI } from './client';

/**
 * Fetch posts with optional filtering and pagination
 */
export async function getPosts(params: {
    per_page?: number;
    page?: number;
    categories?: number[];
    tags?: number[];
    search?: string;
    orderby?: string;
    order?: 'asc' | 'desc';
} = {}): Promise<WPPost[]> {
    const queryParams = new URLSearchParams();

    if (params.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.categories?.length) queryParams.append('categories', params.categories.join(','));
    if (params.tags?.length) queryParams.append('tags', params.tags.join(','));
    if (params.search) queryParams.append('search', params.search);
    if (params.orderby) queryParams.append('orderby', params.orderby);
    if (params.order) queryParams.append('order', params.order);

    queryParams.append('_embed', '1');

    const query = queryParams.toString();
    return fetchAPI<WPPost[]>(`/wp/v2/posts${query ? `?${query}` : ''}`);
}

/**
 * Fetch a single post by slug
 */
export async function getPostBySlug(slug: string): Promise<WPPost | null> {
    const posts = await fetchAPI<WPPost[]>(`/wp/v2/posts?slug=${slug}&_embed=1`);
    return posts.length > 0 ? posts[0] : null;
}

/**
 * Fetch a single post by ID
 */
export async function getPostById(id: number): Promise<WPPost> {
    return fetchAPI<WPPost>(`/wp/v2/posts/${id}?_embed=1`);
}
