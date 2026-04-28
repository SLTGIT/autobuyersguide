import type { Metadata } from "next";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "@/styles/globals.scss";
import { Manrope } from "next/font/google";
import { Layout } from "@/components/layout";
import { ClientImports } from "@/components/ClientImports";
import { DEFAULT_OG_IMAGE_PATH, normalizePublicSiteBase } from "@/lib/site-url";

const manrope = Manrope({ subsets: ["latin"] });

const rawSite =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";
const siteOrigin = rawSite
  ? normalizePublicSiteBase(rawSite)
  : "http://localhost:3000";

const title = "Quality Used Cars Brisbane | Expert Finance &amp; Sourcing";
const description =
  "Access premium used 4x4s, SUVs, and commercial vehicles. Based in Ormiston, we provide $0 deposit finance and statewide delivery from Brisbane to Cairns.";

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title,
  description,
  icons: {
    icon: DEFAULT_OG_IMAGE_PATH,
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: title,
    title,
    description,
    images: [{ url: DEFAULT_OG_IMAGE_PATH }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [DEFAULT_OG_IMAGE_PATH],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={manrope.className}>
        <ClientImports />
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
