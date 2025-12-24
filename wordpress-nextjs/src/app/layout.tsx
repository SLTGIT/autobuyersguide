import type { Metadata } from "next";
import "bootstrap/dist/css/bootstrap.min.css";
import "@/styles/globals.scss";
import { Manrope } from "next/font/google";
import { Layout } from "@/components/layout";
import { ClientImports } from "@/components/ClientImports";

const manrope = Manrope({ subsets: ["latin"] });

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
            <body className={manrope.className}>
                <ClientImports />
                <Layout>
                    {children}
                </Layout>
            </body>
        </html>
    );
}
