<?php
/**
 * Plugin Name: Headless Next.js URL Handler
 * Description: Redirects all WordPress frontend URLs to a Next.js frontend and rewires View/Preview links.
 * Version: 1.1.0
 * Author: Your Name
 */

if (!defined('ABSPATH')) exit;

/**
 * =====================================
 * SETTINGS PAGE
 * =====================================
 */

add_action('admin_menu', 'hn_add_settings_page');
function hn_add_settings_page() {
    add_options_page(
        'Headless Next.js Settings',
        'Headless Next.js',
        'manage_options',
        'headless-nextjs-urls',
        'hn_render_settings_page'
    );
}

add_action('admin_init', 'hn_register_settings');
function hn_register_settings() {
    register_setting('hn_settings_group', 'hn_frontend_url');
    add_settings_section('hn_main_section', 'Main Settings', '__return_empty_string', 'headless-nextjs-urls');
    add_settings_field(
        'hn_frontend_url',
        'Frontend URL',
        'hn_frontend_url_callback',
        'headless-nextjs-urls',
        'hn_main_section'
    );
}

function hn_frontend_url_callback() {
    $url = get_option('hn_frontend_url', 'http://localhost:3000');
    echo '<input type="url" name="hn_frontend_url" value="' . esc_attr($url) . '" class="regular-text" placeholder="https://example.com">';
    echo '<p class="description">Enter the URL of your Next.js application.</p>';
}

function hn_render_settings_page() {
    ?>
    <div class="wrap">
        <h1>Headless Next.js Settings</h1>
        <form method="post" action="options.php">
            <?php
            settings_fields('hn_settings_group');
            do_settings_sections('headless-nextjs-urls');
            submit_button();
            ?>
        </form>
    </div>
    <?php
}

/**
 * Helper to get frontend URL
 */
function hn_get_frontend_url() {
    return trailingslashit(get_option('hn_frontend_url', 'http://localhost:3000'));
}

/**
 * =====================================
 * CONTENT LINKS (Posts, Pages, CPTs)
 * =====================================
 */
add_filter('post_type_link', 'hn_post_links', 10, 2);
add_filter('page_link', 'hn_post_links', 10, 2);

function hn_post_links($url, $post) {
    if (!$post) return $url;

    $base_url = hn_get_frontend_url();
    $slug = $post->post_name;

    switch ($post->post_type) {
        case 'post':
            return $base_url . 'blog/' . $slug;
        case 'page':
            return $base_url . $slug;
        case 'vehicle':
            return $base_url . 'vehicles/' . $slug;
        default:
            return $base_url . $slug;
    }
}

/**
 * =====================================
 * TAXONOMY LINKS (Category, Tag, Custom)
 * =====================================
 */
add_filter('term_link', 'hn_term_links', 10, 3);

function hn_term_links($url, $term, $taxonomy) {
    $base_url = hn_get_frontend_url();
    
    // Default WP behavior usually creates /category/slug
    // We can map them based on Next.js routes if needed
    if ($taxonomy === 'category') {
        return $base_url . 'category/' . $term->slug;
    }
    if ($taxonomy === 'post_tag') {
        return $base_url . 'tag/' . $term->slug;
    }
    
    return $base_url . $taxonomy . '/' . $term->slug;
}

/**
 * =====================================
 * PREVIEW LINK (Draft / Pending)
 * =====================================
 */
add_filter('preview_post_link', 'hn_preview_link', 10, 2);

function hn_preview_link($link, $post) {
    return hn_get_frontend_url() . 'preview?post_id=' . $post->ID . '&post_type=' . $post->post_type;
}

/**
 * =====================================
 * FORCE REDIRECT ALL FRONTEND REQUESTS
 * =====================================
 */
add_action('template_redirect', 'hn_redirect_frontend');

function hn_redirect_frontend() {
    // Allow admin, REST API, AJAX, and CLI
    if (
        is_admin() ||
        wp_doing_ajax() ||
        defined('REST_REQUEST') ||
        (defined('WP_CLI') && WP_CLI)
    ) {
        return;
    }

    // Capture the current path
    $path = $_SERVER['REQUEST_URI'];
    $frontend_url = hn_get_frontend_url();

    // Prevent infinite redirect if referer is frontend
    if (strpos($_SERVER['HTTP_REFERER'] ?? '', $frontend_url) !== false) {
        return;
    }

    // If it's the home page, just go to frontend home
    if ($path === '/' || $path === '') {
        wp_redirect($frontend_url, 302);
        exit;
    }

    // Map specific paths if necessary (e.g., /blog -> /blog on frontend)
    // For now, we'll just redirect to the same path on the frontend
    wp_redirect($frontend_url . ltrim($path, '/'), 302);
    exit;
}

/**
 * =====================================
 * HIDE WORDPRESS FRONTEND COMPLETELY
 * =====================================
 */
add_filter('show_admin_bar', '__return_false');
add_filter('xmlrpc_enabled', '__return_false');
