"use client";
import Link from "next/link";
import { StarPrompt } from "./star-prompt";
import { brand, repo } from "@/lib/site";
import { operator } from "@/lib/operator";
import { homeRoute, route } from "@/lib/routes";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import type { Lang, Messages } from "@/lib/i18n";
import { FolderOpen } from "lucide-react";
import { LanguageSuggestion } from "./language-suggestion";
import { LanguageMenu } from "./language-menu";
import { ThemeToggle } from "./theme-select";
import { PrivacyControls } from "./privacy-controls";

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
    <section className="mx-auto flex w-full max-w-[420px] flex-col items-start gap-[5px] text-left min-[761px]:w-fit min-[761px]:max-w-full min-[761px]:gap-2">
      <h2 className="m-0 text-[15px] leading-[1.4] font-semibold opacity-60">{title}</h2>
      {label ? <nav aria-label={label}>{links}</nav> : links}
    </section>
  );
}

export function Frame({
  lang,
  t,
  children,
  fullscreen = false,
}: {
  lang: Lang;
  t: Messages;
  children: ReactNode;
  fullscreen?: boolean;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [languageCheckComplete, setLanguageCheckComplete] = useState(false);
  const completeLanguageCheck = useCallback(() => setLanguageCheckComplete(true), []);
  useEffect(() => {
    const sync = () => setScrolled(window.scrollY > 20);
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    return () => window.removeEventListener("scroll", sync);
  }, []);
  const link =
    "inline-flex min-h-11 items-center text-[17px] font-medium transition-colors duration-150 hover:bg-forest/10 underline-offset-4 motion-reduce:transition-none";
  const footerLink =
    "flex min-h-8 max-w-full items-center text-[15px] leading-[1.4] font-semibold text-[#f5f7ef] transition-colors duration-150 hover:text-[#c2ddc5] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#c2ddc5] motion-reduce:transition-none min-[761px]:min-h-[27px]";
  return (
    <div className={fullscreen ? "contents" : "flex min-h-dvh flex-col"}>
      <a href="#main" className="sr-only z-50 rounded bg-surface p-3 focus:not-sr-only focus:fixed">
        {t.home}
      </a>
      {!fullscreen && (
        <div className="sticky top-0 z-40 h-16 shrink-0">
          <header
            className={`transition-[height,background-color,backdrop-filter] duration-150 ease-out motion-reduce:transition-none ${scrolled ? "h-14 bg-[#edf1e8]/90 backdrop-blur-sm dark:bg-[#213027]/90" : "h-16 bg-[#edf1e8] dark:bg-[#213027]"}`}
          >
            <nav
              aria-label={t.home}
              className="mx-auto flex h-full max-w-6xl flex-nowrap items-center justify-between gap-1 px-2 py-1 sm:px-6"
            >
              <div className="flex min-w-0 flex-1 items-center gap-0 sm:gap-2">
                <Link
                  className={`${link.replace("hover:bg-forest/10", "")} shrink-0 rounded-lg px-1 max-md:hidden md:inline-flex md:px-2`}
                  href={route(lang, "scoreboard")}
                  aria-label={`${brand}: ${t.home}`}
                >
                  <img
                    src="/wordmark-62157c899159.webp"
                    srcSet="/wordmark-56-82e25c28ac94.webp 56w, /wordmark-112-104bf045763f.webp 112w, /wordmark-128-492516610722.webp 128w, /wordmark-256-aaadf7f18229.webp 256w"
                    sizes="(min-width: 640px) 128px, 56px"
                    width="315"
                    height="83"
                    alt={brand}
                    className="aspect-[315/83] h-auto w-16 min-[360px]:w-[4.5rem] sm:w-32 dark:brightness-0 dark:invert"
                  />
                </Link>
                <Link
                  aria-label={t.saved}
                  className={`${link} ml-0 min-w-0 gap-2 rounded-lg px-2 text-base md:ml-8 md:px-3`}
                  href={route(lang, "saved")}
                >
                  <FolderOpen aria-hidden="true" className="h-4 w-4 shrink-0" />
                  <span className="whitespace-nowrap">{t.saved}</span>
                </Link>
              </div>
              <div className="flex shrink-0 items-center">
                <ThemeToggle t={t} />
                <LanguageMenu lang={lang} languageLabel={t.language} />
              </div>
            </nav>
          </header>
        </div>
      )}
      {!fullscreen && <LanguageSuggestion lang={lang} t={t} onComplete={completeLanguageCheck} />}
      <div className={fullscreen ? "contents" : "flex-1"}>{children}</div>
      {!fullscreen && (
        <footer className="mt-4 bg-[#213f29] text-white">
          <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-start gap-[14px] px-4 py-5 min-[761px]:grid-cols-3 min-[761px]:gap-10 sm:px-6">
            <FooterGroup title={t.contact}>
              <li>
                <a className={footerLink} href={`mailto:${operator.email}`}>
                  {operator.email}
                </a>
              </li>
            </FooterGroup>
            <FooterGroup title={t.explore} label={t.explore}>
              <li>
                <Link className={footerLink} href={homeRoute(lang)}>
                  {t.home}
                </Link>
              </li>
              <li>
                <Link className={footerLink} href={route(lang, "scoreboard")}>
                  {t.create}
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
                <button
                  onClick={() => window.dispatchEvent(new Event("privacy-open"))}
                  className={`${footerLink} border-0 bg-transparent p-0 text-left`}
                >
                  {t.choices}
                </button>
              </li>
              <li>
                <a className={footerLink} href={repo} target="_blank" rel="noopener noreferrer">
                  GitHub
                </a>
              </li>
            </FooterGroup>
          </div>
          <div className="bg-[#182f20] px-4 py-2">
            <p className="mx-auto max-w-6xl text-center text-sm leading-[1.4] font-semibold break-words">
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
      )}
      <StarPrompt lang={lang} fullscreen={fullscreen} />
      <PrivacyControls
        lang={lang}
        t={t}
        fullscreen={fullscreen}
        promptReady={languageCheckComplete}
      />
    </div>
  );
}
