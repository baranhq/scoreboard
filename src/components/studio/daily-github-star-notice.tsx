"use client";

import { Star, X } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { studioCopy } from "@/lib/studio-copy";
import type { Lang } from "@/lib/i18n";
import { localDateStamp, shouldShowDailyNotice } from "@/lib/daily-notice";
import { repo } from "@/lib/site";

const STORAGE_KEY = "scoreboard:github-star-notice:v1";

function subscribeToNotice(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function shouldShowToday() {
  const today = localDateStamp(new Date());
  try {
    return shouldShowDailyNotice(window.localStorage.getItem(STORAGE_KEY), today);
  } catch {
    return true;
  }
}

export function DailyGithubStarNotice({ lang }: { lang: Lang }) {
  const dueToday = useSyncExternalStore(subscribeToNotice, shouldShowToday, () => false);
  const [dismissed, setDismissed] = useState(false);
  const t = studioCopy[lang];

  useEffect(() => {
    if (!dueToday) return;
    const today = localDateStamp(new Date());
    try {
      window.localStorage.setItem(STORAGE_KEY, today);
    } catch {
      return;
    }
  }, [dueToday]);

  if (!dueToday || dismissed) return null;

  return (
    <aside
      role="status"
      aria-live="polite"
      className="fixed top-20 right-3 z-[100] flex w-[calc(100vw-1.5rem)] max-w-lg items-center gap-3 rounded-xl border border-forest/20 bg-surface px-3 py-3 text-sm text-ink shadow-xl sm:right-5 sm:px-4"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-forest/10 text-forest">
        <Star aria-hidden="true" size={18} />
      </span>
      <p className="min-w-0 flex-1 leading-5">{t.githubStarPrompt}</p>
      <a
        href={repo}
        target="_blank"
        rel="noreferrer"
        className="shrink-0 font-semibold text-action underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
      >
        {t.starOnGithub}
      </a>
      <button
        type="button"
        aria-label={t.close}
        title={t.close}
        onClick={() => setDismissed(true)}
        className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg border border-forest/20 text-forest hover:bg-forest/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
      >
        <X aria-hidden="true" size={17} />
      </button>
    </aside>
  );
}
