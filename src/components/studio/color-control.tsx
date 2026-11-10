"use client";
import { useState, type CSSProperties } from "react";
import { Check, ChevronDown, Pipette } from "lucide-react";
import { CustomColorPicker } from "@/components/scoreboard/custom-color-picker";
import { Button } from "@/components/ui/ui";
import { foreground, validColor } from "@/lib/colors";
import type { StudioCopy } from "@/lib/studio-copy";

const accents = [
  "#285b35",
  "#0d7480",
  "#9c3d19",
  "#6741a5",
  "#bf4560",
  "#b26b12",
  "#26384f",
  "#202a30",
];
const backgrounds = [
  "#f7f9fa",
  "#e7efe8",
  "#e3eef5",
  "#fff4df",
  "#f3e2e1",
  "#ece7f6",
  "#e9efe6",
  "#18251f",
];

export function ColorControl({
  label,
  value,
  colors,
  copy,
  change,
}: {
  label: string;
  value: string;
  colors: string[];
  copy: StudioCopy;
  change: (color: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [hex, setHex] = useState(value);
  const [previousValue, setPreviousValue] = useState(value);

  if (value !== previousValue) {
    setPreviousValue(value);
    setHex(value);
  }

  const apply = (color: string) => {
    setHex(color);
    change(color);
  };

  return (
    <fieldset className="min-w-0 rounded-xl border border-forest/15 bg-surface p-3 sm:p-4">
      <legend className="px-1 text-sm font-semibold">{label}</legend>
      <div className="flex flex-wrap items-center gap-2.5">
        <span
          aria-hidden="true"
          style={{ "--swatch": value } as CSSProperties}
          className="size-8 shrink-0 rounded-lg border border-ink/20 bg-[var(--swatch)] shadow-[inset_0_0_0_1px_#ffffff55]"
        />
        <span className="font-mono text-sm font-semibold tracking-wide text-ink/75">
          {value.toUpperCase()}
        </span>
        <Button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className="ml-auto !min-h-10 !px-3 !py-1.5 !text-sm"
        >
          <Pipette size={15} aria-hidden="true" />
          {open ? copy.closePicker : copy.customColor}
          <ChevronDown
            size={15}
            aria-hidden="true"
            className={`transition-transform duration-150 motion-reduce:transition-none ${open ? "rotate-180" : ""}`}
          />
        </Button>
      </div>

      <div
        className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-8"
        role="group"
        aria-label={`${copy.chooseColor}: ${label}`}
      >
        {colors.map((color) => {
          const selected = value.toLowerCase() === color;
          return (
            <button
              key={color}
              type="button"
              aria-label={`${copy.chooseColor}: ${label} ${color.toUpperCase()}`}
              aria-pressed={selected}
              onClick={() => apply(color)}
              style={{ "--swatch": color, "--swatch-mark": foreground(color) } as CSSProperties}
              className="flex size-9 items-center justify-center rounded-lg border border-ink/15 bg-[var(--swatch)] text-[var(--swatch-mark)] transition-[transform,border-color] duration-150 hover:scale-105 hover:border-ink/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action active:scale-95 motion-reduce:transform-none motion-reduce:transition-none"
            >
              {selected && <Check size={17} strokeWidth={2.5} aria-hidden="true" />}
            </button>
          );
        })}
      </div>

      {open && (
        <div className="mt-4 space-y-4 border-t border-forest/15 pt-4 motion-safe:animate-[appear_160ms_ease-out] motion-reduce:animate-none">
          <CustomColorPicker
            value={value}
            change={apply}
            t={{ hue: copy.hue, saturation: copy.saturation, brightness: copy.brightness }}
          />
          <label className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 text-sm font-semibold">
            {copy.hex}
            <input
              value={hex}
              maxLength={7}
              autoCapitalize="characters"
              spellCheck={false}
              aria-label={`${label}: ${copy.hex}`}
              aria-invalid={!validColor(hex)}
              onChange={(event) => {
                const next = event.target.value.toUpperCase();
                setHex(next);
                if (validColor(next)) change(next);
              }}
              onBlur={() => {
                if (!validColor(hex)) setHex(value);
              }}
              className="min-h-11 min-w-0 rounded-lg border border-forest/25 bg-paper px-3 font-mono text-base text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
            />
          </label>
        </div>
      )}
    </fieldset>
  );
}

export const accentColors = accents;
export const backgroundColors = backgrounds;
