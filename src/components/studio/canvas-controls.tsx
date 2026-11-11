"use client";
import { useState } from "react";
import { Button } from "@/components/ui/ui";
import { canvasRatios, type CanvasSize } from "@/lib/graphic-style";
import type { Lang } from "@/lib/i18n";
import { studioCopy } from "@/lib/studio-copy";

const dimensionInputClass =
  "min-h-11 w-full min-w-0 rounded-md border border-forest/25 bg-surface px-3 py-2 text-base text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest";

export function CanvasControls({
  canvas,
  exportScale,
  changeCanvas,
  changeExportScale,
  lang,
}: {
  canvas?: CanvasSize;
  exportScale?: 1 | 2;
  changeCanvas: (size?: CanvasSize) => void;
  changeExportScale: (scale: 1 | 2) => void;
  lang: Lang;
}) {
  const t = studioCopy[lang];
  const [customOpen, setCustomOpen] = useState(false);
  const width = canvas?.width || canvasRatios.landscape.width;
  const height = canvas?.height || canvasRatios.landscape.height;
  const dimensionSignature = `${width}:${height}`;
  const [dimensionDraft, setDimensionDraft] = useState({
    width: String(width),
    height: String(height),
    signature: dimensionSignature,
  });
  const currentDraft =
    dimensionDraft.signature === dimensionSignature
      ? dimensionDraft
      : { width: String(width), height: String(height), signature: dimensionSignature };
  const choices = [
    { label: t.landscapeRatio, size: canvasRatios.landscape },
    { label: t.standardRatio, size: canvasRatios.standard },
    { label: t.portraitRatio, size: canvasRatios.portrait },
    { label: t.squareRatio, size: canvasRatios.square },
    { label: t.storyRatio, size: canvasRatios.story },
  ];
  const updateDimension = (key: "width" | "height", value: string) => {
    setDimensionDraft({ ...currentDraft, [key]: value });
    if (!/^\d+$/.test(value)) return;
    const next = Number(value);
    if (next < 320 || next > 4096) return;
    changeCanvas({
      width: key === "width" ? next : width,
      height: key === "height" ? next : height,
    });
  };

  return (
    <fieldset className="space-y-3 border-t border-forest/15 pt-4">
      <legend className="px-1 text-base font-semibold">{t.canvasSize}</legend>
      <div className="flex flex-wrap gap-2">
        <Button
          aria-pressed={!canvas}
          accent={!canvas}
          className="!min-h-10 !px-3 !text-sm"
          onClick={() => {
            changeCanvas(undefined);
            setCustomOpen(false);
          }}
        >
          {t.fitContent}
        </Button>
        {choices.map(({ label, size }) => {
          const selected = !!canvas && canvas.width * size.height === canvas.height * size.width;
          return (
            <Button
              key={label}
              aria-pressed={selected}
              accent={selected}
              className="!min-h-10 !px-3 !text-sm"
              onClick={() => changeCanvas(size)}
            >
              {label}
            </Button>
          );
        })}
        <Button aria-expanded={customOpen} onClick={() => setCustomOpen(!customOpen)}>
          {t.customSize}
        </Button>
      </div>
      {customOpen && (
        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              ["width", t.width, currentDraft.width],
              ["height", t.height, currentDraft.height],
            ] as const
          ).map(([key, label, value]) => (
            <label key={key} className="grid gap-1 text-sm font-semibold">
              {label} · {t.pixelRange}
              <input
                type="number"
                min="320"
                max="4096"
                value={value}
                className={dimensionInputClass}
                onChange={(event) => updateDimension(key, event.target.value)}
                onBlur={() => {
                  if (!/^\d+$/.test(value) || Number(value) < 320 || Number(value) > 4096)
                    setDimensionDraft({
                      width: String(width),
                      height: String(height),
                      signature: dimensionSignature,
                    });
                }}
              />
            </label>
          ))}
        </div>
      )}
      <div className="grid gap-2 sm:max-w-sm">
        <span className="text-sm font-semibold">{t.outputResolution}</span>
        <div className="flex flex-wrap gap-2" role="group" aria-label={t.outputResolution}>
          {(
            [
              [1, t.standardResolution],
              [2, t.highResolution],
            ] as const
          ).map(([scale, label]) => (
            <Button
              key={scale}
              aria-pressed={(exportScale ?? 1) === scale}
              accent={(exportScale ?? 1) === scale}
              className="!min-h-10 !px-3 !text-sm"
              onClick={() => changeExportScale(scale)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>
    </fieldset>
  );
}
