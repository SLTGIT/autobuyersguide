<?php
/**
 * Vehicle Importer
 *
 * @package Vehicle_Inventory_Manager
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Vehicle Importer Class
 */
class VIM_Vehicle_Importer {
    
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
        add_action('admin_menu', array($this, 'add_import_page'));
        add_action('admin_post_vim_import_csv', array($this, 'handle_csv_import'));
    }
    
    /**
     * Add import page to admin menu
     */
    public function add_import_page() {
        add_submenu_page(
            'edit.php?post_type=vehicle',
            __('Import Vehicles', 'vehicle-inventory-manager'),
            __('Import', 'vehicle-inventory-manager'),
            'manage_options',
            'vim-import',
            array($this, 'render_import_page')
        );
    }
    
    /**
     * Render import page
     */
    public function render_import_page() {
        ?>
        <div class="wrap">
            <h1><?php _e('Import Vehicles', 'vehicle-inventory-manager'); ?></h1>
            
            <div class="vim-import-container">
                <h2><?php _e('CSV Import', 'vehicle-inventory-manager'); ?></h2>
                <form method="post" action="<?php echo admin_url('admin-post.php'); ?>" enctype="multipart/form-data">
                    <?php wp_nonce_field('vim_csv_import', 'vim_csv_import_nonce'); ?>
                    <input type="hidden" name="action" value="vim_import_csv">
                    
                    <table class="form-table">
                        <tr>
                            <th><label for="csv_file"><?php _e('CSV File', 'vehicle-inventory-manager'); ?></label></th>
                            <td>
                                <input type="file" name="csv_file" id="csv_file" accept=".csv" required>
                                <p class="description">
                                    <?php _e('Upload a CSV file with vehicle data. Required columns: title, price, year', 'vehicle-inventory-manager'); ?>
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <th><label for="update_existing"><?php _e('Update Existing', 'vehicle-inventory-manager'); ?></label></th>
                            <td>
                                <input type="checkbox" name="update_existing" id="update_existing" value="1">
                                <label for="update_existing"><?php _e('Update existing vehicles (match by VIN or Stock Number)', 'vehicle-inventory-manager'); ?></label>
                            </td>
                        </tr>
                    </table>
                    
                    <?php submit_button(__('Import CSV', 'vehicle-inventory-manager')); ?>
                </form>
                
                <hr>
                
                <h3><?php _e('CSV Format Example', 'vehicle-inventory-manager'); ?></h3>
                <pre>title,price,year,odometer,vin,stock_number,make,model,body_type,fuel_type,transmission,condition
2020 Toyota Camry,25000,2020,50000,VIN123456,STK001,Toyota,Camry,Sedan,Petrol,Automatic,Used</pre>
            </div>
        </div>
        <?php
    }
    
    /**
     * Handle CSV import
     */
    public function handle_csv_import() {
        // Check nonce
        if (!isset($_POST['vim_csv_import_nonce']) || !wp_verify_nonce($_POST['vim_csv_import_nonce'], 'vim_csv_import')) {
            wp_die(__('Security check failed', 'vehicle-inventory-manager'));
        }
        
        // Check permissions
        if (!current_user_can('manage_options')) {
            wp_die(__('You do not have permission to import vehicles', 'vehicle-inventory-manager'));
        }
        
        // Check file upload
        if (!isset($_FILES['csv_file']) || $_FILES['csv_file']['error'] !== UPLOAD_ERR_OK) {
            wp_die(__('File upload failed', 'vehicle-inventory-manager'));
        }
        
        $file = $_FILES['csv_file']['tmp_name'];
        $update_existing = isset($_POST['update_existing']);
        
        // Parse CSV
        $imported = 0;
        $updated = 0;
        $errors = array();
        
        if (($handle = fopen($file, 'r')) !== false) {
            // Get headers
            $headers = fgetcsv($handle);
            
            // Process rows
            while (($row = fgetcsv($handle)) !== false) {
                $data = array_combine($headers, $row);
                
                try {
                    $result = $this->import_vehicle($data, $update_existing);
                    if ($result === 'updated') {
                        $updated++;
                    } else {
                        $imported++;
                    }
                } catch (Exception $e) {
                    $errors[] = $e->getMessage();
                }
            }
            
            fclose($handle);
        }
        
        // Redirect with results
        $redirect_url = add_query_arg(
            array(
                'page' => 'vim-import',
                'imported' => $imported,
                'updated' => $updated,
                'errors' => count($errors),
            ),
            admin_url('edit.php?post_type=vehicle')
        );
        
        wp_redirect($redirect_url);
        exit;
    }
    
    /**
     * Import single vehicle
     */
    private function import_vehicle($data, $update_existing = false) {
        // Check for existing vehicle
        $existing_id = null;
        
        if ($update_existing) {
            if (!empty($data['vin'])) {
                $existing = get_posts(array(
                    'post_type' => 'vehicle',
                    'meta_key' => '_vim_vin',
                    'meta_value' => $data['vin'],
                    'posts_per_page' => 1,
                ));
                if ($existing) {
                    $existing_id = $existing[0]->ID;
                }
            } elseif (!empty($data['stock_number'])) {
                $existing = get_posts(array(
                    'post_type' => 'vehicle',
                    'meta_key' => '_vim_stock_number',
                    'meta_value' => $data['stock_number'],
                    'posts_per_page' => 1,
                ));
                if ($existing) {
                    $existing_id = $existing[0]->ID;
                }
            }
        }
        
        // Prepare post data
        $post_data = array(
            'post_type' => 'vehicle',
            'post_title' => sanitize_text_field($data['title']),
            'post_content' => isset($data['description']) ? wp_kses_post($data['description']) : '',
            'post_status' => 'publish',
        );
        
        if ($existing_id) {
            $post_data['ID'] = $existing_id;
            $post_id = wp_update_post($post_data);
            $action = 'updated';
        } else {
            $post_id = wp_insert_post($post_data);
            $action = 'imported';
        }
        
        if (is_wp_error($post_id)) {
            throw new Exception($post_id->get_error_message());
        }
        
        // Save meta fields
        $meta_fields = array('price', 'year', 'odometer', 'vin', 'stock_number', 'engine_size', 
                            'cylinders', 'doors', 'seats', 'registration', 'price_type', 
                            'status_badge', 'dealership', 'location', 'features');
        
        foreach ($meta_fields as $field) {
            if (isset($data[$field]) && $data[$field] !== '') {
                update_post_meta($post_id, '_vim_' . $field, sanitize_text_field($data[$field]));
            }
        }
        
        // Set taxonomies
        $taxonomies = array('make', 'model', 'body_type', 'fuel_type', 'transmission', 'drive_type', 'color', 'condition');
        
        foreach ($taxonomies as $taxonomy) {
            if (isset($data[$taxonomy]) && $data[$taxonomy] !== '') {
                $term = term_exists($data[$taxonomy], 'vehicle_' . $taxonomy);
                if (!$term) {
                    $term = wp_insert_term($data[$taxonomy], 'vehicle_' . $taxonomy);
                }
                if (!is_wp_error($term)) {
                    wp_set_object_terms($post_id, (int) $term['term_id'], 'vehicle_' . $taxonomy);
                }
            }
        }
        
        return $action;
    }
}
