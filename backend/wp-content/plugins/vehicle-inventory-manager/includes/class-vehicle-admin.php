<?php
/**
 * Vehicle Admin Interface
 *
 * @package Vehicle_Inventory_Manager
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Vehicle Admin Class
 */
class VIM_Vehicle_Admin {
    
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
        add_action('add_meta_boxes', array($this, 'add_meta_boxes'));
        add_action('save_post_vehicle', array($this, 'save_meta_boxes'), 10, 2);
    }
    
    /**
     * Add meta boxes
     */
    public function add_meta_boxes() {
        add_meta_box(
            'vim_vehicle_details',
            __('Vehicle Details', 'vehicle-inventory-manager'),
            array($this, 'render_vehicle_details_meta_box'),
            'vehicle',
            'normal',
            'high'
        );
        
        add_meta_box(
            'vim_vehicle_pricing',
            __('Pricing Information', 'vehicle-inventory-manager'),
            array($this, 'render_pricing_meta_box'),
            'vehicle',
            'side',
            'default'
        );
        
        add_meta_box(
            'vim_vehicle_gallery',
            __('Vehicle Gallery', 'vehicle-inventory-manager'),
            array($this, 'render_gallery_meta_box'),
            'vehicle',
            'normal',
            'default'
        );
    }
    
    /**
     * Render vehicle details meta box
     */
    public function render_vehicle_details_meta_box($post) {
        wp_nonce_field('vim_save_vehicle_meta', 'vim_vehicle_meta_nonce');
        
        $year = get_post_meta($post->ID, '_vim_year', true);
        $odometer = get_post_meta($post->ID, '_vim_odometer', true);
        $vin = get_post_meta($post->ID, '_vim_vin', true);
        $stock_number = get_post_meta($post->ID, '_vim_stock_number', true);
        $engine_size = get_post_meta($post->ID, '_vim_engine_size', true);
        $cylinders = get_post_meta($post->ID, '_vim_cylinders', true);
        $doors = get_post_meta($post->ID, '_vim_doors', true);
        $seats = get_post_meta($post->ID, '_vim_seats', true);
        $registration = get_post_meta($post->ID, '_vim_registration', true);
        $status_badge = get_post_meta($post->ID, '_vim_status_badge', true);
        $dealership = get_post_meta($post->ID, '_vim_dealership', true);
        $location = get_post_meta($post->ID, '_vim_location', true);
        $features = get_post_meta($post->ID, '_vim_features', true);
        ?>
        <div class="vim-meta-box">
            <table class="form-table">
                <tr>
                    <th><label for="vim_year"><?php _e('Year', 'vehicle-inventory-manager'); ?></label></th>
                    <td><input type="number" id="vim_year" name="vim_year" value="<?php echo esc_attr($year); ?>" class="regular-text" min="1900" max="<?php echo date('Y') + 1; ?>"></td>
                </tr>
                <tr>
                    <th><label for="vim_odometer"><?php _e('Odometer (km)', 'vehicle-inventory-manager'); ?></label></th>
                    <td><input type="number" id="vim_odometer" name="vim_odometer" value="<?php echo esc_attr($odometer); ?>" class="regular-text" min="0"></td>
                </tr>
                <tr>
                    <th><label for="vim_vin"><?php _e('VIN', 'vehicle-inventory-manager'); ?></label></th>
                    <td><input type="text" id="vim_vin" name="vim_vin" value="<?php echo esc_attr($vin); ?>" class="regular-text"></td>
                </tr>
                <tr>
                    <th><label for="vim_stock_number"><?php _e('Stock Number', 'vehicle-inventory-manager'); ?></label></th>
                    <td><input type="text" id="vim_stock_number" name="vim_stock_number" value="<?php echo esc_attr($stock_number); ?>" class="regular-text"></td>
                </tr>
                <tr>
                    <th><label for="vim_engine_size"><?php _e('Engine Size', 'vehicle-inventory-manager'); ?></label></th>
                    <td><input type="text" id="vim_engine_size" name="vim_engine_size" value="<?php echo esc_attr($engine_size); ?>" class="regular-text" placeholder="e.g., 2.0L"></td>
                </tr>
                <tr>
                    <th><label for="vim_cylinders"><?php _e('Cylinders', 'vehicle-inventory-manager'); ?></label></th>
                    <td><input type="number" id="vim_cylinders" name="vim_cylinders" value="<?php echo esc_attr($cylinders); ?>" class="small-text" min="1" max="16"></td>
                </tr>
                <tr>
                    <th><label for="vim_doors"><?php _e('Doors', 'vehicle-inventory-manager'); ?></label></th>
                    <td><input type="number" id="vim_doors" name="vim_doors" value="<?php echo esc_attr($doors); ?>" class="small-text" min="2" max="6"></td>
                </tr>
                <tr>
                    <th><label for="vim_seats"><?php _e('Seats', 'vehicle-inventory-manager'); ?></label></th>
                    <td><input type="number" id="vim_seats" name="vim_seats" value="<?php echo esc_attr($seats); ?>" class="small-text" min="1" max="20"></td>
                </tr>
                <tr>
                    <th><label for="vim_registration"><?php _e('Registration', 'vehicle-inventory-manager'); ?></label></th>
                    <td><input type="text" id="vim_registration" name="vim_registration" value="<?php echo esc_attr($registration); ?>" class="regular-text"></td>
                </tr>
                <tr>
                    <th><label for="vim_status_badge"><?php _e('Status Badge', 'vehicle-inventory-manager'); ?></label></th>
                    <td>
                        <select id="vim_status_badge" name="vim_status_badge" class="regular-text">
                            <option value=""><?php _e('None', 'vehicle-inventory-manager'); ?></option>
                            <option value="just_sold" <?php selected($status_badge, 'just_sold'); ?>><?php _e('Just Sold', 'vehicle-inventory-manager'); ?></option>
                            <option value="managers_special" <?php selected($status_badge, 'managers_special'); ?>><?php _e("Manager's Special", 'vehicle-inventory-manager'); ?></option>
                            <option value="exclusively_listed" <?php selected($status_badge, 'exclusively_listed'); ?>><?php _e('Exclusively Listed', 'vehicle-inventory-manager'); ?></option>
                            <option value="new_arrival" <?php selected($status_badge, 'new_arrival'); ?>><?php _e('New Arrival', 'vehicle-inventory-manager'); ?></option>
                        </select>
                    </td>
                </tr>
                <tr>
                    <th><label for="vim_dealership"><?php _e('Dealership', 'vehicle-inventory-manager'); ?></label></th>
                    <td><input type="text" id="vim_dealership" name="vim_dealership" value="<?php echo esc_attr($dealership); ?>" class="regular-text"></td>
                </tr>
                <tr>
                    <th><label for="vim_location"><?php _e('Location', 'vehicle-inventory-manager'); ?></label></th>
                    <td><input type="text" id="vim_location" name="vim_location" value="<?php echo esc_attr($location); ?>" class="regular-text" placeholder="e.g., NSW, VIC"></td>
                </tr>
                <tr>
                    <th><label for="vim_features"><?php _e('Features', 'vehicle-inventory-manager'); ?></label></th>
                    <td>
                        <textarea id="vim_features" name="vim_features" rows="5" class="large-text"><?php echo esc_textarea($features); ?></textarea>
                        <p class="description"><?php _e('Enter one feature per line', 'vehicle-inventory-manager'); ?></p>
                    </td>
                </tr>
            </table>
        </div>
        <?php
    }
    
    /**
     * Render pricing meta box
     */
    public function render_pricing_meta_box($post) {
        $price = get_post_meta($post->ID, '_vim_price', true);
        $price_type = get_post_meta($post->ID, '_vim_price_type', true);
        ?>
        <div class="vim-meta-box">
            <p>
                <label for="vim_price"><strong><?php _e('Price', 'vehicle-inventory-manager'); ?></strong></label><br>
                <input type="number" id="vim_price" name="vim_price" value="<?php echo esc_attr($price); ?>" class="widefat" min="0" step="1">
            </p>
            <p>
                <label for="vim_price_type"><strong><?php _e('Price Type', 'vehicle-inventory-manager'); ?></strong></label><br>
                <select id="vim_price_type" name="vim_price_type" class="widefat">
                    <option value="drive_away" <?php selected($price_type, 'drive_away'); ?>><?php _e('Drive Away', 'vehicle-inventory-manager'); ?></option>
                    <option value="excl_govt_charges" <?php selected($price_type, 'excl_govt_charges'); ?>><?php _e('Excl. Govt. Charges', 'vehicle-inventory-manager'); ?></option>
                    <option value="negotiable" <?php selected($price_type, 'negotiable'); ?>><?php _e('Negotiable', 'vehicle-inventory-manager'); ?></option>
                </select>
            </p>
        </div>
        <?php
    }
    
    /**
     * Render gallery meta box
     */
    public function render_gallery_meta_box($post) {
        $gallery_images = get_post_meta($post->ID, '_vim_gallery_images', true);
        if (!is_array($gallery_images)) {
            $gallery_images = array();
        }
        ?>
        <div class="vim-gallery-meta-box">
            <div id="vim-gallery-container" class="vim-gallery-container">
                <?php foreach ($gallery_images as $image_id) : ?>
                    <div class="vim-gallery-item" data-id="<?php echo esc_attr($image_id); ?>">
                        <?php echo wp_get_attachment_image($image_id, 'thumbnail'); ?>
                        <button type="button" class="vim-remove-image button">&times;</button>
                    </div>
                <?php endforeach; ?>
            </div>
            <p>
                <button type="button" id="vim-add-gallery-images" class="button button-secondary">
                    <?php _e('Add Images', 'vehicle-inventory-manager'); ?>
                </button>
            </p>
            <input type="hidden" id="vim_gallery_images" name="vim_gallery_images" value="<?php echo esc_attr(implode(',', $gallery_images)); ?>">
        </div>
        <?php
    }
    
    /**
     * Save meta boxes
     */
    public function save_meta_boxes($post_id, $post) {
        // Check nonce
        if (!isset($_POST['vim_vehicle_meta_nonce']) || !wp_verify_nonce($_POST['vim_vehicle_meta_nonce'], 'vim_save_vehicle_meta')) {
            return;
        }
        
        // Check autosave
        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
            return;
        }
        
        // Check permissions
        if (!current_user_can('edit_post', $post_id)) {
            return;
        }
        
        // Save meta fields
        $fields = array(
            'vim_price', 'vim_year', 'vim_odometer', 'vim_vin', 'vim_stock_number',
            'vim_engine_size', 'vim_cylinders', 'vim_doors', 'vim_seats',
            'vim_registration', 'vim_price_type', 'vim_status_badge',
            'vim_dealership', 'vim_location', 'vim_features'
        );
        
        foreach ($fields as $field) {
            if (isset($_POST[$field])) {
                $value = $_POST[$field];
                
                // Sanitize based on field type
                if (in_array($field, array('vim_price', 'vim_year', 'vim_odometer', 'vim_cylinders', 'vim_doors', 'vim_seats'))) {
                    $value = absint($value);
                } elseif ($field === 'vim_features') {
                    $value = sanitize_textarea_field($value);
                } else {
                    $value = sanitize_text_field($value);
                }
                
                update_post_meta($post_id, '_' . $field, $value);
            }
        }
        
        // Save gallery images
        if (isset($_POST['vim_gallery_images'])) {
            $gallery_images = array_filter(array_map('absint', explode(',', $_POST['vim_gallery_images'])));
            update_post_meta($post_id, '_vim_gallery_images', $gallery_images);
        }
    }
}
