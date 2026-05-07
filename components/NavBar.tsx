"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { portfolios } from "@/data/portfolios";

const LINKEDIN_PATH =
  "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z";

function navLinkClass(active: boolean): string {
  return active
    ? "font-mono text-[11px] font-semibold text-[#111111] transition-opacity duration-150"
    : "font-mono text-[11px] text-[#111111] transition-opacity duration-150 hover:opacity-50";
}

export default function NavBar() {
  const pathname = usePathname() ?? "/";

  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur-xl"
      style={{
        background: "rgba(250,247,242,0.94)",
        borderBottom: "1px solid rgba(15,30,53,0.08)",
      }}
    >
      <div className="flex items-center justify-between px-8 py-4 lg:px-12">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            aria-label="Toffel Capital — Home"
            className="flex items-center transition-opacity hover:opacity-80"
          >
            <Image
              src="/tc-logo.png"
              alt="Toffel Capital"
              width={32}
              height={32}
              priority
              className="rounded-sm"
            />
          </Link>
          <a
            href="https://www.linkedin.com/in/isaac-toffel"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="-m-3 inline-flex h-11 w-11 items-center justify-center text-[#111111] transition-opacity hover:opacity-50"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d={LINKEDIN_PATH} />
            </svg>
          </a>
        </div>
        <div className="hidden items-center gap-8 sm:flex">
          {portfolios.map((p) => (
            <Link
              key={p.slug}
              href={`/portfolio/${p.slug}`}
              className={navLinkClass(pathname === `/portfolio/${p.slug}`)}
            >
              {p.title}
            </Link>
          ))}
          <Link
            href="/analytics"
            className={navLinkClass(pathname === "/analytics")}
          >
            Analytics
          </Link>
          <Link
            href="/decision-log"
            className={navLinkClass(pathname === "/decision-log")}
          >
            Decision Log
          </Link>
        </div>
      </div>
    </nav>
  );
}
