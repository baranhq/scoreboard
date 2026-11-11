"use client";

import { RotateCcw } from "lucide-react";
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
const darkPreviewTheme =
  "dark [--color-action:#79bb83] [--color-forest:#9cc99f] [--color-ink:#eef2ec] [--color-on-action:#132116] [--color-paper:#151d17] [--color-surface:#202a22]";

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
    pressed: null,
  };
}

function buildSequence(copy: LandingContent["preview"], compact = false): PreviewStage[] {
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
  const click = (
    target: NonNullable<PreviewState["pressed"]>,
    patch: Partial<PreviewState> = {},
    delayMs = 620,
  ): PreviewStage => ({
    durationMs: delayMs,
    patch: { ...patch, pressed: target },
  });
  const wait = (durationMs: number, patch: Partial<PreviewState> = {}): PreviewStage => ({
    durationMs,
    patch,
  });

  if (compact) {
    return [
      click("team-one-plus", { scores: [1, 0, 0] }),
      release,
      click("team-one-plus", { scores: [2, 0, 0] }, 360),
      release,
      click("team-two-plus", { scores: [2, 1, 0] }),
      release,
      click("team-two-plus", { scores: [2, 2, 0] }, 360),
      release,
      click("team-one-minus", { scores: [1, 2, 0] }),
      release,
      click("team-one-minus", { scores: [0, 2, 0] }, 360),
      release,
      click("team-two-minus", { scores: [0, 1, 0] }),
      release,
      click("team-two-minus", { scores: [0, 0, 0] }, 360),
      release,
    ];
  }

  return [
    click("team-one-plus", { scores: [1, 0, 0] }),
    release,
    click("team-one-plus", { scores: [2, 0, 0] }, 280),
    release,

    click("colors-tab", { tab: "colors" }),
    release,
    click("team-one-color", { teamPalettes: [2, 1, 2] }),
    release,

    click("teams-tab", { tab: "teams" }),
    release,
    click("team-one-name", { editingTeamName: true }),
    release,
    wait(250, { teamNames: partiallyTypedNames }),
    wait(320, { teamNames: renamedNames, editingTeamName: false }),

    click("add-team", { teamCount: 3 }),
    release,
    wait(220),

    click("colors-tab", { tab: "colors" }),
    release,
    click("team-three-color", { teamPalettes: [2, 1, 4] }),
    release,

    click("timer-tab", { tab: "timer" }),
    release,
    click("timer-enable", { timerEnabled: true, timer: "01:00" }),
    release,
    { durationMs: 420, patch: {}, scroll: "bottom" },
    click("timer-paused-time", { trackPausedTime: true }),
    release,
    { durationMs: 360, patch: {}, scroll: "top" },
    click("timer-start", { timerRunning: true }),
    release,

    click("team-two-plus", { scores: [2, 1, 0], timer: "00:59" }, 620),
    release,
    click("team-two-plus", { scores: [2, 2, 0], timer: "00:58" }, 820),
    release,
    click("team-three-plus", { scores: [2, 2, 1], timer: "00:57" }, 620),
    release,
    click("team-one-plus", { scores: [3, 2, 1], timer: "00:56" }, 620),
    release,
    click("team-one-plus", { scores: [4, 2, 1], timer: "00:55" }, 820),
    release,

    click("timer-start", { timerRunning: false, timer: "00:54" }, 620),
    release,
    click("timer-reset", { timer: "01:00" }),
    release,

    click("colors-tab", { tab: "colors" }),
    release,
    click("team-three-default-color", { teamPalettes: [2, 1, 2] }),
    release,
    click("team-one-default-color", { teamPalettes: [0, 1, 2] }),
    release,

    click("timer-tab", { tab: "timer" }),
    release,
    click("timer-enable", {
      timerEnabled: false,
      timerRunning: false,
      timer: "01:00",
      trackPausedTime: false,
    }),
    release,
    click("teams-tab", { tab: "teams" }),
    release,

    click("team-one-minus", { scores: [3, 2, 1] }),
    release,
    click("team-one-minus", { scores: [2, 2, 1] }, 280),
    release,
    click("team-three-minus", { scores: [2, 2, 0] }),
    release,
    click("team-three-remove", { leavingThirdTeam: true }),
    release,
    wait(260, { teamCount: 2, leavingThirdTeam: false }),
    click("team-one-name", { editingTeamName: true }),
    release,
    wait(250, { teamNames: partiallyRestoredNames }),
    wait(320, { teamNames: initialNames, editingTeamName: false }),

    click("team-two-minus", { scores: [2, 1, 0] }),
    release,
    click("team-two-minus", { scores: [2, 0, 0] }, 280),
    release,
    click("team-one-minus", { scores: [1, 0, 0] }),
    release,
    click("team-one-minus", { scores: [0, 0, 0] }, 280),
    release,
  ];
}

