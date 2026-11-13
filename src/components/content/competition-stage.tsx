"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { ToolDemo, type Tool } from "./tool-demo";
import { useAutoDemo } from "./use-auto-demo";
import { ProductThemeShowcase } from "./product-theme-showcase";
import { studioCopy } from "@/lib/studio-copy";
import { productDetails } from "@/lib/product-details";
import { route } from "@/lib/routes";
import { messages, type Lang } from "@/lib/i18n";
import { themeLabels, toolThemes } from "@/lib/tool-themes";
import { Modal } from "@/components/ui/ui";
const tools: Tool[] = ["scoreboard", "leaderboard", "bracket"];
const editors = {
  scoreboard: "scoreboard",
  leaderboard: "leaderboardEditor",
  bracket: "bracketEditor",
} as const;
export function CompetitionStage({ lang, themes = false }: { lang: Lang; themes?: boolean }) {
  const [active, setActive] = useState(themes ? 1 : 0);
  const [widePreview, setWidePreview] = useState(false);
  const [themePromptOpen, setThemePromptOpen] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const advance = useCallback(() => setActive((index) => (index + 1) % tools.length), []);
  const reset = useCallback(() => setActive(0), []);
  const autoPlayByDefault = !themes;
  const { ref, playing, toggle, pause } = useAutoDemo(advance, reset, 8400, autoPlayByDefault, {
    allowReducedMotionAutoplay: autoPlayByDefault,
  });
  const t = studioCopy[lang];
  const tool = tools[active];
  const demoTheme = toolThemes[1];
  const demoThemeLabel = themeLabels[lang][1];

  useEffect(() => {
    const preview = previewRef.current;
    if (!preview || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(([entry]) => {
      setWidePreview(entry.contentRect.width >= 560);
    });
    observer.observe(preview);
    return () => observer.disconnect();
  }, [tool]);

  return (
    <section
      ref={ref}
      aria-label={t.tools}
      className={
        themes
          ? "min-w-0"
          : "flex min-h-0 min-w-0 flex-1 flex-col lg:justify-center [&_[data-demo-setup]]:hidden"
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
      <div
        className={`min-w-0 ${themes ? "pt-4 sm:pt-6" : "flex min-h-0 flex-1 flex-col pt-3 sm:pt-4 lg:flex-none"}`}
      >
        {themes ? (
          <ProductThemeShowcase
            key={tool}
            tool={tool}
            lang={lang}
            hint={productDetails[lang].themeHint}
          />
        ) : (
          <div className="flex min-h-0 min-w-0 flex-1 flex-col lg:flex-none">
            <div
              ref={previewRef}
              key={tool}
              className="mt-3 h-[clamp(17rem,40svh,24rem)] min-w-0 overflow-hidden rounded-2xl border border-white/15 bg-white/[0.025] motion-safe:animate-[surface-enter_360ms_cubic-bezier(0.22,1,0.36,1)_both] motion-reduce:animate-none sm:h-[clamp(18rem,40svh,25rem)] lg:mt-4 lg:h-[clamp(17rem,38svh,24rem)] lg:flex-none"
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
            <div className="mt-2 border-t border-white/15 pt-2">
              <button
                type="button"
                aria-haspopup="dialog"
                onClick={() => {
                  pause();
                  setThemePromptOpen(true);
                }}
                className="group inline-flex min-h-11 max-w-full items-center gap-2 rounded-md text-left text-sm text-white/70 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime motion-reduce:transition-none"
              >
                <span
                  aria-hidden="true"
                  className="size-3 shrink-0 rounded-full border border-white/30"
                  style={{ backgroundColor: demoTheme.accent }}
                />
                <span className="min-w-0">
                  {t.demoThemeLabel}:{" "}
                  <strong className="font-semibold text-white">{demoThemeLabel}</strong>
                </span>
                <ArrowUpRight
                  size={16}
                  aria-hidden="true"
                  className="shrink-0"
                  style={{ color: demoTheme.accent }}
                />
              </button>
            </div>
            <div className="mt-1 flex flex-wrap items-center justify-between gap-3 sm:gap-4">
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
            {themePromptOpen && (
              <Modal
                title={t.demoThemeQuestion}
                close={() => setThemePromptOpen(false)}
                closeLabel={t.close}
                footerActions={[
                  { id: "cancel", label: t.cancel, autoFocus: true },
                  { id: "create", label: t.demoThemeCreate, primary: true },
                ]}
                onAction={(id) => {
                  if (id !== "create") return;
                  const params = new URLSearchParams({ new: "1", theme: demoTheme.id ?? "" });
                  router.push(`${route(lang, editors[tool])}?${params.toString()}`);
                }}
              >
                <p className="text-base leading-relaxed text-ink/85">{t.demoThemeDetails}</p>
                <p className="mt-3 rounded-lg border border-forest/15 bg-forest/5 px-3 py-2 text-sm font-semibold text-forest">
                  {t.demoThemeLabel}: {demoThemeLabel}
                </p>
              </Modal>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
