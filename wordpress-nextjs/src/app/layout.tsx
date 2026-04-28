import type { Metadata } from "next";
import Script from "next/script";
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
const GTM_ID = "GTM-W397LKXC";

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title,
  description,
  robots: {
    index: true,
    follow: true,
  },
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
