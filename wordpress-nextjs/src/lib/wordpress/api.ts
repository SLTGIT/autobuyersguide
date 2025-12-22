import {
    WPPost,
    WPPage,
    WPUser,
    WPCategory,
    WPTag,
    WPMedia,
    WPMenuItem,
    WPSettings,
} from '@/types/wordpress';

const API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || process.env.WORDPRESS_API_URL || '';

// Helper function to construct API URL
const getAPIUrl = (endpoint: string): string => {
    return `${API_URL}${endpoint}`;
};

// Helper function for fetch with error handling
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
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

// ========== POSTS ==========

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

export async function getPostBySlug(slug: string): Promise<WPPost | null> {
    const posts = await fetchAPI<WPPost[]>(`/wp/v2/posts?slug=${slug}&_embed=1`);
    return posts.length > 0 ? posts[0] : null;
}

export async function getPostById(id: number): Promise<WPPost> {
    return fetchAPI<WPPost>(`/wp/v2/posts/${id}?_embed=1`);
}

// ========== PAGES ==========

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

export async function getPageBySlug(slug: string): Promise<WPPage | null> {
    const pages = await fetchAPI<WPPage[]>(`/wp/v2/pages?slug=${slug}&_embed=1`);
    return pages.length > 0 ? pages[0] : null;
}

export async function getPageById(id: number): Promise<WPPage> {
    return fetchAPI<WPPage>(`/wp/v2/pages/${id}?_embed=1`);
}

// ========== USERS ==========

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

export async function getUserById(id: number): Promise<WPUser> {
    return fetchAPI<WPUser>(`/wp/v2/users/${id}`);
}

export async function getUserBySlug(slug: string): Promise<WPUser | null> {
    const users = await fetchAPI<WPUser[]>(`/users?slug=${slug}`);
    return users.length > 0 ? users[0] : null;
}

// ========== CATEGORIES ==========

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

export async function getCategoryById(id: number): Promise<WPCategory> {
    return fetchAPI<WPCategory>(`/wp/v2/categories/${id}`);
}   

export async function getCategoryBySlug(slug: string): Promise<WPCategory | null> {
    const categories = await fetchAPI<WPCategory[]>(`/wp/v2/categories?slug=${slug}`);
    return categories.length > 0 ? categories[0] : null;
}

// ========== TAGS ==========

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

export async function getTagById(id: number): Promise<WPTag> {
    return fetchAPI<WPTag>(`/wp/v2/tags/${id}`);
}

export async function getTagBySlug(slug: string): Promise<WPTag | null> {
    const tags = await fetchAPI<WPTag[]>(`/wp/v2/tags?slug=${slug}`);
    return tags.length > 0 ? tags[0] : null;
}

// ========== MEDIA ==========

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

export async function getMediaById(id: number): Promise<WPMedia> {
    return fetchAPI<WPMedia>(`/wp/v2/media/${id}`);
}

// ========== MENUS ==========
// Note: WordPress doesn't natively expose menus via REST API
// You need to either:
// 1. Install "WP REST API Menus" plugin, OR
// 2. Add custom endpoint to your theme's functions.php

export async function getMenus(): Promise<any[]> {
    try {
        // Try WP REST API Menus plugin endpoint first
        return await fetchAPI<any[]>('/menus/v1/menus');
    } catch (error) {
        console.error('Error fetching menus:', error);
        return [];
    }
}

export async function getMenu(menuId: number | string): Promise<any> {
    try {
        // Try WP REST API Menus plugin endpoint
        return await fetchAPI<any>(`/menus/v1/menus/${menuId}`);
    } catch (error) {
        console.error('Error fetching menu:', error);
        return null;
    }
}

export async function getMenuByLocation(location: string): Promise<any> {
    try {
        // Try WP REST API Menus plugin endpoint
        return await fetchAPI<any>(`/menus/v1/locations/${location}`);
    } catch (error) {
        console.error('Error fetching menu by location:', error);
        return null;
    }
}

export async function getMenuByName(name: string): Promise<any> {
    try {
        // Custom endpoint from theme functions.php
        return await fetchAPI<any>(`/menus/v1/by-name/${name}`);
    } catch (error) {
        console.error('Error fetching menu by name:', error);
        return null;
    }
}

// Fallback: Get menu items from pages (if menu plugin not available)
export async function getNavigationPages(): Promise<WPPage[]> {
    try {
        return await getPages({ 
            per_page: 10, 
            orderby: 'menu_order', 
            order: 'asc' 
        });
    } catch (error) {
        console.error('Error fetching navigation pages:', error);
        return [];
    }
}

// ========== SETTINGS ==========
// Note: /settings endpoint requires authentication
// We'll use the root endpoint instead which is public

export async function getSiteSettings(): Promise<{ title: string; description: string; url: string } | null> {
    try {
        // Use root endpoint which doesn't require auth
        const rootEndpoint = API_URL.replace('/wp/v2', '');
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

// ========== SEARCH ==========

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

// ========== VEHICLES ==========
// Re-export vehicle API functions
export {
    getVehicles,
    getVehicleById,
    getVehicleBySlug,
    getFilterOptions,
    getMakes,
    getModels,
    buildVehicleQueryString,
    parseVehicleQueryString,
} from './vehicles-api';

