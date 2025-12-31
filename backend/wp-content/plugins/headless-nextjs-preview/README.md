# Headless Next.js Preview

A WordPress plugin that seamlessly redirects admin preview and view buttons to your Next.js frontend in a headless WordPress setup.

## Features

- ✅ Redirects "Preview" button to Next.js frontend with draft mode
- ✅ Redirects "View" button to Next.js frontend for published content
- ✅ Supports Posts, Pages, and custom post types (including Vehicles)
- ✅ Secure preview authentication with secret key
- ✅ Easy configuration via WordPress admin settings
- ✅ Admin bar integration for quick frontend preview
- ✅ Customizable post type support

## Installation

1. **Upload the plugin:**
   - Copy the `headless-nextjs-preview` folder to `wp-content/plugins/`
   - Or upload as a ZIP file via WordPress admin

2. **Activate the plugin:**
   - Go to WordPress admin → Plugins
   - Find "Headless Next.js Preview"
   - Click "Activate"

3. **Configure settings:**
   - Go to Settings → Headless Preview
   - Enter your Next.js frontend URL
   - Copy the generated preview secret
   - Select which post types to enable
   - Save settings

## Configuration

### WordPress Settings

Navigate to **Settings → Headless Preview** in your WordPress admin:

- **Next.js Frontend URL**: Your Next.js application URL (e.g., `http://localhost:3000` or `https://yourdomain.com`)
- **Preview Secret**: Auto-generated secret key for authentication (copy this to your Next.js `.env` file)
- **Enabled Post Types**: Select which post types should redirect to Next.js

### Next.js Setup

1. **Add environment variable:**
   
   Add to your `.env` or `.env.local` file:
   ```env
   WORDPRESS_PREVIEW_SECRET=your-secret-from-wordpress-settings
   ```

2. **Create preview API route:**
   
   The plugin expects a preview API endpoint at `/api/preview` in your Next.js app (implementation provided separately).

3. **Restart your Next.js server:**
   ```bash
   npm run dev
   ```

## How It Works

### Preview Flow

1. User clicks "Preview" in WordPress admin
2. Plugin generates a secure preview URL: `/api/preview?secret=xxx&type=post&slug=my-post&id=123`
3. Next.js preview API validates the secret
4. Next.js enables draft mode and redirects to the appropriate page
5. User sees the draft content on the frontend

### View Flow

1. User clicks "View" on published content
2. Plugin redirects directly to the Next.js frontend URL
3. User sees the published content

## URL Structure

The plugin generates URLs based on post type:

- **Posts**: `{nextjs_url}/blog/{slug}`
- **Pages**: `{nextjs_url}/{slug}`
- **Vehicles**: `{nextjs_url}/vehicles/{slug}`
- **Custom Post Types**: `{nextjs_url}/{post-type}/{slug}`

## Supported Post Types

By default, the plugin supports:
- Posts
- Pages
- Vehicles (custom post type)

You can enable/disable any public post type via the settings page.

## Requirements

- WordPress 5.0 or higher
- PHP 7.4 or higher
- Next.js frontend with preview API route
- HTTPS recommended for production

## Troubleshooting

### Preview not working

1. **Check preview secret**: Ensure the secret in WordPress matches your Next.js `.env` file
2. **Verify Next.js URL**: Make sure the URL in settings is correct and accessible
3. **Check Next.js preview API**: Ensure `/api/preview` route exists and is working
4. **Restart Next.js**: After changing environment variables, restart your dev server

### View button not redirecting

1. **Check post status**: Only published content uses the view URL
2. **Verify post type is enabled**: Check Settings → Headless Preview
3. **Clear WordPress cache**: If using a caching plugin, clear the cache

### 401 Unauthorized errors

- The preview secret doesn't match between WordPress and Next.js
- Update the secret in both places and restart Next.js

## Security

- Preview secret is auto-generated with cryptographically secure random bytes
- Secret is required for all preview requests
- Only authenticated WordPress users can access preview URLs
- HTTPS strongly recommended for production environments

## Development

### File Structure

```
headless-nextjs-preview/
├── headless-nextjs-preview.php    # Main plugin file
├── includes/
│   ├── class-preview-handler.php  # URL generation logic
│   └── class-settings.php         # Admin settings page
├── assets/
│   └── admin-styles.css          # Admin UI styles
└── README.md                      # This file
```

### Hooks and Filters

The plugin uses the following WordPress filters:

- `preview_post_link` - Modify preview URLs
- `post_link` - Modify post URLs
- `page_link` - Modify page URLs
- `post_type_link` - Modify custom post type URLs

## Changelog

### 1.0.0
- Initial release
- Support for Posts, Pages, and custom post types
- Admin settings page
- Secure preview authentication
- Admin bar integration

## License

GPL v2 or later

## Support

For issues and feature requests, please contact your development team.

## Credits

Developed for headless WordPress + Next.js architecture.
