"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { hexToHsv, hsvToHex, type HSV } from "@/lib/hsv";
import type { Messages } from "@/lib/i18n";
export function CustomColorPicker({
  value,
  change,
  t,
}: {
  value: string;
  change: (color: string) => void;
  t: Pick<Messages, "hue" | "saturation" | "brightness">;
}) {
  const [hsv, setHsv] = useState(() => hexToHsv(value));
  const emitted = useRef(value);
  const square = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (value !== emitted.current) {
      setHsv(hexToHsv(value));
      emitted.current = value;
    }
  }, [value]);
  const update = (next: HSV) => {
    setHsv(next);
    const color = hsvToHex(next);
    emitted.current = color;
    change(color);
  };
  const point = (x: number, y: number) => {
    const rect = square.current?.getBoundingClientRect();
    if (!rect) return;
    update({
      ...hsv,
      s: Math.max(0, Math.min(1, (x - rect.left) / rect.width)),
      v: 1 - Math.max(0, Math.min(1, (y - rect.top) / rect.height)),
    });
  };
  return (
    <div className="space-y-4">
      <div
        ref={square}
        role="slider"
        tabIndex={0}
        aria-label={`${t.saturation}, ${t.brightness}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(hsv.s * 100)}
        aria-valuetext={`${t.saturation}: ${Math.round(hsv.s * 100)}%, ${t.brightness}: ${Math.round(hsv.v * 100)}%`}
        onKeyDown={(e) => {
          const step = e.shiftKey ? 0.1 : 0.01;
          let { s, v } = hsv;
          if (e.key === "ArrowLeft") s -= step;
          else if (e.key === "ArrowRight") s += step;
          else if (e.key === "ArrowUp") v += step;
          else if (e.key === "ArrowDown") v -= step;
          else if (e.key === "Home") s = 0;
          else if (e.key === "End") s = 1;
          else return;
          e.preventDefault();
          update({ ...hsv, s: Math.max(0, Math.min(1, s)), v: Math.max(0, Math.min(1, v)) });
        }}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          point(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => {
          if (e.currentTarget.hasPointerCapture(e.pointerId)) point(e.clientX, e.clientY);
        }}
        style={{ "--hue-color": hsvToHex({ h: hsv.h, s: 1, v: 1 }) } as CSSProperties}
        className="relative h-44 w-full cursor-crosshair touch-none rounded-xl border border-forest/25 bg-[var(--hue-color)] sm:h-52"
      >
        <div className="pointer-events-none absolute inset-0 rounded-xl bg-[image:var(--picker-white-overlay)]" />
        <div className="pointer-events-none absolute inset-0 rounded-xl bg-[image:var(--picker-black-overlay)]" />
        <span
          aria-hidden="true"
          style={{
            left: `clamp(10px,${hsv.s * 100}%,calc(100% - 10px))`,
            top: `clamp(10px,${(1 - hsv.v) * 100}%,calc(100% - 10px))`,
          }}
          className="pointer-events-none absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[var(--picker-handle-shadow)]"
        />
      </div>
      <label className="grid gap-2 text-base font-medium">
        {t.hue}
        <input
          type="range"
          min="0"
          max="359"
          value={Math.round(hsv.h) % 360}
          onChange={(e) => update({ ...hsv, h: e.target.valueAsNumber })}
          className="h-6 w-full cursor-pointer appearance-none rounded-full border border-forest/25 bg-[image:var(--picker-hue-spectrum)] [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-ink [&::-moz-range-thumb]:bg-white [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-ink [&::-webkit-slider-thumb]:bg-white"
        />
      </label>
    </div>
  );
}
