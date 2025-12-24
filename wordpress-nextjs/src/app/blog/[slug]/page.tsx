import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getPostBySlug } from '@/lib/wordpress';
import { getMetadata } from '@/lib/wordpress/seo';

interface BlogPostProps {
  params: Promise<{
    slug: string;
  }>;
}

/* SEO Metadata */
export async function generateMetadata({
  params,
}: BlogPostProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return { title: 'Post Not Found' };
  }

  return getMetadata(post);
}

export default async function BlogPost({ params }: BlogPostProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const featuredImage = post._embedded?.['wp:featuredmedia']?.[0];
  const author = post._embedded?.author?.[0];
  const postCategories = post._embedded?.['wp:term']?.[0] || [];
  const primaryCategory = postCategories[0];

  const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="bg-white min-vh-100">
      <div className="container py-5">
        {/* Back Link */}
        <Link
          href="/blog"
          className="d-inline-flex align-items-center fw-bold text-primary mb-4 text-decoration-none"
        >
          ← Back to Blog
        </Link>

        <article className="mx-auto" style={{ maxWidth: '900px' }}>
          {/* Header */}
          <header className="mb-5 text-center">
            <h1
              className="display-5 fw-bold text-dark mb-4"
              dangerouslySetInnerHTML={{ __html: post.title.rendered }}
            />

            <div className="d-flex flex-wrap justify-content-center gap-4 bg-light py-3 px-4 rounded-3 text-muted fw-medium">
              <div className="d-flex align-items-center gap-2">
                <span className="text-primary">👤</span>
                <span>{author?.name || 'Unknown'}</span>
              </div>

              <div className="d-flex align-items-center gap-2">
                <span className="text-primary">📅</span>
                <span>{formattedDate}</span>
              </div>

              {primaryCategory && (
                <div className="d-flex align-items-center gap-2">
                  <span className="text-primary">📂</span>
                  <span>{primaryCategory.name}</span>
                </div>
              )}
            </div>
          </header>

          {/* Featured Image */}
          {featuredImage && (
            <div className="mb-5 rounded-4 overflow-hidden shadow">
              <img
                src={featuredImage.source_url}
                alt={featuredImage.alt_text || post.title.rendered}
                className="img-fluid w-100"
                style={{ maxHeight: 600, objectFit: 'cover' }}
              />
            </div>
          )}

          {/* Post Content */}
          <div
            className="fs-5 text-dark"
            style={{ lineHeight: 1.8 }}
            dangerouslySetInnerHTML={{ __html: post.content.rendered }}
          />

          {/* Author Box */}
          {author && (
            <div className="mt-5 p-4 bg-light rounded-4 border d-flex flex-column flex-md-row align-items-center gap-4">
              {author.avatar_urls?.['96'] && (
                <img
                  src={author.avatar_urls['96']}
                  alt={author.name}
                  className="rounded-circle border shadow"
                  width={96}
                  height={96}
                />
              )}

              <div className="text-center text-md-start">
                <h3 className="h5 fw-bold mb-2">
                  About {author.name}
                </h3>
                <p className="text-muted mb-0">
                  {author.description ||
                    'Content creator and technical writer focusing on WordPress and modern web development technologies.'}
                </p>
              </div>
            </div>
          )}

          {/* Footer Navigation */}
          <div className="mt-5 pt-5 border-top">
            <h3 className="h4 fw-bold mb-4">Continue Reading</h3>
            <Link
              href="/blog"
              className="d-inline-flex align-items-center fw-bold text-primary text-decoration-none"
            >
              ← Back to Blog
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
