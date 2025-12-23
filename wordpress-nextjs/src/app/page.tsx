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
        <div className="container mx-auto py-12 px-4">
            {/* API Error Notice */}
            {apiError && (
                <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 text-sm">
                        <strong>Note:</strong> Unable to connect to WordPress API. Please check your configuration in <code className="bg-yellow-100 px-2 py-1 rounded">.env</code> file.
                    </p>
                </div>
            )}

            {/* Hero Section */}
            <section className="py-20 bg-gray-50 text-center rounded-3xl mb-12">
                <h1 className="text-5xl font-extrabold text-blue-900 mb-6">
                    Welcome to {siteTitle}
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
                    {siteDescription}
                </p>
                <div className="flex justify-center gap-4">
                    <Link
                        href="/blog"
                        className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        View Blog
                    </Link>
                    <Link
                        href="/about"
                        className="px-8 py-3 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Learn More
                    </Link>
                </div>
            </section>

            {/* Recent Posts Section */}
            {recentPosts.length > 0 && (
                <section className="mb-16">
                    <h2 className="text-3xl font-bold text-gray-800 mb-8 border-l-4 border-blue-600 pl-4">
                        Latest Posts
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {recentPosts.map((post) => (
                            <div key={post.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                                {post._embedded?.['wp:featuredmedia']?.[0]?.source_url && (
                                    <div className="h-48 overflow-hidden">
                                        <img 
                                            src={post._embedded['wp:featuredmedia'][0].source_url} 
                                            alt={post.title.rendered}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                                        <Link href={`/blog/${post.slug}`} className="hover:text-blue-600 transition-colors">
                                            <span dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                                        </Link>
                                    </h3>
                                    <div 
                                        className="text-gray-600 text-sm mb-4 line-clamp-3"
                                        dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                                    />
                                    <Link
                                        href={`/blog/${post.slug}`}
                                        className="text-blue-600 font-semibold hover:underline"
                                    >
                                        Read More →
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="text-center mt-8">
                        <Link
                            href="/blog"
                            className="text-blue-600 font-semibold hover:underline"
                        >
                            View All Posts →
                        </Link>
                    </div>
                </section>
            )}

            {/* Features Section */}
            <section className="mb-16">
                <h2 className="text-3xl font-bold text-gray-800 mb-8 border-l-4 border-blue-600 pl-4">
                    Features
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="p-8 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                        <span className="text-4xl mb-4 block">⚡</span>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Fast Performance</h3>
                        <p className="text-gray-600">
                            Built with Next.js for optimal performance and SEO with server-side
                            rendering and static generation.
                        </p>
                    </div>
                    <div className="p-8 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                        <span className="text-4xl mb-4 block">🔌</span>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">WordPress API</h3>
                        <p className="text-gray-600">
                            Full integration with WordPress REST API for posts, pages, users,
                            menus, and more.
                        </p>
                    </div>
                    <div className="p-8 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                        <span className="text-4xl mb-4 block">📱</span>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Responsive Design</h3>
                        <p className="text-gray-600">
                            Mobile-first design with Tailwind CSS ensuring great experience on
                            all devices.
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-blue-900 text-white text-center rounded-3xl px-4">
                <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
                <p className="text-blue-100 mb-8 max-w-xl mx-auto">
                    Configure your WordPress API endpoint and start building amazing things.
                </p>
                <Link
                    href="/contact"
                    className="px-8 py-3 bg-white text-blue-900 font-bold rounded-lg hover:bg-blue-50 transition-colors"
                >
                    Contact Us
                </Link>
            </section>
        </div>
    );
}
