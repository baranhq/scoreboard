"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { languageFromPath, messages, type Lang } from "@/lib/i18n";

const languageLinks: { lang: Lang; label: string }[] = [
  { lang: "en", label: "English" },
  { lang: "bg", label: "Български" },
  { lang: "tr", label: "Türkçe" },
];

export default function NotFound() {
  const pathname = usePathname();
  const lang = languageFromPath(pathname);
  const copy = messages[lang];

  return (
    <html lang={lang === "en" ? "en-GB" : lang} suppressHydrationWarning>
      <head>
        <meta name="robots" content="noindex,nofollow" />
        <title>{copy.notFoundTitle} | Baran’s Scoreboard</title>
      </head>
      <body>
        <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center px-6 py-12">
          <h1 className="font-display text-4xl font-bold tracking-tight">{copy.notFoundTitle}</h1>
          <p className="mt-5 text-lg leading-8">{copy.notFoundDescription}</p>
          <Link
            href={`/${lang}/`}
            className="mt-6 inline-flex min-h-12 w-fit items-center rounded-lg bg-action px-5 py-2 text-lg font-medium text-on-action"
          >
            {copy.notFoundHome}
          </Link>
          <p className="mt-8 flex gap-5">
            {languageLinks.map(({ lang: language, label }) => (
              <Link key={language} className="underline" href={`/${language}/`} lang={language}>
                {label}
              </Link>
            ))}
          </p>
        </main>
      </body>
    </html>
  );
}
