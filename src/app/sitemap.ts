import type { MetadataRoute } from "next";
import { languages, origin } from "@/lib/i18n";
import { indexable } from "@/lib/site";
import { localizedAlternates, route, type PageKey } from "@/lib/routes";

export const dynamic = "force-static";

const publicPages = [
  "scoreboard",
  "privacy",
  "licenses",
  "help",
] as const satisfies readonly PageKey[];

export default function sitemap(): MetadataRoute.Sitemap {
  if (!indexable) return [];
  const landingPages = [
    {
      url: origin + "/",
      alternates: { languages: localizedAlternates(origin, "home") },
    },
    ...languages
      .filter((lang) => lang !== "en")
      .map((lang) => ({
        url: origin + route(lang, "home"),
        alternates: { languages: localizedAlternates(origin, "home") },
      })),
  ];
  const localizedPages = publicPages.flatMap((page) =>
    languages.map((lang) => ({
      url: origin + route(lang, page),
      alternates: { languages: localizedAlternates(origin, page) },
    })),
  );

  return [...landingPages, ...localizedPages];
}
