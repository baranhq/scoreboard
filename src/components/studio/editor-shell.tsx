"use client";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Download, Expand, FilePlus2, Save, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/ui";
import { ColorControl, accentColors } from "./color-control";
import { ThemeLibrary } from "./theme-library";
import { toolThemes } from "@/lib/tool-themes";
import { Graphic } from "./graphic";
import { bracketRounds, hasDependentResults, setMatchResult } from "@/lib/brackets";
import type { StudioDocument } from "@/lib/studio";
import { studioCopy } from "@/lib/studio-copy";
import type { Lang } from "@/lib/i18n";
import { route } from "@/lib/routes";
import { foreground, readableText } from "@/lib/colors";
import { exportPng } from "@/lib/export-png";
import type { useDocument } from "./use-document";
import { previewFieldValue, updatePreviewField, type PreviewField } from "@/lib/studio-edit";
import { WorkspaceTabs, type WorkspaceTab } from "./workspace-tabs";
import { CanvasRatioSelect } from "./canvas-controls";
import { Checkbox } from "@/components/ui/checkbox";
import { Select } from "@/components/ui/select";
import { DailyGithubStarNotice } from "./daily-github-star-notice";

export const inputClass =
  "min-h-11 w-full min-w-0 rounded-md border border-forest/25 bg-surface px-3 py-2 text-base text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest";

