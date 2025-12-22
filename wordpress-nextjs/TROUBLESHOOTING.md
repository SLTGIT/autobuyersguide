# Troubleshooting Guide - Dynamic Content Not Updating

## Common Issues and Solutions

### Issue 1: New Pages Not Showing

#### Possible Causes:
1. **Next.js Cache** - Next.js caches data for 60 seconds by default
2. **WordPress URL Incorrect** - API URL in `.env` doesn't match WordPress installation
3. **CORS Not Enabled** - WordPress blocking requests from Next.js
4. **Page Not Published** - Page is still in draft status

#### Solutions:

##### 1. Check Your .env File

Make sure you have a `.env` file (NOT `.env.example`) in the `wordpress-nextjs` folder:

```env
NEXT_PUBLIC_WORDPRESS_API_URL=http://localhost/backend/wp-json/wp/v2
WORDPRESS_API_URL=http://localhost/backend/wp-json/wp/v2
```

**Important:** Adjust the URL based on where your WordPress is installed:
- If WordPress is at `http://localhost/backend/`, use the URL above
- If WordPress is at `http://localhost/wordpress/`, use `http://localhost/wordpress/wp-json/wp/v2`
- If WordPress is at root `http://localhost/`, use `http://localhost/wp-json/wp/v2`

##### 2. Verify WordPress API is Working

Open your browser and visit:
```
http://localhost/backend/wp-json/wp/v2/pages
```

You should see JSON data with your pages. If you get an error:
- WordPress is not running
- The URL is incorrect
- WordPress REST API is disabled

##### 3. Clear Next.js Cache and Restart

```bash
# Stop the dev server (Ctrl+C in terminal)
# Delete the .next folder
Remove-Item -Recurse -Force .next
# Restart
npm run dev
```

##### 4. Check Page Status in WordPress

1. Go to WordPress Admin → Pages → All Pages
2. Make sure your page status is **"Published"** (not Draft or Pending)
3. Note the **slug** of the page

##### 5. Enable CORS in WordPress

Add this to your WordPress theme's `functions.php` file:

**Location:** `backend/wp-content/themes/YOUR-THEME/functions.php`

```php
// Add at the end of the file
function add_cors_http_header(){
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
}
add_action('init','add_cors_http_header');
```

### Issue 2: Menus Not Showing

#### Solution:

1. **Install WP REST API Menus Plugin**
   - Go to WordPress Admin → Plugins → Add New
   - Search for "WP REST API Menus"
   - Install and Activate

2. **Create Menus**
   - Go to Appearance → Menus
   - Create a menu called "Primary Menu"
   - Add menu items
   - Assign to "Primary" location
   - Save

3. **Test Menu API**
   Visit: `http://localhost/backend/wp-json/menus/v1/locations/primary`

### Issue 3: Posts Not Updating

#### Solution:

1. **Clear Browser Cache**
   - Press Ctrl+Shift+R (hard refresh)
   - Or clear browser cache completely

2. **Restart Next.js**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

3. **Check Revalidation Time**
   
   The API has a 60-second cache. Edit `src/lib/wordpress/api.ts`:
   
   Find line 41:
   ```typescript
   next: { revalidate: 60 }, // Revalidate every 60 seconds
   ```
   
   Change to 0 for development (no cache):
   ```typescript
   next: { revalidate: 0 }, // No cache during development
   ```

### Issue 4: Images Not Loading

#### Solution:

1. **Set Featured Images**
   - Edit your post/page in WordPress
   - Set a "Featured Image" in the right sidebar
   - Update/Publish

2. **Check Image URLs**
   - Make sure images are uploaded to WordPress Media Library
   - Verify image URLs are accessible

### Diagnostic Page

Visit the diagnostic page to test your WordPress connection:

```
http://localhost:3000/diagnostics
```

This will show:
- ✓ API URL configuration
- ✓ Posts connection test
- ✓ Pages connection test
- ✓ Settings connection test
- ✓ Menu connection test
- ✓ Detailed error messages

### Quick Checklist

Run through this checklist:

- [ ] `.env` file exists (not `.env.example`)
- [ ] WordPress is running (`http://localhost/backend/wp-admin`)
- [ ] WordPress API works (`http://localhost/backend/wp-json/wp/v2/pages`)
- [ ] CORS is enabled in WordPress `functions.php`
- [ ] Pages are **Published** (not Draft)
- [ ] Next.js dev server is running
- [ ] Browser cache cleared (Ctrl+Shift+R)
- [ ] Checked browser console for errors (F12)

### Still Not Working?

1. **Check Browser Console**
   - Press F12 to open Developer Tools
   - Go to Console tab
   - Look for error messages
   - Share the errors for help

2. **Check Terminal Output**
   - Look at the terminal where `npm run dev` is running
   - Look for error messages
   - Share the errors for help

3. **Visit Diagnostic Page**
   - Go to `http://localhost:3000/diagnostics`
   - Check which tests fail
   - Read the error messages

### Common Error Messages

#### "WordPress API error: 404"
- WordPress URL is incorrect in `.env`
- WordPress is not running
- Check the URL in your browser first

#### "CORS policy: No 'Access-Control-Allow-Origin'"
- CORS not enabled in WordPress
- Add CORS headers to `functions.php`

#### "Failed to fetch"
- WordPress is not running
- URL is completely wrong
- Network/firewall blocking connection

### Development vs Production

For **development**, disable caching in `src/lib/wordpress/api.ts`:

```typescript
next: { revalidate: 0 }, // No cache
```

For **production**, use caching:

```typescript
next: { revalidate: 60 }, // Cache for 60 seconds
```

### Need More Help?

1. Visit the diagnostic page: `http://localhost:3000/diagnostics`
2. Check browser console (F12)
3. Check terminal output
4. Verify WordPress is accessible
5. Test API endpoints directly in browser
