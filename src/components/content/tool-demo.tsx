"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { ChartNoAxesColumn, GitBranch } from "lucide-react";
import { Graphic } from "@/components/studio/graphic";
import { DemoPlaybackControls } from "@/components/content/demo-playback-controls";
import { ScoreboardPreview } from "@/components/content/scoreboard-preview";
import { landingContent } from "@/lib/landing-content";
import { bracketRounds, setMatchResult, type Bracket } from "@/lib/brackets";
import { messages, type Lang } from "@/lib/i18n";
import { advanceStudioDemo, studioDemo } from "@/lib/studio-demo";
import { updateLeaderboardCell, type Leaderboard, type StudioDocument } from "@/lib/studio";
import { previewFieldValue, updatePreviewField, type PreviewField } from "@/lib/studio-edit";
import { studioCopy } from "@/lib/studio-copy";
import { useAutoDemo } from "./use-auto-demo";
import { HomeScoreboard } from "./home-scoreboard";

export type Tool = "scoreboard" | "leaderboard" | "bracket";

const demoInputClass =
  "min-h-9 w-full min-w-0 rounded-lg border border-forest/25 bg-surface px-2.5 py-1.5 text-sm text-ink";

export function ToolDemo({
  tool,
  lang,
  compact = false,
}: {
  tool: Tool;
  lang: Lang;
  compact?: boolean;
}) {
  if (tool === "scoreboard" && compact) return <HomeScoreboard lang={lang} />;
  if (tool === "scoreboard") {
    return (
      <ScoreboardPreview
        copy={landingContent[lang].preview}
        labels={{
          ...messages[lang],
          save: messages[lang].saveBoardShort,
          addTeam: messages[lang].add,
          fineTuneSizes: messages[lang].enableTextSizeSlider,
          editParticipant: studioCopy[lang].editParticipant,
          increase: studioCopy[lang].increase,
          decrease: studioCopy[lang].decrease,
          resetDemo: studioCopy[lang].resetDemo,
        }}
      />
    );
  }

  return <StudioToolDemo key={tool} tool={tool} lang={lang} compact={compact} />;
}

