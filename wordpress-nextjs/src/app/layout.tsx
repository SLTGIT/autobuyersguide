import type { Metadata } from "next";
import "@/styles/globals.css";
import { Layout } from "@/components/layout";
import NextTopLoader from "nextjs-toploader";

export const metadata: Metadata = {
  title: "WordPress Next.js",
  description: "A modern Next.js application powered by WordPress REST API",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <NextTopLoader
          color="#2563eb"
          height={3}
          showSpinner={false}
          shadow="0 0 10px #2563eb,0 0 5px #2563eb"
        />
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
