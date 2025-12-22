<?php
/**
 * Vehicle Meta Fields
 *
 * @package Vehicle_Inventory_Manager
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Vehicle Meta Fields Class
 */
class VIM_Vehicle_Meta_Fields {
    
    /**
     * Single instance
     */
    private static $instance = null;
    
    /**
     * Get instance
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
        add_action('init', array($this, 'register_meta_fields'));
        add_action('rest_api_init', array($this, 'register_rest_fields'));
    }
    
    /**
     * Register all meta fields
     */
    public function register_meta_fields() {
        $meta_fields = $this->get_meta_field_definitions();
        
        foreach ($meta_fields as $key => $args) {
            register_post_meta('vehicle', $key, $args);
        }
    }
    
    /**
     * Get meta field definitions
     */
    public function get_meta_field_definitions() {
        return array(
            '_vim_price' => array(
                'type'              => 'number',
                'description'       => __('Vehicle price', 'vehicle-inventory-manager'),
                'single'            => true,
                'show_in_rest'      => true,
                'sanitize_callback' => 'absint',
            ),
            '_vim_year' => array(
                'type'              => 'number',
                'description'       => __('Manufacturing year', 'vehicle-inventory-manager'),
                'single'            => true,
                'show_in_rest'      => true,
                'sanitize_callback' => 'absint',
            ),
            '_vim_odometer' => array(
                'type'              => 'number',
                'description'       => __('Odometer reading in kilometers', 'vehicle-inventory-manager'),
                'single'            => true,
                'show_in_rest'      => true,
                'sanitize_callback' => 'absint',
            ),
            '_vim_vin' => array(
                'type'              => 'string',
                'description'       => __('Vehicle Identification Number', 'vehicle-inventory-manager'),
                'single'            => true,
                'show_in_rest'      => true,
                'sanitize_callback' => 'sanitize_text_field',
            ),
            '_vim_stock_number' => array(
                'type'              => 'string',
                'description'       => __('Stock number', 'vehicle-inventory-manager'),
                'single'            => true,
                'show_in_rest'      => true,
                'sanitize_callback' => 'sanitize_text_field',
            ),
            '_vim_engine_size' => array(
                'type'              => 'string',
                'description'       => __('Engine size (e.g., 2.0L)', 'vehicle-inventory-manager'),
                'single'            => true,
                'show_in_rest'      => true,
                'sanitize_callback' => 'sanitize_text_field',
            ),
            '_vim_cylinders' => array(
                'type'              => 'number',
                'description'       => __('Number of cylinders', 'vehicle-inventory-manager'),
                'single'            => true,
                'show_in_rest'      => true,
                'sanitize_callback' => 'absint',
            ),
            '_vim_doors' => array(
                'type'              => 'number',
                'description'       => __('Number of doors', 'vehicle-inventory-manager'),
                'single'            => true,
                'show_in_rest'      => true,
                'sanitize_callback' => 'absint',
            ),
            '_vim_seats' => array(
                'type'              => 'number',
                'description'       => __('Seating capacity', 'vehicle-inventory-manager'),
                'single'            => true,
                'show_in_rest'      => true,
                'sanitize_callback' => 'absint',
            ),
            '_vim_registration' => array(
                'type'              => 'string',
                'description'       => __('Registration details', 'vehicle-inventory-manager'),
                'single'            => true,
                'show_in_rest'      => true,
                'sanitize_callback' => 'sanitize_text_field',
            ),
            '_vim_price_type' => array(
                'type'              => 'string',
                'description'       => __('Price type (Drive Away, Excl. Govt. Charges, etc.)', 'vehicle-inventory-manager'),
                'single'            => true,
                'show_in_rest'      => true,
                'sanitize_callback' => 'sanitize_text_field',
            ),
            '_vim_status_badge' => array(
                'type'              => 'string',
                'description'       => __('Status badge (Just Sold, Manager\'s Special, etc.)', 'vehicle-inventory-manager'),
                'single'            => true,
                'show_in_rest'      => true,
                'sanitize_callback' => 'sanitize_text_field',
            ),
            '_vim_dealership' => array(
                'type'              => 'string',
                'description'       => __('Dealership name', 'vehicle-inventory-manager'),
                'single'            => true,
                'show_in_rest'      => true,
                'sanitize_callback' => 'sanitize_text_field',
            ),
            '_vim_location' => array(
                'type'              => 'string',
                'description'       => __('Location (State/Region)', 'vehicle-inventory-manager'),
                'single'            => true,
                'show_in_rest'      => true,
                'sanitize_callback' => 'sanitize_text_field',
            ),
            '_vim_features' => array(
                'type'              => 'string',
                'description'       => __('Vehicle features (JSON)', 'vehicle-inventory-manager'),
                'single'            => true,
                'show_in_rest'      => true,
                'sanitize_callback' => 'sanitize_textarea_field',
            ),
            '_vim_gallery_images' => array(
                'type'              => 'array',
                'description'       => __('Gallery image IDs', 'vehicle-inventory-manager'),
                'single'            => true,
                'show_in_rest'      => array(
                    'schema' => array(
                        'type'  => 'array',
                        'items' => array(
                            'type' => 'integer',
                        ),
                    ),
                ),
                'sanitize_callback' => array($this, 'sanitize_gallery_images'),
            ),
        );
    }
    
