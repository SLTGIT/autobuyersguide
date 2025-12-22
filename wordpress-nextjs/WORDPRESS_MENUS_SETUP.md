# WordPress Menu Setup Guide

This guide explains how to set up menus in WordPress to control your Next.js navigation dynamically.

## Overview

Your Next.js application now fetches navigation menus from WordPress:
- **Header Menu**: Primary navigation menu
- **Footer Menu**: Footer navigation menu

If menus aren't configured, the app will automatically fall back to using your WordPress pages.

## Setting Up Menus in WordPress

### Step 1: Install WP REST API Menus Plugin

The easiest way to expose menus via REST API is to install a plugin:

1. Log into WordPress Admin (`http://localhost/backend/wp-admin`)
2. Go to **Plugins → Add New**
3. Search for **"WP REST API Menus"**
4. Install and activate the plugin

**Plugin Link**: https://wordpress.org/plugins/wp-rest-api-v2-menus/

### Step 2: Create Menu Locations

1. Go to **Appearance → Menus**
2. Create a new menu called **"Primary Menu"**
3. Add pages/links to your menu:
   - Home
   - About
   - Blog
   - Contact
   - Any custom links

4. Under **Menu Settings**, check **"Primary"** location
5. Click **Save Menu**

6. Create another menu called **"Footer Menu"**
7. Add footer links
8. Under **Menu Settings**, check **"Footer"** location
9. Click **Save Menu**

### Step 3: Register Menu Locations (if needed)

If your theme doesn't have menu locations, add this to your theme's `functions.php`:

```php
function register_my_menus() {
    register_nav_menus(
        array(
            'primary' => __( 'Primary Menu' ),
            'footer' => __( 'Footer Menu' )
        )
    );
}
add_action( 'init', 'register_my_menus' );
```

## Alternative: Custom REST API Endpoint

If you don't want to use a plugin, add this to your theme's `functions.php`:

```php
// Add custom REST API endpoint for menus
add_action('rest_api_init', function () {
    register_rest_route('menus/v1', '/locations/(?P<location>[a-zA-Z0-9_-]+)', array(
        'methods' => 'GET',
        'callback' => 'get_menu_by_location',
        'permission_callback' => '__return_true'
    ));
});

function get_menu_by_location($request) {
    $location = $request['location'];
    $locations = get_nav_menu_locations();
    
    if (!isset($locations[$location])) {
        return new WP_Error('no_menu', 'No menu found at this location', array('status' => 404));
    }
    
    $menu_id = $locations[$location];
    $menu_items = wp_get_nav_menu_items($menu_id);
    
    if (!$menu_items) {
        return new WP_Error('no_items', 'No menu items found', array('status' => 404));
    }
    
    $menu_data = array(
        'ID' => $menu_id,
        'name' => wp_get_nav_menu_object($menu_id)->name,
        'items' => array()
    );
    
    foreach ($menu_items as $item) {
        $menu_data['items'][] = array(
            'ID' => $item->ID,
            'title' => $item->title,
            'url' => $item->url,
            'target' => $item->target,
            'parent' => $item->menu_item_parent,
            'order' => $item->menu_order
        );
    }
    
    return $menu_data;
}
```

## Testing Your Menus

### Test the API Endpoint

Visit these URLs in your browser:

- **Primary Menu**: `http://localhost/backend/wp-json/menus/v1/locations/primary`
- **Footer Menu**: `http://localhost/backend/wp-json/menus/v1/locations/footer`

You should see JSON data with your menu items.

### Test in Next.js

1. Restart your Next.js dev server
2. Visit `http://localhost:3000`
3. Your header should now show the menu items from WordPress
4. The footer should show the footer menu items

## Menu Features

### What's Supported

✅ **Internal Links**: Links to pages within your site
✅ **External Links**: Links to external websites (open in new tab)
✅ **Custom Links**: Any custom URL
✅ **Page Links**: Automatic links to WordPress pages
✅ **Post Links**: Links to blog posts
✅ **Category Links**: Links to category archives

### Menu Item Properties

Each menu item includes:
- `ID`: Unique identifier
- `title`: Display text
- `url`: Link URL
- `target`: Open in new window (_blank) or same window
- `parent`: Parent menu item (for submenus)
- `order`: Display order

## Dynamic Page Content

### About Page

Create a page in WordPress with slug **"about"**:

1. Go to **Pages → Add New**
2. Title: "About Us"
3. Add your content
4. In the **Permalink** section, make sure the slug is **"about"**
5. Click **Publish**

The content will automatically appear on `/about` in your Next.js app!

### Contact Page

Create a page with slug **"contact"**:

1. Go to **Pages → Add New**
2. Title: "Contact"
3. Add contact information or additional content
4. Set slug to **"contact"**
5. Click **Publish**

## Fallback Behavior

If menus aren't configured, the app will:

1. **Header**: Show all published pages + Home + Blog
2. **Footer**: Show first 4 published pages + Home

This ensures your site always has navigation, even without menu configuration.

## Troubleshooting

### Menus Not Showing

1. **Check plugin is installed**: Go to Plugins → Installed Plugins
2. **Verify menu location**: Go to Appearance → Menus, check location is assigned
3. **Test API endpoint**: Visit the menu API URL directly
4. **Check console**: Look for errors in browser console
5. **Clear cache**: Restart Next.js dev server

### Menu Items Not Clickable

- Make sure URLs are correct
- Check for JavaScript errors in console
- Verify menu items have both `title` and `url`

### External Links Not Opening

- Set **Target** to "Open in new tab" in WordPress menu editor
- The app automatically handles external links

## Advanced: Nested Menus (Submenus)

To create dropdown menus:

1. In WordPress menu editor, drag menu items to the right to nest them
2. The `parent` field will indicate the parent item
3. You'll need to update the Next.js components to render nested menus

## Site Title and Description

The header and footer automatically use:
- **Site Title**: From WordPress Settings → General → Site Title
- **Site Description**: From WordPress Settings → General → Tagline

Update these in WordPress to change them across your Next.js site!

## Next Steps

1. ✅ Install WP REST API Menus plugin
2. ✅ Create Primary and Footer menus
3. ✅ Add menu items
4. ✅ Assign menu locations
5. ✅ Test API endpoints
6. ✅ Restart Next.js server
7. ✅ Verify menus appear correctly

Your WordPress-powered navigation is now complete! 🎉
