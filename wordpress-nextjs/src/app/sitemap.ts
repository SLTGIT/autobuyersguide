import type { MetadataRoute } from "next";
import { getPosts } from "@/lib/wordpress";
import { normalizePublicSiteBase } from "@/lib/site-url";

function getSiteOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (!raw) return "http://localhost:3000";
  return normalizePublicSiteBase(raw);
}

const staticRoutes = [
  "",
  "/about-us",
  "/blog",
  "/contact",
  "/finance-centre",
  "/sell-my-car",
  "/search",
  "/terms-of-service",
  "/privacy-policy",
  "/finance-disclaimer",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = getSiteOrigin();

  const entries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${origin}${route || "/"}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.8,
  }));

  try {
    const posts = await getPosts({ per_page: 100 });
    entries.push(
      ...posts.map((post) => ({
        url: `${origin}/blog/${post.slug}`,
        lastModified: post.modified ? new Date(post.modified) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    );
  } catch {
    // Keep sitemap generation resilient even if WP API is unavailable.
  }

  return entries;
}
