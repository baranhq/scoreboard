"use client";
import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/ui";
import { Dropdown, MenuItem } from "@/components/ui/dropdown";
import { canvasRatios, type CanvasSize } from "@/lib/graphic-style";
import type { Lang } from "@/lib/i18n";
import { studioCopy } from "@/lib/studio-copy";

const dimensionInputClass =
  "min-h-11 w-full min-w-0 rounded-md border border-forest/25 bg-surface px-3 py-2 text-base text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest";

const ratioChoices = [
  ["square", "square"],
  ["landscape", "landscape"],
  ["standard", "standard"],
  ["portrait", "portrait"],
  ["story", "story"],
] as const;
type RatioChoice = (typeof ratioChoices)[number][0];

function RatioGlyph({ ratio }: { ratio: RatioChoice | "auto" | "custom" }) {
  const sizes: Record<RatioChoice | "auto" | "custom", [number, number]> = {
    square: [1, 1],
    landscape: [16, 9],
    standard: [4, 3],
    portrait: [4, 5],
    story: [9, 16],
    auto: [16, 9],
    custom: [1.35, 1],
  };
  const [ratioWidth, ratioHeight] = sizes[ratio];
  const width = ratioWidth >= ratioHeight ? 24 : (16 * ratioWidth) / ratioHeight;
  const height = ratioHeight >= ratioWidth ? 16 : (24 * ratioHeight) / ratioWidth;
  return (
    <svg viewBox="0 0 28 20" className="h-5 w-7 shrink-0" aria-hidden="true">
      <rect
        x={(28 - width) / 2}
        y={(20 - height) / 2}
        width={width}
        height={height}
        rx="1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function selectedRatio(canvas?: CanvasSize) {
  if (!canvas) return "auto";
  return (
    ratioChoices.find(([, key]) => {
      const size = canvasRatios[key];
      return canvas.width * size.height === canvas.height * size.width;
    })?.[0] || "custom"
  );
}

export function CanvasRatioSelect({
  canvas,
  changeCanvas,
  lang,
  disabled = false,
  onDark = false,
}: {
  canvas?: CanvasSize;
  changeCanvas: (size?: CanvasSize) => void;
  lang: Lang;
  disabled?: boolean;
  onDark?: boolean;
}) {
  const t = studioCopy[lang];
  const options: Record<RatioChoice, readonly [string, CanvasSize]> = {
    landscape: [t.landscapeRatio, canvasRatios.landscape],
    standard: [t.standardRatio, canvasRatios.standard],
    square: [t.squareRatio, canvasRatios.square],
    portrait: [t.portraitRatio, canvasRatios.portrait],
    story: [t.storyRatio, canvasRatios.story],
  } as const;
  const ratio = selectedRatio(canvas);
  const currentLabel =
    ratio === "auto" ? t.fitContent : ratio === "custom" ? t.customSize : options[ratio][0];

  return (
    <Dropdown
      ariaLabel={t.canvasSize}
      disabled={disabled}
      fitViewport
      triggerClassName={`!min-h-11 !w-44 !justify-between !rounded-md !border !px-3 !text-sm ${onDark ? "!border-white/35 !bg-transparent !text-white" : "!border-forest/25 !bg-surface !text-ink"}`}
      label={
        <>
          <RatioGlyph ratio={ratio} />
          <span className="min-w-0 flex-1 truncate text-left">{currentLabel}</span>
          <ChevronDown size={16} aria-hidden="true" />
        </>
      }
    >
      <MenuItem
        type="button"
        role="menuitemradio"
        aria-checked={ratio === "auto"}
        onClick={() => changeCanvas(undefined)}
      >
        <RatioGlyph ratio="auto" />
        {t.fitContent}
        {ratio === "auto" && <Check className="ml-auto size-4" aria-hidden="true" />}
      </MenuItem>
      {ratioChoices.map(([value]) => (
        <MenuItem
          key={value}
          type="button"
          role="menuitemradio"
          aria-checked={ratio === value}
          onClick={() => changeCanvas(options[value][1])}
        >
          <RatioGlyph ratio={value} />
          {options[value][0]}
          {ratio === value && <Check className="ml-auto size-4" aria-hidden="true" />}
        </MenuItem>
      ))}
      {ratio === "custom" && (
        <MenuItem type="button" role="menuitemradio" aria-checked="true" disabled>
          <RatioGlyph ratio="custom" />
          {t.customSize}
          <Check className="ml-auto size-4" aria-hidden="true" />
        </MenuItem>
      )}
    </Dropdown>
  );
}

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
      <div className="flex flex-wrap items-center gap-2">
        <CanvasRatioSelect canvas={canvas} changeCanvas={changeCanvas} lang={lang} />
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
