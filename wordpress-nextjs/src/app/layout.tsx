import type { Metadata } from "next";
import Script from "next/script";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "@/styles/globals.scss";
import { Manrope } from "next/font/google";
import { Layout } from "@/components/layout";
import { ClientImports } from "@/components/ClientImports";
import {
  FAVICON_PATH,
  OG_SHARE_IMAGE_ALT,
  OG_SHARE_IMAGE_DIMENSIONS,
  absoluteOgLogoUrl,
  normalizePublicSiteBase,
} from "@/lib/site-url";

const manrope = Manrope({ subsets: ["latin"] });

const rawSite =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";
const siteOrigin = rawSite
  ? normalizePublicSiteBase(rawSite)
  : "http://localhost:3000";

const title = "Quality Used Cars Brisbane | Expert Finance & Sourcing";
const description =
  "Access premium used 4x4s, SUVs, and commercial vehicles. Based in Ormiston, we provide $0 deposit finance and statewide delivery from Brisbane to Cairns.";
const GTM_ID = "GTM-W397LKXC";

/** Static file URL only — avoids Next rewriting relative image paths for social crawlers. */
const ogLogoAbsolute = absoluteOgLogoUrl(siteOrigin);

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title,
  description,
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: FAVICON_PATH,
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: title,
    title,
    description,
    images: [
      {
        url: '/carsalesbrisbane_logo.png',
        type: "image/png",
        width: OG_SHARE_IMAGE_DIMENSIONS.width,
        height: OG_SHARE_IMAGE_DIMENSIONS.height,
        alt: OG_SHARE_IMAGE_ALT,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [
      {
        url: '/carsalesbrisbane_logo.png',
        alt: OG_SHARE_IMAGE_ALT,
        width: OG_SHARE_IMAGE_DIMENSIONS.width,
        height: OG_SHARE_IMAGE_DIMENSIONS.height,
      },
    ],
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
        <Script id="gtm-script" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${GTM_ID}');
          `}
        </Script>
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <ClientImports />
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
