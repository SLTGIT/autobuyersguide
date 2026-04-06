import Link from "next/link";
import type { WPPost } from "@/types/wordpress";

interface BlogCardProps {
  post: WPPost;
}

function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

export default function BlogCard({ post }: BlogCardProps) {
  const featuredImage =
    post._embedded?.["wp:featuredmedia"]?.[0]?.source_url;
  const href = `/blog/${post.slug}`;
  const plainTitle = stripTags(post.title.rendered);
  const imgAlt = plainTitle
    ? `${plainTitle} — article`
    : "Blog article";

  return (
    <article className="cs-card overflow-hidden h-100">
      {featuredImage ? (
        <Link href={href} className="d-block">
          <img
            src={featuredImage}
            className="w-100"
            alt={imgAlt}
          />
        </Link>
      ) : (
        <Link
          href={href}
          className="d-block bg-light text-muted small text-center py-5 text-decoration-none"
        >
          No image
        </Link>
      )}
      <div className="p-4">
        <h3 className="h5 fw-bold mb-0">
          <Link href={href} className="text-reset text-decoration-none">
            <span
              dangerouslySetInnerHTML={{
                __html: post.title.rendered,
              }}
            />
          </Link>
        </h3>
      </div>
    </article>
  );
}
