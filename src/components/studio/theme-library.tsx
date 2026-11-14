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
type ThemePreviewKind = "scoreboard" | "leaderboard" | "bracket";
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

function ThemePreview({
  theme,
  kind,
  lang,
}: {
  theme: ToolTheme;
  kind: ThemePreviewKind;
  lang: Lang;
}) {
  const t = studioCopy[lang];
  const previewStyle = {
    background: theme.gradient
      ? `linear-gradient(135deg, ${theme.background}, ${theme.backgroundEnd || theme.accent})`
      : theme.background,
    borderRadius: theme.radius,
    border: `${Math.max(1, theme.borderWidth)}px solid ${theme.borderColor}`,
  };
  const itemStyle = {
    borderColor: theme.borderColor,
    borderRadius: Math.min(theme.radius, 8),
    color: theme.textColor,
  };
  const accentStyle = { backgroundColor: theme.accent };

  return (
    <span aria-hidden="true" className="mb-2 block h-14 overflow-hidden p-1.5" style={previewStyle}>
      {kind === "scoreboard" && (
        <span className="grid h-full grid-cols-2 gap-1.5">
          {[1, 2].map((team) => (
            <span
              key={team}
              className="flex min-w-0 flex-col items-start justify-between border px-1.5 py-1"
              style={itemStyle}
            >
              <span className="h-[3px] w-1/3" style={accentStyle} />
              <span className="max-w-full truncate text-[8px] leading-none font-semibold">
                {t.team} {team}
              </span>
              <span className="text-sm leading-none font-bold tabular-nums">—</span>
            </span>
          ))}
        </span>
      )}
      {kind === "leaderboard" && (
        <span className="grid h-full grid-cols-[1rem_minmax(0,1fr)_2.5rem] grid-rows-3 items-center gap-x-1 text-[8px] leading-none">
          <span className="font-semibold" style={{ color: theme.accent }}>
            #
          </span>
          <span className="truncate font-semibold" style={{ color: theme.textColor }}>
            {t.team}
          </span>
          <span className="truncate text-right font-semibold" style={{ color: theme.textColor }}>
            {t.points}
          </span>
          {[1, 2].map((team) => (
            <span
              key={team}
              className="col-span-3 grid h-full grid-cols-[1rem_minmax(0,1fr)_2.5rem] items-center gap-x-1 border-t"
              style={{ borderColor: theme.borderColor, color: theme.textColor }}
            >
              <span>{team}</span>
              <span className="truncate">
                {t.team} {team}
              </span>
              <span className="text-right">—</span>
            </span>
          ))}
        </span>
      )}
      {kind === "bracket" && (
        <span className="flex h-full items-center gap-1 text-[7px] leading-tight">
          <span className="flex min-w-0 flex-1 flex-col gap-1">
            {[1, 2].map((match) => (
              <span key={match} className="min-w-0 border" style={itemStyle}>
                <span className="block truncate px-1">
                  {t.participant} {match * 2 - 1}
                </span>
                <span className="block h-px" style={accentStyle} />
                <span className="block truncate px-1">
                  {t.participant} {match * 2}
                </span>
              </span>
            ))}
          </span>
          <span
            className="h-4 w-2 shrink-0 border-y border-r"
            style={{ borderColor: theme.borderColor }}
          />
          <span className="flex min-w-0 flex-1 flex-col justify-center border" style={itemStyle}>
            <span className="truncate px-1 font-semibold" style={{ color: theme.accent }}>
              {t.final}
            </span>
            <span className="block h-px" style={accentStyle} />
            <span className="truncate px-1">—</span>
          </span>
        </span>
      )}
    </span>
  );
}

export function ThemeLibrary({
  lang,
  previewKind,
  value,
  change,
}: {
  lang: Lang;
  previewKind: ThemePreviewKind;
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
        <section aria-labelledby="theme-presets-title" className="space-y-3">
          <div>
            <h3 id="theme-presets-title" className="font-semibold">
              {t.themePresetsTitle}
            </h3>
            <p className="mt-1 text-sm leading-5 text-ink/70">{t.themePresetsHint}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {orderedThemes.map(({ theme, index }) => (
              <button
                type="button"
                key={theme.id}
                onClick={() => change(theme)}
                aria-pressed={isPresetSelected(value, theme)}
                className={`min-h-28 rounded-lg border p-2 text-left transition-[border-color,background-color] duration-150 hover:border-action focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action motion-reduce:transition-none ${isPresetSelected(value, theme) ? "border-action bg-forest/5 ring-1 ring-action" : "border-forest/20"}`}
              >
                <ThemePreview theme={theme} kind={previewKind} lang={lang} />
                <span className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                  <span className="min-w-0 flex-1 text-xs leading-snug font-semibold">
                    {themeLabels[lang][index]}
                  </span>
                  {isPresetSelected(value, theme) && (
                    <span className="shrink-0 rounded bg-forest/10 px-1.5 py-0.5 text-[10px] leading-tight font-semibold text-forest">
                      {t.currentTheme}
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>
        </section>
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
