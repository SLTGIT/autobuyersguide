// ==============================
// 0. SECURE CORS
// ==============================
add_action('init', function () {

    $allowed_origins = [
        'http://localhost:3000',
        'https://carsalesbrisbane.com.au'
    ];

    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

    if (in_array($origin, $allowed_origins)) {
        header("Access-Control-Allow-Origin: $origin");
        header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Authorization");
    }

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        status_header(200);
        exit();
    }
});


// ==============================
// 1. POST TYPE                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  
// ==============================
add_action('init', function () {
    register_post_type('leads', [
        'labels' => [
            'name' => 'Leads',
            'singular_name' => 'Lead'
        ],
        'public' => false,
        'show_ui' => true,
        'supports' => ['title'],
        'menu_icon' => 'dashicons-groups',
    ]);
});


// ==============================
// 2. CATEGORY TAXONOMY
// ==============================
add_action('init', function () {
    register_taxonomy('lead_category', 'leads', [
        'label' => 'Category',
        'hierarchical' => true,
        'show_ui' => true,
    ]);
});


// ==============================
// 3. API
// ==============================
add_action('rest_api_init', function () {
    register_rest_route('custom/v1', '/submit-lead', [
        'methods' => 'POST',
        'callback' => 'handle_lead_submission',
        'permission_callback' => 'validate_lead_auth',
    ]);
});

function handle_lead_submission($request) {

    $params = $request->get_json_params();

    $firstName = sanitize_text_field($params['firstName']);
    $lastName  = sanitize_text_field($params['lastName']);
    $phone     = sanitize_text_field($params['phone']);
    $email     = sanitize_email($params['email']);
    $message   = sanitize_textarea_field($params['message']);
    $category  = sanitize_text_field($params['form_type']);

    $budget  = sanitize_text_field($params['budget'] ?? '');
    $dob     = sanitize_text_field($params['dob'] ?? '');
    $licence = sanitize_text_field($params['driverLicence'] ?? '');
    $address = sanitize_textarea_field($params['address'] ?? '');
    $kms     = sanitize_text_field($params['kms'] ?? '');

    // ✅ NEW
    $preferredDate = sanitize_text_field($params['preferredDate'] ?? '');
    $preferredTime = sanitize_text_field($params['preferredTime'] ?? '');

    $item = $params['item'] ?? [];

    $post_id = wp_insert_post([
        'post_type' => 'leads',
        'post_title' => trim($firstName . ' ' . $lastName),
        'post_status' => 'publish',
    ]);

    update_post_meta($post_id, 'phone', $phone);
    update_post_meta($post_id, 'email', $email);
    update_post_meta($post_id, 'message', $message);
    update_post_meta($post_id, 'budget', $budget);
    update_post_meta($post_id, 'dob', $dob);
    update_post_meta($post_id, 'driver_licence', $licence);
    update_post_meta($post_id, 'address', $address);
    update_post_meta($post_id, 'kms', $kms);

    // ✅ SAVE NEW FIELDS
    update_post_meta($post_id, 'preferred_date', $preferredDate);
    update_post_meta($post_id, 'preferred_time', $preferredTime);

    update_post_meta($post_id, 'item', wp_json_encode($item));

    if ($category) {
        wp_set_object_terms($post_id, $category, 'lead_category');
    }

    return ['success' => true, 'post_id' => $post_id];
}


// ==============================
// 4. ADMIN TABLE
// ==============================
add_filter('manage_leads_posts_columns', function () {
    return [
        'cb' => '<input type="checkbox" />',
        'lead_category' => 'Category',
        'item' => 'Item',
        'details' => 'Details',
        'message' => 'Message',
    ];
});

