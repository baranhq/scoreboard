"use client";
import { useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { Download, Save, Upload, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/ui";
import { Graphic } from "./graphic";
import { graphicPresets, type StudioDocument } from "@/lib/studio";
import { studioCopy } from "@/lib/studio-copy";
import type { Lang } from "@/lib/i18n";
import { route } from "@/lib/routes";
import { exportPng } from "@/lib/export-png";
import type { useDocument } from "./use-document";
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
          <div className="min-w-0 space-y-6">
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
              <StyleControls document={doc} change={state.change} lang={lang} />
            </fieldset>
          </div>
        )}
        <section aria-label={t.preview} className="min-w-0 lg:sticky lg:top-20">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">{t.preview}</h2>
            <Button aria-pressed={fullSize} onClick={() => setFullSize(!fullSize)}>
              {fullSize ? t.fit : t.actual}
            </Button>
          </div>
          <div
            className="max-h-[75svh] overflow-auto overscroll-contain rounded-xl border border-forest/20 bg-forest/5 p-3 focus-visible:outline-offset-0 sm:p-5"
            tabIndex={0}
            aria-label={t.scrollHint}
          >
            <div className={fullSize ? "w-max [&>svg]:h-auto [&>svg]:w-auto" : "min-w-0"}>
              <Graphic document={doc} labels={t} svgRef={svg} />
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
  return (
    <fieldset className="space-y-3 border-t border-forest/20 pt-4">
      <legend className="pt-4 text-lg font-semibold">{t.style}</legend>
      <div className="flex flex-wrap gap-2">
        {(["classic", "editorial", "night"] as const).map((preset) => (
          <Button
            key={preset}
            aria-pressed={doc.style.preset === preset}
            accent={doc.style.preset === preset}
            onClick={() => change({ ...doc, style: { ...graphicPresets[preset] } })}
          >
            {t[preset]}
          </Button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {(["accent", "background"] as const).map((key) => (
          <label key={key} className="grid gap-1 text-sm font-semibold">
            {t[key]}
            <input
              type="color"
              value={doc.style[key]}
              className="h-11 w-full cursor-pointer rounded-lg border border-forest/25 bg-surface p-1"
              onChange={(e) => change({ ...doc, style: { ...doc.style, [key]: e.target.value } })}
            />
          </label>
        ))}
        <label className="col-span-2 grid gap-1 text-sm font-semibold sm:col-span-1">
          {t.font}
          <select
            className={inputClass}
            value={doc.style.font}
            onChange={(e) =>
              change({
                ...doc,
                style: { ...doc.style, font: e.target.value as StudioDocument["style"]["font"] },
              })
            }
          >
            {["Inter Tight", "Inter", "Georgia"].map((font) => (
              <option key={font}>{font}</option>
            ))}
          </select>
        </label>
      </div>
    </fieldset>
  );
}
