import Link from "next/link";
import { ViewTransition, type ReactNode } from "react";
import { ToolNavigation } from "./tool-navigation";
import { studioCopy } from "@/lib/studio-copy";
import { brand, repo } from "@/lib/site";
import { operator } from "@/lib/operator";
import { homeRoute, route } from "@/lib/routes";
import type { Lang, Messages } from "@/lib/i18n";
import { LanguageMenu } from "./language-menu";
import {
  FrameLanguageSuggestion,
  FrameOverlays,
  PrivacyChoiceButton,
  ScrollingHeader,
} from "./frame-client";
import { ThemeToggle } from "./theme-select";

function FooterGroup({
  title,
  label,
  children,
}: {
  title: string;
  label?: string;
  children: ReactNode;
}) {
  const links = <ul className="grid w-full justify-items-start gap-0.5">{children}</ul>;

  return (
    <section className="flex w-full max-w-60 min-w-0 flex-col items-start gap-[5px] text-left min-[761px]:gap-2">
      <h2 className="m-0 text-[15px] leading-[1.4] font-semibold opacity-60">{title}</h2>
      {label ? <nav aria-label={label}>{links}</nav> : links}
    </section>
  );
}

export function Frame({ lang, t, children }: { lang: Lang; t: Messages; children: ReactNode }) {
  const footerLink =
    "flex min-h-8 max-w-full items-center text-[15px] leading-[1.4] font-semibold text-[#f5f7ef] transition-colors duration-150 hover:text-[#c2ddc5] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#c2ddc5] motion-reduce:transition-none min-[761px]:min-h-[27px]";

  return (
    <div data-frame-root className="flex min-h-dvh flex-col">
      <a
        href="#main"
        data-frame-chrome
        className="sr-only z-50 rounded bg-surface p-3 focus:not-sr-only focus:fixed"
      >
        {t.home}
      </a>
      <div data-frame-chrome className="sticky top-0 z-40 h-16 shrink-0">
        <ScrollingHeader>
          <nav
            aria-label={t.home}
            className="mx-auto flex h-full max-w-[90rem] flex-nowrap items-center justify-between gap-1 px-2 py-1 sm:px-6 lg:px-10"
          >
            <Link
              href={homeRoute(lang)}
              aria-label={`${brand}: ${t.home}`}
              className="inline-flex min-h-11 shrink-0 items-center rounded-lg"
            >
              <img
                src="/wordmark-62157c899159.webp"
                srcSet="/wordmark-128-492516610722.webp 128w, /wordmark-256-aaadf7f18229.webp 256w"
                sizes="128px"
                width="315"
                height="83"
                alt={brand}
                className="h-auto w-24 sm:w-32 dark:brightness-0 dark:invert"
              />
            </Link>
            <div className="flex min-w-0 items-center gap-0 sm:gap-1">
              <ToolNavigation lang={lang} />
              <ThemeToggle t={t} />
              <LanguageMenu lang={lang} languageLabel={t.language} />
            </div>
          </nav>
        </ScrollingHeader>
      </div>
      <FrameLanguageSuggestion lang={lang} t={t} />
      <div data-frame-content className="flex-1">
        <ViewTransition default="none" enter="route-enter" exit="route-exit">
          {children}
        </ViewTransition>
      </div>
      <footer data-frame-chrome className="border-t border-white/10 bg-campaign text-white">
        <div className="mx-auto grid w-full max-w-5xl grid-cols-1 justify-items-center gap-x-8 gap-y-7 px-5 py-8 min-[360px]:grid-cols-2 sm:grid-cols-2 sm:py-10 md:grid-cols-3 lg:grid-cols-[repeat(3,minmax(0,15rem))] lg:justify-center lg:gap-x-16">
          <section className="flex w-full max-w-60 min-w-0 flex-col gap-4 justify-self-start text-left min-[360px]:col-span-2 md:col-span-1 md:justify-self-center">
            <Link
              href={homeRoute(lang)}
              aria-label={`${brand}: ${t.home}`}
              className="inline-flex min-h-11 items-start"
            >
              <img
                src="/wordmark-62157c899159.webp"
                srcSet="/wordmark-128-492516610722.webp 128w, /wordmark-256-aaadf7f18229.webp 256w"
                sizes="128px"
                width="315"
                height="83"
                alt={brand}
                className="h-auto w-28 brightness-0 invert"
              />
            </Link>
            <div>
              <h2 className="text-[15px] leading-[1.4] font-semibold opacity-70">{t.contact}</h2>
              <a className={footerLink} href={`mailto:${operator.email}`}>
                {operator.email}
              </a>
            </div>
          </section>
          <FooterGroup title={t.explore} label={t.explore}>
            <li>
              <Link className={footerLink} href={homeRoute(lang)}>
                {t.home}
              </Link>
            </li>
            <li>
              <Link className={footerLink} href={route(lang, "scoreboard")}>
                {studioCopy[lang].scoreboard}
              </Link>
            </li>
            <li>
              <Link className={footerLink} href={route(lang, "leaderboards")}>
                {studioCopy[lang].leaderboard}
              </Link>
            </li>
            <li>
              <Link className={footerLink} href={route(lang, "brackets")}>
                {studioCopy[lang].bracket}
              </Link>
            </li>
            <li>
              <Link className={footerLink} href={route(lang, "saved")}>
                {t.saved}
              </Link>
            </li>
            <li>
              <Link className={footerLink} href={route(lang, "help")}>
                {t.help}
              </Link>
            </li>
          </FooterGroup>
          <FooterGroup title={t.information} label={t.information}>
            <li>
              <Link className={footerLink} href={route(lang, "privacy")}>
                {t.privacy}
              </Link>
            </li>
            <li>
              <Link className={footerLink} href={route(lang, "licenses")}>
                {t.licenses}
              </Link>
            </li>
            <li>
              <PrivacyChoiceButton
                className={`${footerLink} border-0 bg-transparent p-0 text-left`}
              >
                {t.choices}
              </PrivacyChoiceButton>
            </li>
            <li>
              <a className={footerLink} href={repo} target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
            </li>
          </FooterGroup>
        </div>
        <div className="bg-[#182f20] px-4 py-2">
          <p className="mx-auto max-w-5xl text-center text-sm leading-[1.4] font-semibold break-words">
            {brand} · Copyright © 2026{" "}
            <a
              href="https://baranhq.com"
              className="transition-opacity duration-150 hover:opacity-50 motion-reduce:transition-none"
            >
              Baran Ahmedov (BaranHQ.com)
            </a>
            .{" "}
            <a
              href={`${repo}/blob/HEAD/LICENSE`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-forest/50 decoration-1 underline-offset-4 transition-[opacity,text-decoration-color] duration-150 hover:decoration-forest hover:opacity-50 motion-reduce:transition-none"
            >
              MIT License
            </a>
          </p>
        </div>
      </footer>
      <FrameOverlays lang={lang} t={t} />
    </div>
  );
}
