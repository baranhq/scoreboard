"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { languageFromPath, messages, type Lang } from "@/lib/i18n";
import { homeRoute, route } from "@/lib/routes";
import "./font-faces.css";
import "./globals.css";

const languageLinks: { lang: Lang; label: string }[] = [
  { lang: "en", label: "English" },
  { lang: "bg", label: "Български" },
  { lang: "tr", label: "Türkçe" },
];

const subscribe = () => () => {};

export default function NotFound() {
  const pathname = usePathname();
  // Every missing URL shares one exported HTML file, so hydrate its English copy first.
  const hydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const lang = languageFromPath(
    hydrated && /^\/(bg|tr|en)(\/|$)/.test(pathname ?? "") ? pathname : "/en/",
  );
  const copy = messages[lang];

  return (
    <html lang={lang === "en" ? "en-GB" : lang} suppressHydrationWarning>
      <head>
        <meta name="robots" content="noindex,nofollow" />
        <title>{copy.notFoundTitle} | Baran’s Scoreboard</title>
      </head>
      <body className="selection:bg-lime selection:text-campaign">
        <div className="bg-campaign text-campaign-ink">
          <div className="mx-auto flex min-h-dvh max-w-7xl flex-col px-6 sm:px-10">
            <header className="border-b border-campaign-ink/20 py-6">
              <Link
                href={homeRoute(lang)}
                className="inline-flex min-h-11 items-center font-display text-xl font-bold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime"
              >
                Baran’s Scoreboard
              </Link>
            </header>
            <main className="grid flex-1 items-center gap-8 py-12 sm:py-16 lg:grid-cols-2 lg:gap-16">
              <div
                aria-hidden="true"
                className="grid grid-cols-3 gap-2 rounded-2xl border border-campaign-ink/20 bg-campaign-muted p-3 sm:gap-3 sm:p-5"
              >
                {["4", "0", "4"].map((digit, index) => (
                  <span
                    key={index}
                    className="flex aspect-[3/4] items-center justify-center rounded-lg border border-campaign-ink/15 bg-campaign font-display text-[clamp(4rem,16vw,8rem)] leading-none font-bold text-lime tabular-nums"
                  >
                    {digit}
                  </span>
                ))}
              </div>
              <div>
                <h1 className="max-w-lg font-display text-4xl leading-tight font-bold tracking-tight text-balance sm:text-5xl">
                  {copy.notFoundTitle}
                </h1>
                <p className="mt-5 max-w-md text-base leading-7 text-campaign-ink/80 sm:text-lg sm:leading-8">
                  {copy.notFoundDescription}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href={route(lang, "scoreboard")}
                    className="inline-flex min-h-12 items-center justify-center gap-3 bg-lime px-5 py-3 text-base font-semibold text-campaign hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime"
                  >
                    {copy.notFoundHome}
                    <ArrowRight size={18} aria-hidden="true" />
                  </Link>
                  <Link
                    href={route(lang, "saved")}
                    className="inline-flex min-h-12 items-center justify-center border border-campaign-ink/35 px-5 py-3 text-base font-semibold hover:bg-campaign-ink/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime"
                  >
                    {copy.saved}
                  </Link>
                </div>
              </div>
            </main>
            <nav
              aria-label={copy.language}
              className="flex flex-wrap gap-x-6 border-t border-campaign-ink/20 py-5 text-sm"
            >
              {languageLinks.map(({ lang: language, label }) => (
                <Link
                  key={language}
                  className="inline-flex min-h-11 items-center underline decoration-campaign-ink/40 underline-offset-4 hover:text-lime focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime"
                  href={homeRoute(language)}
                  lang={language}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </body>
    </html>
  );
}
