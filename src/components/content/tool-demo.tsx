"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { Expand, Minimize2 } from "lucide-react";
import { foreground } from "@/lib/colors";
import { Graphic } from "@/components/studio/graphic";
import { DemoPlaybackControls } from "@/components/content/demo-playback-controls";
import { ScoreboardPreview } from "@/components/content/scoreboard-preview";
import { landingContent } from "@/lib/landing-content";
import { bracketRounds, resizeBracket, setMatchResult, type Bracket } from "@/lib/brackets";
import { messages, type Lang } from "@/lib/i18n";
import { advanceStudioDemo, studioDemo } from "@/lib/studio-demo";
import { updateLeaderboardCell, type Leaderboard, type StudioDocument } from "@/lib/studio";
import { previewFieldValue, updatePreviewField, type PreviewField } from "@/lib/studio-edit";
import { studioCopy } from "@/lib/studio-copy";
import { useAutoDemo } from "./use-auto-demo";
import { toolThemes, type ToolTheme } from "@/lib/tool-themes";
import { HomeScoreboard } from "./home-scoreboard";
import { Select } from "@/components/ui/select";

export type Tool = "scoreboard" | "leaderboard" | "bracket";

const demoInputClass =
  "min-h-9 w-full min-w-0 rounded-lg border border-forest/25 bg-surface px-2.5 py-1.5 text-sm text-ink";

export function ToolDemo({
  tool,
  lang,
  compact = false,
  theme,
  expanded = false,
  autoplay = true,
  hideHeading = false,
  showPreviewLabel = false,
  fillPreview = false,
  readOnly = false,
  showPlaybackControls = true,
  showFullscreenControl = false,
  showResultControls = true,
  controlledPlayback = false,
  showReadOnlyControls = false,
  useScoreboardPreview = false,
  widePreview = false,
  teamCount,
}: {
  tool: Tool;
  lang: Lang;
  compact?: boolean;
  theme?: ToolTheme;
  expanded?: boolean;
  autoplay?: boolean;
  hideHeading?: boolean;
  showPreviewLabel?: boolean;
  fillPreview?: boolean;
  readOnly?: boolean;
  showPlaybackControls?: boolean;
  showFullscreenControl?: boolean;
  showResultControls?: boolean;
  controlledPlayback?: boolean;
  showReadOnlyControls?: boolean;
  useScoreboardPreview?: boolean;
  widePreview?: boolean;
  teamCount?: number;
}) {
  const demoKey = [
    tool,
    lang,
    compact ? "compact" : "full",
    expanded ? "expanded" : "default",
    widePreview ? "wide" : "standard",
    hideHeading ? "hidden-heading" : "heading",
    JSON.stringify(theme ?? null),
  ].join(":");

  if (tool === "scoreboard" && compact && !useScoreboardPreview)
    return (
      <HomeScoreboard
        lang={lang}
        theme={theme}
        expanded={expanded}
        autoplay={autoplay}
        compact
        readOnly={readOnly}
        showPlaybackControls={showPlaybackControls}
        controlledPlayback={controlledPlayback}
        showReadOnlyControls={showReadOnlyControls}
        teamCount={teamCount}
      />
    );
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
        compact={compact}
        readOnly={readOnly}
        autoplay={autoplay}
        showPlaybackControls={showPlaybackControls}
      />
    );
  }

  return (
    <StudioToolDemo
      key={demoKey}
      tool={tool}
      lang={lang}
      compact={compact}
      theme={theme}
      expanded={expanded}
      autoplay={autoplay}
      hideHeading={hideHeading}
      showPreviewLabel={showPreviewLabel}
      fillPreview={fillPreview}
      showPlaybackControls={showPlaybackControls}
      showFullscreenControl={showFullscreenControl}
      readOnly={readOnly}
      showResultControls={showResultControls}
      controlledPlayback={controlledPlayback}
      widePreview={widePreview}
    />
  );
}

