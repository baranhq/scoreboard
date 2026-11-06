"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { repo } from "@/lib/site";
import type { Lang } from "@/lib/i18n";
import { readStarPreference, shouldShowStar, STAR_PROMPT_KEY, WEEK } from "@/lib/star-prompt";
import { pageForPath } from "@/lib/routes";
import { usePathname } from "next/navigation";
const labels = {
  en: {
    message: "Finding Baran’s Scoreboard useful? A star on GitHub would mean a lot. Thank you!",
    link: "Star on GitHub",
    close: "Dismiss for a week",
  },
  bg: {
    message:
      "Полезен ли ви е Baran’s Scoreboard? Ще се радвам да оставите звезда в GitHub. Благодаря!",
    link: "Звезда в GitHub",
    close: "Скрий за седмица",
  },
  tr: {
    message:
      "Baran’s Scoreboard işinize yarıyor mu? GitHub’da bir yıldız bırakırsanız çok sevinirim. Teşekkürler!",
    link: "GitHub’da yıldızla",
    close: "Bir hafta gösterme",
  },
};
export function StarPrompt({ lang, fullscreen = false }: { lang: Lang; fullscreen?: boolean }) {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname() || "/";
  const t = labels[lang];
  useEffect(() => {
    if (pageForPath(pathname) !== "scoreboard") {
      setVisible(false);
      return;
    }

    const read = () => readStarPreference(localStorage.getItem(STAR_PROMPT_KEY));
    try {
      const p = read();
      const now = Date.now();
      setVisible(shouldShowStar(p, now));
      localStorage.setItem(STAR_PROMPT_KEY, JSON.stringify({ ...p, lastVisit: now }));
    } catch {}
    const clicked = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest("a") : null;
      if (!target || target.getAttribute("href") !== repo) return;
      setVisible(false);
      try {
        localStorage.setItem(STAR_PROMPT_KEY, JSON.stringify({ ...read(), clicked: true }));
      } catch {}
    };
    document.addEventListener("click", clicked);
    return () => document.removeEventListener("click", clicked);
  }, [pathname]);
  if (!visible || fullscreen || pageForPath(pathname) !== "scoreboard") return null;
  return (
    <aside
      aria-label={t.link}
      className="fixed right-4 bottom-4 z-30 w-[min(24rem,calc(100vw-2rem))] rounded-xl border border-forest/25 bg-surface p-4 shadow-sm motion-safe:animate-[appear_150ms_ease-out]"
    >
      <div className="flex items-start gap-2">
        <p className="text-base leading-6">{t.message}</p>
        <button
          type="button"
          aria-label={t.close}
          onClick={() => {
            setVisible(false);
            try {
              const p = readStarPreference(localStorage.getItem(STAR_PROMPT_KEY));
              localStorage.setItem(
                STAR_PROMPT_KEY,
                JSON.stringify({ ...p, dismissedUntil: Date.now() + WEEK }),
              );
            } catch {}
          }}
          className="-mt-2 -mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg transition-colors duration-150 hover:bg-forest/8 motion-reduce:transition-none"
        >
          <X aria-hidden="true" className="h-5 w-5" />
        </button>
      </div>
      <a
        href={repo}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 inline-flex min-h-11 items-center font-semibold text-forest transition-opacity duration-150 hover:opacity-50 motion-reduce:transition-none"
      >
        {t.link}
      </a>
    </aside>
  );
}
