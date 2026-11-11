"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { Download, Save, Upload, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/ui";
import { ColorControl, accentColors } from "./color-control";
import { ThemeLibrary } from "./theme-library";
import { toolThemes } from "@/lib/tool-themes";
import { Graphic } from "./graphic";
import { bracketRounds, setMatchResult } from "@/lib/brackets";
import type { StudioDocument } from "@/lib/studio";
import { canvasRatios } from "@/lib/graphic-style";
import { studioCopy } from "@/lib/studio-copy";
import type { Lang } from "@/lib/i18n";
import { route } from "@/lib/routes";
import { exportPng } from "@/lib/export-png";
import type { useDocument } from "./use-document";
import { previewFieldValue, updatePreviewField, type PreviewField } from "@/lib/studio-edit";
export const inputClass =
  "min-h-11 w-full min-w-0 rounded-lg border border-forest/25 bg-surface px-3 py-2 text-base text-ink";
export function EditorShell({
  lang,
  state,
  children,
}: {
  lang: Lang;
  state: ReturnType<typeof useDocument>;
  children: ReactNode;
}) {
  const t = studioCopy[lang];
  const doc = state.document;
  const svg = useRef<SVGSVGElement>(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const [fullSize, setFullSize] = useState(doc.kind === "bracket");
  const [previewOnly, setPreviewOnly] = useState(false);
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
  const exportImage = async () => {
    if (!svg.current) return;
    setExporting(true);
    setExportError("");
    try {
      await exportPng(svg.current, doc.title);
    } catch {
      setExportError(t.exportError);
    } finally {
      setExporting(false);
    }
  };
  return (
    <main id="main" className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-forest/20 pb-4">
        <div>
          <Link
            href={route(lang, doc.kind === "leaderboard" ? "leaderboards" : "brackets")}
            className="mb-2 inline-flex min-h-8 items-center gap-1 text-sm text-forest"
          >
            <ArrowLeft size={14} />
            {t.back}
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">{t[doc.kind]}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button disabled={!state.ready || state.busy} onClick={() => void state.save()}>
            <Save size={17} />
            {t.save}
          </Button>
          <Button primary disabled={!state.ready || exporting} onClick={() => void exportImage()}>
            <Download size={17} />
            {exporting ? t.exporting : t.export}
          </Button>
        </div>
      </div>
      <p role="status" className="mb-3 text-sm font-medium text-forest">
        {exportError ||
          state.message ||
          (!state.ready ? t.loading : state.dirty ? t.unsaved : t.saveHint)}
      </p>
      <div className="mb-4 flex flex-wrap gap-2">
        <Button disabled={!state.ready} onClick={state.newProject}>
          {t.newProject}
        </Button>
        <Button disabled={!state.canUndo} onClick={state.undo}>
          {t.undoEdit}
        </Button>
        <Button onClick={() => setPreviewOnly(!previewOnly)}>
          {previewOnly ? t.editing : t.previewOnly}
        </Button>
        <Button disabled={!state.ready} onClick={state.backup}>
          {t.backup}
        </Button>
        <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-forest/25 px-4 text-base font-medium text-forest focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-forest">
          <Upload size={16} />
          {t.import}
          <input
            type="file"
            accept="application/json,.json"
            disabled={!state.ready || state.busy}
            className="sr-only"
            aria-label={t.import}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void state.importFile(file);
              event.target.value = "";
            }}
          />
        </label>
      </div>
      <div
        className={
          previewOnly
            ? ""
            : "grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]"
        }
      >
        {!previewOnly && (
          <div className="order-2 min-w-0 space-y-6 lg:order-1">
            <fieldset disabled={!state.ready || state.busy} className="min-w-0 space-y-5">
              <legend className="sr-only">{t.editing}</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1 text-sm font-semibold">
                  {t.title}
                  <input
                    className={inputClass}
                    maxLength={200}
                    value={doc.title}
                    onChange={(e) => state.change({ ...doc, title: e.target.value })}
                  />
                </label>
                <label className="grid gap-1 text-sm font-semibold">
                  {t.subtitle}
                  <input
                    className={inputClass}
                    maxLength={200}
                    value={doc.subtitle}
                    onChange={(e) => state.change({ ...doc, subtitle: e.target.value })}
                  />
                </label>
              </div>
              {children}
              <details className="border-t border-forest/20 pt-3">
                <summary className="min-h-11 cursor-pointer py-2 text-lg font-semibold">
                  {t.style}
                </summary>
                <StyleControls document={doc} change={state.change} lang={lang} />
              </details>
            </fieldset>
          </div>
        )}
        <section aria-label={t.preview} className="order-1 min-w-0 lg:sticky lg:top-20 lg:order-2">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">{t.preview}</h2>
            <Button aria-pressed={fullSize} onClick={() => setFullSize(!fullSize)}>
              {fullSize ? t.fit : t.actual}
            </Button>
          </div>
          <p className="mb-2 text-sm leading-relaxed text-ink/75">{t.clickToEdit}</p>
          {activeField && (
            <div className="mb-3 flex flex-wrap items-end gap-2 rounded-xl border border-action/30 bg-surface p-3 motion-safe:animate-[appear_160ms_ease-out] motion-reduce:animate-none">
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
            className="max-h-[75svh] overflow-auto overscroll-contain rounded-xl border border-forest/20 bg-forest/5 p-3 focus-visible:outline-offset-0 sm:p-5"
            tabIndex={0}
            aria-label={t.scrollHint}
          >
            <div className={fullSize ? "w-max [&>svg]:h-auto [&>svg]:w-auto" : "min-w-0"}>
              <Graphic document={doc} labels={t} svgRef={svg} onEdit={setActiveField} />
            </div>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-ink/75">{t.scrollHint}</p>
        </section>
      </div>
    </main>
  );
}
function StyleControls({
  document: doc,
  change,
  lang,
}: {
  document: StudioDocument;
  change: (doc: StudioDocument) => void;
  lang: Lang;
}) {
  const t = studioCopy[lang];
  const [participant, setParticipant] = useState("");
  const player =
    doc.kind === "bracket"
      ? doc.participants.find((item) => item.id === participant) || doc.participants[0]
      : undefined;
  return (
    <fieldset className="space-y-3 border-t border-forest/20 pt-4">
      <legend className="pt-4 text-lg font-semibold">{t.style}</legend>
      <ThemeLibrary
        lang={lang}
        value={{ ...toolThemes[0], ...doc.style }}
        change={(style) => change({ ...doc, style: { ...doc.style, ...style } })}
      />
      <details className="border-t border-forest/20 pt-3">
        <summary className="min-h-11 cursor-pointer py-2 font-semibold">{t.more}</summary>
        <div className="grid gap-3 py-3 sm:grid-cols-2">
          {(
            [
              ["titleVisible", t.title],
              ["subtitleVisible", t.subtitle],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex min-h-11 items-center gap-2">
              <input
                type="checkbox"
                checked={doc.style[key] !== false}
                onChange={(e) =>
                  change({ ...doc, style: { ...doc.style, [key]: e.target.checked } })
                }
              />
              {label}
            </label>
          ))}
          {doc.kind === "bracket" && (
            <>
              <label className="flex min-h-11 items-center gap-2">
                <input
                  type="checkbox"
                  checked={doc.style.showScores !== false}
                  onChange={(e) =>
                    change({ ...doc, style: { ...doc.style, showScores: e.target.checked } })
                  }
                />
                {t.score}
              </label>
              <ColorControl
                label={t.connectorColour}
                value={doc.style.connectorColor || doc.style.accent}
                colors={accentColors}
                copy={t}
                change={(connectorColor) =>
                  change({ ...doc, style: { ...doc.style, connectorColor } })
                }
              />
              {(
                [
                  ["connectorWidth", "connectorThickness", 0, 8, 2],
                  ["roundGap", "roundSpacing", 240, 400, 260],
                  ["matchGap", "matchSpacing", 8, 100, 40],
                ] as const
              ).map(([key, label, min, max, fallback]) => (
                <label key={key} className="grid gap-2 text-sm font-semibold">
                  {t[label]}: {doc.style[key] ?? fallback}
                  <input
                    type="range"
                    min={min}
                    max={max}
                    value={doc.style[key] ?? fallback}
                    onChange={(e) =>
                      change({ ...doc, style: { ...doc.style, [key]: Number(e.target.value) } })
                    }
                  />
                </label>
              ))}
              {player && (
                <div className="space-y-2">
                  <label className="grid gap-1 text-sm font-semibold">
                    {t.participant}
                    <select
                      value={player.id}
                      onChange={(e) => setParticipant(e.target.value)}
                      className={inputClass}
                    >
                      {doc.participants.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <ColorControl
                    label={t.participantColour}
                    value={player.color || doc.style.accent}
                    colors={accentColors}
                    copy={t}
                    change={(color) =>
                      change({
                        ...doc,
                        participants: doc.participants.map((item) =>
                          item.id === player.id ? { ...item, color } : item,
                        ),
                      })
                    }
                  />
                </div>
              )}
            </>
          )}
        </div>
      </details>
      <CanvasControls document={doc} change={change} labels={t} />
    </fieldset>
  );
}

function CanvasControls({
  document: doc,
  change,
  labels: t,
}: {
  document: StudioDocument;
  change: (doc: StudioDocument) => void;
  labels: (typeof studioCopy)[Lang];
}) {
  const [customOpen, setCustomOpen] = useState(false);
  const widthValue = String(doc.canvas?.width || canvasRatios.landscape.width);
  const heightValue = String(doc.canvas?.height || canvasRatios.landscape.height);
  const [widthDraft, setWidthDraft] = useState(widthValue);
  const [heightDraft, setHeightDraft] = useState(heightValue);
  const [previousDimensions, setPreviousDimensions] = useState({ widthValue, heightValue });
  const choices = [
    { label: t.landscapeRatio, size: canvasRatios.landscape },
    { label: t.portraitRatio, size: canvasRatios.portrait },
    { label: t.squareRatio, size: canvasRatios.square },
    { label: t.storyRatio, size: canvasRatios.story },
  ];

  if (
    widthValue !== previousDimensions.widthValue ||
    heightValue !== previousDimensions.heightValue
  ) {
    setPreviousDimensions({ widthValue, heightValue });
    setWidthDraft(widthValue);
    setHeightDraft(heightValue);
  }

  const updateDimension = (key: "width" | "height", value: string) => {
    if (key === "width") setWidthDraft(value);
    else setHeightDraft(value);

    if (!/^\d+$/.test(value)) return;
    const dimension = Number(value);
    if (dimension < 320 || dimension > 4096) return;

    change({
      ...doc,
      canvas: {
        width: key === "width" ? dimension : doc.canvas?.width || canvasRatios.landscape.width,
        height: key === "height" ? dimension : doc.canvas?.height || canvasRatios.landscape.height,
      },
    });
  };

  const resetDraft = (key: "width" | "height") => {
    const value = doc.canvas?.[key] || canvasRatios.landscape[key];
    if (key === "width") setWidthDraft(String(value));
    else setHeightDraft(String(value));
  };

  return (
    <fieldset className="space-y-3 border-t border-forest/15 pt-4">
      <legend className="px-1 text-base font-semibold">{t.canvasSize}</legend>
      <div className="flex flex-wrap gap-2">
        <Button
          aria-pressed={!doc.canvas}
          accent={!doc.canvas}
          className="!min-h-10 !px-3 !text-sm"
          onClick={() => {
            change({ ...doc, canvas: undefined });
            setCustomOpen(false);
          }}
        >
          {t.fitContent}
        </Button>
        {choices.map(({ label, size }) => {
          const selected =
            !!doc.canvas && doc.canvas.width * size.height === doc.canvas.height * size.width;
          return (
            <Button
              key={label}
              aria-pressed={selected}
              accent={selected}
              className="!min-h-10 !px-3 !text-sm"
              onClick={() => {
                change({ ...doc, canvas: { ...size } });
                setCustomOpen(false);
              }}
            >
              {label}
            </Button>
          );
        })}
        <Button
          aria-expanded={customOpen}
          aria-pressed={customOpen}
          accent={customOpen}
          className="!min-h-10 !px-3 !text-sm"
          onClick={() => {
            if (!customOpen && !doc.canvas)
              change({ ...doc, canvas: { ...canvasRatios.landscape } });
            setCustomOpen((open) => !open);
          }}
        >
          {t.customSize}
        </Button>
      </div>
      {customOpen && (
        <div className="grid grid-cols-2 gap-3 rounded-xl border border-forest/15 bg-surface p-3 motion-safe:animate-[appear_160ms_ease-out] motion-reduce:animate-none">
          {(["width", "height"] as const).map((key) => (
            <label key={key} className="grid gap-1 text-sm font-semibold">
              {t[key]}
              <input
                type="number"
                min={320}
                max={4096}
                step={1}
                value={key === "width" ? widthDraft : heightDraft}
                inputMode="numeric"
                aria-describedby="canvas-size-hint"
                onChange={(event) => updateDimension(key, event.target.value)}
                onBlur={() => resetDraft(key)}
                className={inputClass}
              />
            </label>
          ))}
          <p id="canvas-size-hint" className="col-span-2 text-sm text-ink/70">
            {t.pixelRange}
          </p>
        </div>
      )}
    </fieldset>
  );
}

function previewFieldLabel(
  doc: StudioDocument,
  field: PreviewField,
  labels: (typeof studioCopy)[Lang],
): string {
  if (field.kind === "title") return labels.title;
  if (field.kind === "subtitle") return labels.subtitle;
  if (field.kind === "leaderboard-column") return `${labels.column} ${field.column + 1}`;
  if (field.kind === "leaderboard-position" && doc.kind === "leaderboard") {
    const index = doc.rows.findIndex((row) => row.id === field.rowId);
    return `${labels.position} ${index + 1}`;
  }
  if (field.kind === "leaderboard-cell" && doc.kind === "leaderboard") {
    const index = doc.rows.findIndex((row) => row.id === field.rowId);
    return `${labels.rows} ${index + 1} · ${doc.columns[field.column] || labels.cell}`;
  }
  if (field.kind === "bracket-participant" && doc.kind === "bracket") {
    const index = doc.participants.findIndex((player) => player.id === field.participantId);
    return `${labels.participant} ${index + 1}`;
  }
  if (field.kind === "bracket-score") {
    const matchNumber = Number(field.matchId.split("-")[1]) + 1;
    return `${labels.match} ${matchNumber} · ${labels.score} ${field.side + 1}`;
  }
  return labels.cell;
}
