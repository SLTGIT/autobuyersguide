import type { Metadata } from "next";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "@/styles/globals.scss";
import { Manrope } from "next/font/google";
import { Layout } from "@/components/layout";
import { ClientImports } from "@/components/ClientImports";

const manrope = Manrope({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Car Sales Brisbane",
  description:
    "Car Sales Brisbane is a leading provider of used cars in Australia. We offer a wide range of used cars for sale in Australia.",
  icons: {
    icon: "/assets/images/new-logo_1.png",
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
