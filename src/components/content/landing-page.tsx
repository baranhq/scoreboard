import Link from "next/link";
import { ArrowDown, ArrowUpRight, Code2 } from "lucide-react";
import { studioCopy } from "@/lib/studio-copy";
import type { Lang } from "@/lib/i18n";
import { route } from "@/lib/routes";
import { repo } from "@/lib/site";
import { PlatformDemo, ToolDemo, type Tool } from "./tool-demo";
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
  return (
    <main id="main" className="mx-auto max-w-6xl px-4 sm:px-6">
      <section className="grid min-w-0 items-center gap-8 border-b border-forest/20 py-9 sm:py-14 lg:min-h-[42rem] lg:grid-cols-[1fr_1.05fr] lg:gap-12">
        <div className="min-w-0">
          <h1 className="max-w-[12ch] font-display text-[clamp(2.7rem,5.6vw,4.7rem)] leading-[.99] font-bold tracking-[-0.035em] text-balance">
            {t.headline}
          </h1>
          <p className="mt-6 max-w-[40ch] text-lg leading-relaxed text-ink/80">{t.intro}</p>
          <a href="#tools" className={`${primaryLinkClass} mt-6`}>
            {t.start}
            <ArrowDown size={18} />
          </a>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-forest">
            <span>{t.free}</span>
            <span>{t.local}</span>
          </div>
        </div>
        <div className="min-w-0 motion-safe:animate-[hero-rise_500ms_ease-out_both]">
          <PlatformDemo lang={lang} />
        </div>
      </section>
      <section id="tools" aria-label={t.tools} className="scroll-mt-20">
        {(["scoreboard", "leaderboard", "bracket"] as const).map((tool, i) => {
          const content = toolContent(lang, tool);
          return (
            <article
              key={tool}
              className="grid min-w-0 items-center gap-6 border-b border-forest/20 py-10 sm:py-16 md:grid-cols-2 md:gap-12"
            >
              <div className={i === 1 ? "min-w-0 md:order-2" : "min-w-0"}>
                <h2 className="font-display text-4xl leading-tight font-bold tracking-tight">
                  {t[tool]}
                </h2>
                <p className="mt-3 max-w-[40ch] text-lg leading-relaxed text-ink/80">
                  {content.description}
                </p>
                <p className="mt-4 text-sm leading-6 font-medium text-forest">{content.features}</p>
                <div className="mt-5 flex flex-wrap items-center gap-4">
                  <Link href={route(lang, toolEditors[tool])} className={primaryLinkClass}>
                    {content.action}
                    <ArrowUpRight size={18} />
                  </Link>
                  <Link
                    className="inline-flex min-h-11 items-center text-base font-semibold underline decoration-forest/35 underline-offset-4"
                    href={route(lang, toolPages[tool])}
                  >
                    {t.learn}
                  </Link>
                </div>
              </div>
              <ToolDemo tool={tool} lang={lang} />
            </article>
          );
        })}
      </section>
      <section className="grid gap-6 py-12 sm:py-16 md:grid-cols-[1fr_1.2fr] md:gap-16">
        <h2 className="max-w-[14ch] font-display text-4xl leading-tight font-bold tracking-tight">
          {t.ownership}
        </h2>
        <div>
          <p className="max-w-prose text-base leading-8 text-ink/80">{t.ownershipText}</p>
          <a
            href={repo}
            className="mt-4 inline-flex min-h-11 items-center gap-2 font-semibold text-forest"
          >
            <Code2 size={18} />
            GitHub
            <ArrowUpRight size={16} />
          </a>
        </div>
      </section>
    </main>
  );
}
