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
export function ProductOutputLab({ tool, lang }: { tool: Tool; lang: Lang }) {
  const [view, setView] = useState(0);
  const [teamCount, setTeamCount] = useState(2);
  const [showLimit, setShowLimit] = useState(false);
  const [timer, setTimer] = useState<GameTimer>({ ...defaultTimer, enabled: true, periodCount: 2 });
  const t = studioCopy[lang];
  const document = useMemo(() => {
    if (tool === "scoreboard") return null;
    const sample = studioDemo(tool, lang);
    if (sample.kind === "leaderboard") {
      const board: Leaderboard = { ...sample, style: { ...sample.style, ...toolThemes[6] } };
      if (view === 1) {
        board.columns = [t.team, t.points, t.round];
        board.rows = board.rows.map((row) => ({ ...row, cells: [...row.cells, "3"] }));
      }
      return board;
    }
    const board: Bracket = view === 2 ? resizeBracket(sample, 3) : sample;
    return { ...board, layout: view === 1 ? ("split" as const) : ("single" as const) };
  }, [tool, lang, view, t]);
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
      ) : (
        <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label={t.layout}>
          {campaignCopy[lang].views[tool].map((label, index) => (
            <button
              key={label}
              type="button"
              aria-pressed={view === index}
              onClick={() => setView(index)}
              className={`min-h-12 border px-5 py-2 text-sm font-semibold transition-colors ${view === index ? "border-action bg-action text-on-action" : "border-forest/30 hover:bg-forest/10"}`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      {tool === "scoreboard" ? (
        <>
          <div className="h-[clamp(28rem,58svh,38rem)] min-w-0 overflow-hidden rounded-xl border border-forest/20">
            <HomeScoreboard lang={lang} teamCount={teamCount} compact autoplay={false} />
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
            className="overflow-auto overscroll-contain border border-forest/20 bg-forest/5 p-3 sm:p-7"
          >
            <div className={tool === "bracket" ? "min-w-[42rem]" : "min-w-[30rem]"}>
              <Graphic document={document} labels={t} />
            </div>
          </div>
        )
      )}
    </div>
  );
}
