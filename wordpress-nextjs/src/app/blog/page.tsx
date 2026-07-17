import type { Metadata } from 'next';
import Link from 'next/link';
import { getPosts, getCategories } from '@/lib/wordpress';
import type { WPPost, WPCategory } from '@/types/wordpress';

export const metadata: Metadata = {
    title: 'Blog | WordPress Next.js',
    description: 'Read our latest blog posts',
};

interface BlogPageProps {
    searchParams: Promise<{
        page?: string;
        category?: string;
    }>;
}

export default async function Blog({ searchParams }: BlogPageProps) {
    const params = await searchParams;
    const currentPage = parseInt(params.page || '1');
    const categoryFilter = params.category ? parseInt(params.category) : undefined;
    const postsPerPage = 9;

    // Fetch posts and categories from WordPress
    let posts: WPPost[] = [];
    let categories: WPCategory[] = [];
    let apiError = false;

    try {
        [posts, categories] = await Promise.all([
            getPosts({
                per_page: postsPerPage,
                page: currentPage,
                categories: categoryFilter ? [categoryFilter] : undefined,
                orderby: 'date',
                order: 'desc'
            }),
            getCategories({ per_page: 100 })
        ]);
    } catch (error) {
        console.error('Error fetching WordPress data:', error);
        apiError = true;
    }

    // Calculate pagination
    const hasNextPage = posts.length === postsPerPage;
    const hasPrevPage = currentPage > 1;

    return (
        <div className="container mx-auto py-12 px-4">
            {/* Page Header */}
            <div className="text-center py-12 bg-gray-50 rounded-3xl mb-12">
                <h1 className="text-4xl md:text-5xl font-extrabold text-blue-900 mb-4" dangerouslySetInnerHTML={{ __html: 'Blog' }} />
                <p className="text-gray-600 max-w-2xl mx-auto">Insights, tutorials, and updates from our team</p>
            </div>

            {/* API Error Notice */}
            {apiError && (
                <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg max-w-4xl mx-auto">
                    <p className="text-yellow-800 text-sm">
                        <strong>Note:</strong> Unable to connect to WordPress API. Please check your configuration in <code className="bg-yellow-100 px-2 py-1 rounded">.env</code> file.
                    </p>
                </div>
            )}

            {/* Category Filter */}
            {categories.length > 0 && (
                <div className="flex flex-wrap justify-center gap-4 mb-12">
                    <Link
                        href="/blog"
                        className={`px-6 py-2 rounded-full border transition-colors ${!categoryFilter ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-600'}`}
                    >
                        All
                    </Link>
                    {categories.map((category) => (
                        <Link
                            key={category.id}
                            href={`/blog?category=${category.id}`}
                            className={`px-6 py-2 rounded-full border transition-colors ${categoryFilter === category.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-600'}`}
                        >
                            {category.name} ({category.count})
                        </Link>
                    ))}
                </div>
            )}

            {/* Blog Posts Grid */}
            <div className="max-w-7xl mx-auto">
                {posts.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {posts.map((post) => {
                                const featuredImage = post._embedded?.['wp:featuredmedia']?.[0]?.source_url;
                                const author = post._embedded?.author?.[0]?.name || 'Unknown';
                                const postCategories = post._embedded?.['wp:term']?.[0] || [];
                                const primaryCategory = postCategories[0]?.name || 'Uncategorized';
                                const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                });

                                return (
                                    <article key={post.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col h-full group">
                                        {featuredImage && (
                                            <div className="h-56 overflow-hidden">
                                                <img 
                                                    src={featuredImage} 
                                                    alt={post.title.rendered}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            </div>
                                        )}
                                        <div className="p-8 flex-grow flex flex-col">
                                            <div className="flex items-center gap-4 text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">
                                                <span className="text-blue-600">{primaryCategory}</span>
                                                <span>•</span>
                                                <span>{formattedDate}</span>
                                            </div>
                                            <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                                                <Link href={`/blog/${post.slug}`}>
                                                    <span dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                                                </Link>
                                            </h2>
                                            <div 
                                                className="text-gray-600 text-sm mb-6 line-clamp-3 flex-grow"
                                                dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                                            />
                                            <div className="flex items-center justify-between pt-6 border-t border-gray-50 mt-auto">
                                                <span className="text-sm text-gray-500 italic">By {author}</span>
                                                <Link
                                                    href={`/blog/${post.slug}`}
                                                    className="text-blue-600 font-bold hover:text-blue-800 transition-colors"
                                                >
                                                    Read More →
                                                </Link>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {(hasNextPage || hasPrevPage) && (
                            <div className="flex justify-center items-center gap-2 mt-12">
                                {hasPrevPage && (
                                    <Link
                                        href={`/blog?page=${currentPage - 1}${categoryFilter ? `&category=${categoryFilter}` : ''}`}
                                        className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium"
                                    >
                                        Previous
                                    </Link>
                                )}
                                <span className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold">
                                    {currentPage}
                                </span>
                                {hasNextPage && (
                                    <Link
                                        href={`/blog?page=${currentPage + 1}${categoryFilter ? `&category=${categoryFilter}` : ''}`}
                                        className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium"
                                    >
                                        Next
                                    </Link>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-600 text-lg">No posts found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
