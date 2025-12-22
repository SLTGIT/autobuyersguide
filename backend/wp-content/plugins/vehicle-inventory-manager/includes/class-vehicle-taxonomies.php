<?php
/**
 * Vehicle Taxonomies
 *
 * @package Vehicle_Inventory_Manager
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Vehicle Taxonomies Class
 */
class VIM_Vehicle_Taxonomies {
    
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
    }
    
    /**
     * Register all vehicle taxonomies
     */
    public static function register() {
        self::register_make();
        self::register_model();
        self::register_body_type();
        self::register_fuel_type();
        self::register_transmission();
        self::register_drive_type();
        self::register_color();
        self::register_condition();
    }
    
    /**
     * Register vehicle make taxonomy
     */
    private static function register_make() {
        $labels = array(
            'name'              => _x('Makes', 'taxonomy general name', 'vehicle-inventory-manager'),
            'singular_name'     => _x('Make', 'taxonomy singular name', 'vehicle-inventory-manager'),
            'search_items'      => __('Search Makes', 'vehicle-inventory-manager'),
            'all_items'         => __('All Makes', 'vehicle-inventory-manager'),
            'parent_item'       => __('Parent Make', 'vehicle-inventory-manager'),
            'parent_item_colon' => __('Parent Make:', 'vehicle-inventory-manager'),
            'edit_item'         => __('Edit Make', 'vehicle-inventory-manager'),
            'update_item'       => __('Update Make', 'vehicle-inventory-manager'),
            'add_new_item'      => __('Add New Make', 'vehicle-inventory-manager'),
            'new_item_name'     => __('New Make Name', 'vehicle-inventory-manager'),
            'menu_name'         => __('Makes', 'vehicle-inventory-manager'),
        );
        
        $args = array(
            'hierarchical'      => true,
            'labels'            => $labels,
            'show_ui'           => true,
            'show_admin_column' => true,
            'query_var'         => true,
            'show_in_rest'      => true,
            'rewrite'           => array('slug' => 'make'),
            'meta_box_cb'       => array('VIM_Vehicle_Taxonomies', 'render_radio_meta_box'),
        );
        
        register_taxonomy('vehicle_make', array('vehicle'), $args);
    }
    
    /**
     * Register vehicle model taxonomy
     */
    private static function register_model() {
        $labels = array(
            'name'              => _x('Models', 'taxonomy general name', 'vehicle-inventory-manager'),
            'singular_name'     => _x('Model', 'taxonomy singular name', 'vehicle-inventory-manager'),
            'search_items'      => __('Search Models', 'vehicle-inventory-manager'),
            'all_items'         => __('All Models', 'vehicle-inventory-manager'),
            'parent_item'       => __('Parent Model', 'vehicle-inventory-manager'),
            'parent_item_colon' => __('Parent Model:', 'vehicle-inventory-manager'),
            'edit_item'         => __('Edit Model', 'vehicle-inventory-manager'),
            'update_item'       => __('Update Model', 'vehicle-inventory-manager'),
            'add_new_item'      => __('Add New Model', 'vehicle-inventory-manager'),
            'new_item_name'     => __('New Model Name', 'vehicle-inventory-manager'),
            'menu_name'         => __('Models', 'vehicle-inventory-manager'),
        );
        
        $args = array(
            'hierarchical'      => true,
            'labels'            => $labels,
            'show_ui'           => true,
            'show_admin_column' => true,
            'query_var'         => true,
            'show_in_rest'      => true,
            'rewrite'           => array('slug' => 'model'),
            'meta_box_cb'       => array('VIM_Vehicle_Taxonomies', 'render_radio_meta_box'),
        );
        
        register_taxonomy('vehicle_model', array('vehicle'), $args);
    }
    
    /**
     * Register body type taxonomy
     */
    private static function register_body_type() {
        $labels = array(
            'name'              => _x('Body Types', 'taxonomy general name', 'vehicle-inventory-manager'),
            'singular_name'     => _x('Body Type', 'taxonomy singular name', 'vehicle-inventory-manager'),
            'search_items'      => __('Search Body Types', 'vehicle-inventory-manager'),
            'all_items'         => __('All Body Types', 'vehicle-inventory-manager'),
            'edit_item'         => __('Edit Body Type', 'vehicle-inventory-manager'),
            'update_item'       => __('Update Body Type', 'vehicle-inventory-manager'),
            'add_new_item'      => __('Add New Body Type', 'vehicle-inventory-manager'),
            'new_item_name'     => __('New Body Type Name', 'vehicle-inventory-manager'),
            'menu_name'         => __('Body Types', 'vehicle-inventory-manager'),
        );
        
        $args = array(
            'hierarchical'      => false,
            'labels'            => $labels,
            'show_ui'           => true,
            'show_admin_column' => true,
            'query_var'         => true,
            'show_in_rest'      => true,
            'rewrite'           => array('slug' => 'body-type'),
            'meta_box_cb'       => array('VIM_Vehicle_Taxonomies', 'render_radio_meta_box'),
        );
        
        register_taxonomy('vehicle_body_type', array('vehicle'), $args);
    }
    
    /**
     * Register fuel type taxonomy
     */
    private static function register_fuel_type() {
        $labels = array(
            'name'              => _x('Fuel Types', 'taxonomy general name', 'vehicle-inventory-manager'),
            'singular_name'     => _x('Fuel Type', 'taxonomy singular name', 'vehicle-inventory-manager'),
            'search_items'      => __('Search Fuel Types', 'vehicle-inventory-manager'),
            'all_items'         => __('All Fuel Types', 'vehicle-inventory-manager'),
            'edit_item'         => __('Edit Fuel Type', 'vehicle-inventory-manager'),
            'update_item'       => __('Update Fuel Type', 'vehicle-inventory-manager'),
            'add_new_item'      => __('Add New Fuel Type', 'vehicle-inventory-manager'),
            'new_item_name'     => __('New Fuel Type Name', 'vehicle-inventory-manager'),
            'menu_name'         => __('Fuel Types', 'vehicle-inventory-manager'),
        );
        
        $args = array(
            'hierarchical'      => false,
            'labels'            => $labels,
            'show_ui'           => true,
            'show_admin_column' => true,
            'query_var'         => true,
            'show_in_rest'      => true,
            'rewrite'           => array('slug' => 'fuel-type'),
            'meta_box_cb'       => array('VIM_Vehicle_Taxonomies', 'render_radio_meta_box'),
        );
        
        register_taxonomy('vehicle_fuel_type', array('vehicle'), $args);
    }
    
    /**
     * Register transmission taxonomy
     */
    private static function register_transmission() {
        $labels = array(
            'name'              => _x('Transmissions', 'taxonomy general name', 'vehicle-inventory-manager'),
            'singular_name'     => _x('Transmission', 'taxonomy singular name', 'vehicle-inventory-manager'),
            'search_items'      => __('Search Transmissions', 'vehicle-inventory-manager'),
            'all_items'         => __('All Transmissions', 'vehicle-inventory-manager'),
            'edit_item'         => __('Edit Transmission', 'vehicle-inventory-manager'),
            'update_item'       => __('Update Transmission', 'vehicle-inventory-manager'),
            'add_new_item'      => __('Add New Transmission', 'vehicle-inventory-manager'),
            'new_item_name'     => __('New Transmission Name', 'vehicle-inventory-manager'),
            'menu_name'         => __('Transmissions', 'vehicle-inventory-manager'),
        );
        
        $args = array(
            'hierarchical'      => false,
            'labels'            => $labels,
            'show_ui'           => true,
            'show_admin_column' => true,
            'query_var'         => true,
            'show_in_rest'      => true,
            'rewrite'           => array('slug' => 'transmission'),
            'meta_box_cb'       => array('VIM_Vehicle_Taxonomies', 'render_radio_meta_box'),
        );
        
        register_taxonomy('vehicle_transmission', array('vehicle'), $args);
    }
    
    /**
     * Register drive type taxonomy
     */
    private static function register_drive_type() {
        $labels = array(
            'name'              => _x('Drive Types', 'taxonomy general name', 'vehicle-inventory-manager'),
            'singular_name'     => _x('Drive Type', 'taxonomy singular name', 'vehicle-inventory-manager'),
            'search_items'      => __('Search Drive Types', 'vehicle-inventory-manager'),
            'all_items'         => __('All Drive Types', 'vehicle-inventory-manager'),
            'edit_item'         => __('Edit Drive Type', 'vehicle-inventory-manager'),
            'update_item'       => __('Update Drive Type', 'vehicle-inventory-manager'),
            'add_new_item'      => __('Add New Drive Type', 'vehicle-inventory-manager'),
            'new_item_name'     => __('New Drive Type Name', 'vehicle-inventory-manager'),
            'menu_name'         => __('Drive Types', 'vehicle-inventory-manager'),
        );
        
        $args = array(
            'hierarchical'      => false,
            'labels'            => $labels,
            'show_ui'           => true,
            'show_admin_column' => true,
            'query_var'         => true,
            'show_in_rest'      => true,
            'rewrite'           => array('slug' => 'drive-type'),
            'meta_box_cb'       => array('VIM_Vehicle_Taxonomies', 'render_radio_meta_box'),
        );
        
        register_taxonomy('vehicle_drive_type', array('vehicle'), $args);
    }
    
    /**
     * Register color taxonomy
     */
    private static function register_color() {
        $labels = array(
            'name'              => _x('Colors', 'taxonomy general name', 'vehicle-inventory-manager'),
            'singular_name'     => _x('Color', 'taxonomy singular name', 'vehicle-inventory-manager'),
            'search_items'      => __('Search Colors', 'vehicle-inventory-manager'),
            'all_items'         => __('All Colors', 'vehicle-inventory-manager'),
            'edit_item'         => __('Edit Color', 'vehicle-inventory-manager'),
            'update_item'       => __('Update Color', 'vehicle-inventory-manager'),
            'add_new_item'      => __('Add New Color', 'vehicle-inventory-manager'),
            'new_item_name'     => __('New Color Name', 'vehicle-inventory-manager'),
            'menu_name'         => __('Colors', 'vehicle-inventory-manager'),
        );
        
        $args = array(
            'hierarchical'      => false,
            'labels'            => $labels,
            'show_ui'           => true,
            'show_admin_column' => false,
            'query_var'         => true,
            'show_in_rest'      => true,
            'rewrite'           => array('slug' => 'color'),
            'meta_box_cb'       => array('VIM_Vehicle_Taxonomies', 'render_radio_meta_box'),
            'show_admin_column' => true, // Update to true for consistency
        );
        
        register_taxonomy('vehicle_color', array('vehicle'), $args);
    }
    
    /**
     * Register condition taxonomy
     */
    private static function register_condition() {
        $labels = array(
            'name'              => _x('Conditions', 'taxonomy general name', 'vehicle-inventory-manager'),
            'singular_name'     => _x('Condition', 'taxonomy singular name', 'vehicle-inventory-manager'),
            'search_items'      => __('Search Conditions', 'vehicle-inventory-manager'),
            'all_items'         => __('All Conditions', 'vehicle-inventory-manager'),
            'edit_item'         => __('Edit Condition', 'vehicle-inventory-manager'),
            'update_item'       => __('Update Condition', 'vehicle-inventory-manager'),
            'add_new_item'      => __('Add New Condition', 'vehicle-inventory-manager'),
            'new_item_name'     => __('New Condition Name', 'vehicle-inventory-manager'),
            'menu_name'         => __('Conditions', 'vehicle-inventory-manager'),
        );
        
        $args = array(
            'hierarchical'      => false,
            'labels'            => $labels,
            'show_ui'           => true,
            'show_admin_column' => true,
            'query_var'         => true,
            'show_in_rest'      => true,
            'rewrite'           => array('slug' => 'condition'),
            'meta_box_cb'       => array('VIM_Vehicle_Taxonomies', 'render_radio_meta_box'),
        );
        
        register_taxonomy('vehicle_condition', array('vehicle'), $args);
    }

    /**
     * Render custom radio meta box for taxonomies
     * 
     * @param WP_Post $post Current post object.
     * @param array   $box  Meta box arguments.
     */
    public static function render_radio_meta_box($post, $box) {
        $taxonomy = $box['args']['taxonomy'];
        $terms = get_terms(array(
            'taxonomy'   => $taxonomy,
            'hide_empty' => false,
        ));
        
        $name = 'tax_input[' . $taxonomy . ']';
        $current_terms = wp_get_object_terms($post->ID, $taxonomy, array('fields' => 'ids'));
        $current = !empty($current_terms) ? $current_terms[0] : 0;
        
        ?>
        <div id="taxonomy-<?php echo esc_attr($taxonomy); ?>" class="categorydiv">
            <div class="tabs-panel" style="max-height: 200px; overflow: auto; padding: 0.5em 0.9em;">
                <ul id="<?php echo esc_attr($taxonomy); ?>-tabs" class="category-tabs">
                    <li class="tabs">
                        <label class="selectit">
                            <input type="radio" name="<?php echo esc_attr($name); ?>[]" value="0" <?php checked($current, 0); ?>>
                            <em><?php _e('None', 'vehicle-inventory-manager'); ?></em>
                        </label>
                    </li>
                    <?php foreach ($terms as $term) : 
                        $parent_id = '';
                        // Special handling for dependent logic: if this is a model, get its parent make
                        if ($taxonomy === 'vehicle_model') {
                            $parent_id = get_term_meta($term->term_id, '_vim_make_parent', true);
                        }
                        ?>
                        <li class="tabs" data-id="<?php echo esc_attr($term->term_id); ?>" data-parent-id="<?php echo esc_attr($parent_id); ?>">
                            <label class="selectit">
                                <input type="radio" name="<?php echo esc_attr($name); ?>[]" value="<?php echo esc_attr($term->term_id); ?>" <?php checked($current, $term->term_id); ?>>
                                <?php echo esc_html($term->name); ?>
                            </label>
                        </li>
                    <?php endforeach; ?>
                </ul>
            </div>
            
            <?php if (current_user_can($taxonomy . '_edit_terms')) : ?>
                <div class="vim-quick-add" style="margin-top: 10px; border-top: 1px solid #ddd; padding-top: 10px;">
                   <p style="font-style: italic; color: #666; font-size: 12px;">
                        <?php _e('Use the "Vehicles" > "Taxonomy Name" menu to add new terms.', 'vehicle-inventory-manager'); ?>
                   </p>
                </div>
            <?php endif; ?>
        </div>
        <?php
    }
}
