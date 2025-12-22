<?php
/**
 * Vehicle REST API
 *
 * @package Vehicle_Inventory_Manager
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Vehicle REST API Class
 */
class VIM_Vehicle_REST_API {
    
    /**
     * Single instance
     */
    private static $instance = null;
    
    /**
     * API namespace
     */
    private $namespace = 'vim/v1';
    
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
        add_action('rest_api_init', array($this, 'register_routes'));
    }
    
    /**
     * Register REST API routes
     */
    public function register_routes() {
        // Get vehicles with filtering
        register_rest_route($this->namespace, '/vehicles', array(
            'methods'  => 'GET',
            'callback' => array($this, 'get_vehicles'),
            'permission_callback' => '__return_true',
            'args'     => $this->get_vehicle_query_params(),
        ));
        
        // Get single vehicle
        register_rest_route($this->namespace, '/vehicles/(?P<id>\d+)', array(
            'methods'  => 'GET',
            'callback' => array($this, 'get_vehicle'),
            'permission_callback' => '__return_true',
            'args'     => array(
                'id' => array(
                    'validate_callback' => function($param) {
                        return is_numeric($param);
                    }
                ),
            ),
        ));
        
        // Get filter options
        register_rest_route($this->namespace, '/filter-options', array(
            'methods'  => 'GET',
            'callback' => array($this, 'get_filter_options'),
            'permission_callback' => '__return_true',
        ));
        
        // Get makes
        register_rest_route($this->namespace, '/makes', array(
            'methods'  => 'GET',
            'callback' => array($this, 'get_makes'),
            'permission_callback' => '__return_true',
        ));
        
        // Get models
        register_rest_route($this->namespace, '/models', array(
            'methods'  => 'GET',
            'callback' => array($this, 'get_models'),
            'permission_callback' => '__return_true',
            'args'     => array(
                'make' => array(
                    'required' => false,
                    'type'     => 'integer',
                ),
            ),
        ));
    }
    
    /**
     * Get vehicle query parameters
     */
    private function get_vehicle_query_params() {
        return array(
            'per_page' => array(
                'default'           => 12,
                'sanitize_callback' => 'absint',
            ),
            'page' => array(
                'default'           => 1,
                'sanitize_callback' => 'absint',
            ),
            'search' => array(
                'sanitize_callback' => 'sanitize_text_field',
            ),
            'slug' => array(
                'sanitize_callback' => 'sanitize_text_field',
            ),
            'make' => array(
                'sanitize_callback' => 'absint',
            ),
            'model' => array(
                'sanitize_callback' => 'absint',
            ),
            'min_price' => array(
                'sanitize_callback' => 'absint',
            ),
            'max_price' => array(
                'sanitize_callback' => 'absint',
            ),
            'min_year' => array(
                'sanitize_callback' => 'absint',
            ),
            'max_year' => array(
                'sanitize_callback' => 'absint',
            ),
            'min_odometer' => array(
                'sanitize_callback' => 'absint',
            ),
            'max_odometer' => array(
                'sanitize_callback' => 'absint',
            ),
            'body_type' => array(
                'sanitize_callback' => 'absint',
            ),
            'fuel_type' => array(
                'sanitize_callback' => 'absint',
            ),
            'transmission' => array(
                'sanitize_callback' => 'absint',
            ),
            'drive_type' => array(
                'sanitize_callback' => 'absint',
            ),
            'color' => array(
                'sanitize_callback' => 'absint',
            ),
            'condition' => array(
                'sanitize_callback' => 'absint',
            ),
            'orderby' => array(
                'default'           => 'date',
                'sanitize_callback' => 'sanitize_text_field',
            ),
            'order' => array(
                'default'           => 'DESC',
                'sanitize_callback' => 'sanitize_text_field',
            ),
        );
    }
    
    /**
     * Get vehicles
     */
    public function get_vehicles($request) {
        $params = $request->get_params();
        
        // Build query args
        $args = array(
            'post_type'      => 'vehicle',
            'post_status'    => 'publish',
            'posts_per_page' => $params['per_page'],
            'paged'          => $params['page'],
            'orderby'        => $params['orderby'],
            'order'          => $params['order'],
        );
        
        // Search
        if (!empty($params['search'])) {
            $args['s'] = $params['search'];
        }

        // Slug support
        if (!empty($params['slug'])) {
            $args['name'] = $params['slug'];
        }
        
        // Taxonomy filters
        $tax_query = array('relation' => 'AND');
        
        if (!empty($params['make'])) {
            $tax_query[] = array(
                'taxonomy' => 'vehicle_make',
                'field'    => 'term_id',
                'terms'    => $params['make'],
            );
        }
        
        if (!empty($params['model'])) {
            $tax_query[] = array(
                'taxonomy' => 'vehicle_model',
                'field'    => 'term_id',
                'terms'    => $params['model'],
            );
        }
        
        if (!empty($params['body_type'])) {
            $tax_query[] = array(
                'taxonomy' => 'vehicle_body_type',
                'field'    => 'term_id',
                'terms'    => $params['body_type'],
            );
        }
        
        if (!empty($params['fuel_type'])) {
            $tax_query[] = array(
                'taxonomy' => 'vehicle_fuel_type',
                'field'    => 'term_id',
                'terms'    => $params['fuel_type'],
            );
        }
        
        if (!empty($params['transmission'])) {
            $tax_query[] = array(
                'taxonomy' => 'vehicle_transmission',
                'field'    => 'term_id',
                'terms'    => $params['transmission'],
            );
        }
        
        if (!empty($params['drive_type'])) {
            $tax_query[] = array(
                'taxonomy' => 'vehicle_drive_type',
                'field'    => 'term_id',
                'terms'    => $params['drive_type'],
            );
        }
        
        if (!empty($params['color'])) {
            $tax_query[] = array(
                'taxonomy' => 'vehicle_color',
                'field'    => 'term_id',
                'terms'    => $params['color'],
            );
        }
        
        if (!empty($params['condition'])) {
            $tax_query[] = array(
                'taxonomy' => 'vehicle_condition',
                'field'    => 'term_id',
                'terms'    => $params['condition'],
            );
        }
        
        if (count($tax_query) > 1) {
            $args['tax_query'] = $tax_query;
        }
        
        // Meta query for price, year, odometer
        $meta_query = array('relation' => 'AND');
        
        if (!empty($params['min_price']) || !empty($params['max_price'])) {
            $price_query = array('key' => '_vim_price', 'type' => 'NUMERIC');
            if (!empty($params['min_price'])) {
                $price_query['value'] = array($params['min_price']);
                $price_query['compare'] = '>=';
            }
            if (!empty($params['max_price'])) {
                if (!empty($params['min_price'])) {
                    $price_query['value'][] = $params['max_price'];
                    $price_query['compare'] = 'BETWEEN';
                } else {
                    $price_query['value'] = $params['max_price'];
                    $price_query['compare'] = '<=';
                }
            }
            $meta_query[] = $price_query;
        }
        
        if (!empty($params['min_year']) || !empty($params['max_year'])) {
            $year_query = array('key' => '_vim_year', 'type' => 'NUMERIC');
            if (!empty($params['min_year'])) {
                $year_query['value'] = array($params['min_year']);
                $year_query['compare'] = '>=';
            }
            if (!empty($params['max_year'])) {
                if (!empty($params['min_year'])) {
                    $year_query['value'][] = $params['max_year'];
                    $year_query['compare'] = 'BETWEEN';
                } else {
                    $year_query['value'] = $params['max_year'];
                    $year_query['compare'] = '<=';
                }
            }
            $meta_query[] = $year_query;
        }
        
        if (!empty($params['min_odometer']) || !empty($params['max_odometer'])) {
            $odometer_query = array('key' => '_vim_odometer', 'type' => 'NUMERIC');
            if (!empty($params['min_odometer'])) {
                $odometer_query['value'] = array($params['min_odometer']);
                $odometer_query['compare'] = '>=';
            }
            if (!empty($params['max_odometer'])) {
                if (!empty($params['min_odometer'])) {
                    $odometer_query['value'][] = $params['max_odometer'];
                    $odometer_query['compare'] = 'BETWEEN';
                } else {
                    $odometer_query['value'] = $params['max_odometer'];
                    $odometer_query['compare'] = '<=';
                }
            }
            $meta_query[] = $odometer_query;
        }
        
        if (count($meta_query) > 1) {
            $args['meta_query'] = $meta_query;
        }
        
        // Custom orderby for meta fields
        if (in_array($params['orderby'], array('price', 'year', 'odometer'))) {
            $args['meta_key'] = '_vim_' . $params['orderby'];
            $args['orderby'] = 'meta_value_num';
        }
        
        // Execute query
        $query = new WP_Query($args);
        
        // Format response
        $vehicles = array();
        if ($query->have_posts()) {
            while ($query->have_posts()) {
                $query->the_post();
                $vehicles[] = $this->format_vehicle_data(get_post());
            }
            wp_reset_postdata();
        }
        
        // Return response with pagination headers
        $response = rest_ensure_response($vehicles);
        $response->header('X-WP-Total', $query->found_posts);
        $response->header('X-WP-TotalPages', $query->max_num_pages);
        
        return $response;
    }
    
    /**
     * Get single vehicle
     */
    public function get_vehicle($request) {
        $post = get_post($request['id']);
        
        if (!$post || $post->post_type !== 'vehicle') {
            return new WP_Error('not_found', __('Vehicle not found', 'vehicle-inventory-manager'), array('status' => 404));
        }
        
        return rest_ensure_response($this->format_vehicle_data($post));
    }
    
    /**
     * Format vehicle data
     */
    private function format_vehicle_data($post) {
        $data = array(
            'id'            => $post->ID,
            'title'         => get_the_title($post),
            'slug'          => $post->post_name,
            'content'       => apply_filters('the_content', $post->post_content),
            'excerpt'       => get_the_excerpt($post),
            'date'          => $post->post_date,
            'modified'      => $post->post_modified,
            'featured_image' => get_the_post_thumbnail_url($post, 'large'),
        );
        
        // Add meta fields
        $meta_fields = array('price', 'year', 'odometer', 'vin', 'stock_number', 'engine_size', 
                            'cylinders', 'doors', 'seats', 'registration', 'price_type', 
                            'status_badge', 'dealership', 'location', 'features');
        
        foreach ($meta_fields as $field) {
            $data[$field] = get_post_meta($post->ID, '_vim_' . $field, true);
        }
        
        // Add formatted price
        $data['formatted_price'] = $this->format_price($data['price']);
        
        // Add taxonomies
        $taxonomies = array('make', 'model', 'body_type', 'fuel_type', 'transmission', 'drive_type', 'color', 'condition');
        
        foreach ($taxonomies as $taxonomy) {
            $terms = get_the_terms($post->ID, 'vehicle_' . $taxonomy);
            $data[$taxonomy] = array();
            if ($terms && !is_wp_error($terms)) {
                foreach ($terms as $term) {
                    $data[$taxonomy][] = array(
                        'id'   => $term->term_id,
                        'name' => $term->name,
                        'slug' => $term->slug,
                    );
                }
            }
        }
        
        // Add gallery images
        $gallery_ids = get_post_meta($post->ID, '_vim_gallery_images', true);
        $data['gallery_images'] = array();
        
        if (is_array($gallery_ids)) {
            foreach ($gallery_ids as $image_id) {
                $data['gallery_images'][] = array(
                    'id'        => $image_id,
                    'url'       => wp_get_attachment_url($image_id),
                    'thumbnail' => wp_get_attachment_image_url($image_id, 'thumbnail'),
                    'medium'    => wp_get_attachment_image_url($image_id, 'medium'),
                    'large'     => wp_get_attachment_image_url($image_id, 'large'),
                    'alt'       => get_post_meta($image_id, '_wp_attachment_image_alt', true),
                );
            }
        }
        
        return $data;
    }
    
    /**
     * Get filter options with faceted counts
     */
    public function get_filter_options($request) {
        $params = $request->get_params();
        
        return rest_ensure_response(array(
            'makes'         => $this->get_faceted_taxonomy_terms('vehicle_make', $params),
            'models'        => $this->get_faceted_model_terms($params),
            'body_types'    => $this->get_faceted_taxonomy_terms('vehicle_body_type', $params),
            'fuel_types'    => $this->get_faceted_taxonomy_terms('vehicle_fuel_type', $params),
            'transmissions' => $this->get_faceted_taxonomy_terms('vehicle_transmission', $params),
            'drive_types'   => $this->get_faceted_taxonomy_terms('vehicle_drive_type', $params),
            'colors'        => $this->get_faceted_taxonomy_terms('vehicle_color', $params),
            'conditions'    => $this->get_faceted_taxonomy_terms('vehicle_condition', $params),
            'price_range'   => $this->get_price_range(),
            'year_range'    => $this->get_year_range(),
            'odometer_range' => $this->get_odometer_range(),
        ));
    }
    
    /**
     * Get faceted taxonomy terms
     */
    private function get_faceted_taxonomy_terms($taxonomy, $params) {
        // Remove the current taxonomy from params to get "sibling" counts
        // e.g. When looking at Colors, we want counts for Red/Blue based on Make/Year/etc,
        // but NOT limited by the currently selected Color.
        $param_map = array(
            'vehicle_make' => 'make',
            'vehicle_body_type' => 'body_type',
            'vehicle_fuel_type' => 'fuel_type',
            'vehicle_transmission' => 'transmission',
            'vehicle_drive_type' => 'drive_type',
            'vehicle_color' => 'color',
            'vehicle_condition' => 'condition',
        );
        
        $exclude_param = isset($param_map[$taxonomy]) ? $param_map[$taxonomy] : '';
        
        // Get potential vehicle IDs matches based on OTHER filters
        $vehicle_ids = $this->get_filtered_vehicle_ids($params, $exclude_param);
        
        // If no matches found, return all terms with 0 count? Or just empty?
        // Better to return 0 count for visibility
        if (empty($vehicle_ids)) {
            return $this->get_taxonomy_terms($taxonomy, array('hide_empty' => false));
        }

        return $this->count_terms_in_set($taxonomy, $vehicle_ids);
    }

    /**
     * Get faceted models (special logic for parent dependency)
     */
    private function get_faceted_model_terms($params) {
        // Models are strictly dependent on Make. 
        // We ALWAYS respect the 'make' param for models.
        // We EXCLUDE the 'model' param itself.
        
        $vehicle_ids = $this->get_filtered_vehicle_ids($params, 'model');

        // Additionally, if a make is selected, we only want models for that make
        // The get_filtered_vehicle_ids handles the vehicle filtering, 
        // but we also need to filter the TERMS returned to be children of the make.
        
        $terms_args = array(
            'taxonomy' => 'vehicle_model',
            'hide_empty' => false,
        );
        
        if (!empty($params['make'])) {
            $terms_args['meta_key'] = '_vim_make_parent';
            $terms_args['meta_value'] = $params['make'];
        }
        
        $all_possible_models = get_terms($terms_args);
        
        if (empty($vehicle_ids)) {
             // Return structure with 0 counts
             return $this->format_term_list($all_possible_models, array());
        }

        return $this->count_terms_in_set('vehicle_model', $vehicle_ids, $all_possible_models);
    }

    /**
     * Helper: Get IDs of vehicles matching current filters
     */
    private function get_filtered_vehicle_ids($params, $exclude_param = '') {
        $query_params = $params;
        if ($exclude_param && isset($query_params[$exclude_param])) {
            unset($query_params[$exclude_param]);
        }
        
        // Use existing get_vehicles logic but return IDs only
        // We modify the params to ask for ALL posts (-1) and IDs fields
        $query_params['per_page'] = -1;
        $query_params['page'] = 1;
        $query_params['fields'] = 'ids'; // We'll handle this in a custom query build or modified get_vehicles
        
        // Re-implement simplified query construction for speed
        $args = array(
            'post_type' => 'vehicle',
            'post_status' => 'publish',
            'posts_per_page' => -1,
            'fields' => 'ids',
            'no_found_rows' => true,
            'update_post_meta_cache' => false,
            'update_post_term_cache' => false,
        );
        
        // Reuse the logic from get_vehicles for building tax_query and meta_query
        // (Copying essential parts for conciseness)
        
        // Search
        if (!empty($query_params['search'])) {
            $args['s'] = $query_params['search'];
        }
        
        // Tax Query
        $tax_query = array('relation' => 'AND');
        $tax_map = array(
            'make' => 'vehicle_make',
            'model' => 'vehicle_model',
            'body_type' => 'vehicle_body_type',
            'fuel_type' => 'vehicle_fuel_type',
            'transmission' => 'vehicle_transmission',
            'drive_type' => 'vehicle_drive_type',
            'color' => 'vehicle_color',
            'condition' => 'vehicle_condition'
        );
        
        foreach ($tax_map as $param => $taxonomy) {
            if (!empty($query_params[$param])) {
                $tax_query[] = array(
                    'taxonomy' => $taxonomy,
                    'field' => 'term_id',
                    'terms' => $query_params[$param]
                );
            }
        }
        if (count($tax_query) > 1) $args['tax_query'] = $tax_query;
        
        // Meta Query (Price, Year, Odometer)
        $meta_query = array('relation' => 'AND');
        
        // Price
        if (!empty($query_params['min_price']) || !empty($query_params['max_price'])) {
            $q = array('key' => '_vim_price', 'type' => 'NUMERIC');
            $min = !empty($query_params['min_price']) ? $query_params['min_price'] : 0;
            $max = !empty($query_params['max_price']) ? $query_params['max_price'] : 99999999;
            $q['value'] = array($min, $max);
            $q['compare'] = 'BETWEEN';
            $meta_query[] = $q;
        }
        // Year
        if (!empty($query_params['min_year']) || !empty($query_params['max_year'])) {
            $q = array('key' => '_vim_year', 'type' => 'NUMERIC');
            $min = !empty($query_params['min_year']) ? $query_params['min_year'] : 1900;
            $max = !empty($query_params['max_year']) ? $query_params['max_year'] : date('Y') + 1;
            $q['value'] = array($min, $max);
            $q['compare'] = 'BETWEEN';
            $meta_query[] = $q;
        }
        // Odometer
        if (!empty($query_params['min_odometer']) || !empty($query_params['max_odometer'])) {
            $q = array('key' => '_vim_odometer', 'type' => 'NUMERIC');
            $min = !empty($query_params['min_odometer']) ? $query_params['min_odometer'] : 0;
            $max = !empty($query_params['max_odometer']) ? $query_params['max_odometer'] : 9999999;
            $q['value'] = array($min, $max);
            $q['compare'] = 'BETWEEN';
            $meta_query[] = $q;
        }
        
        if (count($meta_query) > 1) $args['meta_query'] = $meta_query;
        
        $query = new WP_Query($args);
        return $query->posts;
    }

    /**
     * Count terms in a set of vehicle IDs
     */
    private function count_terms_in_set($taxonomy, $vehicle_ids, $specific_terms = null) {
        if (empty($vehicle_ids)) return array();
        
        $ids_string = implode(',', array_map('absint', $vehicle_ids));
        
        global $wpdb;
        // Count how many of these vehicles have each term
        $query = "SELECT term_taxonomy_id, COUNT(*) as count 
                  FROM {$wpdb->term_relationships} 
                  WHERE object_id IN ($ids_string) 
                  GROUP BY term_taxonomy_id";
                  
        $counts = $wpdb->get_results($query, OBJECT_K);
        
        // Get all terms for this taxonomy to ensure we return even 0 counts
        if ($specific_terms) {
            $terms = $specific_terms;
        } else {
            $terms = get_terms(array(
                'taxonomy' => $taxonomy,
                'hide_empty' => false,
            ));
        }

        return $this->format_term_list($terms, $counts);
    }
    
    /**
     * Format term list with manual counts
     */
    private function format_term_list($terms, $counts) {
        $formatted = array();
        if (is_wp_error($terms)) return array();
        
        foreach ($terms as $term) {
            $count = isset($counts[$term->term_id]) ? (int)$counts[$term->term_id]->count : 0;
            $formatted[] = array(
                'id' => $term->term_id,
                'name' => $term->name,
                'slug' => $term->slug,
                'count' => $count
            );
        }
        return $formatted;
    }

    /**
     * Get makes (Simplified)
     */
    public function get_makes($request) {
        return rest_ensure_response($this->get_taxonomy_terms('vehicle_make', array('hide_empty' => false)));
    }
    
    /**
     * Get models (Simplified)
     */
    public function get_models($request) {
        // ... (existing get_models logic for simple list) ...
        // Keeping as fallback or for direct calls
         $args = array(
            'taxonomy' => 'vehicle_model',
            'hide_empty' => false, 
        );
        if (!empty($request['make'])) {
            $args['meta_key'] = '_vim_make_parent';
            $args['meta_value'] = $request['make'];
        }
        $terms = get_terms($args);
        if (is_wp_error($terms)) return array();
        
        $formatted = array();
        foreach ($terms as $term) {
            $formatted[] = array(
                'id' => $term->term_id,
                'name' => $term->name,
                'slug' => $term->slug,
                'count' => $term->count // Global count
            );
        }
        return rest_ensure_response($formatted);
    }
    
    /**
     * Get taxonomy terms (Legacy/Simple)
     */
    private function get_taxonomy_terms($taxonomy, $args = array()) {
        $default_args = array(
            'taxonomy'   => $taxonomy,
            'hide_empty' => true,
        );
        $args = wp_parse_args($args, $default_args);
        $terms = get_terms($args);
        if (is_wp_error($terms)) return array();
        
        $formatted = array();
        foreach ($terms as $term) {
            $formatted[] = array(
                'id'    => $term->term_id,
                'name'  => $term->name,
                'slug'  => $term->slug,
                'count' => $term->count,
            );
        }
        return $formatted;
    }

    /**
     * Get price range
     */
    private function get_price_range() {
        // ... (Keep existing) ...
        global $wpdb;
        $min = $wpdb->get_var("SELECT MIN(CAST(meta_value AS UNSIGNED)) FROM {$wpdb->postmeta} WHERE meta_key = '_vim_price' AND meta_value != ''");
        $max = $wpdb->get_var("SELECT MAX(CAST(meta_value AS UNSIGNED)) FROM {$wpdb->postmeta} WHERE meta_key = '_vim_price' AND meta_value != ''");
        return array('min' => $min ? (int)$min : 0, 'max' => $max ? (int)$max : 1000000);
    }
    
    private function get_year_range() {
        global $wpdb;
        $min = $wpdb->get_var("SELECT MIN(CAST(meta_value AS UNSIGNED)) FROM {$wpdb->postmeta} WHERE meta_key = '_vim_year' AND meta_value != ''");
        $max = $wpdb->get_var("SELECT MAX(CAST(meta_value AS UNSIGNED)) FROM {$wpdb->postmeta} WHERE meta_key = '_vim_year' AND meta_value != ''");
        return array('min' => $min ? (int)$min : 1990, 'max' => $max ? (int)$max : date('Y'));
    }
    
    private function get_odometer_range() {
        global $wpdb;
        $min = $wpdb->get_var("SELECT MIN(CAST(meta_value AS UNSIGNED)) FROM {$wpdb->postmeta} WHERE meta_key = '_vim_odometer' AND meta_value != ''");
        $max = $wpdb->get_var("SELECT MAX(CAST(meta_value AS UNSIGNED)) FROM {$wpdb->postmeta} WHERE meta_key = '_vim_odometer' AND meta_value != ''");
        return array('min' => $min ? (int)$min : 0, 'max' => $max ? (int)$max : 600000);
    }
    
    private function format_price($price) {
        if (empty($price)) return '';
        $currency = get_option('vim_currency_symbol', '$');
        $position = get_option('vim_currency_position', 'before');
        $formatted = number_format($price);
        return $position === 'before' ? $currency . $formatted : $formatted . $currency;
    }
}
