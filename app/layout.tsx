import type { Metadata } from "next";
import { Geist, Geist_Mono, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { ToffelAI } from "@/components/ToffelAI";
import NavBar from "@/components/NavBar";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const sourceSerif = Source_Serif_4({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const SITE_URL = "https://toffelcapital.com";
const SITE_DESCRIPTION =
  "A public investment portfolio tracking account-level allocation, position sizing, thesis updates, and decision quality across ETFs, equities, Bitcoin exposure, and long-term thematic holdings.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Toffel Capital: Investment Portfolio",
    template: "%s | Toffel Capital",
  },
  description: SITE_DESCRIPTION,
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Toffel Capital: Investment Portfolio",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: "Toffel Capital",
    type: "website",
    images: [{ url: "/og", width: 1200, height: 630, alt: "Toffel Capital" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Toffel Capital: Investment Portfolio",
    description: SITE_DESCRIPTION,
    images: ["/og"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${sourceSerif.variable}`}>
      <body className="min-h-screen bg-[#faf7f2] text-[#0f1e35] antialiased">
        <NavBar />
        {children}
        <ToffelAI />
      </body>
    </html>
  );
}
