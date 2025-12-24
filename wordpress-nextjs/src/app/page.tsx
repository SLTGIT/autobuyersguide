import Link from 'next/link';
import { Metadata } from 'next';
import { getPosts, getSiteSettings } from '@/lib/wordpress';
import type { WPPost } from '@/types/wordpress';

export async function generateMetadata(): Promise<Metadata> {
    const siteSettings = await getSiteSettings();
    return {
        title: siteSettings?.title || 'Home | Auto Buyers Guide',
        description: siteSettings?.description || 'A modern Next.js application powered by WordPress',
    };
}

export default async function Home() {
    // Fetch latest posts and site settings from WordPress
    let recentPosts: WPPost[] = [];
    let siteSettings: { title: string; description: string; url: string } | null = null;
    let apiError = false;

    try {
        [recentPosts, siteSettings] = await Promise.all([
            getPosts({ per_page: 3, orderby: 'date', order: 'desc' }),
            getSiteSettings()
        ]);
    } catch (error) {
        console.error('Error fetching WordPress data:', error);
        apiError = true;
    }

    const siteTitle = siteSettings?.title || 'WordPress Next.js';
    const siteDescription = siteSettings?.description || 'A scalable, modern web application built with Next.js, TypeScript, and WordPress REST API integration.';

    return (
        <div className="container py-5">
            {/* API Error Notice */}
            {apiError && (
                <div className="alert alert-warning mb-4" role="alert">
                    <p className="mb-0 small">
                        <strong>Note:</strong> Unable to connect to WordPress API. Please check your configuration in <code className="bg-light px-1 rounded">.env</code> file.
                    </p>
                </div>
            )}

            {/* Hero Section */}
            <section className="py-5 bg-light text-center rounded-5 mb-5">
                <h1 className="display-4 fw-bold text-primary mb-4">
                    Welcome to {siteTitle}
                </h1>
                <p className="lead text-muted mx-auto mb-5" style={{ maxWidth: '42rem' }}>
                    {siteDescription}
                </p>
                <div className="d-flex justify-center gap-3">
                    <Link
                        href="/blog"
                        className="btn btn-primary btn-lg"
                    >
                        View Blog
                    </Link>
                    <Link
                        href="/about"
                        className="btn btn-secondary btn-lg"
                    >
                        Learn More
                    </Link>
                </div>
            </section>

            {/* Recent Posts Section */}
            {recentPosts.length > 0 && (
                <section className="mb-5">
                    <h2 className="h2 fw-bold text-dark mb-4 border-start border-4 border-primary ps-3">
                        Latest Posts
                    </h2>
                    <div className="row g-4">
                        {recentPosts.map((post) => (
                            <div key={post.id} className="col-12 col-md-4">
                                <div className="card h-100 border-0 shadow-sm hover-shadow transition-all">
                                    {post._embedded?.['wp:featuredmedia']?.[0]?.source_url && (
                                        <div className="card-img-top overflow-hidden" style={{ height: '12rem' }}>
                                            <img 
                                                src={post._embedded['wp:featuredmedia'][0].source_url} 
                                                alt={post.title.rendered}
                                                className="w-100 h-100 object-fit-cover"
                                            />
                                        </div>
                                    )}
                                    <div className="card-body">
                                        <h3 className="card-title h5 fw-bold text-dark mb-2">
                                            <Link href={`/blog/${post.slug}`} className="text-decoration-none text-dark hover-text-primary transition-colors">
                                                <span dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                                            </Link>
                                        </h3>
                                        <div 
                                            className="card-text text-muted small mb-3"
                                            dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                                        />
                                        <Link
                                            href={`/blog/${post.slug}`}
                                            className="text-primary fw-semibold text-decoration-none"
                                        >
                                            Read More →
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="text-center mt-4">
                        <Link
                            href="/blog"
                            className="text-primary fw-semibold text-decoration-none"
                        >
                            View All Posts →
                        </Link>
                    </div>
                </section>
            )}

            {/* Features Section */}
            <section className="mb-5">
                <h2 className="h2 fw-bold text-dark mb-4 border-start border-4 border-primary ps-3">
                    Features
                </h2>
                <div className="row g-4">
                    <div className="col-12 col-md-4">
                        <div className="card h-100 p-4 border-light shadow-sm">
                            <span className="display-4 mb-3 d-block">⚡</span>
                            <h3 className="h4 fw-bold text-dark mb-3">Fast Performance</h3>
                            <p className="text-muted mb-0">
                                Built with Next.js for optimal performance and SEO with server-side
                                rendering and static generation.
                            </p>
                        </div>
                    </div>
                    <div className="col-12 col-md-4">
                         <div className="card h-100 p-4 border-light shadow-sm">
                            <span className="display-4 mb-3 d-block">🔌</span>
                            <h3 className="h4 fw-bold text-dark mb-3">WordPress API</h3>
                            <p className="text-muted mb-0">
                                Full integration with WordPress REST API for posts, pages, users,
                                menus, and more.
                            </p>
                        </div>
                    </div>
                    <div className="col-12 col-md-4">
                         <div className="card h-100 p-4 border-light shadow-sm">
                            <span className="display-4 mb-3 d-block">📱</span>
                            <h3 className="h4 fw-bold text-dark mb-3">Responsive Design</h3>
                            <p className="text-muted mb-0">
                                Mobile-first design with Bootstrap ensuring great experience on
                                all devices.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-5 bg-primary text-white text-center rounded-5 px-3">
                <h2 className="h2 fw-bold mb-3">Ready to Get Started?</h2>
                <p className="mb-4 mx-auto" style={{ maxWidth: '36rem' }}>
                    Configure your WordPress API endpoint and start building amazing things.
                </p>
                <Link
                    href="/contact"
                    className="btn btn-light btn-lg text-primary fw-bold"
                >
                    Contact Us
                </Link>
            </section>
        </div>
    );
}
