import { getPageBySlug } from '@/lib/wordpress';
import { getMetadata } from '@/lib/wordpress/seo';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
    const params = await props.params;
    const page = await getPageBySlug(params.slug);

    if (!page) {
        return {
            title: 'Page Not Found',
        };
    }

    return getMetadata(page);
}

export default async function DynamicPage(props: PageProps) {
    const params = await props.params;
    const page = await getPageBySlug(params.slug);

    if (!page) {
        notFound();
    }

    return (
        <div className="cms-page">
            <article className="cms-page__article">
                {/* Header */}
                <header className="cms-page__header">
                    <h1 dangerouslySetInnerHTML={{ __html: page.title.rendered }} />
                </header>

                {/* Featured Image */}
                {page._embedded?.['wp:featuredmedia']?.[0]?.source_url && (
                    <div className="cms-page__featured-image">
                        <img
                            src={page._embedded['wp:featuredmedia'][0].source_url}
                            alt={page.title.rendered}
                        />
                    </div>
                )}

                {/* Content */}
                <div
                    className="cms-page__content"
                    dangerouslySetInnerHTML={{ __html: page.content.rendered }}
                />
            </article>
        </div>
    );
}
