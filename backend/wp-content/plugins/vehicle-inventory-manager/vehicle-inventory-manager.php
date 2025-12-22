<?php
/**
 * Plugin Name: Vehicle Inventory Manager
 * Plugin URI: https://autobuyersguide.com.au
 * Description: Comprehensive vehicle inventory management system with advanced filtering, import capabilities, and REST API integration.
 * Version: 1.0.0
 * Author: Auto Buyers Guide
 * Author URI: https://autobuyersguide.com.au
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: vehicle-inventory-manager
 * Domain Path: /languages
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('VIM_VERSION', '1.0.0');
define('VIM_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('VIM_PLUGIN_URL', plugin_dir_url(__FILE__));
define('VIM_PLUGIN_BASENAME', plugin_basename(__FILE__));

/**
 * Main Vehicle Inventory Manager Class
 */
class Vehicle_Inventory_Manager {
    
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
        $this->load_dependencies();
        $this->init_hooks();
    }
    
    /**
     * Load required dependencies
     */
    private function load_dependencies() {
        // Core classes
        require_once VIM_PLUGIN_DIR . 'includes/class-vehicle-post-type.php';
        require_once VIM_PLUGIN_DIR . 'includes/class-vehicle-taxonomies.php';
        require_once VIM_PLUGIN_DIR . 'includes/class-vehicle-meta-fields.php';
        require_once VIM_PLUGIN_DIR . 'includes/class-vehicle-admin.php';
        require_once VIM_PLUGIN_DIR . 'includes/class-vehicle-rest-api.php';
        require_once VIM_PLUGIN_DIR . 'includes/class-vehicle-importer.php';
        require_once VIM_PLUGIN_DIR . 'includes/class-vehicle-feed-manager.php';
        require_once VIM_PLUGIN_DIR . 'includes/class-vehicle-taxonomy-meta.php';
    }
    
    /**
     * Initialize WordPress hooks
     */
    private function init_hooks() {
        // Activation and deactivation hooks
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
        
        // Initialize plugin components
        add_action('plugins_loaded', array($this, 'init'));
        
        // Load plugin text domain
        add_action('init', array($this, 'load_textdomain'));
        
        // Enqueue admin assets
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_assets'));
    }
    
    /**
     * Plugin activation
     */
    public function activate() {
        // Register post types and taxonomies
        VIM_Vehicle_Post_Type::register();
        VIM_Vehicle_Taxonomies::register();
        
        // Flush rewrite rules
        flush_rewrite_rules();
        
        // Set default options
        $this->set_default_options();
    }
    
    /**
     * Plugin deactivation
     */
    public function deactivate() {
        // Flush rewrite rules
        flush_rewrite_rules();
    }
    
    /**
     * Initialize plugin components
     */
    public function init() {
        // Initialize post type
        VIM_Vehicle_Post_Type::get_instance();
        
        // Initialize taxonomies
        VIM_Vehicle_Taxonomies::get_instance();
        
        // Initialize taxonomy meta (Make-Model linking)
        if (is_admin()) {
            VIM_Vehicle_Taxonomy_Meta::get_instance();
        }
        
        // Initialize meta fields
        VIM_Vehicle_Meta_Fields::get_instance();
        
        // Initialize admin interface
        if (is_admin()) {
            VIM_Vehicle_Admin::get_instance();
            VIM_Vehicle_Importer::get_instance();
            VIM_Vehicle_Feed_Manager::get_instance();
        }
        
        // Initialize REST API
        VIM_Vehicle_REST_API::get_instance();
    }
    
    /**
     * Load plugin text domain
     */
    public function load_textdomain() {
        load_plugin_textdomain(
            'vehicle-inventory-manager',
            false,
            dirname(VIM_PLUGIN_BASENAME) . '/languages'
        );
    }
    
    /**
     * Enqueue admin assets
     */
    public function enqueue_admin_assets($hook) {
        // Only load on vehicle edit screens
        $screen = get_current_screen();
        if (!$screen || $screen->post_type !== 'vehicle') {
            return;
        }
        
        // Enqueue admin CSS
        wp_enqueue_style(
            'vim-admin-styles',
            VIM_PLUGIN_URL . 'admin/css/admin-styles.css',
            array(),
            VIM_VERSION
        );
        
        // Enqueue admin JS
        wp_enqueue_script(
            'vim-admin-scripts',
            VIM_PLUGIN_URL . 'admin/js/admin-scripts.js',
            array('jquery', 'jquery-ui-sortable'),
            VIM_VERSION,
            true
        );
        
        // Localize script
        wp_localize_script('vim-admin-scripts', 'vimAdmin', array(
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('vim_admin_nonce'),
            'strings' => array(
                'confirmDelete' => __('Are you sure you want to delete this image?', 'vehicle-inventory-manager'),
                'uploadImage' => __('Upload Image', 'vehicle-inventory-manager'),
            ),
        ));
        
        // Enqueue media uploader
        wp_enqueue_media();
    }
    
    /**
     * Set default plugin options
     */
    private function set_default_options() {
        $defaults = array(
            'vim_currency_symbol' => '$',
            'vim_currency_position' => 'before',
            'vim_distance_unit' => 'km',
            'vim_per_page' => 12,
            'vim_image_sizes' => array(
                'thumbnail' => array('width' => 400, 'height' => 300),
                'medium' => array('width' => 800, 'height' => 600),
                'large' => array('width' => 1200, 'height' => 900),
            ),
        );
        
        foreach ($defaults as $key => $value) {
            if (get_option($key) === false) {
                add_option($key, $value);
            }
        }
    }
}

/**
 * Initialize the plugin
 */
function vim_init() {
    return Vehicle_Inventory_Manager::get_instance();
}

// Start the plugin
vim_init();
