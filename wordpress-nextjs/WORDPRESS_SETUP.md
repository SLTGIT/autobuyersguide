# WordPress REST API Configuration Guide

This guide will help you connect your Next.js frontend to your WordPress backend using the REST API.

## Quick Setup

### 1. Configure Environment Variables

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

### 2. Update Your WordPress API URL

Edit the `.env` file and update the WordPress API URL:

```env
# For local development (if WordPress is running locally)
NEXT_PUBLIC_WORDPRESS_API_URL=http://localhost/backend/wp-json/wp/v2
WORDPRESS_API_URL=http://localhost/backend/wp-json/wp/v2

# For production (replace with your actual domain)
# NEXT_PUBLIC_WORDPRESS_API_URL=https://yourdomain.com/wp-json/wp/v2
# WORDPRESS_API_URL=https://yourdomain.com/wp-json/wp/v2
```

### 3. Enable CORS in WordPress (if needed)

If you're running WordPress and Next.js on different domains/ports, you'll need to enable CORS.

Add this to your WordPress `wp-config.php` file (before the "That's all, stop editing!" line):

```php
// Enable CORS for headless WordPress
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
```

Or add this to your theme's `functions.php`:

```php
function add_cors_http_header(){
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
}
add_action('init','add_cors_http_header');
```

### 4. Test Your Connection

1. Make sure WordPress is running
2. Start your Next.js development server:
   ```bash
   npm run dev
   ```
3. Visit `http://localhost:3000` - you should see posts from your WordPress site

## WordPress Setup

### Create Sample Content

To see your site in action, create some content in WordPress:

1. **Posts**: Go to WordPress Admin → Posts → Add New
   - Create at least 3-5 posts
   - Add featured images for better visual appeal
   - Assign categories to posts

2. **Categories**: Go to Posts → Categories
   - Create some categories like "News", "Tutorials", "Updates"

3. **Pages**: Go to Pages → Add New
   - Create an "About" page
   - Create a "Contact" page

### Recommended WordPress Plugins

For enhanced functionality, consider installing these plugins:

1. **WP REST API Menus** - For menu endpoints
2. **Advanced Custom Fields (ACF)** - For custom fields (optional)
3. **Yoast SEO** - For enhanced SEO data (optional)

## API Endpoints

Your WordPress REST API provides these endpoints:

- **Posts**: `http://localhost/backend/wp-json/wp/v2/posts`
- **Pages**: `http://localhost/backend/wp-json/wp/v2/pages`
- **Categories**: `http://localhost/backend/wp-json/wp/v2/categories`
- **Tags**: `http://localhost/backend/wp-json/wp/v2/tags`
- **Users**: `http://localhost/backend/wp-json/wp/v2/users`
- **Media**: `http://localhost/backend/wp-json/wp/v2/media`

You can test these endpoints in your browser or using tools like Postman.

## Troubleshooting

### "Unable to connect to WordPress API" Error

If you see this error:

1. **Check WordPress is running**: Visit `http://localhost/backend/wp-admin`
2. **Verify API URL**: Visit `http://localhost/backend/wp-json/wp/v2/posts` in your browser
   - You should see JSON data
   - If you get a 404, check your WordPress installation
3. **Check .env file**: Make sure the URL in `.env` matches your WordPress installation
4. **CORS issues**: If WordPress and Next.js are on different domains, enable CORS (see above)

### No Posts Showing

1. **Create posts in WordPress**: Go to WordPress Admin → Posts → Add New
2. **Check post status**: Make sure posts are "Published", not "Draft"
3. **Clear Next.js cache**: Stop the dev server and delete `.next` folder, then restart

### Featured Images Not Showing

1. **Set featured images**: In WordPress post editor, set a "Featured Image"
2. **Check media permissions**: Make sure images are accessible
3. **Verify _embed parameter**: The API calls include `?_embed=1` to fetch featured media

## Authentication (Optional)

If you need to access private content or make authenticated requests:

1. Create an application password in WordPress:
   - Go to Users → Your Profile
   - Scroll to "Application Passwords"
   - Create a new password

2. Add credentials to `.env`:
   ```env
   WORDPRESS_AUTH_USERNAME=your_username
   WORDPRESS_AUTH_PASSWORD=your_application_password
   ```

## Production Deployment

When deploying to production:

1. Update `.env` with your production WordPress URL
2. Make sure your WordPress site is accessible from the internet
3. Configure proper CORS settings
4. Consider using ISR (Incremental Static Regeneration) for better performance

## Need Help?

- [WordPress REST API Handbook](https://developer.wordpress.org/rest-api/)
- [Next.js Documentation](https://nextjs.org/docs)
- Check the `EXAMPLES.md` file for code examples
