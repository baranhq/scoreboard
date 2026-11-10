import Link from "next/link";
import { ArrowUpRight, Code2 } from "lucide-react";
import { PlatformDemo, type Tool } from "./tool-demo";
import { studioCopy } from "@/lib/studio-copy";
import type { Lang } from "@/lib/i18n";
import { route } from "@/lib/routes";
import { repo } from "@/lib/site";

export const primaryLinkClass =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-action px-5 py-3 text-base font-semibold text-on-action transition-[filter,transform] duration-150 hover:brightness-95 active:scale-[.98] motion-reduce:transform-none motion-reduce:transition-none";

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
  const sequence: Tool[] = ["scoreboard", "leaderboard", "bracket"];

  return (
    <main id="main">
      <section className="bg-[#edf1e8] dark:bg-[#213027]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid min-w-0 items-center gap-8 py-8 sm:py-12 lg:min-h-[44rem] lg:grid-cols-[minmax(16rem,0.72fr)_minmax(0,1.28fr)] lg:gap-10 lg:py-14">
            <header className="min-w-0">
              <p className="mb-4 text-xs font-bold tracking-[0.18em] text-forest uppercase">
                {t.homeEyebrow}
              </p>
              <h1 className="max-w-[15ch] font-display text-[clamp(2.75rem,4.6vw,3.75rem)] leading-[0.94] font-bold tracking-[-0.055em] text-balance whitespace-pre-line">
                {t.headline}
              </h1>
              <p className="mt-5 max-w-[38ch] text-lg leading-relaxed text-ink/80 sm:text-xl">
                {t.intro}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link href={route(lang, toolEditors.scoreboard)} className={primaryLinkClass}>
                  {t.scoreAction}
                  <ArrowUpRight aria-hidden="true" size={18} />
                </Link>
              </div>
              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-forest">
                <span>{t.free}</span>
                <span>{t.local}</span>
              </div>
            </header>
            <div className="min-w-0 lg:pl-2">
              <PlatformDemo lang={lang} />
            </div>
          </div>
        </div>
      </section>

      <section
        id="sequence"
        aria-labelledby="sequence-title"
        className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16"
      >
        <header className="grid gap-4 border-b border-forest/20 pb-5 md:grid-cols-[0.8fr_1.2fr] md:items-end md:gap-10">
          <h2
            id="sequence-title"
            className="max-w-[13ch] font-display text-3xl leading-tight font-bold tracking-tight sm:text-4xl"
          >
            {t.together}
          </h2>
          <p className="max-w-[55ch] text-base leading-7 text-ink/80 sm:text-lg sm:leading-8">
            {t.togetherText}
          </p>
        </header>
        <ol className="divide-y divide-forest/15">
          {sequence.map((tool, index) => {
            const content = toolContent(lang, tool);
            return (
              <li
                key={tool}
                className="grid min-w-0 gap-3 py-5 transition-colors hover:bg-forest/[0.025] sm:grid-cols-[4rem_minmax(10rem,0.7fr)_minmax(0,1.3fr)_auto] sm:items-center sm:gap-5 sm:py-6"
              >
                <span className="font-display text-sm font-bold text-forest tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display text-xl font-bold tracking-tight sm:text-2xl">
                  {t[tool]}
                </h3>
                <p className="max-w-[60ch] text-sm leading-6 text-ink/75 sm:text-base">
                  {content.features}
                </p>
                <Link
                  className="inline-flex min-h-11 items-center gap-2 font-semibold text-action"
                  href={route(lang, toolEditors[tool])}
                >
                  {content.action}
                  <ArrowUpRight aria-hidden="true" size={16} />
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="bg-[#213f29] text-[#f5f7ef] dark:bg-[#172b23]">
        <div className="mx-auto grid max-w-6xl gap-5 px-4 py-9 sm:px-6 sm:py-12 md:grid-cols-[0.8fr_1.2fr] md:items-center md:gap-12">
          <div>
            <p className="mb-3 text-xs font-bold tracking-[0.16em] text-[#b8d5b8] uppercase">
              {t.free} · {t.local}
            </p>
            <h2 className="max-w-[14ch] font-display text-3xl leading-tight font-bold tracking-tight sm:text-4xl">
              {t.ownership}
            </h2>
          </div>
          <div>
            <p className="max-w-[65ch] text-base leading-7 text-white/80">{t.ownershipText}</p>
            <div className="mt-4 flex flex-wrap gap-4">
              <a
                href={repo}
                className="inline-flex min-h-11 items-center gap-2 font-semibold text-white underline decoration-white/40 underline-offset-4 hover:decoration-white"
              >
                <Code2 aria-hidden="true" size={18} />
                GitHub
                <ArrowUpRight aria-hidden="true" size={16} />
              </a>
              <Link
                href={route(lang, toolEditors.scoreboard)}
                className="inline-flex min-h-11 items-center gap-2 font-semibold text-white underline decoration-white/40 underline-offset-4 hover:decoration-white"
              >
                {t.scoreAction}
                <ArrowUpRight aria-hidden="true" size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
