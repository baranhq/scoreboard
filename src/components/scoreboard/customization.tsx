"use client";
import { ThemeLibrary } from "@/components/studio/theme-library";
import { toolThemes } from "@/lib/tool-themes";
import type { Lang } from "@/lib/i18n";
import { useId, useState } from "react";
import { canAddScoreboardTeam, MAX_SCOREBOARD_TEAMS, type Board } from "@/lib/boards";
import { defaultTimer, resetTimer } from "@/lib/timer";
import { resolveAppearance, type Appearance } from "@/lib/appearance";
import { defaultColor, teamPalette } from "@/lib/colors";
import type { Messages } from "@/lib/i18n";
import { iconIds } from "@/lib/board-icons";
import { BoardIcon } from "./board-icon";
import { ColorChoice } from "./color-choice";
import { Select } from "../ui/select";
import { DurationInput } from "./duration-input";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/ui";
import { WorkspaceTabs, type WorkspaceTab } from "@/components/studio/workspace-tabs";
import { download } from "@/lib/boards";
import { studioCopy } from "@/lib/studio-copy";
import { applyToolTheme } from "@/lib/board-theme";
import { CanvasControls } from "@/components/studio/canvas-controls";
function SizeSlider({
  id,
  label,
  value,
  change,
  t,
}: {
  id: string;
  label: string;
  value: number;
  change: (value: number) => void;
  t: Messages;
}) {
  return (
    <label htmlFor={id} className="grid gap-2 select-none">
      <span className="flex items-center justify-between gap-3 font-medium">
        <span>{label}</span>
        <output htmlFor={id} className="font-semibold text-forest tabular-nums">
          {value}%
        </output>
      </span>
      <input
        id={id}
        type="range"
        className="custom-range w-full cursor-pointer accent-action focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
        min="80"
        max="240"
        step="5"
        value={value}
        onChange={(event) => change(Number(event.target.value))}
      />
      <span className="flex justify-between text-sm text-forest/75">
        <span>{t.smaller}</span>
        <span>{t.larger}</span>
      </span>
    </label>
  );
}
export function Customization({
  lang,
  board,
  t,
  change,
  remove,
  exportImage,
}: {
  lang: Lang;
  board: Board;
  t: Messages;
  change: (update: (board: Board) => Board) => void;
  remove: (id: string) => void;
  exportImage: () => Promise<void>;
}) {
  const [tab, setTab] = useState<WorkspaceTab>("content");
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState("");
  const copy = studioCopy[lang];
  const scaleId = useId();
  const a = resolveAppearance(board.appearance);
  const set = (key: keyof Appearance, value: Appearance[keyof Appearance]) =>
    change((b) => ({ ...b, appearance: { ...b.appearance, [key]: value } }));
  const select = (label: string, key: keyof Appearance, options: [string, string][]) => (
    <div className="grid gap-2 text-base">
      <span>{label}</span>
      <Select
        label={label}
        value={String(a[key])}
        change={(value) => set(key, value as Appearance[keyof Appearance])}
        options={options.map(([value, label]) => ({ value, label }))}
      />
    </div>
  );
  return (
    <section
      aria-label={t.customize}
      className="mt-5 rounded-xl border border-forest/20 bg-surface p-3 shadow-sm sm:p-4"
    >
      <WorkspaceTabs lang={lang} value={tab} change={setTab} includeTimer />
      <div
        id="workspace-panel"
        role="tabpanel"
        aria-labelledby={`workspace-tab-${tab}`}
        className="pt-4"
      >
        {tab === "content" && (
          <div className="space-y-3">
            <div className="border-t border-forest/15 pt-3">
              {board.teams.map((team, index) => (
                <div key={team.id} className="mb-2 flex items-center gap-1.5">
                  <label className="sr-only" htmlFor={`team-${team.id}`}>
                    {t.teamName} {index + 1}
                  </label>
                  <input
                    id={`team-${team.id}`}
                    value={team.name}
                    maxLength={200}
                    onChange={(e) => {
                      const name = e.target.value;
                      change((b) => ({
                        ...b,
                        teams: b.teams.map((old) =>
                          old.id === team.id ? { ...old, name, automaticName: false } : old,
                        ),
                      }));
                    }}
                    onBlur={(e) => {
                      if (!e.target.value.trim())
                        change((b) => ({
                          ...b,
                          teams: b.teams.map((old) =>
                            old.id === team.id ? { ...old, name: `${t.team} ${index + 1}` } : old,
                          ),
                        }));
                    }}
                    className="min-h-11 w-24 min-w-0 flex-1 rounded-lg border border-forest/25 bg-paper px-3 text-base"
                  />
                  <Button
                    aria-label={`${t.up}: ${team.name}`}
                    disabled={index === 0}
                    className="min-w-11 px-2"
                    onClick={() =>
                      change((b) => {
                        const teams = [...b.teams];
                        [teams[index - 1], teams[index]] = [teams[index], teams[index - 1]];
                        return { ...b, teams };
                      })
                    }
                  >
                    ↑
                  </Button>
                  <Button
                    aria-label={`${t.down}: ${team.name}`}
                    disabled={index === board.teams.length - 1}
                    className="min-w-11 px-2"
                    onClick={() =>
                      change((b) => {
                        const teams = [...b.teams];
                        [teams[index + 1], teams[index]] = [teams[index], teams[index + 1]];
                        return { ...b, teams };
                      })
                    }
                  >
                    ↓
                  </Button>
                  <Button
                    disabled={board.teams.length < 2}
                    aria-label={`${t.remove}: ${team.name}`}
                    className="min-w-11 px-2"
                    onClick={() => remove(team.id)}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
            <Button
              disabled={!canAddScoreboardTeam(board.teams.length)}
              onClick={() =>
                change((b) => ({
                  ...b,
                  teams: !canAddScoreboardTeam(b.teams.length)
                    ? b.teams
                    : [
                        ...b.teams,
                        {
                          id: crypto.randomUUID(),
                          name: `${t.team} ${b.teams.length + 1}`,
                          automaticName: true,
                          score: 0,
                        },
                      ],
                }))
              }
            >
              ＋ {t.add}
            </Button>
            {board.teams.length >= MAX_SCOREBOARD_TEAMS && (
              <p className="text-sm text-ink/70" role="status">
                {studioCopy[lang].maxTeams}
              </p>
            )}
          </div>
        )}
        {tab === "design" && (
          <div>
            <h2 className="mb-3 font-display text-xl font-bold">{t.teamColors}</h2>
            <div className="space-y-3">
              {board.teams.map((team, index) => (
                <ColorChoice
                  key={team.id}
                  label={team.name}
                  value={
                    team.color ||
                    board.color ||
                    (board.themeId ? board.background : undefined) ||
                    teamPalette[index % teamPalette.length].background
                  }
                  t={t}
                  change={(color) =>
                    change((b) => ({
                      ...b,
                      teams: b.teams.map((old) => (old.id === team.id ? { ...old, color } : old)),
                    }))
                  }
                />
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-x-8 gap-y-3 border-t border-forest/15 pt-4">
              <ColorChoice
                label={t.color}
                value={board.background || defaultColor}
                t={t}
                presets={false}
                change={(background) => change((b) => ({ ...b, background }))}
              />
              <ColorChoice
                label={t.iconColor}
                value={board.accent || "#285b35"}
                t={t}
                presets={false}
                change={(accent) => change((b) => ({ ...b, accent }))}
              />
            </div>
            <Button
              className="mt-3"
              onClick={() =>
                change((b) => ({
                  ...b,
                  background: undefined,
                  color: undefined,
                  textColor: undefined,
                  accent: "#285b35",
                  teams: b.teams.map((team) => ({
                    ...team,
                    color: undefined,
                    textColor: undefined,
                  })),
                }))
              }
            >
              {t.resetColors}
            </Button>
          </div>
        )}
        {tab === "design" && (
          <div>
            <ThemeLibrary
              lang={lang}
              value={{
                ...toolThemes[0],
                id: board.themeId,
                gradient: a.gradient,
                backgroundEnd: a.backgroundEnd,
                accent: board.accent || toolThemes[0].accent,
                background: board.background || toolThemes[0].background,
                textColor: board.textColor || toolThemes[0].textColor,
                radius: a.cornerRadius ?? 8,
                borderWidth: a.borderWidth ?? 1,
                borderColor: a.borderColor || toolThemes[0].borderColor,
                density: a.density,
              }}
              change={(theme) => change((current) => applyToolTheme(current, theme))}
            />

            <fieldset>
              <legend className="mb-2 font-semibold">{t.layoutLabel}</legend>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {(
                  [
                    ["auto", t.automatic],
                    ["horizontal", t.horizontal],
                    ["vertical", t.vertical],
                    ["grid", t.grid],
                  ] as const
                ).map(([layout, label]) => (
                  <label
                    key={layout}
                    className={`flex min-h-14 cursor-pointer flex-wrap items-center justify-center gap-2 rounded-lg border px-2 py-3 text-center text-base select-none focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-forest ${a.layout === layout ? "border-action bg-forest/5 text-forest" : "border-forest/20"}`}
                  >
                    <input
                      type="radio"
                      name="board-layout"
                      value={layout}
                      checked={a.layout === layout}
                      onChange={() => set("layout", layout)}
                      className="sr-only"
                    />
                    <svg viewBox="0 0 48 28" className="h-6 w-9 fill-current" aria-hidden="true">
                      {layout === "horizontal" ? (
                        <>
                          <rect x="1" y="2" width="13" height="24" rx="2" />
                          <rect x="17" y="2" width="13" height="24" rx="2" />
                          <rect x="33" y="2" width="13" height="24" rx="2" />
                        </>
                      ) : layout === "grid" ? (
                        <>
                          <rect x="2" y="1" width="20" height="11" rx="2" />
                          <rect x="26" y="1" width="20" height="11" rx="2" />
                          <rect x="2" y="16" width="20" height="11" rx="2" />
                          <rect x="26" y="16" width="20" height="11" rx="2" />
                        </>
                      ) : (
                        <>
                          <rect x="2" y="2" width="20" height="24" rx="2" />
                          <rect x="26" y="2" width="20" height="24" rx="2" />
                        </>
                      )}
                    </svg>
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="mt-4 grid gap-4 border-y border-forest/15 py-4 sm:grid-cols-3">
              <fieldset
                disabled={a.textScaleEnabled}
                className="grid min-w-0 gap-4 disabled:cursor-not-allowed sm:col-span-2 sm:grid-cols-2"
              >
                <legend className="sr-only">{t.displayTextSize}</legend>
                {select(t.scoreSize, "scoreSize", [
                  ["small", t.small],
                  ["medium", t.medium],
                  ["large", t.large],
                  ["xlarge", t.extraLarge],
                ])}
                {select(t.teamSize, "teamSize", [
                  ["small", t.small],
                  ["medium", t.medium],
                  ["large", t.large],
                  ["xlarge", t.extraLarge],
                ])}
              </fieldset>
              {select(t.density, "density", [
                ["compact", t.compact],
                ["spacious", t.spacious],
              ])}
            </div>
            <div className="mt-4 max-w-5xl border-t border-forest/15 pt-3">
              <Checkbox
                checked={a.textScaleEnabled}
                change={(enabled) => set("textScaleEnabled", enabled)}
                label={t.enableTextSizeSlider}
              />
              {a.textScaleEnabled && (
                <fieldset className="mt-3 ml-9 grid gap-5 sm:grid-cols-3">
                  <legend className="sr-only">{t.displayTextSize}</legend>
                  <SizeSlider
                    id={`${scaleId}-score`}
                    label={t.scoreSize}
                    value={a.scoreScale}
                    change={(value) => set("scoreScale", value)}
                    t={t}
                  />
                  <SizeSlider
                    id={`${scaleId}-team`}
                    label={t.teamSize}
                    value={a.teamScale}
                    change={(value) => set("teamScale", value)}
                    t={t}
                  />
                  <SizeSlider
                    id={`${scaleId}-timer`}
                    label={t.timerSize}
                    value={a.timerScale}
                    change={(value) => set("timerScale", value)}
                    t={t}
                  />
                  <p className="text-sm leading-5 text-forest/75 sm:col-span-3">
                    {t.displayTextSizeHint}
                  </p>
                </fieldset>
              )}
            </div>
            <fieldset className="mt-4">
              <legend className="mb-2 font-semibold">{t.icon}</legend>
              <div className="flex flex-wrap gap-1">
                {iconIds.map((id) => (
                  <button
                    key={id}
                    aria-label={t.iconNames[id]}
                    aria-pressed={(board.icon || "scoreboard") === id}
                    title={t.iconNames[id]}
                    onClick={() => change((b) => ({ ...b, icon: id }))}
                    className={`flex min-h-11 min-w-11 items-center justify-center rounded-lg transition-colors duration-150 motion-reduce:transition-none ${(board.icon || "scoreboard") === id ? "bg-action text-on-action" : "hover:bg-forest/5"}`}
                  >
                    <BoardIcon id={id} />
                  </button>
                ))}
              </div>
            </fieldset>
            <Button
              className="mt-4"
              onClick={() => change((b) => ({ ...b, appearance: undefined, icon: "scoreboard" }))}
            >
              {t.resetAppearance}
            </Button>
          </div>
        )}
        {tab === "settings" && (
          <div className="mx-auto max-w-3xl divide-y divide-forest/15">
            <label className="flex min-h-14 items-center justify-between gap-4 py-2 text-base">
              <span className="font-medium">{t.step}</span>
              <input
                type="number"
                min="1"
                max="1000"
                step="1"
                key={a.increment}
                defaultValue={a.increment}
                onBlur={(e) => {
                  const n = e.target.valueAsNumber;
                  if (Number.isInteger(n) && n >= 1 && n <= 1000) set("increment", n);
                  else e.target.value = String(a.increment);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.currentTarget.blur();
                }}
                className="min-h-11 w-24 rounded-lg border border-forest/25 bg-paper px-3"
              />
            </label>
            {(["fullscreenControls", "autoHideControls"] as const).map((key) => (
              <div key={key} className="py-2">
                <Checkbox
                  row
                  checked={a[key]}
                  change={(checked) => set(key, checked)}
                  label={t[key]}
                />
              </div>
            ))}
          </div>
        )}
        {tab === "timer" && (
          <div className="space-y-4">
            <Checkbox
              checked={board.timer?.enabled || false}
              change={(enabled) =>
                change((b) => ({ ...b, timer: resetTimer(b.timer || defaultTimer, enabled) }))
              }
              label={t.enableTimer}
            />
            {board.timer?.enabled && (
              <>
                <div className="grid items-end gap-4 sm:grid-cols-[minmax(12rem,18rem)_1fr]">
                  <div className="grid gap-2 [&_button[aria-haspopup]]:min-h-12">
                    <span className="font-medium">{t.timerMode}</span>
                    <Select
                      label={t.timerMode}
                      value={board.timer.mode || "countdown"}
                      change={(mode) =>
                        change((b) => ({
                          ...b,
                          timer: resetTimer({
                            ...b.timer!,
                            mode: mode as "countdown" | "stopwatch",
                          }),
                        }))
                      }
                      options={[
                        { value: "countdown", label: t.countdown },
                        { value: "stopwatch", label: t.stopwatch },
                      ]}
                    />
                  </div>
                  {board.timer.mode !== "stopwatch" && (
                    <DurationInput
                      label={t.duration}
                      value={board.timer.durationMs}
                      change={(durationMs) =>
                        change((b) => ({ ...b, timer: resetTimer({ ...b.timer!, durationMs }) }))
                      }
                      t={t}
                    />
                  )}
                </div>
                {board.timer.mode !== "stopwatch" && (
                  <div className="flex flex-wrap gap-2">
                    {[1, 3, 5, 10, 15].map((minutes) => (
                      <Button
                        key={minutes}
                        aria-pressed={board.timer!.durationMs === minutes * 60000}
                        onClick={() =>
                          change((b) => ({
                            ...b,
                            timer: resetTimer({ ...b.timer!, durationMs: minutes * 60000 }),
                          }))
                        }
                      >
                        {minutes}{" "}
                        {t.minutes === "Minutes"
                          ? minutes === 1
                            ? "minute"
                            : "minutes"
                          : t.minutes.toLocaleLowerCase()}
                      </Button>
                    ))}
                  </div>
                )}
                <div className="max-w-3xl">
                  <Checkbox
                    checked={board.timer.showHours !== false}
                    change={(showHours) =>
                      change((b) => ({ ...b, timer: { ...b.timer!, showHours } }))
                    }
                    label={t.showTimerHours}
                  />
                  <p className="-mt-1 ml-9 text-sm leading-5 text-forest/75">
                    {t.showTimerHoursHint}
                  </p>
                </div>
                <Checkbox
                  checked={!!board.timer.trackPausedTime}
                  change={(trackPausedTime) =>
                    change((b) => ({ ...b, timer: { ...b.timer!, trackPausedTime } }))
                  }
                  label={t.trackPausedTime}
                />
                <Checkbox
                  checked={a.showPausedNotice}
                  change={(enabled) => set("showPausedNotice", enabled)}
                  label={t.pausedScoreNotice}
                />
                <details
                  name="scoreboard-menu"
                  className="group border-t border-forest/15 pt-2"
                  onToggle={(event) => {
                    if (event.currentTarget.open)
                      window.dispatchEvent(
                        new CustomEvent("scoreboard-menu-open", { detail: event.currentTarget }),
                      );
                  }}
                >
                  <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between rounded-lg px-2 py-2 font-semibold transition-colors duration-150 hover:bg-forest/5 motion-reduce:transition-none [&::-webkit-details-marker]:hidden">
                    <span>{t.sportsOptions}</span>
                    <svg
                      viewBox="0 0 16 16"
                      className="h-4 w-4 fill-none stroke-current transition-transform duration-150 group-open:rotate-180 motion-reduce:transition-none"
                      aria-hidden="true"
                    >
                      <path d="m4 6 4 4 4-4" />
                    </svg>
                  </summary>
                  <div className="grid items-start gap-4 px-2 pt-3 sm:grid-cols-2">
                    {board.timer.mode !== "stopwatch" && (
                      <div className="grid content-start gap-2 rounded-xl border border-forest/15 bg-surface p-4">
                        <span className="font-semibold">{t.matchFormat}</span>
                        <Select
                          label={t.matchFormat}
                          value={String(board.timer.periodCount || 1)}
                          change={(periodCount) =>
                            change((b) => ({
                              ...b,
                              timer: resetTimer({ ...b.timer!, periodCount: Number(periodCount) }),
                            }))
                          }
                          options={[
                            [1, t.noPeriods],
                            [2, t.halves],
                            [3, t.thirds],
                            [4, t.quarters],
                          ].map(([value, label]) => ({
                            value: String(value),
                            label: String(label),
                          }))}
                        />
                      </div>
                    )}
                    <div className="rounded-xl border border-forest/15 bg-surface p-4">
                      <Checkbox
                        checked={(board.timer.timeoutMs || 0) > 0}
                        change={(enabled) =>
                          change((b) => ({
                            ...b,
                            timer: {
                              ...b.timer!,
                              timeoutMs: enabled ? 60000 : 0,
                              timeoutActive: false,
                              timeoutStartedAt: null,
                              timeoutRemainingMs: enabled ? 60000 : 0,
                            },
                          }))
                        }
                        label={t.allowTimeouts}
                      />
                      {(board.timer.timeoutMs || 0) > 0 && (
                        <div className="mt-3 border-t border-forest/15 pt-3">
                          <DurationInput
                            label={t.timeoutDuration}
                            value={board.timer.timeoutMs || 60000}
                            change={(timeoutMs) =>
                              change((b) => ({
                                ...b,
                                timer: {
                                  ...b.timer!,
                                  timeoutMs,
                                  timeoutRemainingMs: timeoutMs,
                                  timeoutStartedAt: null,
                                  timeoutActive: false,
                                },
                              }))
                            }
                            t={t}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </details>
              </>
            )}
          </div>
        )}
        {tab === "export" && (
          <div className="space-y-4">
            <CanvasControls
              canvas={board.canvas}
              exportScale={board.exportScale}
              changeCanvas={(canvas) => change((current) => ({ ...current, canvas }))}
              changeExportScale={(exportScale) =>
                change((current) => ({ ...current, exportScale }))
              }
              lang={lang}
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="max-w-xl text-sm leading-5 text-ink/75">{t.backupHint}</p>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => download([board])}>{copy.backup}</Button>
                <Button
                  primary
                  disabled={exporting}
                  onClick={() => {
                    setExporting(true);
                    setExportError("");
                    void exportImage()
                      .catch(() => setExportError(copy.exportError))
                      .finally(() => setExporting(false));
                  }}
                >
                  {exporting ? copy.exporting : copy.export}
                </Button>
              </div>
            </div>
            {exportError && <p role="alert">{exportError}</p>}
          </div>
        )}
      </div>
    </section>
  );
}
