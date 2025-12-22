<?php
/**
 * Twenty Twenty-Five functions and definitions.
 *
 * @link https://developer.wordpress.org/themes/basics/theme-functions/
 *
 * @package WordPress
 * @subpackage Twenty_Twenty_Five
 * @since Twenty Twenty-Five 1.0
 */

// Adds theme support for post formats.
if ( ! function_exists( 'twentytwentyfive_post_format_setup' ) ) :
	/**
	 * Adds theme support for post formats.
	 *
	 * @since Twenty Twenty-Five 1.0
	 *
	 * @return void
	 */
	function twentytwentyfive_post_format_setup() {
		add_theme_support( 'post-formats', array( 'aside', 'audio', 'chat', 'gallery', 'image', 'link', 'quote', 'status', 'video' ) );
	}
endif;
add_action( 'after_setup_theme', 'twentytwentyfive_post_format_setup' );

// Enqueues editor-style.css in the editors.
if ( ! function_exists( 'twentytwentyfive_editor_style' ) ) :
	/**
	 * Enqueues editor-style.css in the editors.
	 *
	 * @since Twenty Twenty-Five 1.0
	 *
	 * @return void
	 */
	function twentytwentyfive_editor_style() {
		add_editor_style( 'assets/css/editor-style.css' );
	}
endif;
add_action( 'after_setup_theme', 'twentytwentyfive_editor_style' );

// Enqueues the theme stylesheet on the front.
if ( ! function_exists( 'twentytwentyfive_enqueue_styles' ) ) :
	/**
	 * Enqueues the theme stylesheet on the front.
	 *
	 * @since Twenty Twenty-Five 1.0
	 *
	 * @return void
	 */
	function twentytwentyfive_enqueue_styles() {
		$suffix = SCRIPT_DEBUG ? '' : '.min';
		$src    = 'style' . $suffix . '.css';

		wp_enqueue_style(
			'twentytwentyfive-style',
			get_parent_theme_file_uri( $src ),
			array(),
			wp_get_theme()->get( 'Version' )
		);
		wp_style_add_data(
			'twentytwentyfive-style',
			'path',
			get_parent_theme_file_path( $src )
		);
	}
endif;
add_action( 'wp_enqueue_scripts', 'twentytwentyfive_enqueue_styles' );

// Registers custom block styles.
if ( ! function_exists( 'twentytwentyfive_block_styles' ) ) :
	/**
	 * Registers custom block styles.
	 *
	 * @since Twenty Twenty-Five 1.0
	 *
	 * @return void
	 */
	function twentytwentyfive_block_styles() {
		register_block_style(
			'core/list',
			array(
				'name'         => 'checkmark-list',
				'label'        => __( 'Checkmark', 'twentytwentyfive' ),
				'inline_style' => '
				ul.is-style-checkmark-list {
					list-style-type: "\2713";
				}

				ul.is-style-checkmark-list li {
					padding-inline-start: 1ch;
				}',
			)
		);
	}
endif;
add_action( 'init', 'twentytwentyfive_block_styles' );

// Registers pattern categories.
if ( ! function_exists( 'twentytwentyfive_pattern_categories' ) ) :
	/**
	 * Registers pattern categories.
	 *
	 * @since Twenty Twenty-Five 1.0
	 *
	 * @return void
	 */
	function twentytwentyfive_pattern_categories() {

		register_block_pattern_category(
			'twentytwentyfive_page',
			array(
				'label'       => __( 'Pages', 'twentytwentyfive' ),
				'description' => __( 'A collection of full page layouts.', 'twentytwentyfive' ),
			)
		);

		register_block_pattern_category(
			'twentytwentyfive_post-format',
			array(
				'label'       => __( 'Post formats', 'twentytwentyfive' ),
				'description' => __( 'A collection of post format patterns.', 'twentytwentyfive' ),
			)
		);
	}
endif;
add_action( 'init', 'twentytwentyfive_pattern_categories' );

// Registers block binding sources.
if ( ! function_exists( 'twentytwentyfive_register_block_bindings' ) ) :
	/**
	 * Registers the post format block binding source.
	 *
	 * @since Twenty Twenty-Five 1.0
	 *
	 * @return void
	 */
	function twentytwentyfive_register_block_bindings() {
		register_block_bindings_source(
			'twentytwentyfive/format',
			array(
				'label'              => _x( 'Post format name', 'Label for the block binding placeholder in the editor', 'twentytwentyfive' ),
				'get_value_callback' => 'twentytwentyfive_format_binding',
			)
		);
	}
