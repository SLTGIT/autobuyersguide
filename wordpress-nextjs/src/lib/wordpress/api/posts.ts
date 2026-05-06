/**
 * WordPress Posts API
 * Functions for fetching and managing WordPress posts
 */

import { WPPost } from '@/types/wordpress';
import { fetchAPI } from './client';

/**
 * Fetch posts with optional filtering and pagination
 */
/**
 * Paginate through all published posts (for sitemaps, feeds, etc.).
 * Stops when a page returns fewer than `per_page` items or after `maxPages` (safety cap).
 */
export async function getAllPosts(options?: {
  per_page?: number;
  maxPages?: number;
}): Promise<WPPost[]> {
  const perPage = options?.per_page ?? 100;
  const maxPages = options?.maxPages ?? 500;
  const all: WPPost[] = [];
  for (let page = 1; page <= maxPages; page++) {
    const batch = await getPosts({ per_page: perPage, page });
    if (!batch.length) break;
    all.push(...batch);
    if (batch.length < perPage) break;
  }
  return all;
}

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
