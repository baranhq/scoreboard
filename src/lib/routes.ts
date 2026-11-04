import type { Lang } from "./i18n";
export const slugs = {
  bg: {
    home: "",
    saved: "zapazeni-igri",
    privacy: "poveritelnost",
    licenses: "licenzi",
    help: "pomosht",
  },
  tr: {
    home: "",
    saved: "kayitli-oyunlar",
    privacy: "gizlilik",
    licenses: "lisanslar",
    help: "yardim",
  },
  en: { home: "", saved: "scoreboards", privacy: "privacy", licenses: "licenses", help: "help" },
} as const;
export type PageKey = keyof typeof slugs.en;
export function route(lang: Lang, page: PageKey = "home"): string {
  return `/${lang}/${slugs[lang][page]}${slugs[lang][page] ? "/" : ""}`;
}
export function localizedAlternates(origin: string, page: PageKey): Record<string, string> {
  const english = origin + route("en", page);
  return {
    bg: origin + route("bg", page),
    tr: origin + route("tr", page),
    en: english,
    "en-GB": english,
    "x-default": english,
  };
}
export function pageForPath(path: string): PageKey | undefined {
  for (const lang of ["bg", "tr", "en"] as const)
    for (const page of ["home", "saved", "privacy", "licenses", "help"] as const)
      if (path.replace(/\/?$/, "/") === route(lang, page)) return page;
  if (/^\/tr\/kayitli-tabelalar\/?$/.test(path)) return "saved";
  const alias = /^\/(bg|tr|en)\/(scoreboards|privacy|licenses)\/?$/.exec(path);
  return alias ? (alias[2] === "scoreboards" ? "saved" : (alias[2] as PageKey)) : undefined;
}
export function translatedPath(path: string, lang: Lang): string {
  return route(lang, pageForPath(path) || "home");
}
