# Quick Start Guide

## Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure WordPress API
Edit `.env.local` and replace with your WordPress site URL:

```env
NEXT_PUBLIC_WORDPRESS_API_URL=https://your-wordpress-site.com/wp-json/wp/v2
WORDPRESS_API_URL=https://your-wordpress-site.com/wp-json/wp/v2
```

### 3. Run Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Project Features

### Pages Created
- **/** - Home page with features section
- **/about** - About page with technology stack info
- **/blog** - Blog listing page (currently with dummy data)
- **/blog/[slug]** - Dynamic blog post pages
- **/contact** - Contact form page

### WordPress API Integration

All WordPress REST API functions are available in `src/lib/wordpress/api.ts`:

#### Example: Display Real Posts

```typescript
// In your page component (src/app/blog/page.tsx)
import { getPosts } from '@/lib/wordpress';

export default async function Blog() {
  const posts = await getPosts({ per_page: 10 });

  return (
    <div>
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.title.rendered}</h2>
          <div dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }} />
        </article>
      ))}
    </div>
  );
}
```

#### Available API Functions

**Posts:**
- `getPosts()` - Get all posts with filters
- `getPostBySlug(slug)` - Get post by slug
- `getPostById(id)` - Get post by ID

**Pages:**
- `getPages()` - Get all pages
- `getPageBySlug(slug)` - Get page by slug
- `getPageById(id)` - Get page by ID

**Users:**
- `getUsers()` - Get all users
- `getUserById(id)` - Get user by ID
- `getUserBySlug(slug)` - Get user by slug

**Categories & Tags:**
- `getCategories()` - Get all categories
- `getTags()` - Get all tags
- `getCategoryBySlug(slug)` - Get category by slug
- `getTagBySlug(slug)` - Get tag by slug

**Media:**
- `getMedia()` - Get all media
- `getMediaById(id)` - Get media by ID

**Search:**
- `searchContent(query, type)` - Search posts/pages

## File Structure

```
wordpress-nextjs/
├── src/
│   ├── app/              # Next.js pages (App Router)
│   ├── components/       # Reusable components
│   │   └── layout/       # Header, Footer, Layout
│   ├── lib/
│   │   └── wordpress/    # WordPress API utilities
│   ├── types/            # TypeScript type definitions
│   └── styles/           # Global styles
├── .env.local            # Environment variables
└── README.md             # Full documentation
```

## Next Steps

1. **Configure your WordPress site URL** in `.env.local`
2. **Replace dummy data** in blog pages with real WordPress API calls
3. **Customize components** in `src/components/`
4. **Add more pages** as needed in `src/app/`
5. **Style your site** using Tailwind CSS classes

## Build for Production

```bash
npm run build
npm start
```

## Troubleshooting

### WordPress CORS Issues
If you encounter CORS errors, add this to your WordPress `functions.php`:

```php
function add_cors_http_header(){
    header("Access-Control-Allow-Origin: *");
}
add_action('init','add_cors_http_header');
```

### Menu Support
To use WordPress menus, install the "WP REST API Menus" plugin on your WordPress site.

## Resources

- [Full README](./README.md)
- [Next.js Docs](https://nextjs.org/docs)
- [WordPress REST API](https://developer.wordpress.org/rest-api/)
- [Tailwind CSS](https://tailwindcss.com/docs)
