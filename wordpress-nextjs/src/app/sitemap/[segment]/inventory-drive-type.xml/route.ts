import { createInventoryFacetSitemapGet } from "@/lib/inventory/inventory-facet-sitemap-route";

export const revalidate = 3600;

export const GET = createInventoryFacetSitemapGet("driveType");
