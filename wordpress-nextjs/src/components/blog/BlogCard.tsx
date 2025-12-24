import Link from 'next/link';
import { WPPost } from '@/types/wordpress';
import styles from './BlogCard.module.scss';

interface BlogCardProps {
    post: WPPost;
}

export default function BlogCard({ post }: BlogCardProps) {
    const featuredImage =
        post._embedded?.['wp:featuredmedia']?.[0]?.source_url;

    const author =
        post._embedded?.author?.[0]?.name || 'Unknown';

    const postCategories =
        post._embedded?.['wp:term']?.[0] || [];

    const primaryCategory =
        postCategories[0]?.name || 'Uncategorized';

    const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });

    return (
        <div className="col-12 col-md-6 col-lg-4">
            <article className={styles.card}>
                {featuredImage && (
                    <div className={styles.imageWrapper}>
                        <img
                            src={featuredImage}
                            alt={post.title.rendered}
                        />
                    </div>
                )}

                <div className={styles.body}>
                    <div className={styles.meta}>
                        <span className={styles.category}>
                            {primaryCategory}
                        </span>{' '}
                        • {formattedDate}
                    </div>

                    <h2 className={styles.title}>
                        <Link href={`/blog/${post.slug}`}>
                            <span
                                dangerouslySetInnerHTML={{
                                    __html: post.title.rendered,
                                }}
                            />
                        </Link>
                    </h2>

                    <div
                        className={styles.excerpt}
                        dangerouslySetInnerHTML={{
                            __html: post.excerpt.rendered,
                        }}
                    />

                    <div className={styles.footer}>
                        <span className={styles.author}>
                            By {author}
                        </span>
                        <Link
                            href={`/blog/${post.slug}`}
                            className={styles.readMore}
                        >
                            Read More →
                        </Link>
                    </div>
                </div>
            </article>
        </div>
    );
}
