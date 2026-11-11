"use client";

import { useCallback, useRef, useState, type CSSProperties } from "react";
import { TeamPanel } from "@/components/scoreboard/team-panel";
import { teamGridClass } from "@/lib/team-layout";
import { defaults } from "@/lib/appearance";
import { messages } from "@/lib/i18n";
import { toolThemes, type ToolTheme } from "@/lib/tool-themes";
import { studioCopy } from "@/lib/studio-copy";
import type { Lang } from "@/lib/i18n";
import { useAutoDemo } from "./use-auto-demo";
import { DemoPlaybackControls } from "./demo-playback-controls";

export function HomeScoreboard({
  lang,
  theme = toolThemes[1],
  expanded = false,
  autoplay = true,
}: {
  lang: Lang;
  theme?: ToolTheme;
  expanded?: boolean;
  autoplay?: boolean;
}) {
  const [editing, setEditing] = useState<number | null>(null);
  const t = studioCopy[lang];
  const teamNames = [t.teamOne, t.teamTwo, `${messages[lang].team} 3`];
  const [scores, setScores] = useState([12, 9, 0]);
  const [seconds, setSeconds] = useState(272);
  const step = useRef(0);
  const reset = useCallback(() => {
    setEditing(null);
    setScores([12, 9, 0]);
    setSeconds(272);
    step.current = 0;
  }, []);
  const advance = useCallback(() => {
    step.current += 1;
    setSeconds((value) => (step.current % 8 === 0 ? 272 : value + 1));
    setScores(
      step.current % 8 === 0
        ? [12, 9, 0]
        : (current) => current.map((value, index) => value + (index === step.current % 2 ? 1 : 0)),
    );
  }, []);
  const {
    ref,
    playing,
    toggle,
    pause,
    reset: resetPlayback,
  } = useAutoDemo(advance, reset, 1500, autoplay);

  return (
    <section
      ref={ref}
      aria-label={t.scoreboard}
      className="flex flex-col overflow-hidden"
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
        <DemoPlaybackControls
          playing={playing}
          onToggle={toggle}
          onReset={resetPlayback}
          labels={{ play: t.startTimer, pause: t.pauseTimer, reset: t.resetDemo }}
        />
      </header>
      <div className="flex flex-1 flex-col justify-center px-4 py-7 sm:px-7 sm:py-6">
        <div className="mb-7 flex items-center justify-center gap-3 text-sm font-medium">
          <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
          {t.secondHalf}{" "}
          <span className="font-mono tabular-nums">
            {String(Math.floor(seconds / 60)).padStart(2, "0")}:
            {String(seconds % 60).padStart(2, "0")}
          </span>
        </div>
        <div className={`${teamGridClass(expanded ? 3 : 2, "auto", false)} gap-2 sm:gap-4`}>
          {teamNames.slice(0, expanded ? 3 : 2).map((name, index) => (
            <TeamPanel
              key={name}
              team={{
                id: `demo-${index}`,
                name,
                score: scores[index],
                color: theme.background,
                textColor: theme.textColor,
              }}
              appearance={{
                ...defaults,
                scoreSize: "xlarge",
                density: theme.density,
                cornerRadius: theme.radius,
                borderWidth: theme.borderWidth,
                borderColor: theme.borderColor,
                gradient: theme.gradient,
                backgroundEnd: theme.backgroundEnd,
              }}
              controlsVisible
              index={index}
              count={expanded ? 3 : 2}
              full={false}
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
    </section>
  );
}