function StudioToolDemo({
  tool,
  lang,
  compact,
}: {
  tool: Exclude<Tool, "scoreboard">;
  lang: Lang;
  compact: boolean;
}) {
  const t = studioCopy[lang];
  const initial = useMemo(() => {
    const sample = studioDemo(tool, lang);
    if (compact) {
      sample.style = {
        ...sample.style,
        accent: tool === "bracket" ? "#ccf86b" : "#285b35",
        background: tool === "bracket" ? "#14251b" : "#f5f2e8",
      };
      if (sample.kind === "bracket") sample.layout = "split";
    }
    return sample;
  }, [tool, lang, compact]);
  const [document, setDocument] = useState(initial);
  const [activeField, setActiveField] = useState<PreviewField | null>(null);
  const step = useRef(0);
  const advance = useCallback(() => {
    setDocument((current) => advanceStudioDemo(current, initial, step.current));
    step.current += 1;
  }, [initial]);
  const reset = useCallback(() => {
    step.current = 0;
    setActiveField(null);
    setDocument(initial);
  }, [initial]);
  const {
    ref: playbackRef,
    playing,
    toggle: togglePlayback,
    pause,
    reset: resetPlayback,
  } = useAutoDemo(advance, reset, 2900);
  const labels = messages[lang];

  return (
    <section
      ref={playbackRef}
      aria-label={t[tool]}
      className={`min-w-0 overflow-hidden bg-surface text-ink ${compact ? "rounded-none" : "rounded-xl border border-forest/20 shadow-[0_18px_50px_-28px_rgba(17,40,32,0.42)]"}`}
    >
      <header className="flex items-center justify-between gap-3 border-b border-forest/15 px-3 py-2.5 sm:px-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-action text-on-action">
            {tool === "leaderboard" ? (
              <ChartNoAxesColumn aria-hidden="true" className="size-5" />
            ) : (
              <GitBranch aria-hidden="true" className="size-5" />
            )}
          </span>
          <span className="truncate text-sm font-semibold">{t[tool]}</span>
        </div>
        <DemoPlaybackControls
          playing={playing}
          labels={{
            play: labels.playPreview,
            pause: labels.pausePreview,
            reset: t.resetDemo,
          }}
          onToggle={togglePlayback}
          onReset={resetPlayback}
        />
      </header>

      <div
        className={`grid min-w-0 items-start gap-3 p-3 sm:p-4 ${compact ? "" : "lg:grid-cols-[minmax(15rem,0.82fr)_minmax(0,1.18fr)]"}`}
        onFocusCapture={pause}
        onInputCapture={pause}
        onChangeCapture={pause}
      >
        <div className={compact ? "hidden" : "min-w-0 space-y-3"}>
          <DocumentFields document={document} setDocument={setDocument} lang={lang} />
          {document.kind === "leaderboard" ? (
            <LeaderboardFields board={document} setDocument={setDocument} lang={lang} />
          ) : (
            <BracketFields board={document} setDocument={setDocument} lang={lang} />
          )}
        </div>

        {compact && document.kind === "bracket" && (
          <details className="rounded-lg border border-forest/20 px-3 py-2 text-sm">
            <summary className="cursor-pointer py-1 font-semibold text-action">{t.results}</summary>
            <BracketFields board={document} setDocument={setDocument} lang={lang} />
          </details>
        )}

        <section aria-label={t.preview} className="min-w-0">
          <div
            className={`${compact ? (tool === "bracket" ? "[&>svg]:min-w-[40rem]" : "[&>svg]:min-w-[28rem]") : "max-h-[min(68svh,30rem)] min-h-52"} overflow-auto overscroll-contain rounded-lg border border-forest/20 bg-paper p-2 sm:p-3`}
          >
            <Graphic
              document={document}
              labels={t}
              onEdit={(field) => {
                pause();
                setActiveField(field);
              }}
            />
          </div>
          <p className="mt-2 text-xs leading-relaxed text-ink/70">
            {compact ? `${t.exploreGraphic} · ${t.clickToEdit}` : t.clickToEdit}
          </p>
          {activeField && (
            <div className="mt-2 flex min-w-0 items-end gap-2 rounded-lg border border-forest/15 bg-paper p-2">
              <label className="grid min-w-0 flex-1 gap-1 text-xs font-semibold">
                {t.selectedPreview}
                <input
                  className={demoInputClass}
                  maxLength={activeField.kind === "bracket-score" ? 12 : 200}
                  value={previewFieldValue(document, activeField)}
                  onChange={(event) =>
                    setDocument((current) =>
                      updatePreviewField(current, activeField, event.target.value),
                    )
                  }
                />
              </label>
              <button
                type="button"
                onClick={() => setActiveField(null)}
                className="min-h-9 rounded-lg px-3 text-sm font-semibold text-action hover:bg-action/10"
              >
                {t.done}
              </button>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}

function DocumentFields({
  document,
  setDocument,
  lang,
}: {
  document: StudioDocument;
  setDocument: (document: StudioDocument) => void;
  lang: Lang;
}) {
  const t = studioCopy[lang];

  return (
    <div className="grid min-w-0 gap-2">
      <label className="grid min-w-0 gap-1 text-xs font-semibold">
        {t.title}
        <input
          className={demoInputClass}
          maxLength={200}
          value={document.title}
          onChange={(event) => setDocument({ ...document, title: event.target.value })}
        />
      </label>
      <label className="grid min-w-0 gap-1 text-xs font-semibold">
        {t.subtitle}
        <input
          className={demoInputClass}
          maxLength={200}
          value={document.subtitle}
          onChange={(event) => setDocument({ ...document, subtitle: event.target.value })}
        />
      </label>
    </div>
  );
}

function LeaderboardFields({
  board,
  setDocument,
  lang,
}: {
  board: Leaderboard;
  setDocument: (document: StudioDocument) => void;
  lang: Lang;
}) {
  const t = studioCopy[lang];

  return (
    <div className="min-w-0 space-y-2 border-t border-forest/15 pt-3">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-semibold">{t.rows}</h4>
        <label className="flex items-center gap-2 text-xs font-semibold">
          {t.leaderboardLayout}
          <select
            className="min-h-9 rounded-lg border border-forest/20 bg-surface px-2 text-sm"
            aria-label={t.leaderboardLayout}
            value={board.gridColumns || 1}
            onChange={(event) =>
              setDocument({ ...board, gridColumns: Number(event.target.value) as 1 | 2 | 3 })
            }
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
          </select>
        </label>
      </div>
      <div className="max-h-60 space-y-1.5 overflow-auto pr-1">
        {board.rows.map((row, index) => (
          <div key={row.id} className="grid min-w-0 grid-cols-[minmax(0,1fr)_5.5rem] gap-1.5">
            <label className="sr-only">
              {t.team} {index + 1}
            </label>
            <input
              aria-label={`${t.team} ${index + 1}`}
              className={demoInputClass}
              maxLength={200}
              value={row.cells[0]}
              onChange={(event) =>
                setDocument(updateLeaderboardCell(board, row.id, 0, event.target.value))
              }
            />
            <input
              aria-label={`${t.points}: ${row.cells[0]}`}
              className={`${demoInputClass} text-right tabular-nums`}
              inputMode="numeric"
              maxLength={200}
              value={row.cells[1]}
              onChange={(event) =>
                setDocument(updateLeaderboardCell(board, row.id, 1, event.target.value, 1))
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function BracketFields({
  board,
  setDocument,
  lang,
}: {
  board: Bracket;
  setDocument: (document: StudioDocument) => void;
  lang: Lang;
}) {
  const t = studioCopy[lang];
  const rounds = bracketRounds(board);
  const match = rounds.flat().find((item) => item.players.every(Boolean) && !item.winner);
  const participantName = (id: string | null) =>
    board.participants.find((participant) => participant.id === id)?.name || t.pending;

  if (!match) {
    return (
      <p className="border-t border-forest/15 pt-3 text-sm font-medium text-ink/75">
        {t.champion}: {participantName(rounds.at(-1)?.[0]?.winner || null)}
      </p>
    );
  }

  const roundIndex = Number(match.id.split("-")[0]);

  return (
    <fieldset className="min-w-0 space-y-2 border-t border-forest/15 pt-3">
      <legend className="px-1 text-sm font-semibold">
        {roundIndex === rounds.length - 1 ? t.final : `${t.round} ${roundIndex + 1}`} · {t.match} 1
      </legend>
      {match.players.map((id, side) => (
        <label
          key={id}
          className="grid min-w-0 grid-cols-[minmax(0,1fr)_5.5rem] items-center gap-2"
        >
          <span className="min-w-0 truncate text-sm">{participantName(id)}</span>
          <input
            aria-label={`${t.score}: ${participantName(id)}`}
            className={`${demoInputClass} text-right tabular-nums`}
            inputMode="numeric"
            maxLength={12}
            value={match.scores[side]}
            onChange={(event) => {
              const scores: [string, string] = [...match.scores];
              scores[side] = event.target.value;
              setDocument(setMatchResult(board, match.id, match.winner, scores));
            }}
          />
        </label>
      ))}
      <label className="grid gap-1 text-xs font-semibold">
        {t.winner}
        <select
          className={demoInputClass}
          value={match.winner || ""}
          onChange={(event) =>
            setDocument(setMatchResult(board, match.id, event.target.value || null, match.scores))
          }
        >
          <option value="">{t.noWinner}</option>
          {match.players.map((id) => (
            <option key={id} value={id || ""}>
              {participantName(id)}
            </option>
          ))}
        </select>
      </label>
    </fieldset>
  );
}