endif;
add_action( 'init', 'twentytwentyfive_register_block_bindings' );

// Registers block binding callback function for the post format name.
if ( ! function_exists( 'twentytwentyfive_format_binding' ) ) :
	/**
	 * Callback function for the post format name block binding source.
	 *
	 * @since Twenty Twenty-Five 1.0
	 *
	 * @return string|void Post format name, or nothing if the format is 'standard'.
	 */
	function twentytwentyfive_format_binding() {
		$post_format_slug = get_post_format();

		if ( $post_format_slug && 'standard' !== $post_format_slug ) {
			return get_post_format_string( $post_format_slug );
		}
	}
endif;


function register_theme_menus() {
    register_nav_menus(
        array(
            'primary_menu' => __('Primary Menu', 'your-textdomain'),
            'footer_menu'  => __('Footer Menu', 'your-textdomain'),
        )
    );
}
add_action('after_setup_theme', 'register_theme_menus');

// Add CORS headers for Next.js
function add_cors_http_header(){
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
}
add_action('init','add_cors_http_header');

// Add custom REST API endpoint for menus
add_action('rest_api_init', function () {
   
    register_rest_route('menus/v1', '/name/(?P<name>[a-zA-Z0-9-_]+)', array(
        'methods' => 'GET',
        'callback' => 'get_menu_by_name_rest',
        'permission_callback' => '__return_true'
    ));
});

// function get_menu_by_location_rest($request) {
//     $location = $request['location'];
//     $locations = get_nav_menu_locations();
    
//     if (!isset($locations[$location])) {
//         return new WP_Error('no_menu', 'No menu found at this location', array('status' => 404));
//     }
    
//     $menu_id = $locations[$location];
//     $menu_items = wp_get_nav_menu_items($menu_id);
    
//     if (!$menu_items) {
//         return new WP_Error('no_items', 'No menu items found', array('status' => 404));
//     }
    
//     $menu_data = array(
//         'ID' => $menu_id,
//         'name' => wp_get_nav_menu_object($menu_id)->name,
//         'items' => array()
//     );
    
//     foreach ($menu_items as $item) {
//         $menu_data['items'][] = array(
//             'ID' => $item->ID,
//             'title' => $item->title,
//             'url' => $item->url,
//             'target' => $item->target,
//             'parent' => $item->menu_item_parent,
//             'order' => $item->menu_order,
//             'classes' => implode(' ', $item->classes)
//         );
//     }
    
//     return $menu_data;
// }
// add_action('rest_api_init', function () {
//     register_rest_route('test/v1', '/ping', [
//         'methods' => 'GET',
//         'callback' => function () {
//             return ['status' => 'OK'];
//         },
//         'permission_callback' => '__return_true'
//     ]);
// });

add_action('rest_api_init', function () {
    register_rest_route('menus/v1', '/by-name/(?P<name>[^\/]+)', [
        'methods'  => 'GET',
        'callback' => 'get_menu_by_name_rest',
        'permission_callback' => '__return_true',
    ]);
});

function get_menu_by_name_rest($request) {
    $menu_name = urldecode($request['name']);

    // Get menu by NAME or SLUG
    $menu = wp_get_nav_menu_object($menu_name);

    if (!$menu) {
        return new WP_Error(
            'menu_not_found',
            'Menu not found',
            ['status' => 404]
        );
    }

    $menu_items = wp_get_nav_menu_items($menu->term_id);

    if (!$menu_items) {
        return [
            'ID' => $menu->term_id,
            'name' => $menu->name,
            'slug' => $menu->slug,
            'items' => []
        ];
    }

    // Build nested structure
    $items = [];
    foreach ($menu_items as $item) {
        $items[$item->ID] = [
            'ID' => $item->ID,
            'title' => $item->title,
            'url' => $item->url,
            'parent' => (int) $item->menu_item_parent,
            'order' => $item->menu_order,
            'children' => []
        ];
    }

    $tree = [];
    foreach ($items as $id => &$item) {
        if ($item['parent'] === 0) {
            $tree[] = &$item;
        } else {
            $items[$item['parent']]['children'][] = &$item;
        }
    }

    return [
        'ID' => $menu->term_id,
        'name' => $menu->name,
        'slug' => $menu->slug,
        'items' => $tree
    ];
}
