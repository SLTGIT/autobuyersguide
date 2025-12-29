import Link from 'next/link';
import { getPosts, getCategoryBySlug } from '@/lib/wordpress/api';
import BlogCard from '../blog/BlogCard';
import styles from './LatestBlogPosts.module.scss';


export default async function LatestBlogPosts() {
    // Fetch 'home' category to get its ID
    const category = await getCategoryBySlug('home');

    // If category exists, filter by it. If not, you might want to return null or fallback.
    // Assuming we only want posts if the category exists or just fallback to latest if not critical.
    // Based on "need to call home catgory only", we should probably try to respect that.

    const posts = await getPosts({
        per_page: 3,
        // Only add categories filter if we found the ID
        categories: category ? [category.id] : undefined
    });

    if (!posts || posts.length === 0) {
        return null;
    }

    return (
        <section className={styles.section}>
            <div className="container">
                <div className={styles.header}>
                    <h2>Latest Tips & Articles</h2>
                    <p>Stay updated with the latest news, reviews, and buying guides from our experts.</p>
                </div>

                <div className="row">
                    {posts.map((post) => (
                        <div key={post.id} className="col-12 col-md-6 col-lg-4">
                            <BlogCard key={post.id} post={post} />
                        </div>
                    ))}
                </div>

                {posts.length >= 3 && (
                    <div className={styles.viewAll}>
                        <Link href="/blog" className={styles.btn}>
                            View All Posts
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
}
