import type { Metadata } from 'next';
import Link from 'next/link';
import { getPosts, getCategories } from '@/lib/wordpress';
import type { WPPost, WPCategory } from '@/types/wordpress';
import BlogCard from '@/components/blog/BlogCard';

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
                order: 'desc',
            }),
            getCategories({ per_page: 100 }),
        ]);
    } catch (error) {
        console.error('Error fetching WordPress data:', error);
        apiError = true;
    }

    const hasNextPage = posts.length === postsPerPage;
    const hasPrevPage = currentPage > 1;

    return (
        <div className="container py-5">
            {/* Page Header */}
            <div className="text-center py-5 bg-light rounded-4 mb-5">
                <h1
                    className="display-5 fw-bold text-primary mb-3"
                    dangerouslySetInnerHTML={{ __html: 'Blog' }}
                />
                <p className="text-muted mx-auto" style={{ maxWidth: 600 }}>
                    Insights, tutorials, and updates from our team
                </p>
            </div>

            {/* API Error */}
            {apiError && (
                <div className="alert alert-warning text-center mb-4">
                    <strong>Note:</strong> Unable to connect to WordPress API.
                    Please check your <code>.env</code> configuration.
                </div>
            )}

            {/* Category Filter */}
            {categories.length > 0 && (
                <div className="d-flex flex-wrap justify-content-center gap-2 mb-5">
                    <Link
                        href="/blog"
                        className={`btn ${
                            !categoryFilter ? 'btn-primary' : 'btn-outline-secondary'
                        } rounded-pill px-4`}
                    >
                        All
                    </Link>

                    {categories.map((category) => (
                        <Link
                            key={category.id}
                            href={`/blog?category=${category.id}`}
                            className={`btn ${
                                categoryFilter === category.id
                                    ? 'btn-primary'
                                    : 'btn-outline-secondary'
                            } rounded-pill px-4`}
                        >
                            {category.name} ({category.count})
                        </Link>
                    ))}
                </div>
            )}

            {/* Blog Posts Grid */}
            <div className="container">
                {posts.length > 0 ? (
                    <>
                        <div className="row g-4">
                            {posts.map((post) => (
                                <BlogCard key={post.id} post={post} />
                            ))}
                        </div>
                        

                        {/* Pagination */}
                        {(hasNextPage || hasPrevPage) && (
                            <div className="d-flex justify-content-center align-items-center gap-2 mt-5">
                                {hasPrevPage && (
                                    <Link
                                        href={`/blog?page=${currentPage - 1}${
                                            categoryFilter
                                                ? `&category=${categoryFilter}`
                                                : ''
                                        }`}
                                        className="btn btn-outline-secondary"
                                    >
                                        Previous
                                    </Link>
                                )}

                                <span className="btn btn-primary disabled">
                                    {currentPage}
                                </span>

                                {hasNextPage && (
                                    <Link
                                        href={`/blog?page=${currentPage + 1}${
                                            categoryFilter
                                                ? `&category=${categoryFilter}`
                                                : ''
                                        }`}
                                        className="btn btn-outline-secondary"
                                    >
                                        Next
                                    </Link>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-5">
                        <p className="text-muted fs-5">No posts found.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
