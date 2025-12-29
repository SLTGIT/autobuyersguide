/**
 * WordPress API - Barrel Export
 * Re-exports all API functions for easy importing
 */

// Core client utilities
export { fetchAPI, getAPIUrl, API_URL } from './client';

// Posts
export { getPosts, getPostBySlug, getPostById } from './posts';

// Pages
export { getPages, getPageBySlug, getPageById } from './pages';

// Categories
export { getCategories, getCategoryById, getCategoryBySlug } from './categories';

// Tags
export { getTags, getTagById, getTagBySlug } from './tags';

// Media
export { getMedia, getMediaById } from './media';

// Menus
export { 
    getMenus, 
    getMenu, 
    getMenuByLocation, 
    getMenuByName, 
    getNavigationPages 
} from './menus';

// Users
export { getUsers, getUserById, getUserBySlug } from './users';

// Settings
export { getSiteSettings } from './settings';

// Search
export { searchContent } from './search';

// Vehicles (re-export from existing vehicles-api)
export {
    getVehicles,
    getVehicleById,
    getVehicleBySlug,
    getFilterOptions,
    getMakes,
    getModels,
    buildVehicleQueryString,
    parseVehicleQueryString,
} from '../vehicles-api';
