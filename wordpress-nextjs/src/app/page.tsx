import Link from 'next/link';
import { getPosts, getSiteSettings } from '@/lib/wordpress';
import type { WPPost } from '@/types/wordpress';

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
        <div className="container mx-auto px-4 py-12">
            {/* API Error Notice */}
            {apiError && (
                <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 text-sm">
                        <strong>Note:</strong> Unable to connect to WordPress API. Please check your configuration in <code className="bg-yellow-100 px-2 py-1 rounded">.env</code> file.
                    </p>
                </div>
            )}

            {/* Hero Section */}
            <section className="text-center mb-16">
                <h1 className="text-5xl font-bold mb-6 text-gray-800">
                    Welcome to {siteTitle}
                </h1>
                <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                    {siteDescription}
                </p>
                <div className="flex gap-4 justify-center">
                    <Link
                        href="/blog"
                        className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        View Blog
                    </Link>
                    <Link
                        href="/about"
                        className="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Learn More
                    </Link>
                </div>
            </section>

            {/* Recent Posts Section */}
            {recentPosts.length > 0 && (
                <section className="mb-16">
                    <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
                        Latest Posts
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {recentPosts.map((post) => {
                            const featuredImage = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
                            const author = post._embedded?.author?.[0]?.name || 'Unknown';
                            
                            return (
                                <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                                    {featuredImage && (
                                        <div className="h-48 overflow-hidden">
                                            <img 
                                                src={featuredImage} 
                                                alt={post.title.rendered}
                                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>
                                    )}
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold mb-2 text-gray-800 hover:text-blue-600 transition-colors">
                                            <Link href={`/blog/${post.slug}`}>
                                                <span dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                                            </Link>
                                        </h3>
                                        <div 
                                            className="text-gray-600 mb-4 line-clamp-3"
                                            dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                                        />
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500">By {author}</span>
                                            <Link
                                                href={`/blog/${post.slug}`}
                                                className="text-blue-600 hover:text-blue-700 font-semibold"
                                            >
                                                Read More →
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                    <div className="text-center mt-8">
                        <Link
                            href="/blog"
                            className="text-blue-600 hover:text-blue-700 font-semibold"
                        >
                            View All Posts →
                        </Link>
                    </div>
                </section>
            )}

            {/* Features Section */}
            <section className="mb-16">
                <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
                    Features
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="text-4xl mb-4">⚡</div>
                        <h3 className="text-xl font-bold mb-2 text-gray-800">Fast Performance</h3>
                        <p className="text-gray-600">
                            Built with Next.js for optimal performance and SEO with server-side
                            rendering and static generation.
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="text-4xl mb-4">🔌</div>
                        <h3 className="text-xl font-bold mb-2 text-gray-800">WordPress API</h3>
                        <p className="text-gray-600">
                            Full integration with WordPress REST API for posts, pages, users,
                            menus, and more.
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="text-4xl mb-4">📱</div>
                        <h3 className="text-xl font-bold mb-2 text-gray-800">Responsive Design</h3>
                        <p className="text-gray-600">
                            Mobile-first design with Tailwind CSS ensuring great experience on
                            all devices.
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="bg-blue-600 text-white rounded-lg p-12 text-center">
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
                <p className="text-xl mb-8">
                    Configure your WordPress API endpoint and start building amazing things.
                </p>
                <Link
                    href="/contact"
                    className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors inline-block"
                >
                    Contact Us
                </Link>
            </section>
        </div>
    );
}
