"use client";
import { useMemo, useState } from "react";
import { RotateCcw, Plus, Minus, ArrowUpRight } from "lucide-react";
import { Graphic } from "@/components/studio/graphic";
import { Button } from "@/components/ui/ui";
import { studioDemo } from "@/lib/studio-demo";
import { studioCopy } from "@/lib/studio-copy";
import type { Lang } from "@/lib/i18n";
import { bracketRounds, setMatchResult } from "@/lib/brackets";
import { moveItem } from "@/lib/studio";
export type Tool = "scoreboard" | "leaderboard" | "bracket";
export function ToolDemo({ tool, lang }: { tool: Tool; lang: Lang }) {
  const t = studioCopy[lang];
  const initial = useMemo(
    () => studioDemo(tool === "scoreboard" ? "leaderboard" : tool, lang),
    [tool, lang],
  );
  const [document, setDocument] = useState(initial);
  const [scores, setScores] = useState([12, 9]);
  const reset = () => {
    setDocument(initial);
    setScores([12, 9]);
  };
  const advance = () => {
    if (document.kind === "leaderboard")
      setDocument({ ...document, rows: moveItem(document.rows, 1, 0) });
    else {
      const match = bracketRounds(document)
        .flat()
        .find((m) => !m.winner && m.players.every(Boolean));
      if (match) setDocument(setMatchResult(document, match.id, match.players[0], ["2", "1"]));
    }
  };
  return (
    <div className="min-w-0 overflow-hidden rounded-2xl border border-forest/20 bg-surface shadow-[0_16px_48px_-24px_rgba(16,40,24,0.3)]">
      <div className="flex items-center justify-between border-b border-forest/15 px-4 py-3">
        <span className="text-sm font-semibold">{t[tool]}</span>
        <button
          aria-label={t.newExample}
          title={t.newExample}
          onClick={reset}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-forest/10"
        >
          <RotateCcw size={16} />
        </button>
      </div>
      {tool === "scoreboard" ? (
        <div className="bg-[#203e29] px-4 py-8 text-[#f5f7ef] sm:px-7 sm:py-10">
          <p className="text-center text-sm font-medium tracking-wide">{t.round} 2 · 04:32</p>
          <div className="mt-7 grid grid-cols-2 divide-x divide-[#f5f7ef]/25">
            {scores.map((score, i) => (
              <div key={i} className="min-w-0 px-2 text-center">
                <p className="font-display text-xl font-semibold">
                  {t.team} {i + 1}
                </p>
                <p
                  aria-live="polite"
                  className="my-3 font-display text-7xl font-bold tracking-tight tabular-nums sm:text-8xl"
                >
                  {score}
                </p>
                <div className="flex justify-center gap-2">
                  <button
                    aria-label={`${t.score} −1, ${t.team} ${i + 1}`}
                    className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/35 hover:bg-white/10"
                    onClick={() => setScores((all) => all.map((n, j) => (i === j ? n - 1 : n)))}
                  >
                    <Minus size={18} />
                  </button>
                  <button
                    aria-label={`${t.score} +1, ${t.team} ${i + 1}`}
                    className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#c2d9a3] text-[#18251f] hover:brightness-95"
                    onClick={() => setScores((all) => all.map((n, j) => (i === j ? n + 1 : n)))}
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div
          className="max-h-[28rem] overflow-auto bg-forest/5 p-3 sm:p-5"
          tabIndex={0}
          aria-label={t.preview}
        >
          <Graphic document={document} labels={t} />
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-forest/15 px-4 py-3">
        <p className="max-w-[28ch] text-sm leading-5 text-ink/75">{t.demoHint}</p>
        {tool !== "scoreboard" && (
          <Button className="!px-3 !text-sm" onClick={advance}>
            {tool === "leaderboard" ? t.up : t.winnerAction}
            <ArrowUpRight size={15} />
          </Button>
        )}
      </div>
    </div>
  );
}
export function PlatformDemo({ lang }: { lang: Lang }) {
  const [tool, setTool] = useState<Tool>("scoreboard");
  const t = studioCopy[lang];
  return (
    <div className="min-w-0">
      <div className="mb-3 flex flex-wrap gap-1" role="group" aria-label={t.tools}>
        {(["scoreboard", "leaderboard", "bracket"] as const).map((key) => (
          <button
            key={key}
            aria-pressed={tool === key}
            onClick={() => setTool(key)}
            className={`min-h-11 rounded-lg px-3 py-2 text-sm font-semibold transition-colors motion-reduce:transition-none ${tool === key ? "bg-action text-on-action" : "hover:bg-forest/10"}`}
          >
            {t[key]}
          </button>
        ))}
      </div>
      <ToolDemo key={tool} tool={tool} lang={lang} />
    </div>
  );
}
