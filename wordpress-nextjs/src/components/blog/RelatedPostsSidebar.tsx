import Link from "next/link";
import Image from "next/image";
import type { WPPost } from "@/types/wordpress";
import { stripHtml } from "@/lib/json-ld";

interface RelatedPostsSidebarProps {
  posts: WPPost[];
}

export default function RelatedPostsSidebar({ posts }: RelatedPostsSidebarProps) {
  if (!posts.length) return null;

  return (
    <aside className="blog-related-sidebar">
      <div className="card cs-card border-0 shadow-sm">
        <div className="card-body p-4">
          <h2 className="h5 fw-bold mb-4">Related Posts</h2>
          <ul className="list-unstyled mb-0 d-flex flex-column gap-3">
            {posts.map((related) => {
              const featuredImage =
                related._embedded?.["wp:featuredmedia"]?.[0]?.source_url as
                  | string
                  | undefined;
              const title = stripHtml(related.title.rendered);
              const href = `/blog/${related.slug}`;

              return (
                <li key={related.id}>
                  <Link
                    href={href}
                    className="d-flex gap-3 text-decoration-none align-items-center blog-related-item"
                  >
                    {featuredImage ? (
                      <div className="blog-related-thumb flex-shrink-0 rounded overflow-hidden position-relative">
                        <Image
                          src={featuredImage}
                          alt={title ? `${title} — article` : "Blog article"}
                          fill
                          className="object-fit-cover"
                          sizes="80px"
                        />
                      </div>
                    ) : null}
                    <span className="fw-semibold text-dark small lh-sm">
                      {title}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link
            href="/blog"
            className="btn btn-outline-primary cs-pill mt-4 w-100"
          >
            View All Posts
          </Link>
        </div>
      </div>
    </aside>
  );
}
