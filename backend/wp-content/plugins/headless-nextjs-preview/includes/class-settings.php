<?php
/**
 * Settings Class
 * Handles plugin settings page and configuration
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

class HNP_Settings {
    
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
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));
    }
    
    /**
     * Add settings page to admin menu
     */
    public function add_settings_page() {
        add_options_page(
            'Headless Next.js Preview Settings',
            'Headless Preview',
            'manage_options',
            'headless-nextjs-preview',
            array($this, 'render_settings_page')
        );
    }
    
    /**
     * Enqueue admin scripts
     */
    public function enqueue_admin_scripts($hook) {
        if ($hook !== 'settings_page_headless-nextjs-preview') {
            return;
        }
        
        wp_enqueue_style('hnp-admin-styles', HNP_PLUGIN_URL . 'assets/admin-styles.css', array(), HNP_VERSION);
    }
    
    /**
     * Render settings page
     */
    public function render_settings_page() {
        if (!current_user_can('manage_options')) {
            return;
        }
        
        // Save settings
        if (isset($_POST['hnp_settings_nonce']) && wp_verify_nonce($_POST['hnp_settings_nonce'], 'hnp_save_settings')) {
            $this->save_settings();
        }
        
        $settings = get_option('hnp_settings', array());
        $nextjs_url = isset($settings['nextjs_url']) ? $settings['nextjs_url'] : 'http://localhost:3000';
        $preview_secret = isset($settings['preview_secret']) ? $settings['preview_secret'] : '';
        $enabled_post_types = isset($settings['enabled_post_types']) ? $settings['enabled_post_types'] : array('post', 'page');
        
        $handler = new HNP_Preview_Handler();
        $post_types = $handler->get_public_post_types();
        
        ?>
        <div class="wrap">
            <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
            
            <div class="hnp-settings-container">
                <form method="post" action="">
                    <?php wp_nonce_field('hnp_save_settings', 'hnp_settings_nonce'); ?>
                    
                    <table class="form-table" role="presentation">
                        <tbody>
                            <tr>
                                <th scope="row">
                                    <label for="nextjs_url">Next.js Frontend URL</label>
                                </th>
                                <td>
                                    <input 
                                        type="url" 
                                        id="nextjs_url" 
                                        name="hnp_settings[nextjs_url]" 
                                        value="<?php echo esc_attr($nextjs_url); ?>" 
                                        class="regular-text"
                                        required
                                    />
                                    <p class="description">
                                        The URL of your Next.js frontend (e.g., http://localhost:3000 or https://yourdomain.com)
                                    </p>
                                </td>
                            </tr>
                            
                            <tr>
                                <th scope="row">
                                    <label for="preview_secret">Preview Secret</label>
                                </th>
                                <td>
                                    <input 
                                        type="text" 
                                        id="preview_secret" 
                                        name="hnp_settings[preview_secret]" 
                                        value="<?php echo esc_attr($preview_secret); ?>" 
                                        class="regular-text"
                                        required
                                        readonly
                                    />
                                    <button type="button" class="button" onclick="document.getElementById('preview_secret').readOnly = false; document.getElementById('preview_secret').select();">
                                        Edit
                                    </button>
                                    <button type="button" class="button" onclick="document.getElementById('preview_secret').value = '<?php echo esc_js($this->generate_secret()); ?>'; document.getElementById('preview_secret').readOnly = true;">
                                        Generate New
                                    </button>
                                    <p class="description">
                                        Secret key for authenticating preview requests. Copy this to your Next.js .env file as WORDPRESS_PREVIEW_SECRET
                                    </p>
                                </td>
                            </tr>
                            
                            <tr>
                                <th scope="row">
                                    Enabled Post Types
                                </th>
                                <td>
                                    <fieldset>
                                        <legend class="screen-reader-text">
                                            <span>Enabled Post Types</span>
                                        </legend>
                                        <?php foreach ($post_types as $post_type => $post_type_obj): ?>
                                            <label>
                                                <input 
                                                    type="checkbox" 
                                                    name="hnp_settings[enabled_post_types][]" 
                                                    value="<?php echo esc_attr($post_type); ?>"
                                                    <?php checked(in_array($post_type, $enabled_post_types)); ?>
                                                />
                                                <?php echo esc_html($post_type_obj->labels->name); ?>
                                                <code><?php echo esc_html($post_type); ?></code>
                                            </label>
                                            <br>
                                        <?php endforeach; ?>
                                        <p class="description">
                                            Select which post types should redirect to the Next.js frontend
                                        </p>
                                    </fieldset>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <?php submit_button('Save Settings'); ?>
                </form>
                
                <hr>
                
                <div class="hnp-info-section">
                    <h2>Setup Instructions</h2>
                    <ol>
                        <li>Copy the <strong>Preview Secret</strong> above</li>
                        <li>Add it to your Next.js <code>.env</code> file:
                            <pre>WORDPRESS_PREVIEW_SECRET=<?php echo esc_html($preview_secret); ?></pre>
                        </li>
                        <li>Restart your Next.js development server</li>
                        <li>Test by clicking "Preview" on any post, page, or vehicle in WordPress admin</li>
                    </ol>
                    
                    <h3>How It Works</h3>
                    <ul>
                        <li><strong>Preview Button:</strong> Redirects to Next.js preview API with authentication</li>
                        <li><strong>View Button:</strong> Opens the published content on your Next.js frontend</li>
                        <li><strong>Draft Content:</strong> Uses preview mode to display unpublished changes</li>
                    </ul>
                    
                    <h3>URL Structure</h3>
                    <ul>
                        <li><strong>Posts:</strong> <code><?php echo esc_html($nextjs_url); ?>/blog/[slug]</code></li>
                        <li><strong>Pages:</strong> <code><?php echo esc_html($nextjs_url); ?>/[slug]</code></li>
                    </ul>
                </div>
            </div>
        </div>
        <?php
    }
    
    /**
     * Save settings
     */
    private function save_settings() {
        if (!isset($_POST['hnp_settings'])) {
            return;
        }
        
        $input = $_POST['hnp_settings'];
        $sanitized = array();
        
        if (isset($input['nextjs_url'])) {
            $sanitized['nextjs_url'] = esc_url_raw(rtrim($input['nextjs_url'], '/'));
        }
        
        if (isset($input['preview_secret'])) {
            $sanitized['preview_secret'] = sanitize_text_field($input['preview_secret']);
        }
        
        if (isset($input['enabled_post_types']) && is_array($input['enabled_post_types'])) {
            $sanitized['enabled_post_types'] = array_map('sanitize_text_field', $input['enabled_post_types']);
        } else {
            $sanitized['enabled_post_types'] = array();
        }
        
        update_option('hnp_settings', $sanitized);
        
        add_settings_error(
            'hnp_messages',
            'hnp_message',
            'Settings saved successfully!',
            'success'
        );
        
        settings_errors('hnp_messages');
    }
    
    /**
     * Generate secret
     */
    private function generate_secret() {
        return bin2hex(random_bytes(32));
    }
}
