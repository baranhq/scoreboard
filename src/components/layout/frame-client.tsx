"use client";

import { useCallback, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import type { Lang, Messages } from "@/lib/i18n";
import { LanguageSuggestion } from "./language-suggestion";
import { PrivacyControls } from "./privacy-controls";

function subscribeToLanguageCheck(onChange: () => void) {
  window.addEventListener("scoreboard-language-check-complete", onChange);
  return () => window.removeEventListener("scoreboard-language-check-complete", onChange);
}

function getLanguageCheckSnapshot() {
  return document.documentElement.dataset.scoreboardLanguageCheck === "complete";
}

function getServerLanguageCheckSnapshot() {
  return false;
}

export function ScrollingHeader({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const campaign = /^\/(?:(?:en|bg|tr)(?:\/(?:tools\/scoreboard|brackets))?)?\/?$/.test(pathname);

  useEffect(() => {
    const sync = () => setScrolled(window.scrollY > 20);
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    return () => window.removeEventListener("scroll", sync);
  }, []);

  return (
    <header
      className={`${campaign ? "!bg-[#14251b] text-[#f5f2e8] [--color-action:#ccf86b] [--color-forest:#ccf86b] [--color-ink:#f5f2e8] [--color-on-action:#14251b] [--color-paper:#14251b] [&_img]:brightness-0 [&_img]:invert" : ""} transition-[height,background-color,backdrop-filter] duration-150 ease-out motion-reduce:transition-none ${scrolled ? "h-14 bg-[#edf1e8]/90 backdrop-blur-sm dark:bg-[#213027]/90" : "h-16 bg-[#edf1e8] dark:bg-[#213027]"}`}
    >
      {children}
    </header>
  );
}

export function PrivacyChoiceButton({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}) {
  return (
    <button onClick={() => window.dispatchEvent(new Event("privacy-open"))} className={className}>
      {children}
    </button>
  );
}

export function FrameLanguageSuggestion({ lang, t }: { lang: Lang; t: Messages }) {
  const completeLanguageCheck = useCallback(() => {
    document.documentElement.dataset.scoreboardLanguageCheck = "complete";
    window.dispatchEvent(new Event("scoreboard-language-check-complete"));
  }, []);

  return (
    <div data-frame-chrome className="contents">
      <LanguageSuggestion lang={lang} t={t} onComplete={completeLanguageCheck} />
    </div>
  );
}

export function FrameOverlays({ lang, t }: { lang: Lang; t: Messages }) {
  const [fullscreen, setFullscreen] = useState(false);
  const promptReady = useSyncExternalStore(
    subscribeToLanguageCheck,
    getLanguageCheckSnapshot,
    getServerLanguageCheckSnapshot,
  );

  useEffect(() => {
    try {
      // Remove the preference left behind by the old star reminder.
      window.localStorage.removeItem("scoreboard-star-prompt");
    } catch {}

    const syncFullscreen = (event: Event) => {
      const active = (event as CustomEvent<boolean>).detail === true;
      setFullscreen(active);
      if (active) document.documentElement.dataset.scoreboardFullscreen = "true";
      else delete document.documentElement.dataset.scoreboardFullscreen;
    };
    window.addEventListener("scoreboard-fullscreen-change", syncFullscreen);

    return () => {
      window.removeEventListener("scoreboard-fullscreen-change", syncFullscreen);
      delete document.documentElement.dataset.scoreboardFullscreen;
      delete document.documentElement.dataset.scoreboardLanguageCheck;
    };
  }, []);

  return (
    <>
      <PrivacyControls lang={lang} t={t} fullscreen={fullscreen} promptReady={promptReady} />
    </>
  );
}
