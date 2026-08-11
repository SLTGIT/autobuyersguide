<?php
/**
 * Plugin Name: Headless Next.js Preview
 * Plugin URI: https://github.com/yourusername/headless-nextjs-preview
 * Description: Redirects WordPress admin preview and view buttons to Next.js frontend for headless WordPress setup. Supports Posts, Pages, and custom post types.
 * Version: 1.0.0
 * Author: Your Name
 * Author URI: https://yourwebsite.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: headless-nextjs-preview
 * Domain Path: /languages
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('HNP_VERSION', '1.0.0');
define('HNP_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('HNP_PLUGIN_URL', plugin_dir_url(__FILE__));
define('HNP_PLUGIN_BASENAME', plugin_basename(__FILE__));

/**
 * Main Plugin Class
 */
class Headless_NextJS_Preview {
    
    /**
     * Single instance of the class
     */
    private static $instance = null;
    
    /**
     * Get single instance
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Constructor
     */
    private function __construct() {
        $this->init_hooks();
        $this->load_dependencies();
    }
    
    /**
     * Initialize hooks
     */
    private function init_hooks() {
        // Activation and deactivation hooks
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
        
        // Admin initialization
        add_action('admin_init', array($this, 'admin_init'));
        
        // Preview link filters
        add_filter('preview_post_link', array($this, 'get_preview_link'), 10, 2);
        add_filter('page_link', array($this, 'get_page_link'), 10, 2);
        add_filter('post_link', array($this, 'get_post_link'), 10, 2);
        add_filter('post_type_link', array($this, 'get_post_type_link'), 10, 2);
        
        // Add admin bar preview link
        add_action('admin_bar_menu', array($this, 'admin_bar_preview_link'), 80);
    }
    
    /**
     * Load dependencies
     */
    private function load_dependencies() {
        require_once HNP_PLUGIN_DIR . 'includes/class-preview-handler.php';
        require_once HNP_PLUGIN_DIR . 'includes/class-settings.php';
        
        // Initialize settings
        HNP_Settings::get_instance();
    }
    
    /**
     * Plugin activation
     */
    public function activate() {
        // Set default options
        $default_options = array(
            'nextjs_url' => 'http://localhost:3000',
            'preview_secret' => $this->generate_preview_secret(),
            'enabled_post_types' => array('post', 'page', 'vehicle')
        );
        
        if (!get_option('hnp_settings')) {
            add_option('hnp_settings', $default_options);
        }
        
        flush_rewrite_rules();
    }
    
    /**
     * Plugin deactivation
     */
    public function deactivate() {
        flush_rewrite_rules();
    }
    
    /**
     * Admin initialization
     */
    public function admin_init() {
        // Register settings
        register_setting('hnp_settings_group', 'hnp_settings', array($this, 'sanitize_settings'));
    }
    
    /**
     * Generate preview secret
     */
    private function generate_preview_secret() {
        return bin2hex(random_bytes(32));
    }
    
    /**
     * Sanitize settings
     */
    public function sanitize_settings($input) {
        $sanitized = array();
        
        if (isset($input['nextjs_url'])) {
            $sanitized['nextjs_url'] = esc_url_raw(rtrim($input['nextjs_url'], '/'));
        }
        
        if (isset($input['preview_secret'])) {
            $sanitized['preview_secret'] = sanitize_text_field($input['preview_secret']);
        }
        
        if (isset($input['enabled_post_types']) && is_array($input['enabled_post_types'])) {
            $sanitized['enabled_post_types'] = array_map('sanitize_text_field', $input['enabled_post_types']);
        }
        
        return $sanitized;
    }
    
    /**
     * Get preview link for posts
     */
    public function get_preview_link($preview_link, $post) {
        $handler = new HNP_Preview_Handler();
        return $handler->get_preview_url($post);
    }
    
    /**
     * Get page link
     */
    public function get_page_link($link, $post_id) {
        if (is_admin() || (defined('REST_REQUEST') && REST_REQUEST)) {
            $post = get_post($post_id);
            if ($post && $post->post_type === 'page') {
                $handler = new HNP_Preview_Handler();
                return $handler->get_frontend_url($post);
            }
        }
        return $link;
    }
    
    /**
     * Get post link
     */
    public function get_post_link($link, $post) {
        if (is_admin() || (defined('REST_REQUEST') && REST_REQUEST)) {
            if (is_object($post) && $post->post_type === 'post') {
                $handler = new HNP_Preview_Handler();
                return $handler->get_frontend_url($post);
            }
        }
        return $link;
    }
    
    /**
     * Get custom post type link
     */
    public function get_post_type_link($link, $post) {
        if (is_admin() || (defined('REST_REQUEST') && REST_REQUEST)) {
            if (is_object($post)) {
                $settings = get_option('hnp_settings', array());
                $enabled_types = isset($settings['enabled_post_types']) ? $settings['enabled_post_types'] : array();
                
                if (in_array($post->post_type, $enabled_types)) {
                    $handler = new HNP_Preview_Handler();
                    return $handler->get_frontend_url($post);
                }
            }
        }
        return $link;
    }
    
    /**
     * Add preview link to admin bar
     */
    public function admin_bar_preview_link($wp_admin_bar) {
        if (!is_admin() || !is_singular()) {
            return;
        }
        
        global $post;
        if (!$post) {
            return;
        }
        
        $settings = get_option('hnp_settings', array());
        $enabled_types = isset($settings['enabled_post_types']) ? $settings['enabled_post_types'] : array();
        
        if (!in_array($post->post_type, $enabled_types)) {
            return;
        }
        
        $handler = new HNP_Preview_Handler();
        $preview_url = $handler->get_preview_url($post);
        
        $wp_admin_bar->add_node(array(
            'id' => 'hnp-preview',
            'title' => 'Preview on Frontend',
            'href' => $preview_url,
            'meta' => array(
                'target' => '_blank',
                'class' => 'hnp-preview-link'
            )
        ));
    }
}

/**
 * Initialize the plugin
 */
function headless_nextjs_preview_init() {
    return Headless_NextJS_Preview::get_instance();
}

// Start the plugin
headless_nextjs_preview_init();
