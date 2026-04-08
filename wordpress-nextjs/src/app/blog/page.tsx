import type { Metadata } from "next";
import Link from "next/link";
import { getPosts, getCategories } from "@/lib/wordpress";
import type { WPPost, WPCategory } from "@/types/wordpress";
import BlogCard from "@/components/blog/BlogCard";
import "./blog.css";

export const metadata: Metadata = {
  title: "Blog | Car Sales Brisbane",
  description: "Read our latest blog posts about used cars in Australia.",
};

interface BlogPageProps {
  searchParams: Promise<{
    page?: string;
    category?: string;
  }>;
}

export default async function Blog({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const currentPage = parseInt(params.page || "1");
  const categoryFilter = params.category
    ? parseInt(params.category)
    : undefined;
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
        orderby: "date",
        order: "desc",
      }),
      getCategories({ per_page: 100 }),
    ]);
  } catch (error) {
    console.error("Error fetching WordPress data:", error);
    apiError = true;
  }

  const hasNextPage = posts.length === postsPerPage;
  const hasPrevPage = currentPage > 1;

  return (
    <>
      <section className="cs-page-hero py-5 text-white">
        <div className="container py-lg-4">
          <div className="row g-4 align-items-center">
            <div className="col-lg-7">
              <span className="badge cs-hero-chip cs-pill px-3 py-2 mb-3">
                Car Sales Brisbane Blog
              </span>
              <h1 className="display-5 fw-bold mb-3 cs-title-tight">
                Used Car Guides for Brisbane Buyers
              </h1>
              <p className="lead mb-0">
                Explore guides on car finance, used cars under $15000, cheap
                cars for sale Brisbane buyers can compare, family SUVs, and the
                best used 4x4s and utes for sale in Brisbane.
              </p>
            </div>
          </div>
        </div>
      </section>
      <div className="container py-5">
        {/* API Error */}
        {apiError && (
          <div className="alert alert-warning text-center mb-4">
            <strong>Note:</strong> Unable to connect to WordPress API. Please
            check your <code>.env</code> configuration.
          </div>
        )}

        {/* Blog Posts Grid */}
        <div className="container">
          {posts.length > 0 ? (
            <>
              <div className="row g-4">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="col-12 col-md-6 col-lg-4 d-flex"
                  >
                    <BlogCard post={post} />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {(hasNextPage || hasPrevPage) && (
                <div className="d-flex justify-content-center align-items-center gap-2 mt-5">
                  {hasPrevPage && (
                    <Link
                      href={`/blog?page=${currentPage - 1}${
                        categoryFilter ? `&category=${categoryFilter}` : ""
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
                        categoryFilter ? `&category=${categoryFilter}` : ""
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
    </>
  );
}
