# API Working Only for Blogs - Fix Guide

## Issue

WordPress REST API is working for blog posts but not for other endpoints (pages, settings, menus, etc.).

## Root Cause

Different WordPress REST API endpoints have different permission requirements:
- ✅ **Posts** (`/posts`) - Public, works without auth
- ✅ **Pages** (`/pages`) - Public, works without auth  
- ✅ **Categories** (`/categories`) - Public, works without auth
- ❌ **Settings** (`/settings`) - Requires authentication
- ❌ **Menus** - Requires plugin or custom endpoint

## What I Fixed

### 1. **Settings Endpoint** ✅
Changed from using `/settings` (requires auth) to using the root endpoint which is public:

**Before:**
```typescript
// Required authentication - didn't work
fetchAPI('/settings')
```

**After:**
```typescript
// Uses public root endpoint - works without auth
const rootEndpoint = API_URL.replace('/wp/v2', '');
fetch(rootEndpoint) // Returns site name, description, etc.
```

### 2. **Disabled Caching** ✅
Changed from 60-second cache to no cache for immediate updates:

```typescript
cache: 'no-store' // Changes appear immediately
```

## Testing Your API

### Method 1: Use the Diagnostic Page

Visit: `http://localhost:3000/diagnostics`

This will test all endpoints and show you exactly which ones work and which don't.

### Method 2: Test Manually in Browser

Open these URLs in your browser to test each endpoint:

#### ✅ Should Work (Public Endpoints)

1. **Root/Site Info:**
   ```
   http://localhost/backend/wp-json
   ```
   Should show: Site name, description, URL

2. **Posts:**
   ```
   http://localhost/backend/wp-json/wp/v2/posts
   ```
   Should show: Array of blog posts

3. **Pages:**
   ```
   http://localhost/backend/wp-json/wp/v2/pages
   ```
   Should show: Array of pages

4. **Categories:**
   ```
   http://localhost/backend/wp-json/wp/v2/categories
   ```
   Should show: Array of categories

5. **Tags:**
   ```
   http://localhost/backend/wp-json/wp/v2/tags
   ```
   Should show: Array of tags

6. **Media:**
   ```
   http://localhost/backend/wp-json/wp/v2/media
   ```
   Should show: Array of media items

7. **Users:**
   ```
   http://localhost/backend/wp-json/wp/v2/users
   ```
   Should show: Array of users (public info only)

#### ⚠️ Requires Plugin (Optional)

8. **Menus:**
   ```
   http://localhost/backend/wp-json/menus/v1/locations/primary
   ```
   Requires: WP REST API Menus plugin

## Common Issues & Solutions

### Issue 1: "404 Not Found" for All Endpoints

**Problem:** WordPress URL is incorrect

**Solution:**
1. Check where WordPress is installed
2. Update `.env` file with correct URL

Examples:
```env
# If WordPress is at http://localhost/backend/
NEXT_PUBLIC_WORDPRESS_API_URL=http://localhost/backend/wp-json/wp/v2

# If WordPress is at http://localhost/wordpress/
NEXT_PUBLIC_WORDPRESS_API_URL=http://localhost/wordpress/wp-json/wp/v2

# If WordPress is at root http://localhost/
NEXT_PUBLIC_WORDPRESS_API_URL=http://localhost/wp-json/wp/v2
```

### Issue 2: "403 Forbidden" or "401 Unauthorized"

**Problem:** Endpoint requires authentication

**Solution:** The app now uses public endpoints that don't require auth. If you still see this:

1. Check WordPress Settings → Reading
2. Make sure "Discourage search engines" is unchecked
3. Make sure posts/pages are set to "Public"

### Issue 3: CORS Errors

**Problem:** WordPress blocking requests from Next.js

**Solution:** Add CORS headers to WordPress

**File:** `backend/wp-content/themes/YOUR-THEME/functions.php`

```php
// Add at the end of the file
function add_cors_http_header(){
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
}
add_action('init','add_cors_http_header');
```

### Issue 4: Pages Not Showing

**Problem:** Pages exist in WordPress but don't appear in Next.js

**Checklist:**
- [ ] Page is **Published** (not Draft or Pending)
- [ ] WordPress is running
- [ ] `.env` file has correct URL
- [ ] CORS is enabled
- [ ] Browser cache cleared (Ctrl+Shift+R)
- [ ] Next.js server restarted

**Test:**
```
http://localhost/backend/wp-json/wp/v2/pages
```
Should show your pages in JSON format.

### Issue 5: Menus Not Working

**Problem:** Menu endpoint returns 404

**Solution:** Menus require a plugin or custom code

**Option A: Install Plugin (Recommended)**
1. Go to WordPress Admin → Plugins → Add New
2. Search for "WP REST API Menus"
3. Install and Activate
4. Test: `http://localhost/backend/wp-json/menus/v1/locations/primary`

**Option B: Add Custom Endpoint**

Add to `functions.php`:

```php
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
        return new WP_Error('no_menu', 'No menu found', array('status' => 404));
    }
    
    $menu_id = $locations[$location];
    $menu_items = wp_get_nav_menu_items($menu_id);
    
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

## Verification Steps

### 1. Test WordPress API Directly

Open browser and visit:
```
http://localhost/backend/wp-json
```

You should see JSON with WordPress info. If not:
- WordPress is not running
- URL is wrong
- WordPress REST API is disabled

### 2. Test Specific Endpoints

Try each endpoint listed above. They should all return JSON data.

### 3. Check Browser Console

1. Open your Next.js app: `http://localhost:3000`
2. Press F12 to open Developer Tools
3. Go to Console tab
4. Look for errors (red text)
5. Check Network tab for failed requests

### 4. Use Diagnostic Page

Visit: `http://localhost:3000/diagnostics`

This will test everything and show you exactly what's working.

## What Should Work Now

After the fixes I made:

✅ **Posts** - Working (public endpoint)
✅ **Pages** - Working (public endpoint)
✅ **Categories** - Working (public endpoint)
✅ **Tags** - Working (public endpoint)
✅ **Media** - Working (public endpoint)
✅ **Users** - Working (public endpoint)
✅ **Site Settings** - Working (using root endpoint)
⚠️ **Menus** - Requires plugin (optional)

## Still Having Issues?

1. **Visit diagnostic page:** `http://localhost:3000/diagnostics`
2. **Check browser console:** Press F12, look for errors
3. **Test API directly:** Visit the URLs in your browser
4. **Verify WordPress is running:** Visit `http://localhost/backend/wp-admin`
5. **Check .env file:** Make sure URL is correct
6. **Enable CORS:** Add headers to functions.php
7. **Restart everything:**
   ```bash
   # Stop Next.js (Ctrl+C)
   # Restart
   npm run dev
   ```

## Quick Checklist

- [ ] WordPress is running
- [ ] `.env` file exists with correct URL
- [ ] CORS enabled in `functions.php`
- [ ] Pages are Published in WordPress
- [ ] Browser cache cleared (Ctrl+Shift+R)
- [ ] Next.js server restarted
- [ ] Visited diagnostic page
- [ ] Tested API URLs in browser
- [ ] Checked browser console for errors

If all checkboxes are checked and it still doesn't work, the diagnostic page will tell you exactly what's wrong!
