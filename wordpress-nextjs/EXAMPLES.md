# WordPress API Integration Examples

## Example 1: Display Latest Posts

```typescript
// src/app/blog/page.tsx
import { getPosts } from '@/lib/wordpress';
import Link from 'next/link';

export default async function Blog() {
  // Fetch latest 10 posts from WordPress
  const posts = await getPosts({
    per_page: 10,
    orderby: 'date',
    order: 'desc'
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Blog</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <article key={post.id} className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-2">
              <Link href={`/blog/${post.slug}`}>
                {post.title.rendered}
              </Link>
            </h2>
            <div
              className="text-gray-600 mb-4"
              dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
            />
            <Link href={`/blog/${post.slug}`} className="text-blue-600">
              Read More →
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
```

## Example 2: Single Post Page with Author Info

```typescript
// src/app/blog/[slug]/page.tsx
import { getPostBySlug } from '@/lib/wordpress';
import { notFound } from 'next/navigation';
import Image from 'next/image';

interface BlogPostProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPost({ params }: BlogPostProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Get author from embedded data
  const author = post._embedded?.author?.[0];
  const featuredImage = post._embedded?['wp:featuredmedia']?.[0];

  return (
    <article className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Featured Image */}
        {featuredImage && (
          <Image
            src={featuredImage.source_url}
            alt={featuredImage.alt_text || post.title.rendered}
            width={1200}
            height={600}
            className="rounded-lg mb-8"
          />
        )}

        {/* Title */}
        <h1
          className="text-4xl font-bold mb-4"
          dangerouslySetInnerHTML={{ __html: post.title.rendered }}
        />

        {/* Author & Date */}
        {author && (
          <div className="flex items-center gap-4 mb-8 text-gray-600">
            {author.avatar_urls && (
              <Image
                src={author.avatar_urls['48']}
                alt={author.name}
                width={48}
                height={48}
                className="rounded-full"
              />
            )}
            <div>
              <p className="font-semibold">{author.name}</p>
              <time>{new Date(post.date).toLocaleDateString()}</time>
            </div>
          </div>
        )}

        {/* Content */}
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content.rendered }}
        />
      </div>
    </article>
  );
}
```

## Example 3: Display Posts by Category

```typescript
// src/app/category/[slug]/page.tsx
import { getCategoryBySlug, getPosts } from '@/lib/wordpress';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const posts = await getPosts({
    categories: [category.id],
    per_page: 20,
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-2">{category.name}</h1>
      {category.description && (
        <p className="text-gray-600 mb-8">{category.description}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {posts.map((post) => (
          <article key={post.id} className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-2">
              <Link href={`/blog/${post.slug}`}>
                {post.title.rendered}
              </Link>
            </h2>
            <div dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }} />
          </article>
        ))}
      </div>
    </div>
  );
}
```

## Example 4: Search Functionality

```typescript
// src/app/search/page.tsx
import { searchContent } from '@/lib/wordpress';
import Link from 'next/link';

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q || '';
  const results = query ? await searchContent(query, 'any') : [];

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-8">Search Results</h1>

      {query && (
        <p className="text-gray-600 mb-6">
          Found {results.length} results for "{query}"
        </p>
      )}

      <div className="space-y-6">
        {results.map((item) => (
          <article key={item.id} className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-2">
              <Link href={`/${item.type}/${item.slug}`}>
                {item.title.rendered}
              </Link>
            </h2>
            <div
              className="text-gray-600"
              dangerouslySetInnerHTML={{ __html: item.excerpt.rendered }}
            />
          </article>
        ))}
      </div>
    </div>
  );
}
```

## Example 5: Dynamic Page from WordPress

```typescript
// src/app/[slug]/page.tsx
import { getPageBySlug } from '@/lib/wordpress';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function DynamicPage({ params }: PageProps) {
  const { slug } = await params;
  const page = await getPageBySlug(slug);

  if (!page) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <article className="max-w-4xl mx-auto">
        <h1
          className="text-4xl font-bold mb-8"
          dangerouslySetInnerHTML={{ __html: page.title.rendered }}
        />
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: page.content.rendered }}
        />
      </article>
    </div>
  );
}
```

## Example 6: Categories Navigation Component

```typescript
// src/components/CategoriesNav.tsx
import { getCategories } from '@/lib/wordpress';
import Link from 'next/link';

export default async function CategoriesNav() {
  const categories = await getCategories({ per_page: 10 });

  return (
    <nav className="bg-gray-100 p-4 rounded-lg">
      <h3 className="font-bold mb-3">Categories</h3>
      <ul className="space-y-2">
        {categories.map((category) => (
          <li key={category.id}>
            <Link
              href={`/category/${category.slug}`}
              className="text-blue-600 hover:text-blue-800"
            >
              {category.name} ({category.count})
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

## Example 7: Recent Posts Widget

```typescript
// src/components/RecentPosts.tsx
import { getPosts } from '@/lib/wordpress';
import Link from 'next/link';

export default async function RecentPosts() {
  const posts = await getPosts({ per_page: 5 });

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-4">Recent Posts</h3>
      <ul className="space-y-3">
        {posts.map((post) => (
          <li key={post.id}>
            <Link
              href={`/blog/${post.slug}`}
              className="text-blue-600 hover:text-blue-800"
            >
              {post.title.rendered}
            </Link>
            <p className="text-sm text-gray-500">
              {new Date(post.date).toLocaleDateString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## TypeScript Types Usage

All WordPress entities have full TypeScript support:

```typescript
import { WPPost, WPPage, WPUser, WPCategory } from '@/types/wordpress';

// Type-safe function
async function getPostWithAuthor(slug: string): Promise<{
  post: WPPost;
  author: WPUser | null;
}> {
  const post = await getPostBySlug(slug);
  if (!post) {
    return { post: null, author: null };
  }

  const author = post._embedded?.author?.[0] || null;
  return { post, author };
}
```

## Error Handling

```typescript
import { getPosts } from '@/lib/wordpress';

export default async function BlogWithErrorHandling() {
  try {
    const posts = await getPosts({ per_page: 10 });

    return (
      <div>
        {posts.map(post => (
          <article key={post.id}>
            <h2>{post.title.rendered}</h2>
          </article>
        ))}
      </div>
    );
  } catch (error) {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded">
        <h2>Error loading posts</h2>
        <p>Please check your WordPress API configuration.</p>
      </div>
    );
  }
}
```

## Revalidation & Caching

The API functions include automatic revalidation every 60 seconds. Customize this in `src/lib/wordpress/api.ts`:

```typescript
const response = await fetch(url, {
  ...options,
  headers,
  next: { revalidate: 300 }, // Revalidate every 5 minutes
});
```

Or use on-demand revalidation:

```typescript
import { revalidatePath } from 'next/cache';

// In a server action or route handler
revalidatePath('/blog');
```