function StudioToolDemo({
  tool,
  lang,
  compact,
  theme,
  expanded,
  autoplay,
  hideHeading,
  showPreviewLabel,
  fillPreview,
  showPlaybackControls,
  showFullscreenControl,
  readOnly,
  showResultControls,
  controlledPlayback,
  widePreview,
}: {
  tool: Exclude<Tool, "scoreboard">;
  lang: Lang;
  compact: boolean;
  expanded: boolean;
  autoplay: boolean;
  hideHeading: boolean;
  showPreviewLabel: boolean;
  fillPreview: boolean;
  showPlaybackControls: boolean;
  showFullscreenControl: boolean;
  readOnly: boolean;
  showResultControls: boolean;
  controlledPlayback: boolean;
  widePreview: boolean;
  theme?: ToolTheme;
}) {
  const t = studioCopy[lang];
  const initial = useMemo(() => {
    let sample = studioDemo(tool, lang);
    if (compact) {
      if (sample.kind === "bracket") sample = resizeBracket(sample, 4);
      sample.style = { ...sample.style, ...(theme || toolThemes[1]) };
      if (sample.kind === "bracket") {
        sample.layout = expanded ? "split" : "single";
        sample.style = {
          ...sample.style,
          titleVisible: false,
          subtitleVisible: false,
          ...(widePreview && !expanded ? { density: "compact", roundGap: 400, matchGap: 28 } : {}),
        };
      } else sample.gridColumns = widePreview || expanded ? 2 : 1;
    }
    if (hideHeading)
      sample.style = { ...sample.style, titleVisible: false, subtitleVisible: false };
    return sample;
  }, [tool, lang, compact, theme, expanded, hideHeading, widePreview]);
  const [document, setDocument] = useState(initial);
  const [activeField, setActiveField] = useState<PreviewField | null>(null);
  const fullscreenTarget = useRef<HTMLElement | null>(null);
  const fullscreenButton = useRef<HTMLButtonElement | null>(null);
  const [nativeFullscreen, setNativeFullscreen] = useState(false);
  const [fallbackFullscreen, setFallbackFullscreen] = useState(false);
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
    ref: attachPlayback,
    playing,
    toggle: togglePlayback,
    pause,
    reset: resetPlayback,
  } = useAutoDemo(advance, reset, 2900, autoplay, {
    controlled: controlledPlayback,
    allowReducedMotionAutoplay: autoplay && readOnly,
  });
  const fullscreen = nativeFullscreen || fallbackFullscreen;
  const attachRef = useCallback(
    (node: HTMLElement | null) => {
      fullscreenTarget.current = node;
      attachPlayback(node);
    },
    [attachPlayback],
  );
  const toggleFullscreen = useCallback(async () => {
    const target = fullscreenTarget.current;
    if (!target) return;

    if (fallbackFullscreen) {
      setFallbackFullscreen(false);
      return;
    }

    if (window.document.fullscreenElement === target) {
      try {
        await window.document.exitFullscreen();
      } catch {
        setFallbackFullscreen(true);
      }
      return;
    }

    try {
      if (!target.requestFullscreen) throw new Error("Fullscreen is unavailable");
      await target.requestFullscreen();
    } catch {
      setFallbackFullscreen(true);
    }
  }, [fallbackFullscreen]);

  useEffect(() => {
    const syncFullscreen = () =>
      setNativeFullscreen(window.document.fullscreenElement === fullscreenTarget.current);
    window.document.addEventListener("fullscreenchange", syncFullscreen);
    return () => window.document.removeEventListener("fullscreenchange", syncFullscreen);
  }, []);

  useEffect(() => {
    if (!fallbackFullscreen) return;

    const previousOverflow = window.document.body.style.overflow;
    const button = fullscreenButton.current;
    window.document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFallbackFullscreen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      button?.focus();
    };
  }, [fallbackFullscreen]);
  const selectedParticipant =
    activeField?.kind === "bracket-participant" ? activeField.participantId : null;
  const selectedMatch =
    document.kind === "bracket" && selectedParticipant
      ? bracketRounds(document)
          .flat()
          .find(
            (match) =>
              !match.winner &&
              match.players.every(Boolean) &&
              match.players.includes(selectedParticipant),
          )
      : undefined;
  const labels = messages[lang];
  const frameClass = fullscreen
    ? "fixed inset-0 z-[100] h-[100dvh] w-screen max-w-none rounded-none border-0 shadow-none"
    : compact
      ? "h-full rounded-none"
      : "rounded-xl border border-forest/20 shadow-[0_18px_50px_-28px_rgba(17,40,32,0.42)]";
  const graphicViewportClass = compact
    ? `flex min-h-0 flex-1 items-center justify-center ${fullscreen ? "overflow-auto" : "overflow-hidden"}`
    : "max-h-[min(68svh,30rem)] min-h-52 overflow-auto";
  const graphicWidthClass =
    compact && (widePreview || fillPreview || fullscreen) ? "[&>svg]:!w-full" : "[&>svg]:!w-auto";

  const demo = (
    <section
      ref={attachRef}
      aria-label={t[tool]}
      style={
        compact
          ? ({
              "--color-surface": document.style.background,
              "--color-paper": document.style.background,
              "--color-ink": document.style.textColor || "#202820",
              "--color-forest": document.style.accent,
              "--color-action": document.style.accent,
              "--color-on-action": foreground(document.style.accent),
            } as CSSProperties)
          : undefined
      }
      className={`flex min-w-0 flex-col overflow-hidden bg-surface text-ink ${frameClass}`}
    >
      <header className="flex items-center justify-between gap-3 border-b border-forest/15 px-3 py-2.5 sm:px-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="truncate text-sm font-semibold">
            {showPreviewLabel ? t.preview : t[tool]}
          </span>
        </div>
        {(showPlaybackControls || showFullscreenControl) && (
          <div className="flex shrink-0 items-center gap-1">
            {showFullscreenControl && (
              <button
                ref={fullscreenButton}
                type="button"
                aria-label={fullscreen ? labels.exit : labels.fullscreen}
                aria-pressed={fullscreen}
                title={fullscreen ? labels.exit : labels.fullscreen}
                onClick={toggleFullscreen}
                className="inline-flex size-11 items-center justify-center rounded-lg text-ink transition-colors hover:bg-forest/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action motion-reduce:transition-none"
              >
                {fullscreen ? (
                  <Minimize2 size={16} aria-hidden="true" />
                ) : (
                  <Expand size={16} aria-hidden="true" />
                )}
              </button>
            )}
            {showPlaybackControls && (
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
            )}
          </div>
        )}
      </header>

      <div
        className={`min-w-0 gap-3 p-3 sm:p-4 ${compact ? "flex min-h-0 flex-1 flex-col overflow-hidden" : "grid items-start lg:grid-cols-[minmax(15rem,0.82fr)_minmax(0,1.18fr)]"}`}
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

        {compact && showResultControls && !readOnly && document.kind === "bracket" && (
          <details className="rounded-lg border border-forest/20 px-3 py-2 text-sm">
            <summary className="cursor-pointer py-1 font-semibold text-action">{t.results}</summary>
            <BracketFields board={document} setDocument={setDocument} lang={lang} />
          </details>
        )}

        <section
          aria-label={t.preview}
          className={`min-w-0 ${compact ? "flex min-h-0 flex-1 flex-col" : ""}`}
        >
          <div
            className={`${graphicViewportClass} overscroll-contain bg-paper [&>svg]:!block [&>svg]:!h-auto [&>svg]:!max-h-full ${graphicWidthClass} [&>svg]:!max-w-full`}
          >
            <Graphic
              document={document}
              labels={t}
              onEdit={
                readOnly
                  ? undefined
                  : (field) => {
                      pause();
                      setActiveField(field);
                    }
              }
            />
          </div>
          {!readOnly && (
            <p className="mt-2 text-xs leading-relaxed text-ink/70">
              {compact ? `${t.exploreGraphic} · ${t.clickToEdit}` : t.clickToEdit}
            </p>
          )}
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
              {document.kind === "bracket" && selectedMatch && selectedParticipant && (
                <button
                  type="button"
                  className="min-h-11 bg-action px-3 text-sm font-semibold text-on-action"
                  onClick={() =>
                    setDocument(
                      setMatchResult(
                        document,
                        selectedMatch.id,
                        selectedParticipant,
                        selectedMatch.scores,
                      ),
                    )
                  }
                >
                  {t.chooseWinner}
                </button>
              )}
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

  return fallbackFullscreen && typeof window !== "undefined"
    ? createPortal(demo, window.document.body)
    : demo;
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
        <label className="grid w-32 shrink-0 gap-1 text-xs font-semibold sm:w-36">
          {t.leaderboardLayout}
          <Select
            label={t.leaderboardLayout}
            value={String(board.gridColumns || 1)}
            triggerClassName="!min-h-11 !bg-surface !px-2 !text-sm"
            change={(value) => setDocument({ ...board, gridColumns: Number(value) as 1 | 2 | 3 })}
            options={[1, 2, 3].map((columns) => ({
              value: String(columns),
              label: String(columns),
            }))}
          />
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
        <Select
          label={t.winner}
          value={match.winner || ""}
          triggerClassName="!min-h-11 !bg-surface !text-sm"
          change={(value) =>
            setDocument(setMatchResult(board, match.id, value || null, match.scores))
          }
          options={[
            { value: "", label: t.noWinner },
            ...match.players.map((id) => ({
              value: id || "",
              label: participantName(id),
            })),
          ]}
        />
      </label>
    </fieldset>
  );
}