export function EditorShell({
  lang,
  state,
  children,
  design,
  settings,
  exportPanel,
  confirmationDialog,
}: {
  lang: Lang;
  state: ReturnType<typeof useDocument>;
  children: ReactNode;
  design: ReactNode;
  settings: ReactNode;
  exportPanel: ReactNode;
  confirmationDialog?: ReactNode;
}) {
  const t = studioCopy[lang];
  const doc = state.document;
  const svg = useRef<SVGSVGElement>(null);
  const preview = useRef<HTMLElement>(null);
  const previewViewport = useRef<HTMLDivElement>(null);
  const previewCanvas = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const [previewScale, setPreviewScale] = useState<"compact" | "fit" | "full">("compact");
  const [previewOnly, setPreviewOnly] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<"edit" | "preview">("edit");
  const [fullscreen, setFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("content");
  const [activeField, setActiveField] = useState<PreviewField | null>(null);
  const [activePosition, setActivePosition] = useState<CSSProperties | null>(null);
  const [actionLeft, setActionLeft] = useState<number | null>(null);
  const previewInput = useRef<HTMLInputElement>(null);
  const activeValue = activeField ? previewFieldValue(doc, activeField) : "";
  const activeLabel = activeField ? previewFieldLabel(doc, activeField, t) : "";
  const previewCanvasClass =
    previewScale === "full"
      ? "relative w-max [&>svg]:!h-auto [&>svg]:!w-auto"
      : previewScale === "fit"
        ? "relative flex h-full min-h-full w-full items-center justify-center [&>svg]:!h-full [&>svg]:!max-h-full [&>svg]:!w-full [&>svg]:!max-w-full"
        : "relative flex h-full min-h-full w-full items-center justify-center [&>svg]:!h-auto [&>svg]:!max-h-[92%] [&>svg]:!w-auto [&>svg]:!max-w-[92%] lg:[&>svg]:!max-h-[78%] lg:[&>svg]:!max-w-[78%]";
  const previewBackground = doc.style.gradient
    ? `linear-gradient(135deg, ${doc.style.background}, ${doc.style.backgroundEnd || doc.style.accent})`
    : doc.style.background;
  const fullscreenOnDark = fullscreen && foreground(doc.style.background) === "#ffffff";
  const fullscreenStyle: CSSProperties = {
    background: previewBackground,
    color: readableText(doc.style.background, doc.style.textColor),
  };
  const previewParticipant =
    activeField?.kind === "bracket-participant" ? activeField.participantId : null;
  const bracketMatches = doc.kind === "bracket" ? bracketRounds(doc) : [];
  const selectedBracketMatch =
    activeField?.kind === "bracket-participant" && activeField.matchId
      ? bracketMatches.flat().find((match) => match.id === activeField.matchId)
      : undefined;
  const advanceMatch =
    doc.kind === "bracket" && previewParticipant
      ? bracketMatches
          .flat()
          .find(
            (match) =>
              !match.winner &&
              match.players.every(Boolean) &&
              match.players.includes(previewParticipant),
          )
      : undefined;
  const moveBackMatch = (() => {
    if (doc.kind !== "bracket" || !previewParticipant || !selectedBracketMatch) return undefined;

    if (
      selectedBracketMatch.winner === previewParticipant &&
      doc.results[selectedBracketMatch.id]?.winner === previewParticipant
    )
      return selectedBracketMatch;

    const matchIndex = /^(\d+)-(\d+)$/.exec(selectedBracketMatch.id);
    if (!matchIndex) return undefined;

    const round = Number(matchIndex[1]);
    const index = Number(matchIndex[2]);
    if (round === 0) return undefined;

    const previousMatch = bracketMatches[round - 1]?.[Math.floor(index / 2)];
    return previousMatch?.winner === previewParticipant &&
      doc.results[previousMatch.id]?.winner === previewParticipant
      ? previousMatch
      : undefined;
  })();

  useEffect(() => {
    if (activeField) previewInput.current?.focus();
  }, [activeField]);

  const editPreviewField = (field: PreviewField, target: SVGTextElement) => {
    const canvas = previewCanvas.current;
    if (!canvas) return;
    const targetRect = target.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    const fontSize = Number.parseFloat(getComputedStyle(target).fontSize);
    setActionLeft(Math.min(targetRect.left - canvasRect.left, Math.max(0, canvasRect.width - 280)));
    setActivePosition({
      left: targetRect.left - canvasRect.left,
      top: targetRect.top - canvasRect.top + Math.max(0, (targetRect.height - 44) / 2),
      width: Math.max(96, Math.min(360, targetRect.width + 28)),
      height: Math.max(44, targetRect.height),
      fontSize: Math.max(14, Math.min(32, fontSize || 18)),
      textAlign:
        target.getAttribute("text-anchor") === "middle"
          ? "center"
          : target.getAttribute("text-anchor") === "end"
            ? "right"
            : "left",
    });
    setActiveField(field);
  };

  useEffect(() => {
    const syncFullscreen = () => setFullscreen(document.fullscreenElement === preview.current);
    document.addEventListener("fullscreenchange", syncFullscreen);
    return () => document.removeEventListener("fullscreenchange", syncFullscreen);
  }, []);

  const exportImage = async () => {
    if (!svg.current) return;
    setExporting(true);
    setExportError("");
    try {
      await exportPng(svg.current, doc.title, doc.exportScale ?? 1);
    } catch {
      setExportError(t.exportError);
    } finally {
      setExporting(false);
    }
  };

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await preview.current?.requestFullscreen();
    } catch {
      setExportError(t.fullscreenError);
    }
  };

  const panels: Record<WorkspaceTab, ReactNode> = {
    content: children,
    design,
    settings,
    timer: null,
    export: exportPanel,
  };

  return (
    <>
      {confirmationDialog}
      <DailyGithubStarNotice lang={lang} />
      <main
        id="main"
        data-editor-shell
        className="mx-auto w-full max-w-[1600px] px-3 py-2 sm:px-5 sm:py-3"
      >
        <h1 className="sr-only">{doc.title}</h1>
        <header className="mb-2 flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-forest/20 pb-2 sm:mb-3 sm:gap-3 sm:pb-3">
          <div className="flex min-w-0 flex-1 basis-full items-center gap-2 sm:basis-auto sm:gap-3">
            <Link
              href={route(lang, doc.kind === "leaderboard" ? "leaderboards" : "brackets")}
              aria-label={t.back}
              className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center text-forest hover:bg-forest/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
            >
              <ArrowLeft aria-hidden="true" size={18} />
            </Link>
            <label className="min-w-0 flex-1">
              <span className="sr-only">{t.title}</span>
              <input
                className="min-h-11 w-full min-w-0 border-b border-transparent bg-transparent px-1 font-display text-xl font-bold tracking-tight text-ink hover:border-forest/25 focus:border-forest focus-visible:outline-none sm:text-2xl"
                maxLength={200}
                value={doc.title}
                disabled={!state.ready || state.busy}
                onChange={(event) => state.change({ ...doc, title: event.target.value })}
              />
            </label>
          </div>
          <div className="flex w-full items-center justify-end gap-1.5 sm:w-auto sm:gap-2">
            <span
              role="status"
              className="mr-auto hidden max-w-56 text-xs leading-4 text-forest md:inline"
            >
              {exportError ||
                state.message ||
                (!state.ready ? t.loading : state.dirty ? t.draftSaved : t.saveHint)}
            </span>
            <Button
              aria-label={t.undoEdit}
              title={t.undoEdit}
              className="!min-h-11 !min-w-11 !px-2 sm:!px-3"
              disabled={!state.canUndo || !state.ready || state.busy}
              onClick={state.undo}
            >
              <Undo2 aria-hidden="true" size={16} />
              <span className="hidden sm:inline">{t.undoEdit}</span>
            </Button>
            <Button
              aria-label={t.newProject}
              title={t.newProject}
              className="!min-h-11 !min-w-11 !px-2 sm:!px-3"
              disabled={!state.ready || state.busy}
              onClick={state.newProject}
            >
              <FilePlus2 aria-hidden="true" size={16} />
              <span className="hidden sm:inline">{t.newProject}</span>
            </Button>
            <Button
              aria-label={t.saveToTables}
              title={t.saveToTables}
              className="!min-h-11 !min-w-11 !px-2 sm:!px-3"
              disabled={!state.ready || state.busy}
              onClick={() => void state.save()}
            >
              <Save aria-hidden="true" size={16} />
              <span className="hidden sm:inline">{t.saveToTables}</span>
            </Button>
            <Button
              primary
              aria-label={exporting ? t.exporting : t.export}
              title={exporting ? t.exporting : t.export}
              className="!min-h-11 !min-w-11 !px-2 sm:!px-3"
              disabled={!state.ready || exporting}
              onClick={() => void exportImage()}
            >
              <Download aria-hidden="true" size={16} />
              <span className="hidden sm:inline">{exporting ? t.exporting : t.export}</span>
            </Button>
          </div>
          <p role="status" className="w-full text-xs leading-4 text-forest md:hidden">
            {exportError ||
              state.message ||
              (!state.ready ? t.loading : state.dirty ? t.draftSaved : t.saveHint)}
          </p>
        </header>

        <div
          className="mb-3 grid grid-cols-2 gap-1 rounded-lg bg-forest/5 p-1 lg:hidden"
          role="group"
          aria-label={t.workspaceTabs}
        >
          {(
            [
              ["edit", t.editing],
              ["preview", t.preview],
            ] as const
          ).map(([panel, label]) => (
            <button
              key={panel}
              type="button"
              aria-pressed={mobilePanel === panel}
              onClick={() => {
                setPreviewOnly(false);
                setMobilePanel(panel);
              }}
              className={`min-h-11 rounded-md px-3 text-sm font-semibold transition-[background-color,color,box-shadow] duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest motion-reduce:transition-none ${mobilePanel === panel ? "bg-surface text-forest shadow-sm" : "text-ink/70 hover:text-ink"}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className={`min-w-0 ${previewOnly ? "" : "grid grid-cols-1 gap-4"}`}>
          <section
            ref={preview}
            aria-label={t.preview}
            className={`flex min-w-0 flex-col overflow-hidden rounded-xl border border-forest/20 bg-paper p-2 shadow-sm sm:p-3 ${mobilePanel === "preview" || previewOnly ? "" : "hidden lg:flex"} ${fullscreen ? "h-dvh rounded-none border-0 p-4" : "h-[min(60dvh,42rem)] lg:h-[min(64dvh,46rem)]"}`}
            style={fullscreen ? fullscreenStyle : undefined}
          >
            <div className="mb-2 grid min-w-0 shrink-0 gap-2 xl:grid-cols-[minmax(10rem,0.7fr)_minmax(0,1.3fr)] xl:items-center">
              <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
                <h2 className="text-base font-semibold">{t.preview}</h2>
                {!fullscreen && <p className="text-sm text-ink/70">{t.clickToEdit}</p>}
              </div>
              <div className="flex min-w-0 flex-wrap items-center justify-start gap-1 sm:gap-2 xl:justify-end">
                <CanvasRatioSelect
                  canvas={doc.canvas}
                  changeCanvas={(canvas) => state.change({ ...doc, canvas })}
                  lang={lang}
                  disabled={state.busy}
                  onDark={fullscreenOnDark}
                />
                <Button
                  onDark={fullscreenOnDark}
                  aria-pressed={previewScale === "fit"}
                  onClick={() => setPreviewScale("fit")}
                >
                  {t.fit}
                </Button>
                <Button
                  onDark={fullscreenOnDark}
                  aria-pressed={previewScale === "full"}
                  onClick={() => setPreviewScale("full")}
                >
                  {t.actual}
                </Button>
                <Button
                  onDark={fullscreenOnDark}
                  aria-pressed={fullscreen}
                  onClick={() => void toggleFullscreen()}
                >
                  <Expand aria-hidden="true" size={16} />
                  {t.fullscreen}
                </Button>
                <Button
                  onDark={fullscreenOnDark}
                  aria-pressed={previewOnly}
                  className="!hidden lg:!inline-flex"
                  onClick={() => setPreviewOnly((current) => !current)}
                >
                  {previewOnly ? t.editing : t.previewOnly}
                </Button>
              </div>
            </div>
            <div
              ref={previewViewport}
              style={{
                background: previewBackground,
                borderColor: fullscreen
                  ? "transparent"
                  : `color-mix(in srgb, ${doc.style.accent} 20%, transparent)`,
              }}
              className={`min-h-0 flex-1 overflow-auto overscroll-contain rounded-lg border border-forest/20 p-2 focus-visible:outline-offset-0 sm:p-4 ${fullscreen ? "border-transparent bg-transparent" : ""}`}
              tabIndex={0}
              aria-label={t.scrollHint}
            >
              <div ref={previewCanvas} className={previewCanvasClass}>
                <Graphic
                  document={doc}
                  labels={t}
                  svgRef={svg}
                  onEdit={state.busy ? undefined : editPreviewField}
                />
                {activeField && activePosition && (
                  <input
                    ref={previewInput}
                    aria-label={`${t.selectedPreview}: ${activeLabel}`}
                    autoComplete="off"
                    disabled={state.busy}
                    maxLength={
                      activeField.kind === "leaderboard-column"
                        ? 80
                        : activeField.kind === "leaderboard-position"
                          ? 6
                          : activeField.kind === "bracket-score"
                            ? 12
                            : 200
                    }
                    inputMode={activeField.kind === "bracket-score" ? "numeric" : undefined}
                    value={activeValue}
                    style={{ ...activePosition, position: "absolute" }}
                    className="z-10 min-w-0 rounded-md border-2 border-action bg-paper/95 px-2 font-semibold text-ink shadow-md outline-none"
                    onChange={(event) =>
                      state.change(updatePreviewField(doc, activeField, event.target.value, false))
                    }
                    onKeyDown={(event) => {
                      if (event.key === "Escape" || event.key === "Enter") {
                        event.preventDefault();
                        event.currentTarget.blur();
                      }
                    }}
                    onBlur={(event) => {
                      if (
                        activeField.kind === "leaderboard-cell" &&
                        doc.kind === "leaderboard" &&
                        (doc.totalColumn !== undefined || activeField.column === 1)
                      )
                        state.change(
                          updatePreviewField(doc, activeField, event.currentTarget.value),
                        );
                      setActiveField(null);
                    }}
                  />
                )}
                {doc.kind === "bracket" &&
                  previewParticipant &&
                  activePosition &&
                  (advanceMatch || moveBackMatch) && (
                    <div
                      className="absolute z-10 flex max-w-[calc(100%-1rem)] flex-wrap gap-1"
                      style={{
                        left: actionLeft ?? activePosition.left,
                        top: Number(activePosition.top) + Number(activePosition.height) + 4,
                      }}
                    >
                      {advanceMatch && (
                        <Button
                          primary
                          disabled={state.busy}
                          className="!min-h-9 !px-2 !py-1 !text-xs"
                          onPointerDown={(event) => event.preventDefault()}
                          onClick={() => {
                            state.change(
                              setMatchResult(
                                doc,
                                advanceMatch.id,
                                previewParticipant,
                                advanceMatch.scores,
                              ),
                            );
                            setActiveField(null);
                          }}
                        >
                          <ArrowRight aria-hidden="true" size={14} />
                          {t.chooseWinner}
                        </Button>
                      )}
                      {moveBackMatch && (
                        <Button
                          disabled={state.busy}
                          className="!min-h-9 !px-2 !py-1 !text-xs"
                          onPointerDown={(event) => event.preventDefault()}
                          onClick={() => {
                            void (async () => {
                              if (hasDependentResults(doc, moveBackMatch.id)) {
                                const choice = await state.confirm(t.confirmClearResults, {
                                  cancelLabel: t.stay,
                                  confirmLabel: t.continue,
                                });
                                if (choice !== "confirm") return;
                              }

                              state.change(
                                setMatchResult(doc, moveBackMatch.id, null, moveBackMatch.scores),
                              );
                              setActiveField(null);
                            })();
                          }}
                        >
                          <Undo2 aria-hidden="true" size={14} />
                          {t.moveBack}
                        </Button>
                      )}
                    </div>
                  )}
              </div>
            </div>
          </section>

          {!previewOnly && (
            <aside
              className={`flex min-w-0 flex-col rounded-xl border border-forest/20 bg-surface shadow-sm ${mobilePanel === "edit" ? "" : "hidden lg:flex"}`}
            >
              <WorkspaceTabs lang={lang} value={activeTab} change={setActiveTab} />
              <fieldset
                id="workspace-panel"
                role="tabpanel"
                aria-labelledby={`workspace-tab-${activeTab}`}
                disabled={!state.ready || state.busy}
                className="min-w-0 space-y-5 px-3 py-3 sm:px-4"
              >
                {panels[activeTab]}
              </fieldset>
            </aside>
          )}
        </div>
      </main>
    </>
  );
}

export function ThemeControls({
  document: doc,
  change,
  lang,
}: {
  document: StudioDocument;
  change: (doc: StudioDocument) => void;
  lang: Lang;
}) {
  const t = studioCopy[lang];
  const [participantId, setParticipantId] = useState("");
  const applyTheme = (theme: (typeof toolThemes)[number]) => {
    const style = { ...theme };
    delete style.id;
    change({
      ...doc,
      style: {
        ...doc.style,
        ...style,
        titleVisible: theme.titleVisible ?? true,
        subtitleVisible: theme.subtitleVisible ?? true,
        showScores: theme.showScores ?? true,
        connectorColor: theme.connectorColor,
        connectorWidth: theme.connectorWidth,
        roundGap: theme.roundGap,
        matchGap: theme.matchGap,
        gradient: theme.gradient,
        backgroundEnd: theme.backgroundEnd,
      },
    });
  };
  const participant =
    doc.kind === "bracket"
      ? doc.participants.find((item) => item.id === participantId) || doc.participants[0]
      : undefined;
  return (
    <div className="space-y-5">
      <ThemeLibrary
        lang={lang}
        previewKind={doc.kind}
        value={{ ...toolThemes[0], ...doc.style, id: undefined }}
        change={applyTheme}
      />
      {doc.kind === "bracket" && (
        <details className="border-t border-forest/20 pt-3">
          <summary className="min-h-11 cursor-pointer py-2 font-semibold">{t.advanced}</summary>
          <div className="grid gap-3 py-3 sm:grid-cols-2">
            <ColorControl
              label={t.connectorColour}
              value={doc.style.connectorColor || doc.style.accent}
              colors={accentColors}
              copy={t}
              change={(connectorColor) =>
                change({ ...doc, style: { ...doc.style, connectorColor } })
              }
            />
            {participant && (
              <div className="space-y-2">
                <label className="grid gap-1 text-sm font-semibold">
                  {t.participant}
                  <Select
                    label={t.participant}
                    value={participant.id}
                    triggerClassName={inputClass}
                    change={setParticipantId}
                    options={doc.participants.map((item) => ({
                      value: item.id,
                      label: item.name,
                    }))}
                  />
                </label>
                <ColorControl
                  label={`${t.participantColour}: ${participant.name}`}
                  value={participant.color || doc.style.accent}
                  colors={accentColors}
                  copy={t}
                  change={(color) =>
                    change({
                      ...doc,
                      participants: doc.participants.map((item) =>
                        item.id === participant.id ? { ...item, color } : item,
                      ),
                    })
                  }
                />
              </div>
            )}
          </div>
          <fieldset className="grid gap-3 border-t border-forest/15 pt-4 sm:grid-cols-2">
            <legend className="px-1 font-semibold">{t.layout}</legend>
            {(
              [
                ["connectorWidth", t.connectorThickness, 0, 8, 2],
                ["roundGap", t.roundSpacing, 240, 400, 260],
                ["matchGap", t.matchSpacing, 8, 100, 40],
              ] as const
            ).map(([field, label, min, max, fallback]) => (
              <label key={field} className="grid gap-2 text-sm font-semibold">
                {label}: {doc.style[field] ?? fallback}
                <input
                  type="range"
                  className="custom-range"
                  min={min}
                  max={max}
                  value={doc.style[field] ?? fallback}
                  onChange={(event) =>
                    change({
                      ...doc,
                      style: { ...doc.style, [field]: Number(event.target.value) },
                    })
                  }
                />
              </label>
            ))}
          </fieldset>
        </details>
      )}
    </div>
  );
}

export function VisibilitySettings({
  document: doc,
  change,
  lang,
}: {
  document: StudioDocument;
  change: (doc: StudioDocument) => void;
  lang: Lang;
}) {
  const t = studioCopy[lang];
  const options = [
    ["titleVisible", t.title],
    ["subtitleVisible", t.subtitle],
  ] as const;
  return (
    <fieldset className="space-y-3">
      <legend className="mb-2 font-semibold">{t.displayElements}</legend>
      {options.map(([key, label]) => (
        <Checkbox
          key={key}
          checked={doc.style[key] !== false}
          label={label}
          change={(checked) => change({ ...doc, style: { ...doc.style, [key]: checked } })}
        />
      ))}
      {doc.kind === "leaderboard" && (
        <Checkbox
          checked={doc.style.rowSeparators === true}
          label={t.rowSeparation}
          change={(rowSeparators) => change({ ...doc, style: { ...doc.style, rowSeparators } })}
        />
      )}
      {doc.kind === "bracket" && (
        <Checkbox
          checked={doc.style.showScores !== false}
          label={t.score}
          change={(showScores) => change({ ...doc, style: { ...doc.style, showScores } })}
        />
      )}
    </fieldset>
  );
}

function previewFieldLabel(
  doc: StudioDocument,
  field: PreviewField,
  labels: (typeof studioCopy)[Lang],
) {
  if (field.kind === "leaderboard-cell")
    return doc.kind === "leaderboard" ? doc.columns[field.column] : labels.cell;
  if (field.kind === "leaderboard-column") return labels.column;
  if (field.kind === "leaderboard-position") return labels.position;
  if (field.kind === "bracket-score") return labels.score;
  return labels.participant;
}
