import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getPostBySlug } from "@/lib/wordpress";
import { repairWpRenderedHtml } from "@/lib/wordpress/repair-rendered-html";
import { getMetadata } from "@/lib/wordpress/seo";
import { mergeSiteUrlMetadata } from "@/lib/site-url";
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
  const postCategories = post._embedded?.["wp:term"]?.[0] || [];
  const primaryCategory = postCategories[0];

  const formattedDate = new Date(post.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="bg-white min-vh-100">
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
