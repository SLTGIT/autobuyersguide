<?php
/**
 * Vehicle Taxonomy Meta
 *
 * @package Vehicle_Inventory_Manager
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Vehicle Taxonomy Meta Class
 */
class VIM_Vehicle_Taxonomy_Meta {
    
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
        // Add form fields
        add_action('vehicle_model_add_form_fields', array($this, 'add_make_field'));
        add_action('vehicle_model_edit_form_fields', array($this, 'edit_make_field'));
        
        // Save form fields
        add_action('created_vehicle_model', array($this, 'save_make_field'));
        add_action('edited_vehicle_model', array($this, 'save_make_field'));
        
        // Add validation script
        add_action('admin_footer', array($this, 'add_validation_script'));
    }
    
    /**
     * Add Make field to "Add New Model" screen
     */
    public function add_make_field() {
        $makes = get_terms(array(
            'taxonomy' => 'vehicle_make',
            'hide_empty' => false,
        ));
        ?>
        <div class="form-field term-make-wrap">
            <label for="vim_parent_make"><?php _e('Parent Make', 'vehicle-inventory-manager'); ?> <span class="required">*</span></label>
            <select name="vim_parent_make" id="vim_parent_make" class="postform" aria-required="true">
                <option value=""><?php _e('Select Make', 'vehicle-inventory-manager'); ?></option>
                <?php foreach ($makes as $make) : ?>
                    <option value="<?php echo esc_attr($make->term_id); ?>"><?php echo esc_html($make->name); ?></option>
                <?php endforeach; ?>
            </select>
            <p class="description"><?php _e('Select the Make this Model belongs to. This is strictly required.', 'vehicle-inventory-manager'); ?></p>
        </div>
        <?php
    }
    
    /**
     * Add Make field to "Edit Model" screen
     */
    public function edit_make_field($term) {
        $parent_make_id = get_term_meta($term->term_id, '_vim_make_parent', true);
        $makes = get_terms(array(
            'taxonomy' => 'vehicle_make',
            'hide_empty' => false,
        ));
        ?>
        <tr class="form-field term-make-wrap">
            <th scope="row"><label for="vim_parent_make"><?php _e('Parent Make', 'vehicle-inventory-manager'); ?> <span class="required">*</span></label></th>
            <td>
                <select name="vim_parent_make" id="vim_parent_make" class="postform" aria-required="true">
                    <option value=""><?php _e('Select Make', 'vehicle-inventory-manager'); ?></option>
                    <?php foreach ($makes as $make) : ?>
                        <option value="<?php echo esc_attr($make->term_id); ?>" <?php selected($parent_make_id, $make->term_id); ?>><?php echo esc_html($make->name); ?></option>
                    <?php endforeach; ?>
                </select>
                <p class="description"><?php _e('Select the Make this Model belongs to.', 'vehicle-inventory-manager'); ?></p>
            </td>
        </tr>
        <?php
    }
    
    /**
     * Save Make field
     */
    public function save_make_field($term_id) {
        if (isset($_POST['vim_parent_make'])) {
            update_term_meta($term_id, '_vim_make_parent', absint($_POST['vim_parent_make']));
        }
    }
    
    /**
     * Add validation script to prevent submission without Make
     */
    public function add_validation_script() {
        $screen = get_current_screen();
        if ($screen->taxonomy !== 'vehicle_model') {
            return;
        }
        ?>
        <script type="text/javascript">
        jQuery(document).ready(function($) {
            // Validation for "Add New" form
            $('#addtag').on('submit', function(e) {
                var make = $('#vim_parent_make').val();
                if (!make) {
                    e.preventDefault();
                    alert('<?php _e('Please select a Parent Make. Every model must belong to a make.', 'vehicle-inventory-manager'); ?>');
                    $('#vim_parent_make').focus();
                    return false;
                }
            });
            
            // Validation for "Edit" form
            $('#edittag').on('submit', function(e) {
                var make = $('#vim_parent_make').val();
                if (!make) {
                    e.preventDefault();
                    alert('<?php _e('Please select a Parent Make. Every model must belong to a make.', 'vehicle-inventory-manager'); ?>');
                    $('#vim_parent_make').focus();
                    return false;
                }
            });
        });
        </script>
        <style>
            .form-field.term-make-wrap label span.required {
                color: #d63638;
            }
        </style>
        <?php
    }
}
