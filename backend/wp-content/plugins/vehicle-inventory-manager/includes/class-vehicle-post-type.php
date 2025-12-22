<?php
/**
 * Vehicle Custom Post Type
 *
 * @package Vehicle_Inventory_Manager
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Vehicle Post Type Class
 */
class VIM_Vehicle_Post_Type {
    
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
        add_action('init', array($this, 'register'));
        add_filter('manage_vehicle_posts_columns', array($this, 'set_custom_columns'));
        add_action('manage_vehicle_posts_custom_column', array($this, 'custom_column_content'), 10, 2);
        add_filter('manage_edit-vehicle_sortable_columns', array($this, 'sortable_columns'));
    }
    
    /**
     * Register vehicle post type
     */
    public static function register() {
        $labels = array(
            'name'                  => _x('Vehicles', 'Post Type General Name', 'vehicle-inventory-manager'),
            'singular_name'         => _x('Vehicle', 'Post Type Singular Name', 'vehicle-inventory-manager'),
            'menu_name'             => __('Vehicles', 'vehicle-inventory-manager'),
            'name_admin_bar'        => __('Vehicle', 'vehicle-inventory-manager'),
            'archives'              => __('Vehicle Archives', 'vehicle-inventory-manager'),
            'attributes'            => __('Vehicle Attributes', 'vehicle-inventory-manager'),
            'parent_item_colon'     => __('Parent Vehicle:', 'vehicle-inventory-manager'),
            'all_items'             => __('All Vehicles', 'vehicle-inventory-manager'),
            'add_new_item'          => __('Add New Vehicle', 'vehicle-inventory-manager'),
            'add_new'               => __('Add New', 'vehicle-inventory-manager'),
            'new_item'              => __('New Vehicle', 'vehicle-inventory-manager'),
            'edit_item'             => __('Edit Vehicle', 'vehicle-inventory-manager'),
            'update_item'           => __('Update Vehicle', 'vehicle-inventory-manager'),
            'view_item'             => __('View Vehicle', 'vehicle-inventory-manager'),
            'view_items'            => __('View Vehicles', 'vehicle-inventory-manager'),
            'search_items'          => __('Search Vehicle', 'vehicle-inventory-manager'),
            'not_found'             => __('Not found', 'vehicle-inventory-manager'),
            'not_found_in_trash'    => __('Not found in Trash', 'vehicle-inventory-manager'),
            'featured_image'        => __('Featured Image', 'vehicle-inventory-manager'),
            'set_featured_image'    => __('Set featured image', 'vehicle-inventory-manager'),
            'remove_featured_image' => __('Remove featured image', 'vehicle-inventory-manager'),
            'use_featured_image'    => __('Use as featured image', 'vehicle-inventory-manager'),
            'insert_into_item'      => __('Insert into vehicle', 'vehicle-inventory-manager'),
            'uploaded_to_this_item' => __('Uploaded to this vehicle', 'vehicle-inventory-manager'),
            'items_list'            => __('Vehicles list', 'vehicle-inventory-manager'),
            'items_list_navigation' => __('Vehicles list navigation', 'vehicle-inventory-manager'),
            'filter_items_list'     => __('Filter vehicles list', 'vehicle-inventory-manager'),
        );
        
        $args = array(
            'label'                 => __('Vehicle', 'vehicle-inventory-manager'),
            'description'           => __('Vehicle inventory listings', 'vehicle-inventory-manager'),
            'labels'                => $labels,
            'supports'              => array('title', 'editor', 'thumbnail', 'custom-fields', 'revisions'),
            'taxonomies'            => array(),
            'hierarchical'          => false,
            'public'                => true,
            'show_ui'               => true,
            'show_in_menu'          => true,
            'menu_position'         => 5,
            'menu_icon'             => 'dashicons-car',
            'show_in_admin_bar'     => true,
            'show_in_nav_menus'     => true,
            'can_export'            => true,
            'has_archive'           => true,
            'exclude_from_search'   => false,
            'publicly_queryable'    => true,
            'capability_type'       => 'post',
            'show_in_rest'          => true,
            'rest_base'             => 'vehicles',
            'rest_controller_class' => 'WP_REST_Posts_Controller',
            'rewrite'               => array(
                'slug'       => 'vehicles',
                'with_front' => false,
            ),
        );
        
        register_post_type('vehicle', $args);
    }
    
    /**
     * Set custom columns for vehicle list
     */
    public function set_custom_columns($columns) {
        $new_columns = array();
        
        $new_columns['cb'] = $columns['cb'];
        $new_columns['featured_image'] = __('Image', 'vehicle-inventory-manager');
        $new_columns['title'] = $columns['title'];
        $new_columns['vehicle_make'] = __('Make', 'vehicle-inventory-manager');
        $new_columns['vehicle_model'] = __('Model', 'vehicle-inventory-manager');
        $new_columns['year'] = __('Year', 'vehicle-inventory-manager');
        $new_columns['price'] = __('Price', 'vehicle-inventory-manager');
        $new_columns['odometer'] = __('Odometer', 'vehicle-inventory-manager');
        $new_columns['condition'] = __('Condition', 'vehicle-inventory-manager');
        $new_columns['stock_number'] = __('Stock #', 'vehicle-inventory-manager');
        $new_columns['date'] = $columns['date'];
        
        return $new_columns;
    }
    
    /**
     * Custom column content
     */
    public function custom_column_content($column, $post_id) {
        switch ($column) {
            case 'featured_image':
                if (has_post_thumbnail($post_id)) {
                    echo get_the_post_thumbnail($post_id, array(60, 60));
                } else {
                    echo '<span class="dashicons dashicons-format-image" style="font-size: 40px; color: #ccc;"></span>';
                }
                break;
                
            case 'vehicle_make':
                $makes = get_the_terms($post_id, 'vehicle_make');
                if ($makes && !is_wp_error($makes)) {
                    $make_names = array_map(function($term) {
                        return $term->name;
                    }, $makes);
                    echo esc_html(implode(', ', $make_names));
                }
                break;
                
            case 'vehicle_model':
                $models = get_the_terms($post_id, 'vehicle_model');
                if ($models && !is_wp_error($models)) {
                    $model_names = array_map(function($term) {
                        return $term->name;
                    }, $models);
                    echo esc_html(implode(', ', $model_names));
                }
                break;
                
            case 'year':
                $year = get_post_meta($post_id, '_vim_year', true);
                echo $year ? esc_html($year) : '—';
                break;
                
            case 'price':
                $price = get_post_meta($post_id, '_vim_price', true);
                if ($price) {
                    $currency = get_option('vim_currency_symbol', '$');
                    echo esc_html($currency . number_format($price));
                } else {
                    echo '—';
                }
                break;
                
            case 'odometer':
                $odometer = get_post_meta($post_id, '_vim_odometer', true);
                if ($odometer) {
                    $unit = get_option('vim_distance_unit', 'km');
                    echo esc_html(number_format($odometer) . ' ' . $unit);
                } else {
                    echo '—';
                }
                break;
                
            case 'condition':
                $conditions = get_the_terms($post_id, 'vehicle_condition');
                if ($conditions && !is_wp_error($conditions)) {
                    $condition = reset($conditions);
                    echo '<span class="vim-condition-badge vim-condition-' . esc_attr($condition->slug) . '">' . esc_html($condition->name) . '</span>';
                }
                break;
                
            case 'stock_number':
                $stock = get_post_meta($post_id, '_vim_stock_number', true);
                echo $stock ? esc_html($stock) : '—';
                break;
        }
    }
    
    /**
     * Make columns sortable
     */
    public function sortable_columns($columns) {
        $columns['year'] = 'year';
        $columns['price'] = 'price';
        $columns['odometer'] = 'odometer';
        return $columns;
    }
}
