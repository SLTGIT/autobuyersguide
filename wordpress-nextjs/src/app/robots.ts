import type { MetadataRoute } from "next";
import { normalizePublicSiteBase } from "@/lib/site-url";

function getSiteOrigin(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (!raw) return "http://localhost:3000";
  return normalizePublicSiteBase(raw);
}

export default function robots(): MetadataRoute.Robots {
  const origin = getSiteOrigin();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${origin}/sitemap.xml`,
  };
}
