"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Expand, Save } from "lucide-react";
import { Button } from "@/components/ui/ui";
import { ColorControl, accentColors, backgroundColors } from "./color-control";
import { ThemeLibrary } from "./theme-library";
import { toolThemes } from "@/lib/tool-themes";
import { Graphic } from "./graphic";
import { bracketRounds, setMatchResult } from "@/lib/brackets";
import type { StudioDocument } from "@/lib/studio";
import { studioCopy } from "@/lib/studio-copy";
import type { Lang } from "@/lib/i18n";
import { route } from "@/lib/routes";
import { exportPng } from "@/lib/export-png";
import type { useDocument } from "./use-document";
import { previewFieldValue, updatePreviewField, type PreviewField } from "@/lib/studio-edit";
import { WorkspaceTabs, type WorkspaceTab } from "./workspace-tabs";

export const inputClass =
  "min-h-11 w-full min-w-0 rounded-md border border-forest/25 bg-surface px-3 py-2 text-base text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest";

export function EditorShell({
  lang,
  state,
  children,
  design,
  settings,
  exportPanel,
}: {
  lang: Lang;
  state: ReturnType<typeof useDocument>;
  children: ReactNode;
  design: ReactNode;
  settings: ReactNode;
  exportPanel: ReactNode;
}) {
  const t = studioCopy[lang];
  const doc = state.document;
  const svg = useRef<SVGSVGElement>(null);
  const preview = useRef<HTMLElement>(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const [fullSize, setFullSize] = useState(doc.kind === "bracket");
  const [previewOnly, setPreviewOnly] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("content");
  const [activeField, setActiveField] = useState<PreviewField | null>(null);
  const previewInput = useRef<HTMLInputElement>(null);
  const activeValue = activeField ? previewFieldValue(doc, activeField) : "";
  const activeLabel = activeField ? previewFieldLabel(doc, activeField, t) : "";
  const previewParticipant =
    activeField?.kind === "bracket-participant" ? activeField.participantId : null;
  const advanceMatch =
    doc.kind === "bracket" && previewParticipant
      ? bracketRounds(doc)
          .flat()
          .find(
            (match) =>
              !match.winner &&
              match.players.every(Boolean) &&
              match.players.includes(previewParticipant),
          )
      : undefined;

  useEffect(() => {
    if (activeField) previewInput.current?.focus();
  }, [activeField]);

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
    export: exportPanel,
  };

  return (
    <main id="main" className="mx-auto max-w-[1600px] px-4 py-4 sm:px-6 sm:py-6">
      <h1 className="sr-only">{doc.title}</h1>
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-forest/20 pb-4">
        <div className="flex min-w-0 flex-1 items-center gap-3">
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
              className="min-h-12 w-full min-w-0 border-b border-transparent bg-transparent px-1 font-display text-2xl font-bold tracking-tight text-ink hover:border-forest/25 focus:border-forest focus-visible:outline-none sm:text-3xl"
              maxLength={200}
              value={doc.title}
              disabled={!state.ready || state.busy}
              onChange={(event) => state.change({ ...doc, title: event.target.value })}
            />
          </label>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <span role="status" className="mr-1 hidden text-sm text-forest sm:inline">
            {exportError ||
              state.message ||
              (!state.ready ? t.loading : state.dirty ? t.unsaved : t.saveHint)}
          </span>
          <Button disabled={!state.canUndo || !state.ready} onClick={state.undo}>
            {t.undoEdit}
          </Button>
          <Button disabled={!state.ready || state.busy} onClick={state.newProject}>
            {t.newProject}
          </Button>
          <Button disabled={!state.ready || state.busy} onClick={() => void state.save()}>
            <Save aria-hidden="true" size={16} />
            {t.save}
          </Button>
          <Button primary disabled={!state.ready || exporting} onClick={() => void exportImage()}>
            <Download aria-hidden="true" size={16} />
            {exporting ? t.exporting : t.export}
          </Button>
        </div>
        <p role="status" className="w-full text-sm text-forest sm:hidden">
          {exportError ||
            state.message ||
            (!state.ready ? t.loading : state.dirty ? t.unsaved : t.saveHint)}
        </p>
      </header>

      <div
        className={
          previewOnly
            ? ""
            : "grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(20rem,0.8fr)_minmax(0,1.8fr)]"
        }
      >
        <section
          ref={preview}
          aria-label={t.preview}
          className={`order-1 min-w-0 bg-paper lg:sticky lg:top-4 lg:order-2 ${fullscreen ? "flex h-dvh flex-col overflow-hidden p-4" : ""}`}
        >
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-semibold">{t.preview}</h2>
            <div className="flex flex-wrap gap-2">
              <Button aria-pressed={fullSize} onClick={() => setFullSize(!fullSize)}>
                {fullSize ? t.fit : t.actual}
              </Button>
              <Button aria-pressed={fullscreen} onClick={() => void toggleFullscreen()}>
                <Expand aria-hidden="true" size={16} />
                {t.fullscreen}
              </Button>
              <Button
                aria-pressed={previewOnly}
                onClick={() => setPreviewOnly((current) => !current)}
              >
                {previewOnly ? t.editing : t.previewOnly}
              </Button>
            </div>
          </div>
          {!fullscreen && (
            <p className="mb-2 text-sm leading-relaxed text-ink/75">{t.clickToEdit}</p>
          )}
          {activeField && (
            <div className="mb-3 flex flex-wrap items-end gap-2 border-y border-action/35 bg-surface px-3 py-3 motion-safe:animate-[appear_160ms_ease-out] motion-reduce:animate-none">
              <label className="grid min-w-0 flex-1 gap-1 text-sm font-semibold">
                <span>
                  {t.selectedPreview}: {activeLabel}
                </span>
                <input
                  ref={previewInput}
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
                  className={inputClass}
                  onChange={(event) =>
                    state.change(updatePreviewField(doc, activeField, event.target.value, false))
                  }
                />
              </label>
              {doc.kind === "bracket" && advanceMatch && previewParticipant && (
                <Button
                  primary
                  onClick={() =>
                    state.change(
                      setMatchResult(doc, advanceMatch.id, previewParticipant, advanceMatch.scores),
                    )
                  }
                >
                  {t.chooseWinner}
                </Button>
              )}
              <Button onClick={() => setActiveField(null)}>{t.done}</Button>
            </div>
          )}
          <div
            className={`min-h-64 overflow-auto overscroll-contain border border-forest/20 bg-forest/5 p-2 focus-visible:outline-offset-0 sm:p-4 ${fullscreen ? "min-h-0 flex-1" : "max-h-[68svh]"}`}
            tabIndex={0}
            aria-label={t.scrollHint}
          >
            <div className={fullSize ? "w-max [&>svg]:h-auto [&>svg]:w-auto" : "min-w-0"}>
              <Graphic document={doc} labels={t} svgRef={svg} onEdit={setActiveField} />
            </div>
          </div>
          {!fullscreen && (
            <p className="mt-2 text-sm leading-relaxed text-ink/75">{t.scrollHint}</p>
          )}
        </section>

        {!previewOnly && (
          <aside className="order-2 min-w-0 border-t border-forest/20 pt-4 lg:order-1 lg:border-t-0 lg:pt-0">
            <WorkspaceTabs lang={lang} value={activeTab} change={setActiveTab} />
            <fieldset
              id="workspace-panel"
              role="tabpanel"
              aria-labelledby={`workspace-tab-${activeTab}`}
              disabled={!state.ready || state.busy}
              className="max-h-[72svh] min-w-0 space-y-5 overflow-y-auto overscroll-contain px-1 py-4 lg:max-h-[calc(100dvh-13rem)]"
            >
              {panels[activeTab]}
            </fieldset>
          </aside>
        )}
      </div>
    </main>
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
      <ThemeLibrary lang={lang} value={{ ...toolThemes[0], ...doc.style }} change={applyTheme} />
      <details className="border-t border-forest/20 pt-3">
        <summary className="min-h-11 cursor-pointer py-2 font-semibold">{t.more}</summary>
        <div className="grid gap-3 py-3 sm:grid-cols-2">
          <ColorControl
            label={doc.kind === "bracket" ? t.connectorColour : t.borderColour}
            value={
              doc.kind === "bracket"
                ? doc.style.connectorColor || doc.style.accent
                : doc.style.borderColor || doc.style.accent
            }
            colors={accentColors}
            copy={t}
            change={(color) =>
              change({
                ...doc,
                style:
                  doc.kind === "bracket"
                    ? { ...doc.style, connectorColor: color }
                    : { ...doc.style, borderColor: color },
              })
            }
          />
          {participant && doc.kind === "bracket" && (
            <div className="space-y-2">
              <label className="grid gap-1 text-sm font-semibold">
                {t.participant}
                <select
                  value={participant.id}
                  className={inputClass}
                  onChange={(event) => setParticipantId(event.target.value)}
                >
                  {doc.participants.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
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
        <div className="grid gap-3 sm:grid-cols-2">
          <ColorControl
            label={t.accent}
            value={doc.style.accent}
            colors={accentColors}
            copy={t}
            change={(accent) => change({ ...doc, style: { ...doc.style, accent } })}
          />
          <ColorControl
            label={t.background}
            value={doc.style.background}
            colors={backgroundColors}
            copy={t}
            change={(background) => change({ ...doc, style: { ...doc.style, background } })}
          />
          <ColorControl
            label={t.textColour}
            value={doc.style.textColor || "#111111"}
            colors={accentColors}
            copy={t}
            change={(textColor) => change({ ...doc, style: { ...doc.style, textColor } })}
          />
        </div>
        <div className="grid gap-3 pt-3 sm:grid-cols-2">
          {(
            [
              ["radius", t.cornerRadius, 40],
              ["borderWidth", t.borderThickness, 8],
            ] as const
          ).map(([field, label, max]) => (
            <label key={field} className="grid gap-2 text-sm font-semibold">
              {label}: {doc.style[field] ?? 0}
              <input
                type="range"
                min="0"
                max={max}
                value={doc.style[field] ?? 0}
                onChange={(event) =>
                  change({
                    ...doc,
                    style: { ...doc.style, [field]: Number(event.target.value) },
                  })
                }
              />
            </label>
          ))}
        </div>
        {doc.kind === "bracket" && (
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
        )}
        <label className="mt-3 flex min-h-11 items-center gap-3">
          <input
            type="checkbox"
            checked={!!doc.style.gradient}
            onChange={(event) =>
              change({
                ...doc,
                style: {
                  ...doc.style,
                  gradient: event.target.checked,
                  backgroundEnd: doc.style.backgroundEnd || doc.style.accent,
                },
              })
            }
          />
          {t.gradientBackground}
        </label>
      </details>
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
        <label key={key} className="flex min-h-11 items-center gap-3">
          <input
            type="checkbox"
            checked={doc.style[key] !== false}
            onChange={(event) =>
              change({ ...doc, style: { ...doc.style, [key]: event.target.checked } })
            }
          />
          {label}
        </label>
      ))}
      {doc.kind === "bracket" && (
        <label className="flex min-h-11 items-center gap-3">
          <input
            type="checkbox"
            checked={doc.style.showScores !== false}
            onChange={(event) =>
              change({ ...doc, style: { ...doc.style, showScores: event.target.checked } })
            }
          />
          {t.score}
        </label>
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
