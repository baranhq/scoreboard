import Link from "next/link";
import { ArrowUpRight, ArrowDown, Code2 } from "lucide-react";
import type { Tool } from "./tool-demo";
import { CompetitionStage } from "./competition-stage";
import { campaignCopy } from "@/lib/campaign-copy";
import { studioCopy } from "@/lib/studio-copy";
import type { Lang } from "@/lib/i18n";
import { route } from "@/lib/routes";
import { repo } from "@/lib/site";

export const primaryLinkClass =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-lime px-6 py-3 text-base font-semibold text-campaign transition-[filter,transform] duration-150 hover:brightness-95 active:scale-[.98] motion-reduce:transform-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime motion-reduce:transition-none";

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

export function LandingPage({ lang }: { lang: Lang; root?: boolean }) {
  const t = studioCopy[lang];
  const copy = campaignCopy[lang];
  return (
    <main id="main" data-campaign="dark" data-landing-home>
      <section className="bg-campaign text-campaign-ink">
        <div className="mx-auto grid max-w-[90rem] grid-cols-1 px-5 pt-7 pb-8 sm:px-8 lg:h-[calc(100svh-4rem)] lg:min-h-0 lg:grid-cols-[minmax(20rem,1.1fr)_minmax(0,0.9fr)] lg:items-center lg:gap-x-10 lg:px-10 lg:py-6">
          <div className="lg:flex lg:min-h-0 lg:flex-col lg:justify-center">
            <p className="mb-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold">
              <span className="text-lime">{t.free}</span>
              <span aria-hidden="true" className="text-white/45">
                ·
              </span>
              <span className="text-white/70">{t.local}</span>
            </p>
            <h1 className="max-w-[13ch] font-display text-[clamp(3rem,6.4vw,6.25rem)] leading-[0.9] font-bold tracking-[-0.05em] text-balance whitespace-pre-line motion-safe:animate-[text-enter_360ms_cubic-bezier(0.16,1,0.3,1)_both] motion-reduce:animate-none">
              {copy.headline}
            </h1>
            <p className="mt-5 max-w-[40ch] text-base leading-7 text-white/80 sm:text-lg sm:leading-8 lg:mt-6">
              {copy.intro}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link
                href={route(lang, toolEditors.scoreboard)}
                className="inline-flex min-h-12 items-center gap-2 bg-lime px-5 py-3 font-semibold text-campaign transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-lime active:translate-y-0 motion-reduce:transform-none"
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
          <div className="mt-8 min-w-0 lg:mt-0 lg:flex lg:h-full lg:min-h-0 lg:flex-col lg:justify-center">
            <CompetitionStage lang={lang} />
          </div>
        </div>
      </section>
      <section id="tools" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-14 sm:px-8 sm:py-20">
        {(["scoreboard", "leaderboard", "bracket"] as const).map((tool, index) => {
          const content = toolContent(lang, tool);
          return (
            <article
              key={tool}
              className="grid gap-4 border-b border-forest/25 py-7 first:border-t lg:grid-cols-[0.8fr_1fr_13rem] lg:items-center lg:gap-8"
            >
              <h2 className="font-display text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
                {t[tool]}
              </h2>
              <p className="max-w-[48ch] leading-7 text-ink/75">{content.description}</p>
              <div className="flex flex-wrap items-center gap-4 lg:flex-col lg:items-start">
                <Link
                  href={route(lang, toolEditors[tool])}
                  className="inline-flex min-h-11 items-center gap-2 font-semibold text-action"
                >
                  {content.action}
                  <ArrowUpRight size={18} aria-hidden="true" />
                </Link>
                <Link
                  href={route(lang, toolPages[tool])}
                  className="inline-flex min-h-11 items-center text-sm underline underline-offset-4"
                >
                  {t[tool]}
                </Link>
              </div>
              <span className="sr-only">{index + 1}</span>
            </article>
          );
        })}
      </section>
      <section className="bg-forest/5">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
          <h2 className="mb-9 max-w-[24ch] font-display text-[clamp(2.75rem,5.5vw,5rem)] leading-[0.98] font-bold tracking-[-0.04em] whitespace-pre-line">
            {copy.design}
          </h2>
          <CompetitionStage lang={lang} themes />
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
        <h2 className="max-w-[20ch] font-display text-4xl leading-tight font-bold tracking-[-0.04em] sm:text-5xl">
          {copy.workflow}
        </h2>
        <ol className="mt-10 grid gap-7 md:grid-cols-3">
          {copy.steps.map(([title, description], index) => (
            <li key={title} className="border-t border-forest/30 pt-4">
              <span className="font-display text-5xl font-semibold text-action">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-5 text-xl font-semibold">{title}</h3>
              <p className="mt-3 max-w-[35ch] leading-7 text-ink/75">{description}</p>
            </li>
          ))}
        </ol>
      </section>
      <section className="bg-campaign text-campaign-ink">
        <div className="mx-auto grid max-w-7xl gap-9 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          <h2 className="font-display text-[clamp(3.5rem,7vw,6rem)] leading-[0.95] font-bold tracking-[-0.04em]">
            {copy.ownership}
          </h2>
          <div>
            <p className="text-xl leading-8">{copy.open}</p>
            <p className="mt-5 text-sm leading-7 text-white/70">{t.ownershipText}</p>
            <a
              href={repo}
              className="mt-6 inline-flex min-h-12 items-center gap-3 border-b border-lime font-semibold text-lime"
            >
              <Code2 size={20} aria-hidden="true" />
              GitHub
              <ArrowUpRight size={18} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
      <section className="border-t border-white/10 bg-campaign text-campaign-ink">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
          <h2 className="font-display text-[clamp(3rem,7.5vw,7rem)] leading-[0.95] font-bold tracking-[-0.04em] whitespace-pre-line">
            {copy.close}
          </h2>
          <div className="mt-8 flex flex-wrap gap-3">
            {(["scoreboard", "leaderboard", "bracket"] as const).map((tool) => (
              <Link
                key={tool}
                href={route(lang, toolEditors[tool])}
                className={`${primaryLinkClass} !rounded-none`}
              >
                {t[tool]}
                <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
