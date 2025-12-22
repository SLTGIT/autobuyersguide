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
        <div className="container mx-auto px-4 py-12">
            {/* Page Header */}
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4 text-gray-800">Blog</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Insights, tutorials, and updates from our team
                </p>
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
                <div className="max-w-6xl mx-auto mb-8">
                    <div className="flex flex-wrap gap-2 justify-center">
                        <Link
                            href="/blog"
                            className={`px-4 py-2 rounded-lg transition-colors ${
                                !categoryFilter
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                        >
                            All
                        </Link>
                        {categories.map((category) => (
                            <Link
                                key={category.id}
                                href={`/blog?category=${category.id}`}
                                className={`px-4 py-2 rounded-lg transition-colors ${
                                    categoryFilter === category.id
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                {category.name} ({category.count})
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Blog Posts Grid */}
            <div className="max-w-6xl mx-auto">
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
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-sm text-blue-600 font-semibold">{primaryCategory}</span>
                                                <span className="text-sm text-gray-500">{formattedDate}</span>
                                            </div>
                                            <h2 className="text-xl font-bold mb-3 text-gray-800 hover:text-blue-600 transition-colors">
                                                <Link href={`/blog/${post.slug}`}>
                                                    <span dangerouslySetInnerHTML={{ __html: post.title.rendered }} />
                                                </Link>
                                            </h2>
                                            <div 
                                                className="text-gray-600 mb-4 line-clamp-3"
                                                dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
                                            />
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-500">By {author}</span>
                                                <Link
                                                    href={`/blog/${post.slug}`}
                                                    className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
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
                            <div className="mt-12 flex justify-center gap-2">
                                {hasPrevPage && (
                                    <Link
                                        href={`/blog?page=${currentPage - 1}${categoryFilter ? `&category=${categoryFilter}` : ''}`}
                                        className="px-4 py-2 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 transition-colors"
                                    >
                                        Previous
                                    </Link>
                                )}
                                <span className="px-4 py-2 bg-blue-600 text-white rounded">
                                    {currentPage}
                                </span>
                                {hasNextPage && (
                                    <Link
                                        href={`/blog?page=${currentPage + 1}${categoryFilter ? `&category=${categoryFilter}` : ''}`}
                                        className="px-4 py-2 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 transition-colors"
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
