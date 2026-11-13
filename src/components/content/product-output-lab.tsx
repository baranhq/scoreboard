"use client";
import { Minus, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Graphic } from "@/components/studio/graphic";
import { TimerDisplay } from "@/components/scoreboard/game-timer";
import { HomeScoreboard } from "./home-scoreboard";
import { studioDemo } from "@/lib/studio-demo";
import { resizeBracket, type Bracket } from "@/lib/brackets";
import type { Leaderboard } from "@/lib/studio";
import { defaultTimer, type GameTimer } from "@/lib/timer";
import { messages, type Lang } from "@/lib/i18n";
import { studioCopy } from "@/lib/studio-copy";
import { campaignCopy } from "@/lib/campaign-copy";
import { toolThemes } from "@/lib/tool-themes";
import type { Tool } from "./tool-demo";
import { canAddScoreboardTeam, MAX_SCOREBOARD_TEAMS } from "@/lib/boards";
import { Button } from "@/components/ui/ui";
import { DemoTeamLimit } from "./demo-team-limit";
import { useSiteThemeMode } from "@/components/layout/theme-select";
export function ProductOutputLab({ tool, lang }: { tool: Tool; lang: Lang }) {
  const { dark } = useSiteThemeMode();
  const defaultTheme = toolThemes[dark ? 1 : 3];
  const [view, setView] = useState(0);
  const [teamCount, setTeamCount] = useState(2);
  const [showLimit, setShowLimit] = useState(false);
  const [timer, setTimer] = useState<GameTimer>({ ...defaultTimer, enabled: true, periodCount: 2 });
  const t = studioCopy[lang];
  const bracketPreviewWidth = view === 1 ? "min-w-[42rem]" : "mx-auto w-full min-w-0 sm:w-[42rem]";
  const scoreboardPreviewHeight =
    teamCount >= 4 && teamCount <= 6
      ? "h-[clamp(28rem,58svh,38rem)] md:h-[clamp(34rem,66svh,44rem)]"
      : "h-[clamp(28rem,58svh,38rem)]";
  const document = useMemo(() => {
    if (tool === "scoreboard") return null;
    const sample = studioDemo(tool, lang);
    if (sample.kind === "leaderboard")
      return {
        ...sample,
        gridColumns: 1,
        style: { ...sample.style, ...defaultTheme },
      } satisfies Leaderboard;
    const board: Bracket = view === 2 ? resizeBracket(sample, 3) : sample;
    return {
      ...board,
      layout: view === 1 ? ("split" as const) : ("single" as const),
      style: { ...board.style, ...defaultTheme },
    };
  }, [tool, lang, view, defaultTheme]);
  return (
    <div className="min-w-0">
      {tool === "scoreboard" ? (
        <div className="relative mb-5 flex flex-wrap items-center justify-between gap-3">
          <div
            className="flex flex-wrap items-center gap-2"
            role="group"
            aria-label={messages[lang].teams}
          >
            <span className="mr-1 text-sm font-semibold tabular-nums">
              {messages[lang].teams}: {teamCount}
            </span>
            <Button
              disabled={teamCount <= 1}
              onClick={() => {
                setTeamCount((current) => Math.max(1, current - 1));
                setShowLimit(false);
              }}
            >
              <Minus size={16} aria-hidden="true" />
              {t.removeTeam}
            </Button>
            <Button
              onClick={() => {
                if (!canAddScoreboardTeam(teamCount)) setShowLimit(true);
                else setTeamCount((current) => Math.min(MAX_SCOREBOARD_TEAMS, current + 1));
              }}
            >
              <Plus size={16} aria-hidden="true" />
              {t.addTeam}
            </Button>
          </div>
          {showLimit && <DemoTeamLimit lang={lang} close={() => setShowLimit(false)} />}
        </div>
      ) : tool === "bracket" ? (
        <div
          className="mb-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap"
          role="group"
          aria-label={t.layout}
        >
          {campaignCopy[lang].views[tool].map((label, index) => {
            const wideMobileButton = tool === "bracket" && index === 2;
            return (
              <button
                key={label}
                type="button"
                aria-pressed={view === index}
                onClick={() => setView(index)}
                className={`min-h-12 w-full min-w-0 border px-3 py-2 text-sm font-semibold transition-[background-color,color,transform] active:scale-[.98] motion-reduce:transform-none sm:w-auto sm:px-5 ${wideMobileButton ? "col-span-2 sm:col-span-1" : ""} ${view === index ? "border-action bg-action text-on-action" : "border-forest/30 hover:bg-forest/10"}`}
              >
                {label}
              </button>
            );
          })}
        </div>
      ) : null}
      {tool === "scoreboard" ? (
        <>
          <div
            className={`${scoreboardPreviewHeight} min-w-0 overflow-hidden rounded-xl border border-forest/20`}
          >
            <HomeScoreboard
              lang={lang}
              theme={defaultTheme}
              teamCount={teamCount}
              allowManualEdit={false}
              compact
              autoplay={false}
              showHeader={false}
            />
          </div>
          <div className="mt-5 border-y border-forest/25 py-6">
            <TimerDisplay
              timer={timer}
              t={messages[lang]}
              change={setTimer}
              full={false}
              controlsVisible
              textScale={1}
            />
          </div>
        </>
      ) : (
        document && (
          <div
            tabIndex={0}
            aria-label={t.exploreGraphic}
            className="overflow-auto overscroll-contain rounded-xl border border-forest/20 bg-forest/5 p-2 sm:p-4"
          >
            <div
              className={
                tool === "bracket"
                  ? bracketPreviewWidth
                  : view === 1
                    ? "min-w-[30rem]"
                    : "mx-auto w-full max-w-2xl min-w-0"
              }
            >
              <Graphic document={document} labels={t} />
            </div>
          </div>
        )
      )}
    </div>
  );
}
