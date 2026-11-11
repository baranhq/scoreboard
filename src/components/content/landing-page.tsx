import Link from "next/link";
import { ArrowUpRight, ArrowDown, Code2 } from "lucide-react";
import { ToolDemo, type Tool } from "./tool-demo";
import { HomeScoreboard } from "./home-scoreboard";
import { studioCopy } from "@/lib/studio-copy";
import type { Lang } from "@/lib/i18n";
import { route } from "@/lib/routes";
import { repo } from "@/lib/site";

export const primaryLinkClass =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-action px-6 py-3 text-base font-semibold text-on-action transition-[filter,transform] duration-150 hover:brightness-95 active:scale-[.98] motion-reduce:transform-none motion-reduce:transition-none";

export const toolPages = {
  scoreboard: "scoreboardIntro",
  leaderboard: "leaderboards",
  bracket: "brackets",
} as const;

export const toolEditors = {
  scoreboard: "scoreboard",
  leaderboard: "leaderboardEditor",
  bracket: "bracketEditor",
} as const;

export function toolContent(lang: Lang, tool: Tool) {
  const t = studioCopy[lang];
  return {
    title:
      tool === "scoreboard"
        ? t.scoreTitle
        : tool === "leaderboard"
          ? t.leaderTitle
          : t.bracketTitle,
    description:
      tool === "scoreboard"
        ? t.scoreDescription
        : tool === "leaderboard"
          ? t.leaderDescription
          : t.bracketDescription,
    action:
      tool === "scoreboard"
        ? t.scoreAction
        : tool === "leaderboard"
          ? t.leaderAction
          : t.bracketAction,
    features:
      tool === "scoreboard"
        ? t.scoreFeatures
        : tool === "leaderboard"
          ? t.leaderFeatures
          : t.bracketFeatures,
  };
}

const homeCopy = {
  en: {
    headline: "Every point.\nEvery position.\nEvery win.",
    ownership: "Your game. Your rules. Your browser.",
  },
  bg: {
    headline: "Всяка точка.\nВсяко място.\nВсяка победа.",
    ownership: "Вашата игра. Вашите правила. Вашият браузър.",
  },
  tr: {
    headline: "Her sayı.\nHer sıra.\nHer galibiyet.",
    ownership: "Sizin oyununuz. Sizin kurallarınız. Sizin tarayıcınız.",
  },
};

export function LandingPage({ lang }: { lang: Lang; root?: boolean }) {
  const t = studioCopy[lang];
  const copy = homeCopy[lang];
  return (
    <main id="main" data-campaign="dark" data-landing-home>
      <section className="overflow-hidden bg-[#14251b] text-[#f5f2e8]">
        <div className="mx-auto max-w-7xl px-5 pt-10 sm:px-8 sm:pt-14">
          <div className="grid items-end gap-6 motion-safe:animate-[preview-intro_600ms_ease-out_both] lg:grid-cols-[1.3fr_0.7fr]">
            <h1 className="font-display text-[clamp(3.5rem,8vw,7rem)] leading-[0.88] font-bold tracking-[-0.065em] whitespace-pre-line">
              {copy.headline}
            </h1>
            <div className="lg:pb-2">
              <p className="max-w-[42ch] text-base leading-7 text-white/75 sm:text-lg">{t.intro}</p>
              <div className="mt-6 flex flex-wrap items-center gap-5">
                <Link
                  href={route(lang, toolEditors.scoreboard)}
                  className="inline-flex min-h-12 items-center gap-3 rounded-full bg-[#ccf86b] px-6 py-3 font-semibold text-[#14251b] transition-transform active:scale-95 motion-reduce:transform-none"
                >
                  {t.scoreAction}
                  <ArrowUpRight size={18} aria-hidden="true" />
                </Link>
                <a
                  href="#tools"
                  className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold"
                >
                  {t.explore}
                  <ArrowDown size={16} aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
          <div className="mt-10 border-t border-white/25 pt-3 pb-7 sm:mt-12">
            <div className="mb-3 flex flex-wrap justify-between gap-2 text-xs font-semibold tracking-wide text-[#ccf86b]">
              <span>{t.scoreboard}</span>
              <span>
                {t.free} · {t.local}
              </span>
            </div>
            <HomeScoreboard lang={lang} />
          </div>
        </div>
      </section>
      <section id="tools" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-14 sm:px-8 sm:py-20">
        <div className="grid items-center gap-9 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <div>
            <p className="mb-4 text-sm font-semibold text-action">{t.leaderboard}</p>
            <h2 className="font-display text-[clamp(2.75rem,5vw,5rem)] leading-[0.98] font-bold tracking-[-0.055em]">
              {t.leaderTitle}
            </h2>
            <p className="mt-5 max-w-[40ch] leading-7 text-ink/75">{t.leaderDescription}</p>
            <Link href={route(lang, toolPages.leaderboard)} className={`${primaryLinkClass} mt-7`}>
              {t.leaderAction}
              <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </div>
          <div className="min-w-0 border-t-[6px] border-[#285b35] bg-[#e6ebdd] p-3 sm:p-7 dark:bg-[#243b2b]">
            <ToolDemo tool="leaderboard" lang={lang} compact />
          </div>
        </div>
      </section>
      <section className="overflow-hidden bg-[#d8eead] text-[#14251b] dark:bg-[#263c28] dark:text-[#f5f2e8]">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
          <div className="grid items-end gap-5 pb-8 md:grid-cols-[1.2fr_0.8fr]">
            <h2 className="max-w-[17ch] font-display text-[clamp(2.75rem,6vw,5.5rem)] leading-[0.98] font-bold tracking-[-0.055em]">
              {t.bracketTitle}
            </h2>
            <div>
              <p className="max-w-[45ch] leading-7 opacity-80">{t.bracketDescription}</p>
              <Link
                href={route(lang, toolPages.bracket)}
                className="mt-3 inline-flex min-h-11 items-center gap-2 font-semibold underline underline-offset-4"
              >
                {t.bracketAction}
                <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
            </div>
          </div>
          <div className="mx-auto max-w-4xl min-w-0">
            <ToolDemo tool="bracket" lang={lang} compact />
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
          <h2 className="font-display text-4xl leading-[1.02] font-bold tracking-[-0.04em] sm:text-5xl">
            {copy.ownership}
          </h2>
          <div>
            <p className="max-w-[65ch] leading-7 text-ink/75">{t.ownershipText}</p>
            <a
              href={repo}
              className="mt-5 inline-flex min-h-11 items-center gap-2 font-semibold text-action"
            >
              <Code2 size={18} aria-hidden="true" />
              GitHub
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
