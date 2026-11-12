import { studioCopy } from "./studio-copy";
import { help } from "./help";
import { brand, indexable, siteOrigin } from "./site";
import type { Metadata } from "next";
import { type Lang, messages } from "./i18n";
import { localizedAlternates, route, type PageKey } from "./routes";
import { seoContent } from "./seo-content";

export function landingMetadata(lang: Lang): Metadata {
  const content = seoContent[lang];
  const url = siteOrigin + (lang === "en" ? "/" : route(lang, "home"));
  const title = `${content.title} | ${brand}`;

  return {
    metadataBase: new URL(siteOrigin),
    title,
    description: content.description,
    alternates: { canonical: url, languages: localizedAlternates(siteOrigin, "home") },
    openGraph: {
      type: "website",
      siteName: brand,
      title,
      description: content.description,
      locale: content.openGraphLocale,
      url,
      images: [
        {
          url: `${siteOrigin}/social.png`,
          width: 1200,
          height: 630,
          alt: content.imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: content.description,
      images: [{ url: `${siteOrigin}/social.png`, alt: content.imageAlt }],
    },
    robots: { index: indexable, follow: indexable },
    icons: { icon: "/icon.png" },
  };
}

export function pageMetadata(
  lang: Lang,
  page: Exclude<PageKey, "home">,
  currentPath?: string,
): Metadata {
  let heading: string;
  let description: string;

  switch (page) {
    case "scoreboardIntro":
      heading = {
        en: "Online Scoreboard & Timer",
        bg: "Онлайн табло и таймер",
        tr: "Çevrim İçi Skor Tabelası ve Zamanlayıcı",
      }[lang];
      description = studioCopy[lang].scoreDescription;
      break;
    case "leaderboards":
    case "leaderboardEditor":
      heading = studioCopy[lang].leaderboard;
      description = studioCopy[lang].leaderDescription;
      break;
    case "brackets":
    case "bracketEditor":
      heading = studioCopy[lang].bracket;
      description = studioCopy[lang].bracketDescription;
      break;
    case "help":
      heading = help[lang].title;
      description = seoContent[lang].pageDescriptions.help;
      break;
    case "privacy":
      heading = messages[lang].privacy;
      description = messages[lang].privacyIntro;
      break;
    case "licenses":
      heading = messages[lang].licenses;
      description = seoContent[lang].pageDescriptions.licenses;
      break;
    case "saved":
      heading = messages[lang].saved;
      description = seoContent[lang].pageDescriptions.saved;
      break;
    case "scoreboard":
      heading = messages[lang].scoreboardPageTitle;
      description = seoContent[lang].pageDescriptions.scoreboard;
      break;
  }

  if (page === "leaderboardEditor" || page === "bracketEditor")
    heading = `${heading} · ${studioCopy[lang].editing}`;
  const title = page === "help" ? heading : `${heading} | ${brand}`;
  const url = siteOrigin + route(lang, page);
  const canonicalPath = currentPath === undefined || currentPath === route(lang, page);
  const publicIndexable =
    indexable && !["saved", "leaderboardEditor", "bracketEditor"].includes(page) && canonicalPath;
  return {
    metadataBase: new URL(siteOrigin),
    title,
    description,
    alternates: { canonical: url, languages: localizedAlternates(siteOrigin, page) },
    openGraph: {
      type: "website",
      siteName: brand,
      title,
      description,
      locale: seoContent[lang].openGraphLocale,
      url,
      images: [
        {
          url: `${siteOrigin}/social.png`,
          width: 1200,
          height: 630,
          alt: seoContent[lang].imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: `${siteOrigin}/social.png`, alt: seoContent[lang].imageAlt }],
    },
    robots: { index: publicIndexable, follow: indexable && page !== "saved" },
    icons: { icon: "/icon.png" },
  };
}
