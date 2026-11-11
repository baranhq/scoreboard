"use client";
import { useMemo, useState, useSyncExternalStore } from "react";
import {
  toolThemes,
  themeLabels,
  validToolTheme,
  cleanToolTheme,
  type ToolTheme,
} from "@/lib/tool-themes";
import { studioCopy } from "@/lib/studio-copy";
import type { Lang } from "@/lib/i18n";
import { Button } from "@/components/ui/ui";
import { ColorControl, accentColors, backgroundColors } from "./color-control";
type SavedTheme = { id: string; name: string; value: ToolTheme };
const key = "scoreboard-custom-themes-v1";
const presetKeys = [
  "accent",
  "background",
  "textColor",
  "borderColor",
  "radius",
  "borderWidth",
  "density",
  "gradient",
  "backgroundEnd",
  "connectorColor",
  "connectorWidth",
  "roundGap",
  "matchGap",
] as const;

function isPresetSelected(value: ToolTheme, preset: ToolTheme) {
  return presetKeys.every((key) => value[key] === preset[key]);
}

export function ThemeLibrary({
  lang,
  value,
  change,
}: {
  lang: Lang;
  value: ToolTheme;
  change: (value: ToolTheme) => void;
}) {
  const t = studioCopy[lang];
  const stored = useSyncExternalStore(
    (notify) => {
      window.addEventListener("storage", notify);
      window.addEventListener("scoreboard-themes", notify);
      return () => {
        window.removeEventListener("storage", notify);
        window.removeEventListener("scoreboard-themes", notify);
      };
    },
    () => {
      try {
        return localStorage.getItem(key) || "[]";
      } catch {
        return "[]";
      }
    },
    () => "[]",
  );
  const saved = useMemo<SavedTheme[]>(() => {
    try {
      const raw: unknown = JSON.parse(stored);
      return Array.isArray(raw)
        ? raw
            .filter(
              (item): item is SavedTheme =>
                !!item &&
                typeof item.id === "string" &&
                typeof item.name === "string" &&
                validToolTheme(item.value),
            )
            .slice(0, 50)
        : [];
    } catch {
      return [];
    }
  }, [stored]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const store = (next: SavedTheme[]) => {
    try {
      localStorage.setItem(key, JSON.stringify(next));
      window.dispatchEvent(new Event("scoreboard-themes"));
      setError("");
    } catch {
      setError(t.storageError);
    }
  };
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {toolThemes.map((theme, index) => (
          <button
            type="button"
            key={theme.id}
            onClick={() => change(theme)}
            aria-pressed={isPresetSelected(value, theme)}
            className={`min-h-24 rounded-sm border p-2 text-left transition-[border-color,background-color] duration-150 hover:border-action focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action motion-reduce:transition-none ${isPresetSelected(value, theme) ? "border-action bg-forest/5 ring-1 ring-action" : "border-forest/20"}`}
          >
            <span
              aria-hidden="true"
              className="mb-2 grid h-10 grid-cols-[1fr_0.6fr] gap-1 overflow-hidden p-1.5"
              style={{
                background: theme.gradient
                  ? `linear-gradient(135deg, ${theme.background}, ${theme.backgroundEnd || theme.accent})`
                  : theme.background,
                borderRadius: theme.radius,
                border: `${Math.max(1, theme.borderWidth)}px solid ${theme.borderColor}`,
              }}
            >
              <span className="flex flex-col justify-center gap-1">
                <span className="h-2.5 w-1/2" style={{ background: theme.accent }} />
                <span className="h-1 w-full" style={{ background: theme.textColor }} />
                <span
                  className="h-1 w-4/5"
                  style={{ background: theme.textColor, opacity: 0.65 }}
                />
              </span>
              <span className="flex flex-col justify-center gap-1">
                <span className="h-2.5 w-full" style={{ background: theme.accent }} />
                <span className="h-1 w-full" style={{ background: theme.textColor }} />
                <span
                  className="h-1 w-3/5"
                  style={{ background: theme.textColor, opacity: 0.65 }}
                />
              </span>
            </span>
            <span className="text-xs font-semibold">{themeLabels[lang][index]}</span>
          </button>
        ))}
      </div>
      <label className="flex min-h-11 items-center gap-3">
        <input
          type="checkbox"
          checked={!!value.gradient}
          onChange={(e) =>
            change({
              ...value,
              gradient: e.target.checked,
              backgroundEnd: value.backgroundEnd || value.accent,
            })
          }
        />
        {t.gradientBackground}
      </label>
      {value.gradient && (
        <ColorControl
          label={t.gradientBackground}
          value={value.backgroundEnd || value.accent}
          colors={backgroundColors}
          copy={t}
          change={(backgroundEnd) => change({ ...value, backgroundEnd })}
        />
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        {(
          [
            ["accent", accentColors],
            ["background", backgroundColors],
            ["textColour", accentColors],
            ["borderColour", accentColors],
          ] as const
        ).map(([label, colors], index) => {
          const field = (["accent", "background", "textColor", "borderColor"] as const)[index];
          return (
            <ColorControl
              key={field}
              label={t[label]}
              value={value[field]}
              colors={colors}
              copy={t}
              change={(color) => change({ ...value, [field]: color })}
            />
          );
        })}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {(
          [
            ["radius", "cornerRadius", 40],
            ["borderWidth", "borderThickness", 8],
          ] as const
        ).map(([field, label, max]) => (
          <label key={field} className="grid gap-2 text-sm font-semibold">
            {t[label]}: {value[field]}
            <input
              type="range"
              min="0"
              max={max}
              value={value[field]}
              onChange={(e) => change({ ...value, [field]: Number(e.target.value) })}
            />
          </label>
        ))}
      </div>
      <label className="flex min-h-11 items-center gap-3">
        <input
          type="checkbox"
          checked={value.density === "spacious"}
          onChange={(e) => change({ ...value, density: e.target.checked ? "spacious" : "compact" })}
        />
        {t.spaciousDisplay}
      </label>
      <div className="flex flex-wrap gap-2">
        <input
          aria-label={t.themeName}
          placeholder={t.themeName}
          maxLength={80}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="min-h-11 min-w-0 flex-1 border border-forest/25 bg-surface px-3"
        />
        <Button
          disabled={!name.trim() || saved.length >= 50}
          onClick={() => {
            store([
              ...saved,
              { id: crypto.randomUUID(), name: name.trim(), value: cleanToolTheme(value) },
            ]);
            setName("");
          }}
        >
          {t.saveTheme}
        </Button>
      </div>
      {saved.map((item) => (
        <div
          key={item.id}
          className="flex flex-wrap items-center gap-2 border-t border-forest/15 pt-2"
        >
          <input
            aria-label={t.themeName}
            maxLength={80}
            value={item.name}
            onChange={(e) =>
              store(
                saved.map((theme) =>
                  theme.id === item.id ? { ...theme, name: e.target.value } : theme,
                ),
              )
            }
            className="min-h-11 min-w-0 flex-1 border border-forest/20 bg-surface px-2"
          />
          <Button onClick={() => change(cleanToolTheme(item.value))}>{t.open}</Button>
          <Button
            disabled={saved.length >= 50}
            onClick={() =>
              store([
                ...saved,
                {
                  ...item,
                  id: crypto.randomUUID(),
                  name: `${item.name} (${t.copySuffix})`,
                },
              ])
            }
          >
            {t.duplicateTheme}
          </Button>
          <Button
            onClick={() => {
              if (confirm(t.discardQuestion)) store(saved.filter((theme) => theme.id !== item.id));
            }}
          >
            {t.remove}
          </Button>
        </div>
      ))}
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