add_action('manage_leads_posts_custom_column', function ($column, $post_id) {

    // ==========================
    // CATEGORY + DATE
    // ==========================
    if ($column === 'lead_category') {

        $terms = get_the_terms($post_id, 'lead_category');

        if ($terms && !is_wp_error($terms)) {
            echo '<strong>' . esc_html($terms[0]->name) . '</strong>';
        }

        echo '<div style="margin-top:4px;color:#666;font-size:12px;">'
            . get_the_date('d M Y', $post_id)
            . '</div>';
    }

    // ==========================
    // ITEM
    // ==========================
    if ($column === 'item') {

        $item_json = get_post_meta($post_id, 'item', true);

        if ($item_json) {
            $item = json_decode($item_json, true);

            $image = $item['image'] ?? '';
            $make  = $item['make'] ?? '';
            $model = $item['model'] ?? '';
            $year  = $item['year'] ?? '';
            $stock = $item['stock'] ?? '';
            $rego  = $item['rego'] ?? '';
            $status= $item['status'] ?? '';
            $tag   = $item['tag'] ?? '';
            $url   = $item['url'] ?? '';

            echo '<div style="display:flex;gap:10px;">';

            if ($image) {
                $proxy = site_url('/wp-json/custom/v1/image-proxy?url=' . urlencode($image));
                echo '<img src="' . esc_url($proxy) . '" style="width:70px;height:50px;border-radius:6px;object-fit:cover;" />';
            }

            echo '<div>';

            if ($url) {
                echo '<a href="' . esc_url($url) . '" target="_blank"><strong>' . esc_html("$make $model") . '</strong></a>';
            } else {
                echo '<strong>' . esc_html("$make $model") . '</strong>';
            }

            if ($status) {
                echo ' <span style="background:#28a745;color:#fff;padding:2px 8px;border-radius:10px;">' . esc_html($status) . '</span>';
            }

            if ($year || $stock || $rego) {
                echo '<br><small>' . esc_html("$year - $stock - $rego") . '</small>';
            }

            if ($tag) {
                echo '<br><span style="background:#6c757d;color:#fff;padding:3px 8px;border-radius:10px;font-size:11px;">' . esc_html($tag) . '</span>';
            }

            echo '</div></div>';
        }
    }

    // ==========================
    // DETAILS
    // ==========================
    if ($column === 'details') {

        $name   = get_the_title($post_id);
        $email  = get_post_meta($post_id, 'email', true);
        $phone  = get_post_meta($post_id, 'phone', true);
        $budget = get_post_meta($post_id, 'budget', true);
        $dob    = get_post_meta($post_id, 'dob', true);
        $licence= get_post_meta($post_id, 'driver_licence', true);
        $address= get_post_meta($post_id, 'address', true);
        $kms    = get_post_meta($post_id, 'kms', true);

        // ✅ NEW
        $preferredDate = get_post_meta($post_id, 'preferred_date', true);
        $preferredTime = get_post_meta($post_id, 'preferred_time', true);

        echo '<div>';
        echo '<strong>' . esc_html($name) . '</strong><br>';

        if ($email) echo esc_html($email) . '<br>';
        if ($phone) echo esc_html($phone) . '<br>';

        // ✅ SHOW PREFERRED DATE
        if ($preferredDate) {
            echo 'Preferred Date: ' . esc_html(date('d M Y', strtotime($preferredDate))) . '<br>';
        }

        // ✅ SHOW PREFERRED TIME
        if ($preferredTime) {
            echo 'Preferred Time: ' . esc_html($preferredTime) . '<br>';
        }

        // ✅ SHOW KMS
        if ($kms) {
            echo 'Kms: ' . number_format((int)$kms) . ' km<br>';
        }

        $clean = preg_replace('/[^0-9]/', '', $budget);
        if ($clean) {
            echo '<strong style="color:#28a745;">$' . number_format($clean) . '</strong><br>';
        }

        if ($dob) echo 'DOB: ' . esc_html($dob) . '<br>';
        if ($licence) echo 'Licence: ' . esc_html($licence) . '<br>';
        if ($address) echo 'Address: ' . esc_html($address);

        echo '</div>';
    }

    // ==========================
    // MESSAGE
    // ==========================
    if ($column === 'message') {
        echo esc_html(get_post_meta($post_id, 'message', true));
    }

}, 10, 2);


// ==============================
// 5. IMAGE PROXY
// ==============================
add_action('rest_api_init', function () {
    register_rest_route('custom/v1', '/image-proxy', [
        'methods' => 'GET',
        'callback' => function ($request) {

            $url = $request->get_param('url');
            if (!$url) return;

            $res = wp_remote_get($url);
            if (is_wp_error($res)) return;

            header("Content-Type: " . wp_remote_retrieve_header($res, 'content-type'));
            echo wp_remote_retrieve_body($res);
            exit;
        },
        'permission_callback' => '__return_true',
    ]);
});


// ==============================
// 6. META BOX
// ==============================
add_action('add_meta_boxes', function () {
    add_meta_box(
        'lead_details',
        'Lead Details',
        'render_lead_details_box',
        'leads',
        'normal',
        'high'
    );
});

function render_lead_details_box($post) {

    $fields = [
        'email' => 'Email',
        'phone' => 'Phone',
        'preferred_date' => 'Preferred Date', // ✅ NEW
        'preferred_time' => 'Preferred Time', // ✅ NEW
        'kms' => 'Kms',
        'budget' => 'Budget',
        'dob' => 'Date of Birth',
        'driver_licence' => 'Driver Licence',
        'address' => 'Address',
        'message' => 'Message',
    ];

    echo '<table style="width:100%;line-height:2;">';

    foreach ($fields as $key => $label) {

        $value = get_post_meta($post->ID, $key, true);

        if (empty($value)) continue;

        if ($key === 'budget') {
            $value = '$' . number_format((int)preg_replace('/[^0-9]/','',$value));
        }

        if ($key === 'kms') {
            $value = number_format((int)$value) . ' km';
        }

        // ✅ FORMAT DATES
        if ($key === 'dob' || $key === 'preferred_date') {
            $value = date('d M Y', strtotime($value));
        }

        echo "<tr><td><strong>$label:</strong></td><td>" . esc_html($value) . "</td></tr>";
    }

    echo '</table>';
}