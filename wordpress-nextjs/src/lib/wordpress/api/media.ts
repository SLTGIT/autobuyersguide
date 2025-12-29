/**
 * WordPress Media API
 * Functions for fetching and managing WordPress media items
 */

import { WPMedia } from '@/types/wordpress';
import { fetchAPI } from './client';

/**
 * Fetch media items with optional filtering and pagination
 */
export async function getMedia(params: {
    per_page?: number;
    page?: number;
    media_type?: string;
    orderby?: string;
    order?: 'asc' | 'desc';
} = {}): Promise<WPMedia[]> {
    const queryParams = new URLSearchParams();

    if (params.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.media_type) queryParams.append('media_type', params.media_type);
    if (params.orderby) queryParams.append('orderby', params.orderby);
    if (params.order) queryParams.append('order', params.order);

    const query = queryParams.toString();
    return fetchAPI<WPMedia[]>(`/wp/v2/media${query ? `?${query}` : ''}`);
}

/**
 * Fetch a single media item by ID
 */
export async function getMediaById(id: number): Promise<WPMedia> {
    return fetchAPI<WPMedia>(`/wp/v2/media/${id}`);
}
