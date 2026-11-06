import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { Frame } from "@/components/layout/frame";
import { HomeFaq } from "@/components/content/home-faq";
import {
  LandingFeatures,
  LandingSteps,
  LandingUseCases,
  OpenSourceSection,
} from "@/components/content/landing-sections";
import { ScoreboardPreview } from "@/components/content/scoreboard-preview";
import { LandingMotion } from "@/components/content/landing-motion";
import { landingContent } from "@/lib/landing-content";
import { messages, type Lang } from "@/lib/i18n";
import { route } from "@/lib/routes";
import type { PreviewLabels } from "./scoreboard-preview-types";

const primaryLinkClass =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-action bg-action px-5 py-3 text-base font-semibold text-on-action transition-[filter,transform] duration-150 hover:brightness-95 active:scale-[.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest motion-safe:hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none";

export function LandingPage({ lang, root = false }: { lang: Lang; root?: boolean }) {
  const copy = landingContent[lang];
  const message = messages[lang];
  const previewLabels: PreviewLabels = {
    share: message.share,
    save: message.saveBoardShort,
    fullscreen: message.fullscreen,
    reset: message.reset,
    teams: message.teams,
    colors: message.colors,
    appearance: message.appearance,
    controls: message.controls,
    timer: message.timer,
    boardName: message.boardName,
    teamName: message.teamName,
    addTeam: message.add,
    scoreSize: message.scoreSize,
    medium: message.medium,
    teamSize: message.teamSize,
    increment: message.increment,
    enableTimer: message.enableTimer,
    countdown: message.countdown,
    pauseTimer: message.pauseTimer,
    startTimer: message.startTimer,
    pausePreview: message.pausePreview,
    playPreview: message.playPreview,
    resetTimer: message.resetTimer,
    teamColors: message.teamColors,
    customColor: message.customColor,
    color: message.color,
    iconColor: message.iconColor,
    resetColors: message.resetColors,
    layoutLabel: message.layoutLabel,
    automatic: message.automatic,
    horizontal: message.horizontal,
    grid: message.grid,
    density: message.density,
    compact: message.compact,
    spacious: message.spacious,
    small: message.small,
    large: message.large,
    extraLarge: message.extraLarge,
    fineTuneSizes: message.enableTextSizeSlider,
    icon: message.icon,
    resetAppearance: message.resetAppearance,
    step: message.step,
    fullscreenControls: message.fullscreenControls,
    autoHideControls: message.autoHideControls,
    timerMode: message.timerMode,
    duration: message.duration,
    hours: message.hours,
    minutes: message.minutes,
    minute: message.minute,
    seconds: message.seconds,
    showTimerHours: message.showTimerHours,
    trackPausedTime: message.trackPausedTime,
    pausedScoreNotice: message.pausedScoreNotice,
    sportsOptions: message.sportsOptions,
  };
  const scoreboardPath = root ? "/scoreboard/" : route(lang, "scoreboard");

  return (
    <>
      <script
        id={`legacy-scoreboard-link-${lang}`}
        dangerouslySetInnerHTML={{
          __html: `if (location.hash.startsWith("#share=") || location.hash.startsWith("#board=")) location.replace(${JSON.stringify(scoreboardPath)} + location.search + location.hash);`,
        }}
      />
      <Frame lang={lang} t={message}>
        <LandingMotion />
        <main id="main" data-landing-home className="mx-auto max-w-6xl px-4 sm:px-6">
          <section className="grid min-w-0 items-center gap-5 border-b border-forest/15 pt-8 pb-6 sm:gap-7 sm:py-10 md:min-h-[calc(100svh-4rem-1px)] md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:gap-10 md:py-0">
            <div className="min-w-0 text-center md:text-left">
              <h1 className="mx-auto max-w-xl font-display text-4xl leading-[1.08] font-bold tracking-tight text-ink motion-safe:animate-[hero-rise_650ms_cubic-bezier(0.16,1,0.3,1)_both] sm:text-5xl md:mx-0 md:text-4xl lg:text-5xl">
                {copy.hero.title}
              </h1>
              <p className="mx-auto mt-3 max-w-xl text-base leading-6 text-ink/85 [animation-delay:80ms] motion-safe:animate-[hero-rise_650ms_cubic-bezier(0.16,1,0.3,1)_both] sm:mt-4 sm:text-lg sm:leading-7 md:mx-0 md:mt-3 md:text-left lg:mt-4">
                {copy.hero.description}
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 [animation-delay:160ms] motion-safe:animate-[hero-rise_650ms_cubic-bezier(0.16,1,0.3,1)_both] sm:mt-6 sm:gap-x-5 sm:gap-y-3 md:mt-4 md:justify-start lg:mt-6">
                <Link href={scoreboardPath} className={primaryLinkClass}>
                  {copy.hero.action}
                  <ArrowRight aria-hidden="true" className="h-5 w-5" />
                </Link>
                <a
                  href="#features"
                  className="inline-flex min-h-11 items-center gap-2 text-base font-semibold text-forest transition-[color,text-decoration-color] duration-150 hover:text-forest/75 hover:underline hover:decoration-forest/50 hover:underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest motion-reduce:transition-none"
                >
                  {copy.hero.featuresLink}
                </a>
              </div>
              <ul className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-base font-medium text-ink [animation-delay:240ms] motion-safe:animate-[hero-rise_650ms_cubic-bezier(0.16,1,0.3,1)_both] md:mt-3 md:justify-start lg:mt-5">
                {copy.hero.benefits.map((benefit) => (
                  <li key={benefit} className="inline-flex items-center gap-2">
                    <Check aria-hidden="true" className="h-4 w-4 shrink-0 text-forest" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
            <ScoreboardPreview copy={copy.preview} labels={previewLabels} />
          </section>

          <LandingFeatures copy={copy.features} />
          <LandingSteps copy={copy.steps} />
          <LandingUseCases copy={copy.useCases} />
          <OpenSourceSection copy={copy.openSource} />
          <HomeFaq lang={lang} />

          <section
            aria-labelledby="final-cta-title"
            data-reveal="scale"
            className="mb-9 flex flex-col items-start gap-4 rounded-xl bg-[#203e29] bg-none px-5 py-6 text-[#f5f7ef] sm:mb-10 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-7"
          >
            <div>
              <h2
                id="final-cta-title"
                className="font-display text-2xl font-bold tracking-tight sm:text-3xl"
              >
                {copy.finalCta.title}
              </h2>
              <p className="mt-2 text-base leading-7 text-white/85">{copy.finalCta.description}</p>
            </div>
            <Link
              href={scoreboardPath}
              className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-lg border border-white bg-white px-5 py-3 text-base font-semibold text-[#203e29] transition-[filter,transform] duration-150 hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white active:scale-[.98] motion-safe:hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none"
            >
              {copy.finalCta.action}
              <ArrowRight aria-hidden="true" className="h-5 w-5" />
            </Link>
          </section>
        </main>
      </Frame>
    </>
  );
}
