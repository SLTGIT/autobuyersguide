<?php
/**
 * Vehicle Feed Manager
 *
 * @package Vehicle_Inventory_Manager
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Vehicle Feed Manager Class
 */
class VIM_Vehicle_Feed_Manager {
    
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
        add_action('admin_menu', array($this, 'add_settings_page'));
        add_action('admin_init', array($this, 'register_settings'));
        add_action('admin_post_vim_sync_feed', array($this, 'handle_manual_sync'));
        add_action('vim_feed_sync_cron', array($this, 'sync_feed'));
        
        // Schedule cron if not already scheduled
        if (!wp_next_scheduled('vim_feed_sync_cron')) {
            wp_schedule_event(time(), 'hourly', 'vim_feed_sync_cron');
        }
    }
    
    /**
     * Add settings page
     */
    public function add_settings_page() {
        add_submenu_page(
            'edit.php?post_type=vehicle',
            __('Feed Settings', 'vehicle-inventory-manager'),
            __('Feed Settings', 'vehicle-inventory-manager'),
            'manage_options',
            'vim-feed-settings',
            array($this, 'render_settings_page')
        );
        
        add_submenu_page(
            'edit.php?post_type=vehicle',
            __('Feed Logs', 'vehicle-inventory-manager'),
            __('Feed Logs', 'vehicle-inventory-manager'),
            'manage_options',
            'vim-feed-logs',
            array($this, 'render_logs_page')
        );
    }
    
    /**
     * Register settings
     */
    public function register_settings() {
        register_setting('vim_feed_settings', 'vim_feed_url');
        register_setting('vim_feed_settings', 'vim_feed_type');
        register_setting('vim_feed_settings', 'vim_feed_auto_sync');
        register_setting('vim_feed_settings', 'vim_feed_sync_interval');
        register_setting('vim_feed_settings', 'vim_feed_download_images');
    }
    
    /**
     * Render settings page
     */
    public function render_settings_page() {
        $feed_url = get_option('vim_feed_url', '');
        $feed_type = get_option('vim_feed_type', 'csv');
        $auto_sync = get_option('vim_feed_auto_sync', '0');
        $sync_interval = get_option('vim_feed_sync_interval', 'hourly');
        $download_images = get_option('vim_feed_download_images', '1');
        $last_sync = get_option('vim_last_feed_sync', '');
        ?>
        <div class="wrap">
            <h1><?php _e('Vehicle Feed Settings', 'vehicle-inventory-manager'); ?></h1>
            
            <?php if ($last_sync): ?>
                <div class="notice notice-info">
                    <p>
                        <strong><?php _e('Last Sync:', 'vehicle-inventory-manager'); ?></strong>
                        <?php echo esc_html(date('Y-m-d H:i:s', $last_sync)); ?>
                    </p>
                </div>
            <?php endif; ?>
            
            <form method="post" action="options.php">
                <?php settings_fields('vim_feed_settings'); ?>
                
                <table class="form-table">
                    <tr>
                        <th><label for="vim_feed_url"><?php _e('Feed URL', 'vehicle-inventory-manager'); ?></label></th>
                        <td>
                            <input type="url" id="vim_feed_url" name="vim_feed_url" value="<?php echo esc_attr($feed_url); ?>" class="large-text">
                            <p class="description">
                                <?php _e('Enter the URL to your vehicle feed (CSV or XML)', 'vehicle-inventory-manager'); ?>
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <th><label for="vim_feed_type"><?php _e('Feed Type', 'vehicle-inventory-manager'); ?></label></th>
                        <td>
                            <select id="vim_feed_type" name="vim_feed_type">
                                <option value="csv" <?php selected($feed_type, 'csv'); ?>>CSV</option>
                                <option value="xml" <?php selected($feed_type, 'xml'); ?>>XML</option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <th><label for="vim_feed_auto_sync"><?php _e('Auto Sync', 'vehicle-inventory-manager'); ?></label></th>
                        <td>
                            <input type="checkbox" id="vim_feed_auto_sync" name="vim_feed_auto_sync" value="1" <?php checked($auto_sync, '1'); ?>>
                            <label for="vim_feed_auto_sync"><?php _e('Automatically sync feed on schedule', 'vehicle-inventory-manager'); ?></label>
                        </td>
                    </tr>
                    <tr>
                        <th><label for="vim_feed_sync_interval"><?php _e('Sync Interval', 'vehicle-inventory-manager'); ?></label></th>
                        <td>
                            <select id="vim_feed_sync_interval" name="vim_feed_sync_interval">
                                <option value="hourly" <?php selected($sync_interval, 'hourly'); ?>><?php _e('Hourly', 'vehicle-inventory-manager'); ?></option>
                                <option value="twicedaily" <?php selected($sync_interval, 'twicedaily'); ?>><?php _e('Twice Daily', 'vehicle-inventory-manager'); ?></option>
                                <option value="daily" <?php selected($sync_interval, 'daily'); ?>><?php _e('Daily', 'vehicle-inventory-manager'); ?></option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <th><label for="vim_feed_download_images"><?php _e('Download Images', 'vehicle-inventory-manager'); ?></label></th>
                        <td>
                            <input type="checkbox" id="vim_feed_download_images" name="vim_feed_download_images" value="1" <?php checked($download_images, '1'); ?>>
                            <label for="vim_feed_download_images"><?php _e('Download and import vehicle images from feed', 'vehicle-inventory-manager'); ?></label>
                        </td>
                    </tr>
                </table>
                
                <?php submit_button(); ?>
            </form>
            
            <hr>
            
            <h2><?php _e('Manual Sync', 'vehicle-inventory-manager'); ?></h2>
            <form method="post" action="<?php echo admin_url('admin-post.php'); ?>">
                <?php wp_nonce_field('vim_sync_feed', 'vim_sync_feed_nonce'); ?>
                <input type="hidden" name="action" value="vim_sync_feed">
                <p>
                    <button type="submit" class="button button-primary button-large">
                        <?php _e('Sync Feed Now', 'vehicle-inventory-manager'); ?>
                    </button>
                </p>
            </form>
            
            <hr>
            
            <h2><?php _e('CSV Field Mapping', 'vehicle-inventory-manager'); ?></h2>
            <p><?php _e('The following CSV fields are supported:', 'vehicle-inventory-manager'); ?></p>
            <table class="widefat">
                <thead>
                    <tr>
                        <th><?php _e('CSV Field', 'vehicle-inventory-manager'); ?></th>
                        <th><?php _e('Maps To', 'vehicle-inventory-manager'); ?></th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td>StockNo</td><td>Stock Number</td></tr>
                    <tr><td>ManuYear</td><td>Year</td></tr>
                    <tr><td>Make</td><td>Make (Taxonomy)</td></tr>
                    <tr><td>Model</td><td>Model (Taxonomy)</td></tr>
                    <tr><td>Series</td><td>Series/Variant</td></tr>
                    <tr><td>Badge</td><td>Badge</td></tr>
                    <tr><td>Body</td><td>Body Type (Taxonomy)</td></tr>
                    <tr><td>Doors</td><td>Doors</td></tr>
                    <tr><td>Seats</td><td>Seats</td></tr>
                    <tr><td>BodyColour</td><td>Color (Taxonomy)</td></tr>
                    <tr><td>Gearbox</td><td>Transmission (Taxonomy)</td></tr>
                    <tr><td>FuelType</td><td>Fuel Type (Taxonomy)</td></tr>
                    <tr><td>Retail</td><td>Price</td></tr>
                    <tr><td>Rego</td><td>Registration</td></tr>
                    <tr><td>Odometer</td><td>Odometer</td></tr>
                    <tr><td>Cylinders</td><td>Cylinders</td></tr>
                    <tr><td>EngineCapacity</td><td>Engine Size</td></tr>
                    <tr><td>VINNumber</td><td>VIN</td></tr>
                    <tr><td>Options</td><td>Features</td></tr>
                    <tr><td>Comments / Description</td><td>Description</td></tr>
                    <tr><td>Condition</td><td>Condition (Taxonomy)</td></tr>
                    <tr><td>DriveType</td><td>Drive Type (Taxonomy)</td></tr>
                    <tr><td>ImageList</td><td>Gallery Images (comma-separated URLs)</td></tr>
                </tbody>
            </table>
        </div>
        <?php
    }
    
    /**
     * Render logs page
     */
    public function render_logs_page() {
        $logs = get_option('vim_feed_logs', array());
        $logs = array_reverse($logs); // Show newest first
        ?>
        <div class="wrap">
            <h1><?php _e('Feed Sync Logs', 'vehicle-inventory-manager'); ?></h1>
            
            <?php if (empty($logs)): ?>
                <p><?php _e('No sync logs available.', 'vehicle-inventory-manager'); ?></p>
            <?php else: ?>
                <table class="widefat">
                    <thead>
                        <tr>
                            <th><?php _e('Date/Time', 'vehicle-inventory-manager'); ?></th>
                            <th><?php _e('Status', 'vehicle-inventory-manager'); ?></th>
                            <th><?php _e('Imported', 'vehicle-inventory-manager'); ?></th>
                            <th><?php _e('Updated', 'vehicle-inventory-manager'); ?></th>
                            <th><?php _e('Errors', 'vehicle-inventory-manager'); ?></th>
                            <th><?php _e('Message', 'vehicle-inventory-manager'); ?></th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($logs as $log): ?>
                            <tr>
                                <td><?php echo esc_html(date('Y-m-d H:i:s', $log['timestamp'])); ?></td>
                                <td>
                                    <span class="vim-log-status vim-log-<?php echo esc_attr($log['status']); ?>">
                                        <?php echo esc_html(ucfirst($log['status'])); ?>
                                    </span>
                                </td>
                                <td><?php echo esc_html($log['imported']); ?></td>
                                <td><?php echo esc_html($log['updated']); ?></td>
                                <td><?php echo esc_html($log['errors']); ?></td>
                                <td><?php echo esc_html($log['message']); ?></td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            <?php endif; ?>
        </div>
        <?php
    }
    
    /**
     * Handle manual sync
     */
    public function handle_manual_sync() {
        if (!isset($_POST['vim_sync_feed_nonce']) || !wp_verify_nonce($_POST['vim_sync_feed_nonce'], 'vim_sync_feed')) {
            wp_die(__('Security check failed', 'vehicle-inventory-manager'));
        }
        
        if (!current_user_can('manage_options')) {
            wp_die(__('You do not have permission to sync feeds', 'vehicle-inventory-manager'));
        }
        
        $result = $this->sync_feed();
        
        $redirect_url = add_query_arg(
            array(
                'page' => 'vim-feed-settings',
                'synced' => $result ? '1' : '0',
            ),
            admin_url('edit.php?post_type=vehicle')
        );
        
        wp_redirect($redirect_url);
        exit;
    }
    
    /**
     * Sync feed
     */
    public function sync_feed() {
        $feed_url = get_option('vim_feed_url', '');
        $feed_type = get_option('vim_feed_type', 'csv');
        $download_images = get_option('vim_feed_download_images', '1');
        
        if (empty($feed_url)) {
            $this->log_sync('error', 0, 0, 0, 'No feed URL configured');
            return false;
        }

        // Increase time limit for large feeds
        set_time_limit(1800); // 30 minutes
        
        $start_time = microtime(true);
        $processed_vins = array(); // Array to track processed VINs for pruning
        
        try {
            // Download feed
            $response = wp_remote_get($feed_url, array('timeout' => 120));
            
            if (is_wp_error($response)) {
                throw new Exception($response->get_error_message());
            }
            
            $body = wp_remote_retrieve_body($response);
            
            if (empty($body)) {
                throw new Exception('Empty feed response');
            }
            
            // Parse feed based on type
            if ($feed_type === 'csv') {
                $result = $this->parse_csv_feed($body, $download_images, $processed_vins);
            } elseif ($feed_type === 'xml') {
                $result = $this->parse_xml_feed($body, $download_images, $processed_vins);
            } else {
                $result = $this->parse_json_feed($body, $download_images, $processed_vins);
            }

            // Prune sold/removed vehicles
            $pruned = $this->prune_vehicles($processed_vins);
            
            $duration = round(microtime(true) - $start_time, 2);
            $message = sprintf('Sync completed in %s seconds. Pruned: %d', $duration, $pruned);
            
            $this->log_sync(
                'success',
                $result['imported'],
                $result['updated'],
                count($result['errors']),
                $message
            );
            
            update_option('vim_last_feed_sync', time());
            
            return true;
            
        } catch (Exception $e) {
            $this->log_sync('error', 0, 0, 0, $e->getMessage());
            return false;
        }
    }

    /**
     * Parse CSV feed
     */
    private function parse_csv_feed($csv_content, $download_images, &$processed_vins) {
        $imported = 0;
        $updated = 0;
        $errors = array();
        
        $lines = explode("\n", $csv_content);
        $headers = str_getcsv(array_shift($lines));
        
        foreach ($lines as $line) {
            if (empty(trim($line))) {
                continue;
            }
            
            $data = str_getcsv($line);
            if (count($data) !== count($headers)) {
                continue; // Skip malformed lines
            }
            $vehicle_data = array_combine($headers, $data);
            
            try {
                // Determine unique ID (VIN)
                $vin = isset($vehicle_data['VINNumber']) ? trim($vehicle_data['VINNumber']) : '';
                if (empty($vin) && isset($vehicle_data['StockNo'])) {
                    // Fallback to stock number if VIN missing
                     $vin = 'STOCK-' . trim($vehicle_data['StockNo']);
                }

                if (!empty($vin)) {
                    $processed_vins[] = $vin;
                    $result = $this->import_vehicle_from_feed($vehicle_data, $download_images);
                    if ($result === 'imported') {
                        $imported++;
                    } elseif ($result === 'updated') {
                        $updated++;
                    }
                }
            } catch (Exception $e) {
                $errors[] = $e->getMessage();
            }

            // Memory cleanup
            if (($imported + $updated) % 50 === 0) {
                $this->cleanup_memory();
            }
        }
        
        return array('imported' => $imported, 'updated' => $updated, 'errors' => $errors);
    }
    
    /**
     * Parse XML feed
     */
    private function parse_xml_feed($xml_content, $download_images, &$processed_vins) {
        $imported = 0;
        $updated = 0;
        $errors = array();
        
        $xml = simplexml_load_string($xml_content);
        if ($xml === false) {
            throw new Exception('Invalid XML feed');
        }
        
        // Handle different XML structures - try to find vehicle nodes
        $vehicles = $xml->vehicle ?: $xml->Vehicle ?: $xml->item ?: [];

        foreach ($vehicles as $vehicle) {
            $vehicle_data = array();
            foreach ($vehicle as $key => $value) {
                $vehicle_data[$key] = (string) $value;
            }
            
            try {
                $vin = isset($vehicle_data['VINNumber']) ? trim($vehicle_data['VINNumber']) : (isset($vehicle_data['vin']) ? trim($vehicle_data['vin']) : '');
                
                 if (empty($vin) && isset($vehicle_data['StockNo'])) {
                     $vin = 'STOCK-' . trim($vehicle_data['StockNo']);
                }

                if (!empty($vin)) {
                    $processed_vins[] = $vin;
                    $result = $this->import_vehicle_from_feed($vehicle_data, $download_images);
                    if ($result === 'imported') {
                        $imported++;
                    } elseif ($result === 'updated') {
                        $updated++;
                    }
                }
            } catch (Exception $e) {
                $errors[] = $e->getMessage();
            }
            
             // Memory cleanup
            if (($imported + $updated) % 50 === 0) {
                $this->cleanup_memory();
            }
        }
        
        return array('imported' => $imported, 'updated' => $updated, 'errors' => $errors);
    }

    /**
     * Parse JSON feed (NEW)
     */
    private function parse_json_feed($json_content, $download_images, &$processed_vins) {
        $imported = 0;
        $updated = 0;
        $errors = array();

        $data = json_decode($json_content, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('Invalid JSON feed');
        }

        // Handle if root is object with 'vehicles' key or direct array
        $vehicles = isset($data['vehicles']) ? $data['vehicles'] : (isset($data['Vehicles']) ? $data['Vehicles'] : $data);

        if (!is_array($vehicles)) {
             throw new Exception('JSON feed format not recognized');
        }

        foreach ($vehicles as $vehicle_data) {
             try {
                $vin = isset($vehicle_data['VINNumber']) ? trim($vehicle_data['VINNumber']) : (isset($vehicle_data['vin']) ? trim($vehicle_data['vin']) : '');
                
                 if (empty($vin) && isset($vehicle_data['StockNo'])) {
                     $vin = 'STOCK-' . trim($vehicle_data['StockNo']);
                }

                if (!empty($vin)) {
                    $processed_vins[] = $vin;
                    $result = $this->import_vehicle_from_feed($vehicle_data, $download_images);
                    if ($result === 'imported') {
                        $imported++;
                    } elseif ($result === 'updated') {
                        $updated++;
                    }
                }
            } catch (Exception $e) {
                $errors[] = $e->getMessage();
            }
            
             // Memory cleanup
            if (($imported + $updated) % 50 === 0) {
                $this->cleanup_memory();
            }
        }

        return array('imported' => $imported, 'updated' => $updated, 'errors' => $errors);
    }
    
    /**
     * Prune inactive vehicles
     */
    private function prune_vehicles($active_vins) {
        if (empty($active_vins)) {
            return 0;
        }

        // Get all published vehicles
        $args = array(
            'post_type' => 'vehicle',
            'post_status' => 'publish',
            'posts_per_page' => -1,
            'fields' => 'ids',
            'meta_query' => array(
                array(
                    'key' => '_vim_vin',
                    'compare' => 'EXISTS',
                )
            )
        );
        $all_vehicles = get_posts($args);
        $pruned_count = 0;

        foreach ($all_vehicles as $post_id) {
            $vin = get_post_meta($post_id, '_vim_vin', true);
            // Also check stock number fallback format if used
             if (empty($vin)) {
                 $stock = get_post_meta($post_id, '_vim_stock_number', true);
                 if ($stock) $vin = 'STOCK-' . $stock;
             }

            if (!in_array($vin, $active_vins)) {
                // Vehicle not in feed -> Mark as Sold/Private
                $updates = array(
                    'ID' => $post_id,
                    'post_status' => 'private' // Or 'draft' or custom 'sold' status
                );
                wp_update_post($updates);
                update_post_meta($post_id, '_vim_status_badge', 'sold');
                wp_set_object_terms($post_id, 'sold', 'vehicle_condition', true); // Append 'sold' condition
                $pruned_count++;
            }
        }
        
        return $pruned_count;
    }

    /**
     * Import vehicle from feed data
     */
    private function import_vehicle_from_feed($data, $download_images) {
        $field_map = $this->get_field_map();
        
        $vin = isset($data['VINNumber']) ? $data['VINNumber'] : (isset($data['vin']) ? $data['vin'] : '');
        $stock_no = isset($data['StockNo']) ? $data['StockNo'] : (isset($data['stock_number']) ? $data['stock_number'] : '');
        
        // Find existing vehicle
        $existing_id = null;
        if (!empty($vin)) {
             $existing_id = $this->get_post_id_by_meta('_vim_vin', $vin);
        }
        if (!$existing_id && !empty($stock_no)) {
             $existing_id = $this->get_post_id_by_meta('_vim_stock_number', $stock_no);
        }
        
        // Prepare post data
        $make = isset($data['Make']) ? $data['Make'] : '';
        $model = isset($data['Model']) ? $data['Model'] : '';
        $year = isset($data['ManuYear']) ? $data['ManuYear'] : '';
        
        $title_parts = array_filter([$year, $make, $model, isset($data['Badge']) ? $data['Badge'] : '']);
        $title = implode(' ', $title_parts);
        if (empty($title)) $title = "Vehicle " . ($stock_no ?: $vin);

        $description = isset($data['Description']) ? $data['Description'] : (isset($data['Comments']) ? $data['Comments'] : '');
        
        $post_data = array(
            'post_type' => 'vehicle',
            'post_title' => sanitize_text_field($title),
            'post_content' => wp_kses_post($description),
            'post_status' => 'publish',
        );

        // Optimization: Check if update needed
        if ($existing_id) {
            $post_data['ID'] = $existing_id;
            // Only update if critical fields changed (simplified check)
            // Ideally compare hash of data, for now we update every time to ensure consistency
             wp_update_post($post_data);
             $post_id = $existing_id;
             $action = 'updated';
        } else {
             $post_id = wp_insert_post($post_data);
             $action = 'imported';
        }
        
        if (is_wp_error($post_id)) {
            throw new Exception($post_id->get_error_message());
        }
        
        // Save Meta Fields
        foreach ($field_map as $feed_field => $meta_field) {
            // Support both Exact Case (CSV) and lowercase (JSON/XML variant) keys
            $value = isset($data[$feed_field]) ? $data[$feed_field] : (isset($data[strtolower($feed_field)]) ? $data[strtolower($feed_field)] : '');
            
            if ($value !== '') {
                 update_post_meta($post_id, '_vim_' . $meta_field, sanitize_text_field($value));
            }
        }
        
        // Handle Taxonomies with Hierarchy
        $this->set_vehicle_taxonomies($post_id, $data);
        
        // Handle Images
        if ($download_images) {
             $image_list = isset($data['ImageList']) ? $data['ImageList'] : (isset($data['images']) ? $data['images'] : '');
             if (!empty($image_list)) {
                 // Only process images if not already processed or force update logic here
                 // For now, standard implementation
                 $this->import_vehicle_images($post_id, $image_list);
             }
        }
        
        return $action;
    }

    /**
     * Set Taxonomies with Hierarchy Enforcement
     */
    private function set_vehicle_taxonomies($post_id, $data) {
        $taxonomies = array(
            'Body' => 'vehicle_body_type',
            'FuelType' => 'vehicle_fuel_type',
            'Gearbox' => 'vehicle_transmission',
            'DriveType' => 'vehicle_drive_type',
            'BodyColour' => 'vehicle_color',
            'Condition' => 'vehicle_condition',
        );

        // Standard taxonomies
        foreach ($taxonomies as $key => $tax) {
             $val = isset($data[$key]) ? $data[$key] : (isset($data[strtolower($key)]) ? $data[strtolower($key)] : '');
             if ($val) {
                 wp_set_object_terms($post_id, $val, $tax);
             }
        }

        // Make & Model Hierarchy
        $make_name = isset($data['Make']) ? $data['Make'] : '';
        $model_name = isset($data['Model']) ? $data['Model'] : '';

        if ($make_name) {
            // Set Make
             $make_term = term_exists($make_name, 'vehicle_make');
             if (!$make_term) {
                 $make_term = wp_insert_term($make_name, 'vehicle_make');
             }
             if (!is_wp_error($make_term)) {
                 $make_id = (int) $make_term['term_id'];
                 wp_set_object_terms($post_id, $make_id, 'vehicle_make');

                 // Set Model as Child of Make
                 if ($model_name) {
                      // Check if model exists
                      $model_term = term_exists($model_name, 'vehicle_model');
                      
                      if (!$model_term) {
                          $model_term = wp_insert_term($model_name, 'vehicle_model');
                      }
                      
                      if (!is_wp_error($model_term)) {
                           $model_id = (int) $model_term['term_id'];
                           wp_set_object_terms($post_id, $model_id, 'vehicle_model');
                           
                           // Link Model to Make via Term Meta
                           update_term_meta($model_id, '_vim_make_parent', $make_id);
                      }
                 }
             }
        }
    }

    /**
     * Helper to find post by meta
     */
    private function get_post_id_by_meta($key, $value) {
        global $wpdb;
        $query = $wpdb->prepare("SELECT post_id FROM $wpdb->postmeta WHERE meta_key = %s AND meta_value = %s LIMIT 1", $key, $value);
        return $wpdb->get_var($query);
    }
    
    /**
     * Memory cleanup helper
     */
    private function cleanup_memory() {
        global $wpdb, $wp_object_cache;
        $wpdb->queries = [];
        if (is_object($wp_object_cache)) {
            $wp_object_cache->group_ops = [];
            $wp_object_cache->stats = [];
            $wp_object_cache->memcache = null;
            $wp_object_cache->cache = [];
        }
    }

    /**
     * Get field mapping
     */
    private function get_field_map() {
        return array(
            'StockNo' => 'stock_number',
            'ManuYear' => 'year',
            'Retail' => 'price',
            'Rego' => 'registration',
            'Odometer' => 'odometer',
            'Cylinders' => 'cylinders',
            'EngineCapacity' => 'engine_size',
            'VINNumber' => 'vin',
            'Doors' => 'doors',
            'Seats' => 'seats',
            'Options' => 'features',
            'Series' => 'series',
            'Badge' => 'badge',
        );
    }

    
    /**
     * Import vehicle images
     */
    private function import_vehicle_images($post_id, $image_list) {
        require_once(ABSPATH . 'wp-admin/includes/media.php');
        require_once(ABSPATH . 'wp-admin/includes/file.php');
        require_once(ABSPATH . 'wp-admin/includes/image.php');
        
        $image_urls = explode(',', $image_list);
        $gallery_ids = array();
        $first_image = true;
        
        foreach ($image_urls as $image_url) {
            $image_url = trim($image_url);
            
            if (empty($image_url)) {
                continue;
            }
            
            // Download image
            $tmp = download_url($image_url);
            
            if (is_wp_error($tmp)) {
                continue;
            }
            
            $file_array = array(
                'name' => basename($image_url),
                'tmp_name' => $tmp,
            );
            
            // Upload to media library
            $attachment_id = media_handle_sideload($file_array, $post_id);
            
            if (is_wp_error($attachment_id)) {
                @unlink($file_array['tmp_name']);
                continue;
            }
            
            // Set first image as featured
            if ($first_image) {
                set_post_thumbnail($post_id, $attachment_id);
                $first_image = false;
            } else {
                $gallery_ids[] = $attachment_id;
            }
        }
        
        // Save gallery images
        if (!empty($gallery_ids)) {
            update_post_meta($post_id, '_vim_gallery_images', $gallery_ids);
        }
    }
    
    /**
     * Log sync activity
     */
    private function log_sync($status, $imported, $updated, $errors, $message) {
        $logs = get_option('vim_feed_logs', array());
        
        $logs[] = array(
            'timestamp' => time(),
            'status' => $status,
            'imported' => $imported,
            'updated' => $updated,
            'errors' => $errors,
            'message' => $message,
        );
        
        // Keep only last 50 logs
        if (count($logs) > 50) {
            $logs = array_slice($logs, -50);
        }
        
        update_option('vim_feed_logs', $logs);
    }
}
