"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ToolDemo, type Tool } from "./tool-demo";
import { useAutoDemo } from "./use-auto-demo";
import { ProductThemeShowcase } from "./product-theme-showcase";
import { studioCopy } from "@/lib/studio-copy";
import { productDetails } from "@/lib/product-details";
import { route } from "@/lib/routes";
import { messages, type Lang } from "@/lib/i18n";
const tools: Tool[] = ["scoreboard", "leaderboard", "bracket"];
const editors = {
  scoreboard: "scoreboard",
  leaderboard: "leaderboardEditor",
  bracket: "bracketEditor",
} as const;
export function CompetitionStage({ lang, themes = false }: { lang: Lang; themes?: boolean }) {
  const [active, setActive] = useState(themes ? 1 : 0);
  const [widePreview, setWidePreview] = useState(false);
  const advance = useCallback(() => setActive((index) => (index + 1) % tools.length), []);
  const reset = useCallback(() => setActive(0), []);
  const autoPlayByDefault = !themes;
  const { ref, playing, toggle, pause } = useAutoDemo(advance, reset, 8400, autoPlayByDefault, {
    allowReducedMotionAutoplay: autoPlayByDefault,
  });
  const t = studioCopy[lang];
  const tool = tools[active];

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const update = () => setWidePreview(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return (
    <section
      ref={ref}
      aria-label={t.tools}
      className={
        themes ? "min-w-0" : "flex min-h-0 min-w-0 flex-1 flex-col [&_[data-demo-setup]]:hidden"
      }
    >
      <div
        className="relative grid grid-cols-3 border-y border-current/20"
        role="group"
        aria-label={t.tools}
      >
        {tools.map((item, index) => (
          <button
            type="button"
            key={item}
            aria-pressed={active === index}
            onClick={() => {
              pause();
              setActive(index);
            }}
            className={`min-h-14 min-w-0 px-1 py-3 font-display text-sm font-semibold transition-colors focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-lime active:brightness-90 motion-reduce:transition-none sm:min-h-16 sm:text-xl ${active === index ? "bg-action text-on-action" : "hover:bg-current/10"}`}
          >
            {t[item]}
          </button>
        ))}
      </div>
      <div className={`min-w-0 ${themes ? "pt-4 sm:pt-6" : "pt-3 sm:pt-4"}`}>
        {themes ? (
          <ProductThemeShowcase
            key={tool}
            tool={tool}
            lang={lang}
            hint={productDetails[lang].themeHint}
          />
        ) : (
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <div
              key={tool}
              className="mt-3 h-[clamp(20rem,46svh,28rem)] min-w-0 overflow-hidden rounded-2xl border border-white/15 bg-white/[0.025] motion-safe:animate-[surface-enter_360ms_cubic-bezier(0.22,1,0.36,1)_both] motion-reduce:animate-none lg:mt-4 lg:h-[clamp(24rem,42svh,34rem)] lg:flex-1"
            >
              <ToolDemo
                tool={tool}
                lang={lang}
                compact
                showPreviewLabel={tool !== "scoreboard"}
                widePreview={widePreview}
                fillPreview={tool === "bracket"}
                autoplay={playing}
                readOnly
                showReadOnlyControls
                showPlaybackControls={false}
                showFullscreenControl={false}
                showResultControls={false}
                controlledPlayback
              />
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-white/15 pt-2 sm:mt-4 sm:pt-3">
              <Link
                href={route(lang, editors[tool])}
                className="inline-flex min-h-11 items-center gap-2 font-semibold"
              >
                {tool === "scoreboard"
                  ? t.scoreAction
                  : tool === "leaderboard"
                    ? t.leaderAction
                    : t.bracketAction}
                <ArrowUpRight size={18} aria-hidden="true" />
              </Link>
              <button
                type="button"
                data-stage-playback
                onClick={toggle}
                className="min-h-11 px-2 text-sm underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
              >
                {playing ? messages[lang].pausePreview : messages[lang].playPreview}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