export function ScoreboardPreview({
  copy,
  labels,
  compact = false,
  readOnly = false,
  autoplay = true,
  showPlaybackControls = true,
}: {
  copy: LandingContent["preview"];
  labels: PreviewLabels;
  compact?: boolean;
  readOnly?: boolean;
  autoplay?: boolean;
  showPlaybackControls?: boolean;
}) {
  const previewRef = useRef<HTMLElement>(null);
  const layoutSnapshotRef = useRef<Map<number, TeamBounds> | null>(null);
  const demoPositionSnapshotRef = useRef<DemoPosition | null>(null);
  const remainingMs = useRef<number | null>(null);
  const sequenceTimeout = useRef<number | null>(null);
  const manuallyPausedRef = useRef(false);
  const resettingPlayback = useRef(false);
  const stageIndexRef = useRef(0);
  const [state, setState] = useState(() => initialPreviewState(copy));
  const [editingNameIndex, setEditingNameIndex] = useState<number | null>(null);
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [mobileLayout, setMobileLayout] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(true);
  const [manuallyPaused, setManuallyPaused] = useState(false);
  const [motionPreferenceOverridden, setMotionPreferenceOverridden] = useState(false);
  const sequence = useMemo(() => buildSequence(copy, compact), [compact, copy]);
  const playbackPaused = manuallyPaused || (prefersReducedMotion && !motionPreferenceOverridden);
  const shouldAnimate = autoplay && inView && pageVisible && !playbackPaused;

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
    if (!element || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.12,
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

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
        if (manuallyPausedRef.current) return;
        sequenceTimeout.current = null;
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
      sequenceTimeout.current = timeout;
    };

    runNextStage();

    return () => {
      window.clearTimeout(timeout);
      sequenceTimeout.current = null;
      remainingMs.current = resettingPlayback.current
        ? null
        : Math.max(0, delay - (performance.now() - startedAt));
      resettingPlayback.current = false;
    };
  }, [mobileLayout, sequence, shouldAnimate]);

  const visibleTeams = state.teamNames.slice(0, state.teamCount);
  const pausePlayback = () => {
    manuallyPausedRef.current = true;
    if (sequenceTimeout.current !== null) window.clearTimeout(sequenceTimeout.current);
    sequenceTimeout.current = null;
    setManuallyPaused(true);
  };
  const pauseForInteraction = () => pausePlayback();
  const resetDemo = () => {
    manuallyPausedRef.current = true;
    resettingPlayback.current = shouldAnimate;
    if (sequenceTimeout.current !== null) window.clearTimeout(sequenceTimeout.current);
    sequenceTimeout.current = null;
    remainingMs.current = null;
    stageIndexRef.current = 0;
    setState(initialPreviewState(copy));
    setEditingNameIndex(null);
    setManuallyPaused(true);
  };
  return (
    <figure
      ref={previewRef}
      aria-labelledby="scoreboard-preview-caption"
      className={`group/demo relative mx-auto flex min-w-0 flex-col justify-center overflow-hidden ${darkPreviewTheme} ${compact ? "h-full max-h-full w-full" : "h-[min(72svh,34rem)] max-h-[min(72svh,34rem)] min-h-[20rem] w-full max-w-2xl md:h-[calc(100svh-4rem-1px)] md:max-h-[calc(100svh-4rem-1px)] md:min-h-0"}`}
    >
      <figcaption id="scoreboard-preview-caption" className="sr-only">
        {copy.accessibleDescription}
      </figcaption>
      <div className={`relative w-full min-w-0 ${compact ? "h-full min-h-0" : ""}`}>
        <div
          data-scoreboard-demo
          data-demo-running={shouldAnimate}
          data-demo-stage="0"
          className={`relative flex min-h-0 w-full min-w-0 flex-col overflow-hidden rounded-xl border border-forest/20 bg-paper p-2 text-ink shadow-sm motion-safe:animate-[surface-enter_280ms_cubic-bezier(0.16,1,0.3,1)_both] motion-reduce:animate-none sm:p-3 ${compact ? "h-full max-h-full" : "h-[min(calc(72svh-4rem),31rem)] max-h-[min(calc(72svh-4rem),31rem)] md:h-auto md:max-h-[calc(100svh-12rem-1px)]"}`}
        >
          <PreviewToolbar
            copy={copy}
            labels={labels}
            playing={!playbackPaused}
            showPlaybackControls={showPlaybackControls && !readOnly}
            onToggle={() => {
              if (playbackPaused) {
                manuallyPausedRef.current = false;
                setManuallyPaused(false);
                setMotionPreferenceOverridden(true);
              } else {
                pausePlayback();
              }
            }}
            onReset={resetDemo}
          />
          <div aria-hidden="true" inert>
            <PreviewTimer state={state} labels={labels} />
          </div>
          <section
            className={`grid min-h-0 gap-2 ${state.teamCount === 2 ? "grid-cols-2" : "grid-cols-3"}`}
            aria-label={labels.teams}
            onClickCapture={readOnly ? undefined : pauseForInteraction}
            onFocusCapture={readOnly ? undefined : pauseForInteraction}
            onInputCapture={readOnly ? undefined : pauseForInteraction}
          >
            {visibleTeams.map((name, index) => (
              <PreviewTeamCard
                key={index}
                state={state}
                index={index}
                name={name}
                score={state.scores[index]}
                labels={labels}
                readOnly={readOnly}
                editingName={editingNameIndex === index}
                onEditName={() => setEditingNameIndex(index)}
                onDoneEditingName={() => setEditingNameIndex(null)}
                onNameChange={(value) =>
                  setState((current) => {
                    const teamNames = [...current.teamNames] as PreviewState["teamNames"];
                    teamNames[index] = value;
                    return { ...current, teamNames };
                  })
                }
                onScoreChange={(amount) =>
                  setState((current) => {
                    const scores = [...current.scores] as PreviewState["scores"];
                    scores[index] = Math.max(0, scores[index] + amount);
                    return { ...current, scores };
                  })
                }
              />
            ))}
          </section>
          {!compact && !readOnly && (
            <div
              className="mt-2 flex justify-end [@media(max-height:600px)]:mt-1"
              onClickCapture={pauseForInteraction}
            >
              <button
                type="button"
                aria-label={labels.reset}
                onClick={() => setState((current) => ({ ...current, scores: [0, 0, 0] }))}
                className="inline-flex min-h-11 items-center gap-1 rounded-lg border border-forest/25 px-2 py-1 text-sm font-medium text-forest hover:bg-forest/5"
              >
                <RotateCcw aria-hidden="true" className="h-3.5 w-3.5" />
                {labels.reset}
              </button>
            </div>
          )}
          {!compact && (
            <div aria-hidden="true" inert className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <PreviewConfiguration state={state} copy={copy} labels={labels} />
            </div>
          )}
        </div>
      </div>
    </figure>
  );
}
