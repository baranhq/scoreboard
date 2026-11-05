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
import { landingContent } from "@/lib/landing-content";
import { messages, type Lang } from "@/lib/i18n";
import { route } from "@/lib/routes";
import type { PreviewLabels } from "./scoreboard-preview-types";

const primaryLinkClass =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-action bg-action px-5 py-3 text-base font-semibold text-on-action transition-[filter,transform] duration-150 hover:brightness-95 active:scale-[.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-forest motion-reduce:transform-none motion-reduce:transition-none";

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
        <main id="main" className="mx-auto max-w-6xl px-4 sm:px-6">
          <section className="grid items-center gap-7 border-b border-forest/15 py-7 sm:py-10 lg:min-h-[48rem] lg:grid-cols-[0.8fr_1.2fr] lg:gap-10 lg:py-12">
            <div className="min-w-0">
              <h1 className="max-w-xl font-display text-4xl leading-tight font-bold tracking-tight text-ink sm:text-5xl">
                {copy.hero.title}
              </h1>
              <p className="mt-4 max-w-xl text-lg leading-7 text-ink/85">{copy.hero.description}</p>
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
                <Link href={scoreboardPath} className={primaryLinkClass}>
                  {copy.hero.action}
                  <ArrowRight aria-hidden="true" className="h-5 w-5" />
                </Link>
                <a
                  href="#features"
                  className="inline-flex min-h-11 items-center gap-2 text-base font-semibold text-forest transition-colors duration-150 hover:text-forest/75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest motion-reduce:transition-none"
                >
                  {copy.hero.featuresLink}
                </a>
              </div>
              <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-base font-medium text-ink">
                {copy.hero.benefits.map((benefit, index) => (
                  <li key={benefit} className="inline-flex items-center gap-2">
                    <Check aria-hidden="true" className="h-4 w-4 shrink-0 text-forest" />
                    {index === 2 ? (
                      <a
                        href="#open-source-title"
                        className="rounded-sm hover:text-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
                      >
                        {benefit}
                      </a>
                    ) : (
                      benefit
                    )}
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
            className="mb-9 flex flex-col items-start gap-4 rounded-xl bg-[#203e29] px-5 py-6 text-[#f5f7ef] sm:mb-10 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-7"
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
              className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-lg border border-white bg-white px-5 py-3 text-base font-semibold text-[#203e29] transition-[filter,transform] duration-150 hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white active:scale-[.98] motion-reduce:transform-none motion-reduce:transition-none"
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
