import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToffelAI } from "@/components/ToffelAI";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const SITE_URL = "https://toffelcapital.com";
const SITE_DESCRIPTION =
  "Isaac Toffel's documented investment process. A concentrated, conviction-based portfolio across ETFs, semiconductors, Bitcoin, and select compounders.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Toffel Capital — Investment Portfolio",
    template: "%s — Toffel Capital",
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    title: "Toffel Capital — Investment Portfolio",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: "Toffel Capital",
    type: "website",
    images: [{ url: "/og", width: 1200, height: 630, alt: "Toffel Capital" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Toffel Capital — Investment Portfolio",
    description: SITE_DESCRIPTION,
    images: ["/og"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-[#faf7f2] text-[#0f1e35] antialiased">
        {children}
        <ToffelAI />
      </body>
    </html>
  );
}
