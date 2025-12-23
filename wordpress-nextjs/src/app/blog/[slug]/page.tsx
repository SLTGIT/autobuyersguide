import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getPostBySlug, getPosts } from '@/lib/wordpress';
import { getMetadata } from '@/lib/wordpress/seo';

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

  return getMetadata(post);
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
    <div className="bg-white min-h-screen">
      <div className="container mx-auto py-12 px-4">
        <Link href="/blog" className="inline-flex items-center text-blue-600 font-bold mb-8 hover:gap-2 transition-all">
          ← Back to Blog
        </Link>
        
        <article className="max-w-4xl mx-auto">
          {/* Post Header */}
          <header className="mb-12 text-center">
            <h1 
              className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight"
              dangerouslySetInnerHTML={{ __html: post.title.rendered }}
            />
            
            <div className="flex flex-wrap items-center justify-center gap-6 text-gray-500 font-medium bg-gray-50 py-4 px-6 rounded-2xl">
              <div className="flex items-center gap-2">
                <span className="text-blue-600">👤</span>
                <span>{author?.name || 'Unknown'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-600">📅</span>
                <span>{formattedDate}</span>
              </div>
              {primaryCategory && (
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">📂</span>
                  <span>{primaryCategory.name}</span>
                </div>
              )}
            </div>
          </header>

          {/* Featured Image */}
          {featuredImage && (
            <div className="mb-12 rounded-3xl overflow-hidden shadow-2xl">
              <img 
                src={featuredImage.source_url} 
                alt={featuredImage.alt_text || post.title.rendered}
                className="w-full h-auto object-cover max-h-[600px]"
              />
            </div>
          )}

          {/* Post Content */}
          <div 
            className="prose prose-lg max-w-none prose-blue prose-headings:text-gray-900 prose-headings:font-bold prose-a:text-blue-600 prose-img:rounded-2xl"
            dangerouslySetInnerHTML={{ __html: post.content.rendered }}
          />

          {/* Author Section */}
          {author && (
            <div className="mt-16 p-8 bg-gray-50 rounded-3xl flex flex-col md:flex-row items-center gap-8 border border-gray-100">
              {author.avatar_urls?.['96'] && (
                <img 
                  src={author.avatar_urls['96']} 
                  alt={author.name} 
                  className="w-24 h-24 rounded-full shadow-lg border-4 border-white"
                />
              )}
              <div className="text-center md:text-left">
                <h3 className="text-xl font-bold text-gray-900 mb-2">About {author.name}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {author.description || 'Content creator and technical writer focusing on WordPress and modern web development technologies.'}
                </p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-16 pt-16 border-t border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Continue Reading</h3>
            <Link 
              href="/blog"
              className="inline-flex items-center text-blue-600 font-bold hover:gap-2 transition-all"
            >
              ← Back to Blog
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
