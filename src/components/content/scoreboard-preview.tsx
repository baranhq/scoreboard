"use client";

import { MousePointer2, Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { LandingContent } from "@/lib/landing-content";
import {
  PreviewConfiguration,
  PreviewTeamCard,
  PreviewTimer,
  PreviewToolbar,
} from "./scoreboard-preview-panels";
import type { PreviewLabels, PreviewState } from "./scoreboard-preview-types";

type PreviewStage = {
  durationMs: number;
  patch: Partial<PreviewState>;
  scroll?: "top" | "bottom";
};
type TeamBounds = { left: number; top: number; width: number; height: number };
type DemoPosition = { top: number };

function readTeamBounds(element: HTMLElement): Map<number, TeamBounds> {
  const bounds = new Map<number, TeamBounds>();
  const origin = element.getBoundingClientRect();

  element.querySelectorAll<HTMLElement>("[data-demo-team]").forEach((team) => {
    const rect = team.getBoundingClientRect();
    bounds.set(Number(team.dataset.demoTeam), {
      left: rect.left - origin.left,
      top: rect.top - origin.top,
      width: rect.width,
      height: rect.height,
    });
  });

  return bounds;
}

function initialPreviewState(copy: LandingContent["preview"]): PreviewState {
  return {
    teamNames: [copy.firstTeam, copy.secondTeam, copy.thirdTeam],
    scores: [0, 0, 0],
    teamCount: 2,
    teamPalettes: [0, 1, 2],
    tab: "teams",
    timerEnabled: false,
    timerRunning: false,
    timer: "01:00",
    trackPausedTime: false,
    editingTeamName: false,
    leavingThirdTeam: false,
    cursor: null,
    pressed: null,
  };
}

function buildSequence(copy: LandingContent["preview"]): PreviewStage[] {
  const initialNames: [string, string, string] = [copy.firstTeam, copy.secondTeam, copy.thirdTeam];
  const renamedNames: [string, string, string] = [
    copy.renamedFirstTeam,
    copy.secondTeam,
    copy.thirdTeam,
  ];
  const partiallyTypedNames: [string, string, string] = [
    copy.renamedFirstTeam.slice(0, 5),
    copy.secondTeam,
    copy.thirdTeam,
  ];
  const partiallyRestoredNames: [string, string, string] = [
    copy.firstTeam.slice(0, -1),
    copy.secondTeam,
    copy.thirdTeam,
  ];
  const release: PreviewStage = { durationMs: 180, patch: { pressed: null } };
  const moveTo = (
    target: PreviewState["cursor"],
    patch: Partial<PreviewState> = {},
  ): PreviewStage => ({
    durationMs: 0,
    patch: { ...patch, cursor: target, pressed: null },
  });
  const click = (
    target: NonNullable<PreviewState["cursor"]>,
    patch: Partial<PreviewState> = {},
    delayMs = 620,
  ): PreviewStage => ({
    durationMs: delayMs,
    patch: { ...patch, cursor: target, pressed: target },
  });
  const wait = (durationMs: number, patch: Partial<PreviewState> = {}): PreviewStage => ({
    durationMs,
    patch,
  });

  return [
    moveTo("team-one-plus"),
    click("team-one-plus", { scores: [1, 0, 0] }),
    release,
    click("team-one-plus", { scores: [2, 0, 0] }, 280),
    release,

    moveTo("colors-tab"),
    click("colors-tab", { tab: "colors" }),
    release,
    moveTo("team-one-color"),
    click("team-one-color", { teamPalettes: [2, 1, 2] }),
    release,

    moveTo("teams-tab"),
    click("teams-tab", { tab: "teams" }),
    release,
    moveTo("team-one-name"),
    click("team-one-name", { editingTeamName: true }),
    release,
    wait(250, { teamNames: partiallyTypedNames }),
    wait(320, { teamNames: renamedNames, editingTeamName: false }),

    moveTo("add-team"),
    click("add-team", { teamCount: 3 }),
    release,
    wait(220),

    moveTo("colors-tab"),
    click("colors-tab", { tab: "colors" }),
    release,
    moveTo("team-three-color"),
    click("team-three-color", { teamPalettes: [2, 1, 4] }),
    release,

    moveTo("timer-tab"),
    click("timer-tab", { tab: "timer" }),
    release,
    moveTo("timer-enable"),
    click("timer-enable", { timerEnabled: true, timer: "01:00" }),
    release,
    moveTo("timer-scroll"),
    { durationMs: 420, patch: { cursor: "timer-scroll" }, scroll: "bottom" },
    moveTo("timer-paused-time"),
    click("timer-paused-time", { trackPausedTime: true }),
    release,
    moveTo("timer-scroll"),
    { durationMs: 360, patch: { cursor: "timer-scroll" }, scroll: "top" },
    moveTo("timer-start"),
    click("timer-start", { timerRunning: true }),
    release,

    moveTo("team-two-plus"),
    click("team-two-plus", { scores: [2, 1, 0], timer: "00:59" }, 620),
    release,
    click("team-two-plus", { scores: [2, 2, 0], timer: "00:58" }, 820),
    release,
    moveTo("team-three-plus"),
    click("team-three-plus", { scores: [2, 2, 1], timer: "00:57" }, 620),
    release,
    moveTo("team-one-plus"),
    click("team-one-plus", { scores: [3, 2, 1], timer: "00:56" }, 620),
    release,
    click("team-one-plus", { scores: [4, 2, 1], timer: "00:55" }, 820),
    release,

    moveTo("timer-start"),
    click("timer-start", { timerRunning: false, timer: "00:54" }, 620),
    release,
    moveTo("timer-reset"),
    click("timer-reset", { timer: "01:00" }),
    release,

    moveTo("colors-tab"),
    click("colors-tab", { tab: "colors" }),
    release,
    moveTo("team-three-default-color"),
    click("team-three-default-color", { teamPalettes: [2, 1, 2] }),
    release,
    moveTo("team-one-default-color"),
    click("team-one-default-color", { teamPalettes: [0, 1, 2] }),
    release,

    moveTo("timer-tab"),
    click("timer-tab", { tab: "timer" }),
    release,
    moveTo("timer-enable"),
    click("timer-enable", {
      timerEnabled: false,
      timerRunning: false,
      timer: "01:00",
      trackPausedTime: false,
    }),
    release,
    moveTo("teams-tab"),
    click("teams-tab", { tab: "teams" }),
    release,

    moveTo("team-one-minus"),
    click("team-one-minus", { scores: [3, 2, 1] }),
    release,
    click("team-one-minus", { scores: [2, 2, 1] }, 280),
    release,
    moveTo("team-three-minus"),
    click("team-three-minus", { scores: [2, 2, 0] }),
    release,
    moveTo("team-three-remove"),
    click("team-three-remove", { leavingThirdTeam: true }),
    release,
    wait(260, { teamCount: 2, leavingThirdTeam: false }),
    moveTo("team-one-name"),
    click("team-one-name", { editingTeamName: true }),
    release,
    wait(250, { teamNames: partiallyRestoredNames }),
    wait(320, { teamNames: initialNames, editingTeamName: false }),

    moveTo("team-two-minus"),
    click("team-two-minus", { scores: [2, 1, 0] }),
    release,
    click("team-two-minus", { scores: [2, 0, 0] }, 280),
    release,
    moveTo("team-one-minus"),
    click("team-one-minus", { scores: [1, 0, 0] }),
    release,
    click("team-one-minus", { scores: [0, 0, 0] }, 280),
    release,
    moveTo("team-one-plus"),
  ];
}

export function ScoreboardPreview({
  copy,
  labels,
}: {
  copy: LandingContent["preview"];
  labels: PreviewLabels;
}) {
  const previewRef = useRef<HTMLElement>(null);
  const pointerRef = useRef<HTMLSpanElement>(null);
  const layoutSnapshotRef = useRef<Map<number, TeamBounds> | null>(null);
  const demoPositionSnapshotRef = useRef<DemoPosition | null>(null);
  const remainingMs = useRef<number | null>(null);
  const stageIndexRef = useRef(0);
  const [state, setState] = useState(() => initialPreviewState(copy));
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [mobileLayout, setMobileLayout] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(true);
  const [manuallyPaused, setManuallyPaused] = useState(false);
  const [motionPreferenceOverridden, setMotionPreferenceOverridden] = useState(false);
  const [playbackControlRevealed, setPlaybackControlRevealed] = useState(false);
  const sequence = useMemo(() => buildSequence(copy), [copy]);
  const playbackPaused = manuallyPaused || (prefersReducedMotion && !motionPreferenceOverridden);
  const shouldAnimate = inView && pageVisible && !playbackPaused;

  useLayoutEffect(() => {
    const demo = previewRef.current?.querySelector<HTMLElement>("[data-scoreboard-demo]");
    const pointer = pointerRef.current;
    if (!demo || !pointer) return;

    if (!state.cursor) {
      pointer.style.opacity = "0";
      return;
    }

    const target = demo.querySelector<HTMLElement>(`[data-demo-target="${state.cursor}"]`);
    if (!target) return;

    const updatePosition = () => {
      const demoBounds = demo.getBoundingClientRect();
      const targetBounds = target.getBoundingClientRect();
      const offset = mobileLayout ? 10 : 3;
      const x = targetBounds.left - demoBounds.left + targetBounds.width / 2 - offset;
      const y = targetBounds.top - demoBounds.top + targetBounds.height / 2 - offset;
      pointer.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      pointer.style.opacity = "1";
    };

    updatePosition();
    const scrollPanel = demo.querySelector<HTMLElement>("[data-demo-scroll-panel]");
    let resizeFrame = 0;
    const onResize = () => {
      window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(updatePosition);
    };
    window.addEventListener("resize", onResize, { passive: true });
    scrollPanel?.addEventListener("scroll", onResize, { passive: true });
    return () => {
      window.cancelAnimationFrame(resizeFrame);
      window.removeEventListener("resize", onResize);
      scrollPanel?.removeEventListener("scroll", onResize);
    };
  }, [
    mobileLayout,
    prefersReducedMotion,
    state.cursor,
    state.teamCount,
    state.tab,
    state.timerEnabled,
  ]);

  useLayoutEffect(() => {
    const previousBounds = layoutSnapshotRef.current;
    const previousPosition = demoPositionSnapshotRef.current;
    layoutSnapshotRef.current = null;
    demoPositionSnapshotRef.current = null;
    const demo = previewRef.current?.querySelector<HTMLElement>("[data-scoreboard-demo]");
    if ((!previousBounds && !previousPosition) || !demo || prefersReducedMotion) return;

    const animations: Animation[] = [];
    const currentDemo = demo.getBoundingClientRect();

    if (previousPosition) {
      const y = previousPosition.top - currentDemo.top;
      if (y !== 0) {
        animations.push(
          demo.animate(
            [{ transform: `translate3d(0, ${y}px, 0)` }, { transform: "translate3d(0, 0, 0)" }],
            { duration: 300, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
          ),
        );
      }
    }

    if (previousBounds) {
      demo.querySelectorAll<HTMLElement>("[data-demo-team]").forEach((team) => {
        const previous = previousBounds.get(Number(team.dataset.demoTeam));
        if (!previous) return;

        const current = team.getBoundingClientRect();
        const x = previous.left - (current.left - currentDemo.left);
        const y = previous.top - (current.top - currentDemo.top);
        const scaleX = previous.width / current.width;
        const scaleY = previous.height / current.height;
        if (x === 0 && y === 0 && scaleX === 1 && scaleY === 1) return;

        animations.push(
          team.animate(
            [
              { transform: `translate3d(${x}px, ${y}px, 0) scale(${scaleX}, ${scaleY})` },
              { transform: "translate3d(0, 0, 0) scale(1, 1)" },
            ],
            { duration: 300, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
          ),
        );
      });
    }

    if (animations.length === 0) return;
    return () => animations.forEach((animation) => animation.cancel());
  }, [prefersReducedMotion, state.teamCount, state.tab, state.timerEnabled]);

  useEffect(() => {
    const element = previewRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.12,
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const pointer = pointerRef.current;
    if (!pointer) return;

    pointer.getAnimations().forEach((animation) => {
      if (shouldAnimate) animation.play();
      else animation.pause();
    });
  }, [shouldAnimate]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(pointer: coarse), (max-width: 767px)");
    const update = () => setMobileLayout(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const update = () => setPageVisible(document.visibilityState === "visible");
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  useEffect(() => {
    if (!shouldAnimate) return;

    let timeout = 0;
    let delay = 0;
    let startedAt = 0;

    const runNextStage = () => {
      const stage = sequence[stageIndexRef.current];
      delay = remainingMs.current ?? stage.durationMs * (mobileLayout ? 1.35 : 1);
      remainingMs.current = null;
      startedAt = performance.now();

      timeout = window.setTimeout(() => {
        if (stage.scroll) {
          const optionsPanel = previewRef.current?.querySelector<HTMLElement>(
            "[data-demo-scroll-panel]",
          );
          if (optionsPanel) {
            const top =
              stage.scroll === "bottom" ? optionsPanel.scrollHeight - optionsPanel.clientHeight : 0;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
              optionsPanel.scrollTop = top;
            } else {
              optionsPanel.scrollTo({ top, behavior: "smooth" });
            }
          }
        }

        if (
          stage.patch.teamCount !== undefined ||
          stage.patch.tab !== undefined ||
          stage.patch.timerEnabled !== undefined
        ) {
          const demo = previewRef.current?.querySelector<HTMLElement>("[data-scoreboard-demo]");
          if (demo) {
            const bounds = demo.getBoundingClientRect();
            demoPositionSnapshotRef.current = { top: bounds.top };
            if (stage.patch.teamCount !== undefined)
              layoutSnapshotRef.current = readTeamBounds(demo);
          }
        }

        setState((current) =>
          Object.keys(stage.patch).length === 0 ? current : { ...current, ...stage.patch },
        );

        stageIndexRef.current = (stageIndexRef.current + 1) % sequence.length;
        const demo = previewRef.current?.querySelector<HTMLElement>("[data-scoreboard-demo]");
        demo?.setAttribute("data-demo-stage", String(stageIndexRef.current));
        runNextStage();
      }, delay);
    };

    runNextStage();

    return () => {
      window.clearTimeout(timeout);
      remainingMs.current = Math.max(0, delay - (performance.now() - startedAt));
    };
  }, [mobileLayout, sequence, shouldAnimate]);

  const visibleTeams = state.teamNames.slice(0, state.teamCount);

  return (
    <figure
      ref={previewRef}
      aria-labelledby="scoreboard-preview-caption"
      className="group/demo relative mx-auto flex h-[min(72svh,34rem)] max-h-[min(72svh,34rem)] min-h-[20rem] w-full max-w-2xl min-w-0 flex-col justify-center overflow-hidden rounded-xl md:h-[calc(100svh-4rem-1px)] md:max-h-[calc(100svh-4rem-1px)] md:min-h-0"
      onPointerDown={() => setPlaybackControlRevealed(true)}
    >
      <figcaption id="scoreboard-preview-caption" className="sr-only">
        {copy.accessibleDescription}
      </figcaption>
      <div className="relative w-full min-w-0">
        <button
          type="button"
          aria-label={playbackPaused ? labels.playPreview : labels.pausePreview}
          aria-pressed={playbackPaused}
          title={playbackPaused ? labels.playPreview : labels.pausePreview}
          onClick={() => {
            if (playbackPaused) {
              setManuallyPaused(false);
              setMotionPreferenceOverridden(true);
            } else {
              setManuallyPaused(true);
            }
          }}
          className={`absolute -top-14 right-2 z-40 flex h-11 w-11 items-center justify-center rounded-lg border border-forest/20 bg-surface text-forest transition-[opacity,background-color] duration-150 hover:bg-forest/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest motion-reduce:transition-none ${playbackControlRevealed ? "opacity-100" : "opacity-0"} group-focus-within/demo:opacity-100 md:right-3 md:group-hover/demo:opacity-100`}
        >
          {playbackPaused ? (
            <Play aria-hidden="true" className="h-4 w-4" />
          ) : (
            <Pause aria-hidden="true" className="h-4 w-4" />
          )}
        </button>
        <div
          data-scoreboard-demo
          data-demo-running={shouldAnimate}
          data-demo-stage="0"
          className="relative flex h-[min(calc(72svh-4rem),31rem)] max-h-[min(calc(72svh-4rem),31rem)] min-h-0 w-full min-w-0 flex-col overflow-hidden rounded-xl border border-forest/20 bg-paper p-2 text-ink shadow-sm motion-safe:animate-[preview-intro_720ms_cubic-bezier(0.16,1,0.3,1)_both] motion-reduce:animate-none sm:p-3 md:h-auto md:max-h-[calc(100svh-12rem-1px)]"
        >
          <PreviewToolbar copy={copy} labels={labels} />
          <div aria-hidden="true" className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <PreviewTimer state={state} labels={labels} />
            <div className={`grid gap-2 ${state.teamCount === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
              {visibleTeams.map((name, index) => (
                <PreviewTeamCard
                  key={index}
                  state={state}
                  index={index}
                  name={name}
                  score={state.scores[index]}
                />
              ))}
            </div>
            <div className="mt-2 flex justify-end [@media(max-height:600px)]:mt-1">
              <span className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-forest/25 px-2 py-1 text-sm font-medium text-forest">
                <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
                {labels.reset}
              </span>
            </div>
            <PreviewConfiguration state={state} copy={copy} labels={labels} />
          </div>
          {!prefersReducedMotion && (
            <span
              ref={pointerRef}
              aria-hidden="true"
              className="pointer-events-none absolute top-0 left-0 z-30 opacity-0 transition-[transform,opacity] duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
              style={{ transform: "translate3d(0, 0, 0)" }}
            >
              {mobileLayout ? (
                <span className="relative block h-5 w-5 rounded-full border-2 border-forest bg-paper/90 shadow-md">
                  <span className="absolute inset-1 rounded-full bg-action" />
                  {state.pressed === state.cursor && (
                    <span className="absolute -inset-1.5 rounded-full border border-action/70 motion-safe:animate-[cursor-tap_220ms_ease-out]" />
                  )}
                </span>
              ) : (
                <span
                  className={`relative block transition-transform duration-150 motion-reduce:transition-none ${state.pressed === state.cursor ? "scale-90" : "scale-100"}`}
                >
                  {state.pressed === state.cursor && (
                    <span className="absolute -top-1 -left-1 h-6 w-6 rounded-full border border-forest/60 motion-safe:animate-[cursor-tap_180ms_ease-out]" />
                  )}
                  <MousePointer2
                    aria-hidden="true"
                    className="h-5 w-5 fill-paper text-ink drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)] motion-safe:animate-[cursor-enter_180ms_ease-out]"
                    strokeWidth={1.7}
                  />
                </span>
              )}
            </span>
          )}
        </div>
      </div>
    </figure>
  );
}