    /**
     * Sanitize gallery images
     */
    public function sanitize_gallery_images($value) {
        if (!is_array($value)) {
            return array();
        }
        return array_map('absint', $value);
    }
    
    /**
     * Register REST API fields
     */
    public function register_rest_fields() {
        // Register gallery images with full URLs
        register_rest_field('vehicle', 'gallery_images_urls', array(
            'get_callback' => array($this, 'get_gallery_images_urls'),
            'schema'       => array(
                'description' => __('Gallery images with URLs', 'vehicle-inventory-manager'),
                'type'        => 'array',
                'context'     => array('view', 'edit'),
                'items'       => array(
                    'type' => 'object',
                    'properties' => array(
                        'id'        => array('type' => 'integer'),
                        'url'       => array('type' => 'string'),
                        'thumbnail' => array('type' => 'string'),
                        'medium'    => array('type' => 'string'),
                        'large'     => array('type' => 'string'),
                        'alt'       => array('type' => 'string'),
                    ),
                ),
            ),
        ));
        
        // Register formatted price
        register_rest_field('vehicle', 'formatted_price', array(
            'get_callback' => array($this, 'get_formatted_price'),
            'schema'       => array(
                'description' => __('Formatted price with currency', 'vehicle-inventory-manager'),
                'type'        => 'string',
                'context'     => array('view', 'edit'),
            ),
        ));
    }
    
    /**
     * Get gallery images with URLs
     */
    public function get_gallery_images_urls($object) {
        $image_ids = get_post_meta($object['id'], '_vim_gallery_images', true);
        
        if (empty($image_ids) || !is_array($image_ids)) {
            return array();
        }
        
        $images = array();
        foreach ($image_ids as $image_id) {
            $images[] = array(
                'id'        => $image_id,
                'url'       => wp_get_attachment_url($image_id),
                'thumbnail' => wp_get_attachment_image_url($image_id, 'thumbnail'),
                'medium'    => wp_get_attachment_image_url($image_id, 'medium'),
                'large'     => wp_get_attachment_image_url($image_id, 'large'),
                'alt'       => get_post_meta($image_id, '_wp_attachment_image_alt', true),
            );
        }
        
        return $images;
    }
    
    /**
     * Get formatted price
     */
    public function get_formatted_price($object) {
        $price = get_post_meta($object['id'], '_vim_price', true);
        
        if (empty($price)) {
            return '';
        }
        
        $currency = get_option('vim_currency_symbol', '$');
        $position = get_option('vim_currency_position', 'before');
        
        $formatted = number_format($price);
        
        if ($position === 'before') {
            return $currency . $formatted;
        } else {
            return $formatted . $currency;
        }
    }
}
