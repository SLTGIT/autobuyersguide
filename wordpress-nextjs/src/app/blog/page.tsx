import type { Metadata } from "next";
import Link from "next/link";
import { getPosts, getCategories } from "@/lib/wordpress";
import { getCurrentUrlAndRoute, siteUrlMetadataFields } from "@/lib/site-url";
import type { WPPost, WPCategory } from "@/types/wordpress";
import BlogCard from "@/components/blog/BlogCard";
import JsonLd from "@/components/JsonLd";
import {
  jsonLdGraph,
  organizationJsonLd,
  stripHtml,
  upgradeHttpToHttpsUrl,
  webSiteJsonLd,
} from "@/lib/json-ld";
import "./blog.css";

function blogListingPath(page: number, categoryId: number | undefined): string {
  const sp = new URLSearchParams();
  if (page > 1) sp.set("page", String(page));
  if (categoryId) sp.set("category", String(categoryId));
  const q = sp.toString();
  return q ? `/blog?${q}` : "/blog";
}

export async function generateMetadata(): Promise<Metadata> {
  const { currentUrl, currentRoute } = await getCurrentUrlAndRoute("/blog");
  return {
    title: "Used Car Guides for Brisbane Buyers | Car Sales Brisbane",
    description:
      "Read Brisbane used car guides covering car finance, used 4x4s, family SUVs, cheap cars, and first-time buyer tips from Car Sales Brisbane.",
    ...siteUrlMetadataFields(currentUrl, currentRoute),
  };
}

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

  const listingPath = blogListingPath(currentPage, categoryFilter);
  const [{ currentUrl: listingPageUrl }, { currentUrl: blogCanonicalUrl }] =
    await Promise.all([
      getCurrentUrlAndRoute(listingPath),
      getCurrentUrlAndRoute("/blog"),
    ]);
  const listingPageHttps = upgradeHttpToHttpsUrl(listingPageUrl);
  const blogCanonicalHttps = upgradeHttpToHttpsUrl(blogCanonicalUrl);
  const origin = new URL(listingPageHttps).origin;
  const blogEntityId = `${blogCanonicalHttps}#blog`;

  const pageTitle = "Used Car Guides for Brisbane Buyers | Car Sales Brisbane";
  const pageDescription =
    "Read Brisbane used car guides covering car finance, used 4x4s, family SUVs, cheap cars, and first-time buyer tips from Car Sales Brisbane.";

  const blogPostingSchemas: Record<string, unknown>[] = posts.map((post) => {
    const headline = stripHtml(post.title.rendered);
    const imageUrl = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url as
      | string
      | undefined;
    const authorName = post._embedded?.author?.[0]?.name as string | undefined;
    const excerpt = stripHtml(post.excerpt.rendered);
    const articleUrl = upgradeHttpToHttpsUrl(`${origin}/blog/${post.slug}`);
    const blogPosting: Record<string, unknown> = {
      "@type": "BlogPosting",
      "@id": `${articleUrl}#article`,
      headline,
      url: articleUrl,
      datePublished: post.date,
      dateModified: post.modified,
      inLanguage: "en-AU",
      publisher: { "@id": `${origin}/#organization` },
      mainEntityOfPage: articleUrl,
      isPartOf: { "@id": blogEntityId },
    };
    if (imageUrl) blogPosting.image = [upgradeHttpToHttpsUrl(imageUrl)];
    blogPosting.author = authorName
      ? { "@type": "Person", name: authorName }
      : { "@id": `${origin}/#organization` };
    if (excerpt) blogPosting.description = excerpt;
    return blogPosting;
  });

  const itemListElements = blogPostingSchemas.map((bp, index) => ({
    "@type": "ListItem",
    position: (currentPage - 1) * postsPerPage + index + 1,
    item: { "@id": bp["@id"] as string },
  }));

  const jsonLd = jsonLdGraph(
    organizationJsonLd(origin),
    webSiteJsonLd(origin),
    {
      "@type": "Blog",
      "@id": blogEntityId,
      name: "Used Car Guides for Brisbane Buyers",
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
          name: "Blog",
          item: listingPageHttps,
        },
      ],
    },
    ...blogPostingSchemas,
  );

  return (
    <>
      <JsonLd data={jsonLd} />
      <section className="cs-page-hero py-5">
        <div className="container py-lg-4">
          <div className="row g-4 align-items-center">
            <div className="col-lg-7">
              {/* <span className="badge cs-hero-chip cs-pill px-3 py-2 mb-3">
                Car Sales Brisbane Blog
              </span> */}
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
      <section className="bg-white">
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
      </section>
    </>
  );
}
