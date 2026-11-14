"use client";
import { useMemo, useState, useSyncExternalStore } from "react";
import {
  toolThemes,
  themeLabels,
  cleanToolTheme,
  parseSavedToolThemes,
  type ToolTheme,
  type SavedToolTheme,
} from "@/lib/tool-themes";
import { studioCopy } from "@/lib/studio-copy";
import type { Lang } from "@/lib/i18n";
import { Button } from "@/components/ui/ui";
import { useConfirmation } from "@/components/ui/use-confirmation";
import { ColorControl, accentColors, backgroundColors } from "./color-control";
import { Checkbox } from "@/components/ui/checkbox";
import { useSiteThemeMode } from "@/components/layout/theme-select";
import { foreground } from "@/lib/colors";
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
  "rowSeparators",
  "connectorColor",
  "connectorWidth",
  "roundGap",
  "matchGap",
] as const;

function isPresetSelected(value: ToolTheme, preset: ToolTheme) {
  return value.id === preset.id || presetKeys.every((key) => value[key] === preset[key]);
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
  const { dark } = useSiteThemeMode();
  const { confirm, dialog } = useConfirmation(t);
  const matchesMode = (color: string) => (foreground(color) === "#ffffff") === dark;
  const orderedThemes = toolThemes
    .map((theme, index) => ({ theme, index }))
    .sort(
      (a, b) => Number(matchesMode(b.theme.background)) - Number(matchesMode(a.theme.background)),
    );
  const orderedBackgrounds = [
    ...backgroundColors.filter(matchesMode),
    ...backgroundColors.filter((color) => !matchesMode(color)),
  ];
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
  const saved = useMemo<SavedToolTheme[]>(() => parseSavedToolThemes(stored), [stored]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const store = (next: SavedToolTheme[]) => {
    try {
      localStorage.setItem(key, JSON.stringify(next));
      window.dispatchEvent(new Event("scoreboard-themes"));
      setError("");
    } catch {
      setError(t.storageError);
    }
  };
  return (
    <>
      {dialog}
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {orderedThemes.map(({ theme, index }) => (
            <button
              type="button"
              key={theme.id}
              onClick={() => change(theme)}
              aria-pressed={isPresetSelected(value, theme)}
              className={`min-h-24 rounded-lg border p-2 text-left transition-[border-color,background-color] duration-150 hover:border-action focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action motion-reduce:transition-none ${isPresetSelected(value, theme) ? "border-action bg-forest/5 ring-1 ring-action" : "border-forest/20"}`}
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
        <div className="grid gap-3 sm:grid-cols-2">
          <ColorControl
            label={t.accent}
            value={value.accent}
            colors={accentColors}
            copy={t}
            change={(accent) => change({ ...value, accent })}
          />
          <ColorControl
            label={t.boardBackground}
            value={value.background}
            colors={orderedBackgrounds}
            copy={t}
            change={(background) => change({ ...value, background })}
          />
          <ColorControl
            label={t.textColour}
            value={value.textColor}
            colors={accentColors}
            copy={t}
            change={(textColor) => change({ ...value, textColor })}
          />
        </div>
        <section className="space-y-3 border-t border-forest/15 pt-3">
          <h3 className="font-semibold">{t.myThemes}</h3>
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
        </section>
        <details className="border-t border-forest/15 pt-2">
          <summary className="min-h-11 cursor-pointer py-2 font-semibold">{t.advanced}</summary>
          <div className="space-y-4 py-3">
            <Checkbox
              checked={!!value.gradient}
              label={t.gradientBackground}
              change={(gradient) =>
                change({ ...value, gradient, backgroundEnd: value.backgroundEnd || value.accent })
              }
            />
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
              <ColorControl
                label={t.borderColour}
                value={value.borderColor}
                colors={accentColors}
                copy={t}
                change={(borderColor) => change({ ...value, borderColor })}
              />
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
                    className="custom-range"
                    min="0"
                    max={max}
                    value={value[field]}
                    onChange={(e) => change({ ...value, [field]: Number(e.target.value) })}
                  />
                </label>
              ))}
            </div>
            <Checkbox
              checked={value.density === "spacious"}
              label={t.spaciousDisplay}
              change={(checked) => change({ ...value, density: checked ? "spacious" : "compact" })}
            />
          </div>
        </details>
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
              onClick={() =>
                void confirm(t.removeThemeQuestion, {
                  confirmLabel: t.remove,
                  cancelLabel: t.cancel,
                }).then((choice) => {
                  if (choice === "confirm") store(saved.filter((theme) => theme.id !== item.id));
                })
              }
            >
              {t.remove}
            </Button>
          </div>
        ))}
        {error && <p role="alert">{error}</p>}
      </div>
    </>
  );
}
