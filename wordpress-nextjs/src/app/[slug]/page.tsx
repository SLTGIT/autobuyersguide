import { getPageBySlug } from "@/lib/wordpress";
import { getMetadata, getAcfSeoCopy } from "@/lib/wordpress/seo";
import { getCurrentUrlAndRoute, mergeSiteUrlMetadata } from "@/lib/site-url";
import { notFound, permanentRedirect } from "next/navigation";
import { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import {
  breadcrumbJsonLd,
  jsonLdGraph,
  organizationJsonLd,
  stripHtml,
  upgradeHttpToHttpsUrl,
  webPageJsonLd,
  webSiteJsonLd,
} from "@/lib/json-ld";
import { fetchCmsSrpPageBySlug } from "@/lib/cms-srp/cms-srp-page";
import { cmsSrpMetadataForSlug } from "@/lib/cms-srp/render-cms-srp-search";
import WpRenderedHtml from "@/components/cms/WpRenderedHtml";
import "./cms-page.scss";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const cmsMeta = await cmsSrpMetadataForSlug(params.slug);
  if (cmsMeta) {
    return mergeSiteUrlMetadata(cmsMeta, `/search/${params.slug}`);
  }
  const page = await getPageBySlug(params.slug);
  if (!page) {
    return {
      title: "Page Not Found",
    };
  }

  return mergeSiteUrlMetadata(getMetadata(page), `/${params.slug}`);
}

export default async function DynamicPage(props: PageProps) {
  const params = await props.params;

  const srp = await fetchCmsSrpPageBySlug(params.slug);
  if (srp) {
    permanentRedirect(`/search/${params.slug.trim()}`);
  }

  const page = await getPageBySlug(params.slug);

  if (!page) {
    notFound();
  }

  const path = `/${params.slug}`;
  const { currentUrl } = await getCurrentUrlAndRoute(path);
  const pageUrl = upgradeHttpToHttpsUrl(currentUrl);
  const origin = new URL(pageUrl).origin;
  const acfSeo = getAcfSeoCopy(page);
  const headline = stripHtml(page.title.rendered);
  const excerpt = stripHtml(page.excerpt?.rendered || "");
  const seoTitle = acfSeo?.title || headline;
  const seoDescription = acfSeo?.description || excerpt || headline;
  const featuredUrl = page._embedded?.["wp:featuredmedia"]?.[0]?.source_url as
    | string
    | undefined;

  const article: Record<string, unknown> = {
    "@type": "Article",
    "@id": `${pageUrl}#article`,
    headline,
    url: pageUrl,
    inLanguage: "en-AU",
    datePublished: page.date,
    dateModified: page.modified,
    publisher: { "@id": `${origin}/#organization` },
    author: { "@id": `${origin}/#organization` },
    mainEntityOfPage: { "@id": `${pageUrl}#webpage` },
  };
  if (featuredUrl) article.image = [upgradeHttpToHttpsUrl(featuredUrl)];
  if (seoDescription) article.description = seoDescription;

  const jsonLd = jsonLdGraph(
    organizationJsonLd(origin),
    webSiteJsonLd(origin),
    webPageJsonLd({
      pageUrl,
      name: seoTitle,
      description: seoDescription,
    }),
    article,
    breadcrumbJsonLd(pageUrl, [
      { name: "Home", item: `${origin}/` },
      {
        name: seoTitle.length > 90 ? `${seoTitle.slice(0, 87)}…` : seoTitle,
        item: pageUrl,
      },
    ]),
  );

  return (
    <div className="container py-3">
      <JsonLd data={jsonLd} />
      {page.content?.rendered?.trim() ? (
        <WpRenderedHtml html={page.content.rendered} />
      ) : null}
    </div>
  );
}
