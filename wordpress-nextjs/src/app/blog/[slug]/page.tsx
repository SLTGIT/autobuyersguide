import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getPostBySlug, getPosts } from '@/lib/wordpress';

interface BlogPostProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: BlogPostProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: `${post.title.rendered} | Blog`,
    description: post.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 160),
  };
}

export default async function BlogPost({ params }: BlogPostProps) {
  const { slug } = await params;

  // Fetch the post from WordPress
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Extract embedded data
  const featuredImage = post._embedded?.['wp:featuredmedia']?.[0];
  const author = post._embedded?.author?.[0];
  const postCategories = post._embedded?.['wp:term']?.[0] || [];
  const primaryCategory = postCategories[0];

  // Format date
  const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        {/* Back Link */}
        <Link href="/blog" className="text-blue-600 hover:text-blue-700 mb-6 inline-block">
          ← Back to Blog
        </Link>

        {/* Article Header */}
        <article className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Featured Image */}
          {featuredImage && (
            <div className="w-full h-96 overflow-hidden">
              <img 
                src={featuredImage.source_url} 
                alt={featuredImage.alt_text || post.title.rendered}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-8">
            {/* Category and Date */}
            <div className="mb-6">
              {primaryCategory && (
                <span className="text-sm text-blue-600 font-semibold">
                  {primaryCategory.name}
                </span>
              )}
              <h1 
                className="text-4xl font-bold mt-2 mb-4 text-gray-800"
                dangerouslySetInnerHTML={{ __html: post.title.rendered }}
              />
              <div className="flex items-center text-gray-600 text-sm">
                {author && (
                  <>
                    <span>By {author.name}</span>
                    <span className="mx-2">•</span>
                  </>
                )}
                <time>{formattedDate}</time>
              </div>
            </div>

            {/* Article Content */}
            <div
              className="prose prose-lg max-w-none prose-headings:text-gray-800 prose-p:text-gray-600 prose-a:text-blue-600 prose-strong:text-gray-800 prose-img:rounded-lg"
              dangerouslySetInnerHTML={{ __html: post.content.rendered }}
            />

            {/* Tags */}
            {postCategories.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Categories:</h3>
                <div className="flex flex-wrap gap-2">
                  {postCategories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/blog?category=${category.id}`}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Author Info */}
            {author && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-4">
                  {author.avatar_urls?.['96'] && (
                    <img 
                      src={author.avatar_urls['96']} 
                      alt={author.name}
                      className="w-16 h-16 rounded-full"
                    />
                  )}
                  <div>
                    <h3 className="font-bold text-gray-800">{author.name}</h3>
                    {author.description && (
                      <p className="text-gray-600 text-sm mt-1">{author.description}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </article>

        {/* Related Posts */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Continue Reading</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/blog" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold mb-2 text-gray-800">View All Posts</h3>
              <p className="text-gray-600">Explore more articles and tutorials</p>
            </Link>
            <Link href="/" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold mb-2 text-gray-800">Back to Home</h3>
              <p className="text-gray-600">Return to the homepage</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
