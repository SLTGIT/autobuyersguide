/**
 * WordPress Types - Barrel Export
 * Re-exports all WordPress type definitions
 */

// Core content types
export type { WPPost } from './post';
export type { WPPage } from './page';
export type { WPUser } from './user';

// Taxonomy types
export type { WPCategory } from './category';
export type { WPTag } from './tag';

// Media types
export type { WPMedia } from './media';

// Menu types
export type { WPMenu, WPMenuItem } from './menu';

// Settings and config
export type { WPSettings } from './settings';
export type { WPAPIConfig } from './config';
