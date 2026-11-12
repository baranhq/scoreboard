"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { TeamPanel } from "@/components/scoreboard/team-panel";
import { teamGridClass } from "@/lib/team-layout";
import { defaults } from "@/lib/appearance";
import { messages } from "@/lib/i18n";
import { toolThemes, type ToolTheme } from "@/lib/tool-themes";
import { studioCopy } from "@/lib/studio-copy";
import type { Lang } from "@/lib/i18n";
import { useAutoDemo } from "./use-auto-demo";
import { DemoPlaybackControls } from "./demo-playback-controls";
import { MAX_SCOREBOARD_TEAMS } from "@/lib/boards";

function mixHex(background: string, accent: string, amount: number) {
  const backgroundChannels = background
    .slice(1)
    .match(/../g)
    ?.map((value) => Number.parseInt(value, 16));
  const accentChannels = accent
    .slice(1)
    .match(/../g)
    ?.map((value) => Number.parseInt(value, 16));
  if (!backgroundChannels || !accentChannels) return background;
  return `#${backgroundChannels
    .map((channel, index) =>
      Math.round(channel * (1 - amount) + accentChannels[index] * amount)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

export function HomeScoreboard({
  lang,
  theme = toolThemes[1],
  expanded = false,
  autoplay = true,
  compact = false,
  readOnly = false,
  showPlaybackControls = true,
  controlledPlayback = false,
  teamCount,
  showReadOnlyControls = false,
}: {
  lang: Lang;
  theme?: ToolTheme;
  expanded?: boolean;
  autoplay?: boolean;
  compact?: boolean;
  readOnly?: boolean;
  showPlaybackControls?: boolean;
  controlledPlayback?: boolean;
  teamCount?: number;
  showReadOnlyControls?: boolean;
}) {
  const container = useRef<HTMLElement | null>(null);
  const [full, setFull] = useState(false);
  const [fullscreenError, setFullscreenError] = useState(false);
  useEffect(() => {
    const sync = () => setFull(document.fullscreenElement === container.current);
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);
  const [editing, setEditing] = useState<number | null>(null);
  const t = studioCopy[lang];
  const initialTeamNames = useMemo(
    () =>
      Array.from({ length: MAX_SCOREBOARD_TEAMS }, (_, index) =>
        index === 0 ? t.teamOne : index === 1 ? t.teamTwo : `${messages[lang].team} ${index + 1}`,
      ),
    [lang, t.teamOne, t.teamTwo],
  );
  const [teamNames, setTeamNames] = useState(initialTeamNames);
  const count =
    teamCount === undefined
      ? expanded
        ? 3
        : 2
      : Math.max(1, Math.min(MAX_SCOREBOARD_TEAMS, teamCount));
  const [scores, setScores] = useState([12, 9, 0, 0, 0, 0]);
  const [seconds, setSeconds] = useState(272);
  const step = useRef(0);
  const reset = useCallback(() => {
    setEditing(null);
    setScores([12, 9, 0, 0, 0, 0]);
    setSeconds(272);
    if (readOnly) setTeamNames(initialTeamNames);
    step.current = 0;
  }, [initialTeamNames, readOnly]);
  const advance = useCallback(() => {
    step.current += 1;
    setSeconds((value) => (step.current % 8 === 0 ? 272 : value + 1));
    if (readOnly && step.current % 8 === 4)
      setTeamNames((current) =>
        current.map((name, index) => (index === 0 ? t.demoRenamedTeam : name)),
      );
    if (readOnly && step.current % 8 === 0) setTeamNames(initialTeamNames);
    setScores(
      step.current % 8 === 0
        ? [12, 9, 0, 0, 0, 0]
        : (current) =>
            current.map((value, index) => value + (index === step.current % count ? 1 : 0)),
    );
  }, [count, initialTeamNames, readOnly, t.demoRenamedTeam]);
  const {
    ref,
    playing,
    toggle,
    pause,
    reset: resetPlayback,
  } = useAutoDemo(advance, reset, 1500, autoplay, {
    controlled: controlledPlayback,
    allowReducedMotionAutoplay: autoplay && readOnly,
  });

  const attach = useCallback(
    (node: HTMLElement | null) => {
      container.current = node;
      ref(node);
    },
    [ref],
  );
  return (
    <section
      ref={attach}
      aria-label={t.scoreboard}
      className={`flex min-w-0 flex-col overflow-hidden ${full ? "h-dvh" : compact ? "h-full" : ""}`}
      style={
        {
          background: theme.background,
          color: theme.textColor,
          "--color-ink": theme.textColor,
          "--color-forest": theme.accent,
        } as CSSProperties
      }
    >
      <header className="flex items-center justify-between border-b border-white/15 px-4 py-2 sm:px-6">
        <span className="text-sm font-semibold">{t.eventName}</span>
        {showPlaybackControls && (
          <DemoPlaybackControls
            playing={playing}
            onToggle={toggle}
            onReset={resetPlayback}
            labels={{ play: t.startTimer, pause: t.pauseTimer, reset: t.resetDemo }}
          />
        )}
      </header>
      <div
        className={`flex min-h-0 flex-1 flex-col justify-center px-3 ${compact ? "py-1 sm:px-5" : "py-7 sm:px-7 sm:py-4"}`}
      >
        <div
          className={`flex items-center justify-center gap-3 text-sm font-medium ${compact ? "mb-1" : "mb-3"}`}
        >
          <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
          {t.secondHalf}{" "}
          <span className="font-mono tabular-nums">
            {String(Math.floor(seconds / 60)).padStart(2, "0")}:
            {String(seconds % 60).padStart(2, "0")}
          </span>
        </div>
        <div className="relative min-h-0 flex-1">
          <div
            className={`${teamGridClass(count, "auto", full)} ${compact ? "auto-rows-fr" : ""} h-full min-h-0 gap-2 sm:gap-3`}
          >
            {teamNames.slice(0, count).map((name, index) => (
              <TeamPanel
                key={name}
                team={{
                  id: `demo-${index}`,
                  name,
                  score: scores[index],
                  color: mixHex(theme.background, theme.accent, 0.14),
                  textColor: theme.textColor,
                }}
                appearance={{
                  ...defaults,
                  scoreSize: compact ? "medium" : "xlarge",
                  density: theme.density,
                  cornerRadius: theme.radius,
                  borderWidth: Math.max(theme.borderWidth, 1),
                  borderColor: theme.borderColor,
                  gradient: theme.gradient,
                  backgroundEnd: theme.backgroundEnd,
                }}
                controlsVisible
                interactive={!readOnly}
                showControls={!readOnly || showReadOnlyControls}
                fitCompactGrid={compact && count >= 4}
                index={index}
                count={count}
                full={full}
                t={messages[lang]}
                change={(amount) => {
                  pause();
                  setScores((current) =>
                    current.map((score, position) =>
                      position === index ? Math.max(0, score + amount) : score,
                    ),
                  );
                }}
                manual={() => {
                  pause();
                  setEditing(index);
                }}
              />
            ))}
          </div>
        </div>
        {editing !== null && (
          <label className="mx-auto mt-4 grid max-w-60 gap-2 text-sm font-semibold">
            {t.score}: {teamNames[editing]}
            <input
              type="number"
              value={scores[editing]}
              min="0"
              max="999999999"
              onChange={(event) => {
                const score = Number(event.target.value);
                if (Number.isSafeInteger(score) && score >= 0 && score <= 999999999)
                  setScores((current) =>
                    current.map((value, index) => (index === editing ? score : value)),
                  );
              }}
              className="min-h-11 rounded border border-current bg-transparent px-3"
            />
          </label>
        )}
      </div>
      {!readOnly && (
        <div data-demo-setup className="flex justify-end px-4 py-2">
          <button
            type="button"
            onClick={async () => {
              try {
                if (full) await document.exitFullscreen();
                else await container.current?.requestFullscreen();
              } catch {
                setFullscreenError(true);
              }
            }}
            className="min-h-11 px-3 text-sm font-semibold underline underline-offset-4"
          >
            {full ? messages[lang].exitShort : messages[lang].fullscreen}
          </button>
        </div>
      )}
      {fullscreenError && (
        <p role="alert" className="px-4 pb-3 text-sm">
          {t.fullscreenError}
        </p>
      )}
      {!readOnly && (
        <details
          data-demo-setup
          className="border-t border-current/20 px-4 py-3 sm:px-6"
          onToggle={pause}
        >
          <summary className="min-h-11 cursor-pointer py-2 text-sm font-semibold">
            {t.editing}
          </summary>
          <div className="grid gap-3 py-3 sm:grid-cols-3">
            {teamNames.slice(0, count).map((name, index) => (
              <label key={index} className="grid gap-1 text-sm">
                {messages[lang].team} {index + 1}
                <input
                  value={name}
                  maxLength={200}
                  onChange={(event) => {
                    pause();
                    setTeamNames((current) =>
                      current.map((value, position) =>
                        position === index ? event.target.value : value,
                      ),
                    );
                  }}
                  className="min-h-11 min-w-0 border border-current/30 bg-transparent px-3"
                />
              </label>
            ))}
          </div>
        </details>
      )}
    </section>
  );
}
