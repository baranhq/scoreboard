import Link from "next/link";
import { ArrowUpRight, ArrowDown, Code2, Check } from "lucide-react";
import { PlatformDemo, ToolDemo, type Tool } from "./tool-demo";
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

const homeCopy = {
  en: {
    headline: "Every point.\nEvery position.\nEvery win.",
    heading: "A great game deserves a clear view.",
    steps: ["Pick your tool", "Make it yours", "Show the result"],
    descriptions: [
      "Keep a score, rank the field or build a tournament.",
      "Add your teams, enter results and choose your colours.",
      "Present the action, save locally or export a supported format.",
    ],
    ownership: "Your game. Your rules. Your browser.",
    source: "Built in the open.",
  },
  bg: {
    headline: "Всяка точка.\nВсяко място.\nВсяка победа.",
    heading: "Добрата игра заслужава ясна картина.",
    steps: ["Изберете инструмент", "Направете го свой", "Покажете резултата"],
    descriptions: [
      "Следете резултат, подредете класиране или създайте турнир.",
      "Добавете отбори, въведете резултати и изберете цветове.",
      "Представете играта, запазете локално или експортирайте в поддържан формат.",
    ],
    ownership: "Вашата игра. Вашите правила. Вашият браузър.",
    source: "С отворен код.",
  },
  tr: {
    headline: "Her sayı.\nHer sıra.\nHer galibiyet.",
    heading: "İyi bir oyun, net bir görünümü hak eder.",
    steps: ["Aracınızı seçin", "Kendinize uyarlayın", "Sonucu gösterin"],
    descriptions: [
      "Skor tutun, sıralama yapın veya turnuva oluşturun.",
      "Takımları ekleyin, sonuçları girin ve renkleri seçin.",
      "Oyunu sunun, cihazınıza kaydedin veya desteklenen bir biçimde dışa aktarın.",
    ],
    ownership: "Sizin oyununuz. Sizin kurallarınız. Sizin tarayıcınız.",
    source: "Açık kaynakla geliştirildi.",
  },
};

export function LandingPage({ lang }: { lang: Lang; root?: boolean }) {
  const t = studioCopy[lang];
  const copy = homeCopy[lang];
  return (
    <main id="main" data-landing-home>
      <section className="overflow-hidden bg-[#edf1e8] dark:bg-[#213027]">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 pt-10 pb-12 sm:px-8 sm:pt-14 lg:min-h-[43rem] lg:grid-cols-[1fr_1.05fr] lg:gap-12 lg:py-16">
          <header className="min-w-0">
            <p className="mb-5 text-xs font-bold tracking-[0.16em] text-forest uppercase">
              {t.homeEyebrow}
            </p>
            <h1 className="font-display text-[clamp(2.8rem,5.6vw,5.25rem)] leading-[0.98] font-bold tracking-[-0.065em] whitespace-pre-line">
              {copy.headline}
            </h1>
            <p className="mt-6 max-w-[43ch] text-base leading-7 text-ink/75 sm:text-lg">
              {t.intro}
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link href={route(lang, toolEditors.scoreboard)} className={primaryLinkClass}>
                {t.scoreAction}
                <ArrowUpRight aria-hidden="true" size={18} />
              </Link>
              <a
                href="#tools"
                className="inline-flex min-h-12 items-center gap-2 font-semibold text-forest"
              >
                {t.explore}
                <ArrowDown aria-hidden="true" size={16} />
              </a>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-forest sm:text-sm">
              {[t.free, t.local].map((text) => (
                <span key={text} className="inline-flex items-center gap-1.5">
                  <Check size={14} aria-hidden="true" />
                  {text}
                </span>
              ))}
            </div>
          </header>
          <div className="relative min-w-0 border-t border-b border-forest/25 py-4 lg:translate-y-3">
            <PlatformDemo lang={lang} compact />
          </div>
        </div>
      </section>

      <section id="tools" aria-labelledby="tools-title" className="scroll-mt-24">
        <div className="mx-auto max-w-7xl px-5 pt-14 sm:px-8 sm:pt-20">
          <h2
            id="tools-title"
            className="max-w-[20ch] font-display text-4xl leading-[1.04] font-bold tracking-[-0.045em] sm:text-5xl"
          >
            {copy.heading}
          </h2>
        </div>
        {(["scoreboard", "leaderboard", "bracket"] as const).map((tool, index) => {
          const content = toolContent(lang, tool);
          return (
            <article
              key={tool}
              className={tool === "bracket" ? "bg-[#e5ecdf] dark:bg-[#213027]" : ""}
            >
              <div
                className={`mx-auto grid max-w-7xl items-center gap-7 px-5 py-12 sm:px-8 sm:py-16 lg:gap-16 ${index === 1 ? "lg:grid-cols-[1.2fr_0.8fr]" : "lg:grid-cols-[0.8fr_1.2fr]"}`}
              >
                <div className={index === 1 ? "lg:order-2" : ""}>
                  <p className="mb-3 text-sm font-semibold text-forest">{t[tool]}</p>
                  <h3 className="max-w-[20ch] font-display text-3xl leading-[1.08] font-bold tracking-[-0.04em] sm:text-4xl">
                    {content.title}
                  </h3>
                  <p className="mt-4 max-w-[45ch] leading-7 text-ink/75">{content.description}</p>
                  <p className="mt-5 max-w-[44ch] text-sm leading-6 font-medium text-forest">
                    {content.features}
                  </p>
                  <Link
                    href={route(lang, toolPages[tool])}
                    className="mt-5 inline-flex min-h-11 items-center gap-2 font-semibold text-action underline decoration-action/35 underline-offset-4"
                  >
                    {t.learn}
                    <ArrowUpRight size={17} aria-hidden="true" />
                  </Link>
                </div>
                <div className={`min-w-0 ${index === 1 ? "lg:order-1" : ""}`}>
                  <ToolDemo tool={tool} lang={lang} compact />
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
        <ol className="grid gap-8 md:grid-cols-3 md:gap-10">
          {copy.steps.map((title, index) => (
            <li key={title} className="border-t border-forest/30 pt-4">
              <span className="font-display text-4xl font-semibold tracking-tight text-forest/50">
                0{index + 1}
              </span>
              <h2 className="mt-4 font-display text-2xl font-bold tracking-tight">{title}</h2>
              <p className="mt-2 max-w-[32ch] text-sm leading-6 text-ink/75">
                {copy.descriptions[index]}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-[#213f29] text-[#f7f7f0] dark:bg-[#172b20]">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-2 lg:gap-20">
          <h2 className="max-w-[15ch] font-display text-5xl leading-[1.02] font-bold tracking-[-0.05em] sm:text-6xl">
            {copy.ownership}
          </h2>
          <div className="self-end">
            <p className="mb-4 text-xl font-semibold text-[#a9d5a5]">{copy.source}</p>
            <p className="max-w-[55ch] leading-7 text-white/75">{t.ownershipText}</p>
            <div className="mt-6 flex flex-wrap items-center gap-6">
              <a
                href={repo}
                className="inline-flex min-h-12 items-center gap-2 font-semibold text-[#a9d5a5] underline underline-offset-4"
              >
                <Code2 size={20} aria-hidden="true" />
                GitHub
                <ArrowUpRight size={16} aria-hidden="true" />
              </a>
              <Link
                href={route(lang, toolEditors.scoreboard)}
                className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-[#a9d5a5] px-5 py-3 font-semibold text-[#19251c]"
              >
                {t.scoreAction}
                <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
