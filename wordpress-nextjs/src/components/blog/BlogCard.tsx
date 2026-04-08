import Link from "next/link";
import Image from "next/image";
import type { WPPost } from "@/types/wordpress";
import styles from "./BlogCard.module.scss";

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
  const plainExcerpt = stripTags(post.excerpt.rendered);
  const imgAlt = plainTitle ? `${plainTitle} — article` : "Blog article";

  return (
    <article className={styles.card}>
      {featuredImage ? (
        <div className={styles.media}>
          <Link href={href} className={styles.mediaLink}>
            <Image
              src={featuredImage}
              alt={imgAlt}
              fill
              className={styles.mediaImg}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </Link>
        </div>
      ) : (
        <Link href={href} className={styles.placeholder}>
          No image
        </Link>
      )}
      <div className={styles.body}>
        <h3 className={styles.title}>
          <Link href={href}>
            <span
              dangerouslySetInnerHTML={{
                __html: post.title.rendered,
              }}
            />
          </Link>
        </h3>
        {plainExcerpt ? (
          <p className={styles.excerpt}>{plainExcerpt}</p>
        ) : null}
        <Link href={href} className={styles.readBtn}>
          Read Article
        </Link>
      </div>
    </article>
  );
}
