import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPageBySlug, getPostsPaginated } from "@/lib/wordpress";
import { getMetadata, getAcfSeoCopy } from "@/lib/wordpress/seo";
import WpRenderedHtml from "@/components/cms/WpRenderedHtml";
import { getCurrentUrlAndRoute, mergeSiteUrlMetadata } from "@/lib/site-url";
import type { WPPost } from "@/types/wordpress";
import BlogCard from "@/components/blog/BlogCard";
import JsonLd from "@/components/JsonLd";
import {
  jsonLdGraph,
  organizationJsonLd,
  stripHtml,
  upgradeHttpToHttpsUrl,
  webSiteJsonLd,
} from "@/lib/json-ld";
import "../[slug]/cms-page.scss";
import "./blog.css";

export const revalidate = 3600;

const BLOG_SLUG = "blog";
const BLOG_PATH = "/blog";

function blogListingPath(page: number, categoryId: number | undefined): string {
  const sp = new URLSearchParams();
  if (page > 1) sp.set("page", String(page));
  if (categoryId) sp.set("category", String(categoryId));
  const q = sp.toString();
  return q ? `/blog?${q}` : "/blog";
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPageBySlug(BLOG_SLUG);
  if (!page) {
    return mergeSiteUrlMetadata({ title: "Blog" }, BLOG_PATH);
  }
  return mergeSiteUrlMetadata(getMetadata(page), BLOG_PATH);
}

interface BlogPageProps {
  searchParams: Promise<{
    page?: string;
    category?: string;
  }>;
}

export default async function Blog({ searchParams }: BlogPageProps) {
  const cmsPage = await getPageBySlug(BLOG_SLUG);
  if (!cmsPage) {
    notFound();
  }

  const params = await searchParams;
  const currentPage = parseInt(params.page || "1");
  const categoryFilter = params.category
    ? parseInt(params.category)
    : undefined;
  const postsPerPage = 9;

  let posts: WPPost[] = [];
  let totalPages = 1;
  let apiError = false;

  try {
    const postsResult = await getPostsPaginated({
      per_page: postsPerPage,
      page: currentPage,
      categories: categoryFilter ? [categoryFilter] : undefined,
      orderby: "date",
      order: "desc",
    });
    posts = postsResult.posts;
    totalPages = Math.max(1, postsResult.totalPages);
  } catch (error) {
    console.error("Error fetching WordPress data:", error);
    apiError = true;
  }

  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  const listingPath = blogListingPath(currentPage, categoryFilter);
  const [{ currentUrl: listingPageUrl }, { currentUrl: blogCanonicalUrl }] =
    await Promise.all([
      getCurrentUrlAndRoute(listingPath),
      getCurrentUrlAndRoute(BLOG_PATH),
    ]);
  const listingPageHttps = upgradeHttpToHttpsUrl(listingPageUrl);
  const blogCanonicalHttps = upgradeHttpToHttpsUrl(blogCanonicalUrl);
  const origin = new URL(listingPageHttps).origin;
  const blogEntityId = `${blogCanonicalHttps}#blog`;

  const acfSeo = getAcfSeoCopy(cmsPage);
  const headline = stripHtml(cmsPage.title.rendered);
  const excerpt = stripHtml(cmsPage.excerpt?.rendered || "");
  const pageTitle = acfSeo?.title || headline;
  const pageDescription = acfSeo?.description || excerpt || headline;

  const itemListElements = posts.map((post, index) => ({
    "@type": "ListItem",
    position: (currentPage - 1) * postsPerPage + index + 1,
    item: upgradeHttpToHttpsUrl(`${origin}/blog/${post.slug}`),
  }));

  const jsonLd = jsonLdGraph(
    organizationJsonLd(origin),
    webSiteJsonLd(origin),
    {
      "@type": "Blog",
      "@id": blogEntityId,
      name: pageTitle,
      description: pageDescription,
      url: blogCanonicalHttps,
      inLanguage: "en-AU",
      publisher: { "@id": `${origin}/#organization` },
      isPartOf: { "@id": `${origin}/#website` },
    },
    {
      "@type": "CollectionPage",
      "@id": `${listingPageHttps}#webpage`,
      name: pageTitle,
      description: pageDescription,
      url: listingPageHttps,
      inLanguage: "en-AU",
      isPartOf: { "@id": `${origin}/#website` },
      publisher: { "@id": `${origin}/#organization` },
      ...(itemListElements.length > 0
        ? {
            mainEntity: {
              "@type": "ItemList",
              numberOfItems: posts.length,
              itemListElement: itemListElements,
            },
          }
        : {}),
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${listingPageHttps}#breadcrumb`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: `${origin}/`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: headline,
          item: listingPageHttps,
        },
      ],
    },
  );

  return (
    <>
      <JsonLd data={jsonLd} />
      {cmsPage.content?.rendered?.trim() ? (
        <WpRenderedHtml html={cmsPage.content.rendered} />
      ) : null}

      <section className="bg-white" aria-labelledby="blog-posts-heading">
        <div className="container py-5">
          <h2 id="blog-posts-heading" className="visually-hidden">
            Blog posts
          </h2>
          {apiError && (
            <div className="alert alert-warning text-center mb-4">
              <strong>Note:</strong> Unable to connect to WordPress API. Please
              check your <code>.env</code> configuration.
            </div>
          )}

          <div className="container">
            {posts.length > 0 ? (
              <>
                <div className="row g-4">
                  {posts.map((post, index) => (
                    <div
                      key={post.id}
                      className="col-12 col-md-6 col-lg-4 d-flex"
                    >
                      <BlogCard
                        post={post}
                        titleHeadingLevel={2}
                        priority={index < 3}
                      />
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <nav
                    className="blog-pagination"
                    aria-label="Blog pages"
                  >
                    {hasPrevPage ? (
                      <Link
                        className="blog-pagination-link"
                        href={blogListingPath(
                          currentPage - 1,
                          categoryFilter,
                        )}
                      >
                        Previous
                      </Link>
                    ) : (
                      <button
                        type="button"
                        className="blog-pagination-link is-disabled"
                        disabled
                      >
                        Previous
                      </button>
                    )}

                    <span className="blog-pagination-status">
                      Page {currentPage} of {totalPages}
                    </span>

                    {hasNextPage ? (
                      <Link
                        className="blog-pagination-link"
                        href={blogListingPath(
                          currentPage + 1,
                          categoryFilter,
                        )}
                      >
                        Next
                      </Link>
                    ) : (
                      <button
                        type="button"
                        className="blog-pagination-link is-disabled"
                        disabled
                      >
                        Next
                      </button>
                    )}
                  </nav>
                )}
              </>
            ) : (
              <div className="text-center py-5">
                <p className="text-muted fs-5">No posts found.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
