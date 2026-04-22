import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToffelAI } from "@/components/ToffelAI";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Investment Portfolio",
  description: "A concentrated, conviction-based equity portfolio across AI, Defense, and Energy.",
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
