<?php
/**
 * Preview Handler Class
 * Handles URL generation for different content types
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

class HNP_Preview_Handler {
    
    /**
     * Get preview URL for a post
     */
    public function get_preview_url($post) {
        if (!is_object($post)) {
            $post = get_post($post);
        }
        
        if (!$post) {
            return '';
        }
        
        $settings = get_option('hnp_settings', array());
        $nextjs_url = isset($settings['nextjs_url']) ? $settings['nextjs_url'] : 'http://localhost:3000';
        $preview_secret = isset($settings['preview_secret']) ? $settings['preview_secret'] : '';
        
        // Build preview API URL
        $preview_api_url = add_query_arg(array(
            'secret' => $preview_secret,
            'type' => $post->post_type,
            'slug' => $post->post_name,
            'id' => $post->ID,
            'status' => $post->post_status
        ), trailingslashit($nextjs_url) . 'api/preview');
        
        return $preview_api_url;
    }
    
    /**
     * Get frontend URL for published content
     */
    public function get_frontend_url($post) {
        if (!is_object($post)) {
            $post = get_post($post);
        }
        
        if (!$post) {
            return '';
        }
        
        // If it's a draft or pending, use preview URL
        if (in_array($post->post_status, array('draft', 'pending', 'auto-draft', 'future'))) {
            return $this->get_preview_url($post);
        }
        
        $settings = get_option('hnp_settings', array());
        $nextjs_url = isset($settings['nextjs_url']) ? $settings['nextjs_url'] : 'http://localhost:3000';
        
        // Build frontend URL based on post type
        $frontend_url = $this->build_frontend_url($nextjs_url, $post);
        
        return $frontend_url;
    }
    
    /**
     * Build frontend URL based on post type
     */
    private function build_frontend_url($base_url, $post) {
        $slug = $post->post_name;
        
        switch ($post->post_type) {
            case 'post':
                // Posts go to /blog/[slug]
                return trailingslashit($base_url) . 'blog/' . $slug;
                
            case 'page':
                // Pages go to /[slug]
                // Handle special cases
                if ($slug === 'home' || $slug === 'front-page') {
                    return $base_url;
                }
                return trailingslashit($base_url) . $slug;
                
            case 'vehicle':
                // Vehicles go to /vehicles/[slug]
                return trailingslashit($base_url) . 'vehicles/' . $slug;
                
            default:
                // Custom post types go to /[post-type]/[slug]
                return trailingslashit($base_url) . $post->post_type . '/' . $slug;
        }
    }
    
    /**
     * Get post type label
     */
    public function get_post_type_label($post_type) {
        $post_type_obj = get_post_type_object($post_type);
        return $post_type_obj ? $post_type_obj->labels->singular_name : ucfirst($post_type);
    }
    
    /**
     * Check if post type is enabled
     */
    public function is_post_type_enabled($post_type) {
        $settings = get_option('hnp_settings', array());
        $enabled_types = isset($settings['enabled_post_types']) ? $settings['enabled_post_types'] : array();
        
        return in_array($post_type, $enabled_types);
    }
    
    /**
     * Get all public post types
     */
    public function get_public_post_types() {
        $post_types = get_post_types(array(
            'public' => true,
            '_builtin' => false
        ), 'objects');
        
        // Add built-in post types
        $post_types['post'] = get_post_type_object('post');
        $post_types['page'] = get_post_type_object('page');
        
        return $post_types;
    }
}
