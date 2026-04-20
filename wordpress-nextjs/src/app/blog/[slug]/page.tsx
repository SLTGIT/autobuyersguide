import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPostBySlug } from "@/lib/wordpress";
import { repairWpRenderedHtml } from "@/lib/wordpress/repair-rendered-html";
import { getMetadata } from "@/lib/wordpress/seo";
import { getCurrentUrlAndRoute, mergeSiteUrlMetadata } from "@/lib/site-url";
import JsonLd from "@/components/JsonLd";
import {
  breadcrumbJsonLd,
  jsonLdGraph,
  organizationJsonLd,
  stripHtml,
  upgradeHttpToHttpsUrl,
  webPageJsonLd,
  webSiteJsonLd,
} from "@/lib/json-ld";
import "./blog-details.css";

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
    return { title: "Post Not Found" };
  }

  return mergeSiteUrlMetadata(getMetadata(post), `/blog/${slug}`);
}

export default async function BlogPost({ params }: BlogPostProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const featuredImage = post._embedded?.["wp:featuredmedia"]?.[0];
  const author = post._embedded?.author?.[0];

  const [{ currentUrl: articleUrl }, { currentUrl: blogCanonicalUrl }] =
    await Promise.all([
      getCurrentUrlAndRoute(`/blog/${slug}`),
      getCurrentUrlAndRoute("/blog"),
    ]);
  const articleHttps = upgradeHttpToHttpsUrl(articleUrl);
  const blogCanonicalHttps = upgradeHttpToHttpsUrl(blogCanonicalUrl);
  const origin = new URL(articleHttps).origin;
  const blogEntityId = `${blogCanonicalHttps}#blog`;
  const headline = stripHtml(post.title.rendered);
  const excerpt = stripHtml(post.excerpt.rendered);
  const imageUrl = featuredImage?.source_url as string | undefined;
  const authorName = author?.name as string | undefined;

  const blogPosting: Record<string, unknown> = {
    "@type": "BlogPosting",
    "@id": `${articleHttps}#article`,
    headline,
    url: articleHttps,
    datePublished: post.date,
    dateModified: post.modified,
    inLanguage: "en-AU",
    publisher: { "@id": `${origin}/#organization` },
    isPartOf: { "@id": blogEntityId },
    mainEntityOfPage: { "@id": `${articleHttps}#webpage` },
  };
  if (imageUrl) blogPosting.image = [upgradeHttpToHttpsUrl(imageUrl)];
  blogPosting.author = authorName
    ? { "@type": "Person", name: authorName }
    : { "@id": `${origin}/#organization` };
  if (excerpt) blogPosting.description = excerpt;

  const jsonLd = jsonLdGraph(
    organizationJsonLd(origin),
    webSiteJsonLd(origin),
    {
      "@type": "Blog",
      "@id": blogEntityId,
      name: "Used Car Guides for Brisbane Buyers",
      url: blogCanonicalHttps,
      inLanguage: "en-AU",
      publisher: { "@id": `${origin}/#organization` },
      isPartOf: { "@id": `${origin}/#website` },
    },
    webPageJsonLd({
      pageUrl: articleHttps,
      name: headline,
      description: excerpt || headline,
    }),
    blogPosting,
    breadcrumbJsonLd(articleHttps, [
      { name: "Home", item: `${origin}/` },
      { name: "Blog", item: blogCanonicalHttps },
      {
        name: headline.length > 90 ? `${headline.slice(0, 87)}…` : headline,
        item: articleHttps,
      },
    ]),
  );

  return (
    <div className="bg-white min-vh-100">
      <JsonLd data={jsonLd} />
      {/* <div className="container pt-4">
        Back Link
        <Link
          href="/blog"
          className="d-inline-flex align-items-center fw-bold text-primary mb-4 text-decoration-none"
        >
          ← Back to Blog
        </Link>
      </div> */}
      {/* Post Content */}
      <div
        dangerouslySetInnerHTML={{
          __html: repairWpRenderedHtml(post.content.rendered),
        }}
      />

      {/* Footer Navigation */}
      {/* <div className="container">
        <div className="px-4 py-4 mb-4  border">
          <h3 className="h4 fw-bold mb-4">Continue Reading</h3>
          <Link
            href="/blog"
            className="d-inline-flex align-items-center fw-bold text-primary text-decoration-none"
          >
            ← Back to Blog
          </Link>
        </div>
      </div> */}
    </div>
  );
}
