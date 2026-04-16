import { getPageBySlug } from '@/lib/wordpress';
import { getMetadata } from '@/lib/wordpress/seo';
import { getCurrentUrlAndRoute, mergeSiteUrlMetadata } from '@/lib/site-url';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import {
    breadcrumbJsonLd,
    jsonLdGraph,
    organizationJsonLd,
    stripHtml,
    webPageJsonLd,
    webSiteJsonLd,
} from '@/lib/json-ld';

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

    return mergeSiteUrlMetadata(getMetadata(page), `/${params.slug}`);
}

export default async function DynamicPage(props: PageProps) {
    const params = await props.params;
    const page = await getPageBySlug(params.slug);

    if (!page) {
        notFound();
    }

    const path = `/${params.slug}`;
    const { currentUrl } = await getCurrentUrlAndRoute(path);
    const origin = new URL(currentUrl).origin;
    const headline = stripHtml(page.title.rendered);
    const excerpt = stripHtml(page.excerpt?.rendered || '');
    const featuredUrl = page._embedded?.['wp:featuredmedia']?.[0]?.source_url as
        | string
        | undefined;

    const article: Record<string, unknown> = {
        '@type': 'Article',
        '@id': `${currentUrl}#article`,
        headline,
        url: currentUrl,
        datePublished: page.date,
        dateModified: page.modified,
        publisher: { '@id': `${origin}/#organization` },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${currentUrl}#webpage`,
        },
    };
    if (featuredUrl) article.image = [featuredUrl];
    if (excerpt) article.description = excerpt;

    const jsonLd = jsonLdGraph(
        organizationJsonLd(origin),
        webSiteJsonLd(origin),
        webPageJsonLd({
            pageUrl: currentUrl,
            name: headline,
            description: excerpt || headline,
        }),
        article,
        breadcrumbJsonLd(currentUrl, [
            { name: 'Home', item: `${origin}/` },
            {
                name: headline.length > 90 ? `${headline.slice(0, 87)}…` : headline,
                item: currentUrl,
            },
        ]),
    );

    return (
        <div className="cms-page">
            <JsonLd data={jsonLd} />
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
