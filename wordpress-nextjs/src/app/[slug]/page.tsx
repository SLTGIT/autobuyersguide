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
    upgradeHttpToHttpsUrl,
    webPageJsonLd,
    webSiteJsonLd,
} from '@/lib/json-ld';
import {
    mergeInventoryFiltersWithPathAugment,
    parseInventorySearchParams,
} from '@/lib/inventory/query';
import {
    cmsSrpPathAugmentFromFilters,
    fetchCmsSrpPageBySlug,
    inventoryFiltersFromCmsSrpApi,
    resolveCmsSrpSeoCopy,
} from '@/lib/cms-srp/cms-srp-page';
import SearchPageView from '@/app/search/SearchPageView';
import './cms-page.scss';

export const dynamic = 'force-dynamic';

interface PageProps {
    params: Promise<{
        slug: string;
    }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
    const params = await props.params;
    const srp = await fetchCmsSrpPageBySlug(params.slug);
    if (srp) {
        const { documentTitle, documentDescription } = resolveCmsSrpSeoCopy(srp);
        return mergeSiteUrlMetadata(
            { title: documentTitle, description: documentDescription },
            `/${params.slug}`,
        );
    }

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
    const rawSearchParams = await props.searchParams;

    const srp = await fetchCmsSrpPageBySlug(params.slug);
    if (srp) {
        const baseFilters = inventoryFiltersFromCmsSrpApi(srp.filters);
        const pathAugment = cmsSrpPathAugmentFromFilters(baseFilters);
        const fromQuery = parseInventorySearchParams(rawSearchParams ?? {});
        const filters = mergeInventoryFiltersWithPathAugment(
            fromQuery,
            pathAugment,
        );
        const makeForCrumb = srp.filters.make?.trim();
        const { listingJsonLd } = resolveCmsSrpSeoCopy(srp);
        return (
            <SearchPageView
                filters={filters}
                pathAugment={pathAugment}
                pathHeroLabel={null}
                customHero={{
                    heading: stripHtml(srp.hero_heading),
                    description: stripHtml(srp.hero_description),
                    breadcrumbCurrent: makeForCrumb || undefined,
                }}
                listingSeo={listingJsonLd}
                canonicalPathname={`/${params.slug}`}
            />
        );
    }

    const page = await getPageBySlug(params.slug);

    if (!page) {
        notFound();
    }

    const acfHeading = page.acf?.heading?.trim();
    const acfParagraph = page.acf?.paragraph?.trim();

    const path = `/${params.slug}`;
    const { currentUrl } = await getCurrentUrlAndRoute(path);
    const pageUrl = upgradeHttpToHttpsUrl(currentUrl);
    const origin = new URL(pageUrl).origin;
    const headline = stripHtml(page.title.rendered);
    const excerpt = stripHtml(page.excerpt?.rendered || '');
    const featuredUrl = page._embedded?.['wp:featuredmedia']?.[0]?.source_url as
        | string
        | undefined;

    const article: Record<string, unknown> = {
        '@type': 'Article',
        '@id': `${pageUrl}#article`,
        headline,
        url: pageUrl,
        inLanguage: 'en-AU',
        datePublished: page.date,
        dateModified: page.modified,
        publisher: { '@id': `${origin}/#organization` },
        author: { '@id': `${origin}/#organization` },
        mainEntityOfPage: { '@id': `${pageUrl}#webpage` },
    };
    if (featuredUrl) article.image = [upgradeHttpToHttpsUrl(featuredUrl)];
    if (excerpt) article.description = excerpt;

    const jsonLd = jsonLdGraph(
        organizationJsonLd(origin),
        webSiteJsonLd(origin),
        webPageJsonLd({
            pageUrl,
            name: headline,
            description: excerpt || headline,
        }),
        article,
        breadcrumbJsonLd(pageUrl, [
            { name: 'Home', item: `${origin}/` },
            {
                name: headline.length > 90 ? `${headline.slice(0, 87)}…` : headline,
                item: pageUrl,
            },
        ]),
    );

    return (
        <div className="cms-page">
            <JsonLd data={jsonLd} />
            <article className="cms-page__article">
                {(acfHeading || acfParagraph) && (
                    <section className="cms-page__acf" aria-label="Page introduction">
                        {acfHeading && (
                            <h2
                                className="cms-page__acf-heading"
                                dangerouslySetInnerHTML={{ __html: acfHeading }}
                            />
                        )}
                        {acfParagraph && (
                            <div
                                className="cms-page__acf-paragraph"
                                dangerouslySetInnerHTML={{ __html: acfParagraph }}
                            />
                        )}
                    </section>
                )}

                {page._embedded?.['wp:featuredmedia']?.[0]?.source_url && (
                    <div className="cms-page__featured-image">
                        <img
                            src={page._embedded['wp:featuredmedia'][0].source_url}
                            alt={page.title.rendered}
                        />
                    </div>
                )}
            </article>
        </div>
    );
}
