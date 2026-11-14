import type { Lang } from "./i18n";
export const slugs = {
  bg: {
    home: "",
    saved: "zapazeni-igri",
    privacy: "poveritelnost",
    licenses: "licenzi",
    help: "pomosht",
    scoreboard: "tablo",
    scoreboardIntro: "tablo-za-rezultati",
    leaderboards: "klasatsii",
    brackets: "turnirni-shemi",
    leaderboardEditor: "klasatsii/redaktirane",
    bracketEditor: "turnirni-shemi/redaktirane",
  },
  tr: {
    home: "",
    saved: "kayitli-oyunlar",
    privacy: "gizlilik",
    licenses: "lisanslar",
    help: "yardim",
    scoreboard: "skor-tahtasi",
    scoreboardIntro: "skor-tablosu",
    leaderboards: "siralama",
    brackets: "turnuva-semalari",
    leaderboardEditor: "siralama/duzenle",
    bracketEditor: "turnuva-semalari/duzenle",
  },
  en: {
    home: "",
    saved: "scoreboards",
    privacy: "privacy",
    licenses: "licenses",
    help: "help",
    scoreboard: "scoreboard",
    scoreboardIntro: "tools/scoreboard",
    leaderboards: "leaderboards",
    brackets: "brackets",
    leaderboardEditor: "leaderboards/edit",
    bracketEditor: "brackets/edit",
  },
} as const;
export type PageKey = keyof typeof slugs.en;
export type DetailPageKey = Exclude<PageKey, "home" | "scoreboard">;

const legacyToolSlugs: Record<Lang, Partial<Record<PageKey, string>>> = {
  en: {},
  bg: {
    scoreboard: "scoreboard",
    scoreboardIntro: "tools/scoreboard",
    leaderboards: "leaderboards",
    brackets: "brackets",
    leaderboardEditor: "leaderboards/edit",
    bracketEditor: "brackets/edit",
  },
  tr: {
    scoreboard: "scoreboard",
    scoreboardIntro: "tools/scoreboard",
    leaderboards: "leaderboards",
    brackets: "brackets",
    leaderboardEditor: "leaderboards/edit",
    bracketEditor: "brackets/edit",
  },
};

export function route(lang: Lang, page: PageKey = "home"): string {
  return `/${lang}/${slugs[lang][page]}${slugs[lang][page] ? "/" : ""}`;
}
export function homeRoute(lang: Lang): string {
  return lang === "en" ? "/" : route(lang, "home");
}
export function localizedAlternates(origin: string, page: PageKey): Record<string, string> {
  const english = origin + (page === "home" ? "/" : route("en", page));
  const defaultRoute = page === "home" ? "/" : route("en", page);
  return {
    bg: origin + route("bg", page),
    tr: origin + route("tr", page),
    en: english,
    "en-GB": english,
    "x-default": origin + defaultRoute,
  };
}
export function pageForPath(path: string): PageKey | undefined {
  const normalizedPath = path.replace(/\/+$/, "") || "/";
  if (normalizedPath === "/scoreboard") return "scoreboard";
  for (const lang of ["bg", "tr", "en"] as const) {
    for (const page of Object.keys(slugs.en) as PageKey[]) {
      const currentPath =
        (page === "home" ? homeRoute(lang) : route(lang, page)).replace(/\/+$/, "") || "/";
      const legacySlug = legacyToolSlugs[lang][page];
      const legacyPath = legacySlug ? `/${lang}/${legacySlug}` : undefined;
      if (normalizedPath === currentPath || normalizedPath === legacyPath) return page;
    }
  }
  if (normalizedPath === "/tr/kayitli-tabelalar") return "saved";
  const alias = /^\/(bg|tr|en)\/(scoreboards|privacy|licenses)$/.exec(normalizedPath);
  return alias ? (alias[2] === "scoreboards" ? "saved" : (alias[2] as PageKey)) : undefined;
}

export function isApplicationPath(path: string, lang: Lang): boolean {
  const page = pageForPath(path);
  return (
    page === "scoreboard" ||
    page === "saved" ||
    page === "leaderboardEditor" ||
    page === "bracketEditor" ||
    path.replace(/\/$/, "") === route(lang, "scoreboard").replace(/\/$/, "")
  );
}

export function translatedPath(path: string, lang: Lang): string {
  const page = pageForPath(path) || "home";
  return page === "home" ? homeRoute(lang) : route(lang, page);
}
