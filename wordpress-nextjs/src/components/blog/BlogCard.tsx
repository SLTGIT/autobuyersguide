import Link from "next/link";
import Image from "next/image";
import type { WPPost } from "@/types/wordpress";
import styles from "./BlogCard.module.scss";

interface BlogCardProps {
  post: WPPost;
  /** Use `2` on /blog listing (after page h1); default `3` when nested under a section h2. */
  titleHeadingLevel?: 2 | 3;
}

function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

export default function BlogCard({
  post,
  titleHeadingLevel = 3,
}: BlogCardProps) {
  const TitleTag = titleHeadingLevel === 2 ? "h2" : "h3";

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
        <TitleTag className={styles.title}>
          <Link href={href}>{plainTitle}</Link>
        </TitleTag>
        {/* {plainExcerpt ? (
          <p className={styles.excerpt}>{plainExcerpt}</p>
        ) : null} */}
        <Link href={href} className={styles.readBtn}>
          Read Article
        </Link>
      </div>
    </article>
  );
}
