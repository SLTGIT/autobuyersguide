/**
 * WordPress Menus API
 * Functions for fetching WordPress menus
 * 
 * Note: WordPress doesn't natively expose menus via REST API
 * You need to either:
 * 1. Install "WP REST API Menus" plugin, OR
 * 2. Add custom endpoint to your theme's functions.php
 */

import { WPPage } from '@/types/wordpress';
import { fetchAPI } from './client';
import { getPages } from './pages';

/**
 * Fetch all menus
 */
export async function getMenus(): Promise<any[]> {
    try {
        // Try WP REST API Menus plugin endpoint first
        return await fetchAPI<any[]>('/menus/v1/menus');
    } catch (error) {
        console.error('Error fetching menus:', error);
        return [];
    }
}

/**
 * Fetch a menu by ID or slug
 */
export async function getMenu(menuId: number | string): Promise<any> {
    try {
        // Try WP REST API Menus plugin endpoint
        return await fetchAPI<any>(`/menus/v1/menus/${menuId}`);
    } catch (error) {
        console.error('Error fetching menu:', error);
        return null;
    }
}

/**
 * Fetch a menu by location
 */
export async function getMenuByLocation(location: string): Promise<any> {
    try {
        // Try WP REST API Menus plugin endpoint
        return await fetchAPI<any>(`/menus/v1/locations/${location}`);
    } catch (error) {
        console.error('Error fetching menu by location:', error);
        return null;
    }
}

/**
 * Fetch a menu by name
 */
export async function getMenuByName(name: string): Promise<any> {
    try {
        // Custom endpoint from theme functions.php
        return await fetchAPI<any>(`/menus/v1/by-name/${name}`);
    } catch (error) {
        console.error('Error fetching menu by name:', error);
        return null;
    }
}

/**
 * Fallback: Get menu items from pages (if menu plugin not available)
 */
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
