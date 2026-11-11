import {
  ArrowDown,
  ArrowUp,
  Check,
  ChartNoAxesColumn,
  ChevronDown,
  Maximize,
  Minus,
  Pause,
  Pencil,
  Play,
  Plus,
  RotateCcw,
  Save,
  Share2,
  Trash2,
} from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { buttonColors, readableText, teamPalette, themePaletteColor } from "@/lib/colors";
import type { LandingContent } from "@/lib/landing-content";
import type {
  PreviewLabels,
  PreviewState,
  PreviewTab,
  PreviewTarget,
} from "./scoreboard-preview-types";
import { iconIds } from "@/lib/board-icons";
import { BoardIcon } from "../scoreboard/board-icon";
import { DemoPlaybackControls } from "./demo-playback-controls";

function VisualButton({
  children,
  primary = false,
  pressed = false,
  className = "",
  target,
}: {
  children: ReactNode;
  primary?: boolean;
  pressed?: boolean;
  className?: string;
  target?: PreviewTarget;
}) {
  return (
    <span
      className={`inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border px-2 py-1 text-sm font-medium transition-[color,background-color,border-color,transform] duration-150 motion-reduce:transform-none motion-reduce:transition-none ${primary ? "border-action bg-action text-on-action" : "border-forest/25 bg-transparent text-forest"} ${pressed ? "scale-[.96] brightness-95" : ""} ${className}`}
      data-demo-target={target}
    >
      {children}
    </span>
  );
}

function PreviewCheck({
  label,
  checked = false,
  target,
  pressed = false,
}: {
  label: string;
  checked?: boolean;
  target?: PreviewTarget;
  pressed?: boolean;
}) {
  return (
    <div
      data-demo-target={target}
      className={`flex min-h-9 items-center gap-2 text-sm transition-transform duration-150 motion-reduce:transition-none ${pressed ? "scale-[.98]" : ""}`}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${checked ? "border-action bg-action text-on-action" : "border-forest/30"}`}
      >
        {checked && <Check aria-hidden="true" className="h-4 w-4" />}
      </span>
      <span className="min-w-0 break-words">{label}</span>
    </div>
  );
}

export function PreviewToolbar({
  copy,
  labels,
  playing,
  showPlaybackControls = true,
  onToggle,
  onReset,
}: {
  copy: LandingContent["preview"];
  labels: PreviewLabels;
  playing: boolean;
  showPlaybackControls?: boolean;
  onToggle: () => void;
  onReset: () => void;
}) {
  return (
    <div className="mb-3 flex min-w-0 items-center justify-between gap-2 [@media(max-height:600px)]:mb-1">
      <h2
        aria-hidden="true"
        className="flex min-w-0 items-center gap-2 font-display text-lg font-bold tracking-tight sm:text-xl"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-action text-on-action">
          <ChartNoAxesColumn aria-hidden="true" className="h-5 w-5" />
        </span>
        <span className="truncate">{copy.boardName}</span>
      </h2>
      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        {showPlaybackControls && (
          <DemoPlaybackControls
            playing={playing}
            labels={{
              play: labels.playPreview,
              pause: labels.pausePreview,
              reset: labels.resetDemo,
            }}
            onToggle={onToggle}
            onReset={onReset}
          />
        )}
        <div aria-hidden="true" className="hidden items-center gap-1 sm:flex sm:gap-2">
          <VisualButton>
            <Share2 aria-hidden="true" className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only">{labels.share}</span>
          </VisualButton>
          <VisualButton primary>
            <Save aria-hidden="true" className="h-4 w-4" />
            <span>{labels.save}</span>
          </VisualButton>
          <VisualButton>
            <span className="hidden sm:inline">{labels.fullscreen}</span>
            <Maximize aria-hidden="true" className="h-4 w-4" />
          </VisualButton>
        </div>
      </div>
    </div>
  );
}

export function PreviewTimer({ state, labels }: { state: PreviewState; labels: PreviewLabels }) {
  if (!state.timerEnabled) return null;

  return (
    <div className="mb-3 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-x-2 text-center [@media(max-height:600px)]:mb-1">
      <div className="col-start-2">
        <p className="font-display text-2xl font-bold tabular-nums sm:text-3xl [@media(max-height:600px)]:text-xl">
          {state.timer}
        </p>
      </div>
      <div className="col-start-3 flex justify-end gap-1.5">
        <VisualButton target="timer-start" pressed={state.pressed === "timer-start"}>
          {state.timerRunning ? (
            <Pause aria-hidden="true" className="h-4 w-4" />
          ) : (
            <Play aria-hidden="true" className="h-4 w-4" />
          )}
          <span className="sr-only">
            {state.timerRunning ? labels.pauseTimer : labels.startTimer}
          </span>
        </VisualButton>
        <VisualButton target="timer-reset" pressed={state.pressed === "timer-reset"}>
          <RotateCcw aria-hidden="true" className="h-4 w-4" />
          <span className="sr-only">{labels.resetTimer}</span>
        </VisualButton>
      </div>
    </div>
  );
}

export function PreviewTeamCard({
  state,
  index,
  name,
  score,
  labels,
  readOnly = false,
  editingName,
  onEditName,
  onDoneEditingName,
  onNameChange,
  onScoreChange,
}: {
  state: PreviewState;
  index: number;
  name: string;
  score: number;
  labels: PreviewLabels;
  readOnly?: boolean;
  editingName: boolean;
  onEditName: () => void;
  onDoneEditingName: () => void;
  onNameChange: (name: string) => void;
  onScoreChange: (amount: -1 | 1) => void;
}) {
  const palette = teamPalette[state.teamPalettes[index]];
  const darkBackground = themePaletteColor(palette.background, "dark");
  const lightButtons = buttonColors(palette.background);
  const darkButtons = buttonColors(darkBackground);
  const style = {
    "--team-bg": palette.background,
    "--team-fg": readableText(palette.background, palette.text),
    "--team-bg-dark": darkBackground,
    "--team-fg-dark": readableText(darkBackground, palette.darkText),
    "--button-bg": lightButtons.primary,
    "--button-text": lightButtons.text,
    "--button-border": lightButtons.border,
    "--secondary-text": lightButtons.secondaryText,
    "--button-bg-dark": darkButtons.primary,
    "--button-text-dark": darkButtons.text,
    "--button-border-dark": darkButtons.border,
    "--secondary-text-dark": darkButtons.secondaryText,
  } as CSSProperties;
  const plusTarget =
    index === 0 ? "team-one-plus" : index === 1 ? "team-two-plus" : "team-three-plus";
  const minusTarget =
    index === 0 ? "team-one-minus" : index === 1 ? "team-two-minus" : "team-three-minus";
  const leaving = index === 2 && state.leavingThirdTeam;

  return (
    <article
      data-demo-team={index + 1}
      style={style}
      className={`[container-type:inline-size] flex min-w-0 flex-col items-center justify-center rounded-xl bg-[var(--team-bg)] px-1.5 py-2 text-[var(--team-fg)] transition-[opacity,transform,background-color] duration-300 motion-reduce:transition-none sm:flex-1 sm:px-2 sm:py-4 dark:bg-[var(--team-bg-dark)] dark:text-[var(--team-fg-dark)] [@media(max-height:600px)]:py-0 ${leaving ? "scale-[.96] opacity-0" : "scale-100 opacity-100"} motion-safe:animate-[appear_180ms_ease-out]`}
    >
      <h3 className="w-full min-w-0 px-1 py-1 text-center font-display text-sm font-semibold sm:px-2 sm:text-lg [@media(max-height:600px)]:px-1 [@media(max-height:600px)]:py-0 [@media(max-height:600px)]:text-sm">
        {readOnly ? (
          <span className="inline-flex min-h-9 max-w-full items-center justify-center truncate px-1.5">
            {name}
          </span>
        ) : editingName ? (
          <input
            aria-label={`${labels.teamName} ${index + 1}`}
            autoFocus
            maxLength={64}
            className="min-h-9 w-full min-w-0 rounded-md border border-action bg-paper px-1.5 text-center text-sm text-ink ring-2 ring-action/20 outline-none sm:text-base"
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            onBlur={onDoneEditingName}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.currentTarget.blur();
              if (event.key === "Escape") event.currentTarget.blur();
            }}
          />
        ) : (
          <button
            type="button"
            aria-label={`${labels.editParticipant}: ${name}`}
            onClick={onEditName}
            className="inline-flex min-h-9 max-w-full items-center justify-center gap-1 truncate rounded-md px-1.5 text-center hover:bg-black/5 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-current dark:hover:bg-white/10"
          >
            <span className="truncate">{name}</span>
            <Pencil aria-hidden="true" className="size-3 shrink-0 opacity-65" />
          </button>
        )}
      </h3>
      <p className="my-0 w-full overflow-hidden py-1 text-center font-display text-[calc(min(40cqw,5rem))] leading-[1.15] font-bold tracking-[-0.06em] tabular-nums sm:text-[calc(min(48cqw,7rem))] [@media(max-height:600px)]:py-0 [@media(max-height:600px)]:text-[calc(min(30cqw,4rem))]">
        {score}
      </p>
      <div
        className={`mt-1 flex items-center gap-1 min-[480px]:gap-2 [@media(max-height:600px)]:mt-0 ${state.teamCount === 3 ? "flex-col sm:flex-row" : "flex-row"}`}
      >
        <button
          type="button"
          aria-label={`${labels.decrease} ${name}`}
          disabled={readOnly}
          onClick={() => onScoreChange(-1)}
          data-demo-target={minusTarget ?? undefined}
          className={`flex min-h-11 min-w-11 items-center justify-center rounded-md border border-[var(--button-border)] text-[var(--secondary-text)] transition-colors duration-150 hover:bg-[var(--button-hover)] disabled:cursor-not-allowed disabled:border-solid disabled:opacity-100 sm:w-14 dark:border-[var(--button-border-dark)] dark:text-[var(--secondary-text-dark)] dark:hover:bg-[var(--button-hover-dark)] ${minusTarget !== null && state.pressed === minusTarget ? "bg-[var(--button-hover)] dark:bg-[var(--button-hover-dark)]" : ""}`}
        >
          <Minus aria-hidden="true" className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label={`${labels.increase} ${name}`}
          disabled={readOnly}
          onClick={() => onScoreChange(1)}
          data-demo-target={plusTarget}
          className={`flex min-h-11 min-w-11 items-center justify-center rounded-md border border-[var(--button-border)] bg-[var(--button-bg)] text-[var(--button-text)] transition-colors duration-150 hover:bg-[var(--button-hover)] disabled:cursor-not-allowed disabled:border-solid disabled:opacity-100 sm:w-14 dark:border-[var(--button-border-dark)] dark:bg-[var(--button-bg-dark)] dark:text-[var(--button-text-dark)] dark:hover:bg-[var(--button-hover-dark)] ${plusTarget !== null && state.pressed === plusTarget ? "bg-[var(--button-hover)] dark:bg-[var(--button-hover-dark)]" : ""}`}
        >
          <Plus aria-hidden="true" className="h-5 w-5" />
        </button>
      </div>
    </article>
  );
}

const tabOrder: PreviewTab[] = ["teams", "colors", "appearance", "controls", "timer"];
const tabTargets: Partial<Record<PreviewTab, PreviewTarget>> = {
  teams: "teams-tab",
  colors: "colors-tab",
  timer: "timer-tab",
};

function colorTargetFor(teamIndex: number, paletteIndex: number): PreviewTarget | undefined {
  if (teamIndex === 0 && paletteIndex === 2) return "team-one-color";
  if (teamIndex === 0 && paletteIndex === 0) return "team-one-default-color";
  if (teamIndex === 2 && paletteIndex === 4) return "team-three-color";
  if (teamIndex === 2 && paletteIndex === 2) return "team-three-default-color";
  return undefined;
}

export function PreviewConfiguration({
  state,
  copy,
  labels,
}: {
  state: PreviewState;
  copy: LandingContent["preview"];
  labels: PreviewLabels;
}) {
  const tabLabels: Record<PreviewTab, string> = {
    teams: labels.teams,
    colors: labels.colors,
    appearance: labels.appearance,
    controls: labels.controls,
    timer: labels.timer,
  };
  const names = state.teamNames.slice(0, state.teamCount);

  return (
    <section className="mt-2 flex max-h-[min(40svh,22rem)] min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-forest/20 bg-surface p-2 sm:mt-3 sm:p-3 [@media(max-height:600px)]:mt-1 [@media(max-height:600px)]:p-1">
      <div className="grid shrink-0 grid-cols-3 gap-1 min-[900px]:grid-cols-5 min-[900px]:gap-0.5 lg:flex lg:overflow-hidden">
        {tabOrder.map((tab) => (
          <span
            key={tab}
            data-demo-target={tabTargets[tab]}
            className={`inline-flex min-h-9 min-w-0 items-center justify-center rounded-lg px-1 py-1 text-center text-xs font-semibold transition-colors duration-150 motion-reduce:transition-none min-[900px]:px-0 min-[900px]:text-[11px] lg:min-w-0 lg:flex-1 lg:px-2 lg:text-sm ${state.tab === tab ? "bg-action text-on-action" : "text-forest"} ${state.pressed === tabTargets[tab] ? "scale-[.97]" : ""}`}
          >
            {tabLabels[tab]}
          </span>
        ))}
      </div>

      <div
        key={state.tab}
        data-demo-scroll-panel
        data-demo-target={state.tab === "timer" ? "timer-scroll" : undefined}
        className="mt-3 min-h-0 flex-1 touch-pan-y [scrollbar-width:thin] [scrollbar-color:rgba(40,91,53,0.35)_transparent] overflow-x-hidden overflow-y-auto overscroll-contain rounded-b-md border-t border-forest/15 pt-3 pb-2 motion-safe:animate-[appear_160ms_ease-out] motion-reduce:animate-none [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-forest/35 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-forest/5"
      >
        {state.tab === "teams" && (
          <div className="space-y-2">
            <div className="grid min-w-0 gap-1.5 text-sm sm:grid-cols-[8rem_minmax(0,1fr)] sm:items-center">
              <span className="font-medium">{labels.boardName}</span>
              <span className="flex min-h-9 items-center rounded-lg border border-forest/25 bg-paper px-2.5 text-ink">
                {copy.boardName}
              </span>
            </div>
            {names.map((name, index) => (
              <div key={index} className="flex min-w-0 items-center gap-1">
                <span className="sr-only">{`${labels.teamName} ${index + 1}`}</span>
                <span
                  data-demo-target={index === 0 ? "team-one-name" : undefined}
                  className={`flex min-h-9 min-w-0 flex-1 items-center truncate rounded-lg border bg-paper px-2.5 text-sm text-ink transition-[border-color,box-shadow] duration-150 motion-reduce:transition-none ${index === 0 && state.editingTeamName ? "border-action ring-2 ring-action/20" : "border-forest/25"}`}
                >
                  {name}
                  {index === 0 && state.editingTeamName && (
                    <span className="ml-0.5 h-4 w-px bg-ink" />
                  )}
                </span>
                <span className="flex h-9 w-8 shrink-0 items-center justify-center rounded-md border border-forest/20 text-forest">
                  <ArrowUp aria-hidden="true" className="h-4 w-4" />
                </span>
                <span className="flex h-9 w-8 shrink-0 items-center justify-center rounded-md border border-forest/20 text-forest">
                  <ArrowDown aria-hidden="true" className="h-4 w-4" />
                </span>
                <span
                  data-demo-target={index === 2 ? "team-three-remove" : undefined}
                  className={`flex h-9 w-8 shrink-0 items-center justify-center rounded-md border border-forest/20 text-forest transition-transform duration-150 motion-reduce:transition-none ${index === 2 && state.pressed === "team-three-remove" ? "scale-95" : ""}`}
                >
                  <Trash2 aria-hidden="true" className="h-4 w-4" />
                </span>
              </div>
            ))}
            {state.teamCount === 2 && (
              <div className="pt-1">
                <VisualButton target="add-team" pressed={state.pressed === "add-team"}>
                  <Plus aria-hidden="true" className="h-4 w-4" />
                  <span>{labels.addTeam}</span>
                </VisualButton>
              </div>
            )}
          </div>
        )}

        {state.tab === "colors" && (
          <div className="space-y-2 text-sm">
            <h3 className="font-semibold">{labels.teamColors}</h3>
            {names.map((name, teamIndex) => (
              <div
                key={teamIndex}
                className="grid gap-1 sm:grid-cols-[8rem_minmax(0,1fr)] sm:items-center"
              >
                <span className="truncate">{name}</span>
                <div className="flex min-h-9 flex-wrap items-center gap-1.5">
                  {teamPalette.map((palette, paletteIndex) => {
                    const target = colorTargetFor(teamIndex, paletteIndex);
                    const selected = state.teamPalettes[teamIndex] === paletteIndex;
                    const darkBackground = themePaletteColor(palette.background, "dark");
                    const lightCheck = readableText(palette.background, palette.text);
                    const darkCheck = readableText(darkBackground, palette.darkText);

                    return (
                      <span
                        key={palette.background}
                        data-demo-target={target}
                        className={`flex h-7 w-7 items-center justify-center rounded-lg border border-black/15 bg-[var(--swatch-bg)] text-[var(--swatch-check)] transition-[transform,border-color] duration-150 motion-reduce:transition-none min-[480px]:h-8 min-[480px]:w-8 dark:border-white/20 dark:bg-[var(--swatch-bg-dark)] dark:text-[var(--swatch-check-dark)] ${state.pressed === target ? "scale-95" : selected ? "scale-105 border-action" : ""}`}
                        style={
                          {
                            "--swatch-bg": palette.background,
                            "--swatch-bg-dark": darkBackground,
                            "--swatch-check": lightCheck,
                            "--swatch-check-dark": darkCheck,
                          } as CSSProperties
                        }
                      >
                        {selected && <Check aria-hidden="true" className="h-4 w-4" />}
                      </span>
                    );
                  })}
                  <VisualButton className="h-8 min-h-8 gap-1 px-1.5">
                    <span className="h-4 w-4 rounded border border-black/20 bg-action dark:border-white/20" />
                    <Pencil aria-hidden="true" className="h-3.5 w-3.5" />
                  </VisualButton>
                </div>
              </div>
            ))}
            <div className="grid grid-cols-2 gap-1 border-t border-forest/15 pt-2 sm:gap-2">
              {[labels.color, labels.iconColor].map((label, index) => (
                <div key={label} className="flex min-w-0 items-center justify-between gap-2">
                  <span className="min-w-0 text-xs leading-4 break-words sm:text-sm">{label}</span>
                  <VisualButton className="h-8 min-h-8 px-1.5">
                    <span
                      className={`h-4 w-4 rounded border border-forest/20 ${index === 0 ? "bg-paper" : "bg-action"}`}
                    />
                    <Pencil aria-hidden="true" className="h-3.5 w-3.5" />
                  </VisualButton>
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-1">
              <VisualButton className="h-8 min-h-8 px-2">{labels.resetColors}</VisualButton>
            </div>
          </div>
        )}

        {state.tab === "appearance" && (
          <div className="space-y-2 text-sm">
            <fieldset>
              <legend className="mb-1.5 font-semibold">{labels.layoutLabel}</legend>
              <div className="grid grid-cols-3 gap-1.5">
                {[labels.automatic, labels.horizontal, labels.grid].map((layout, index) => (
                  <span
                    key={layout}
                    className={`flex min-h-9 items-center justify-center rounded-lg border px-1 text-center ${index === 0 ? "border-action bg-forest/5 text-forest" : "border-forest/20"}`}
                  >
                    {layout}
                  </span>
                ))}
              </div>
            </fieldset>
            <div className="grid min-w-0 gap-1.5 border-y border-forest/15 py-2 sm:grid-cols-3">
              {[labels.scoreSize, labels.teamSize, labels.density].map((label, index) => (
                <div
                  key={label}
                  className="flex min-h-9 min-w-0 items-center justify-between gap-2 rounded-lg border border-forest/20 px-2"
                >
                  <span>{label}</span>
                  <span className="text-forest">
                    {index === 2 ? labels.compact : labels.medium}
                  </span>
                </div>
              ))}
            </div>
            <PreviewCheck label={labels.fineTuneSizes} />
            <fieldset>
              <legend className="mb-1 font-semibold">{labels.icon}</legend>
              <div className="grid grid-cols-6 gap-1">
                {iconIds.map((id, index) => (
                  <span
                    key={id}
                    className={`flex h-7 w-7 items-center justify-center rounded-md ${index === 0 ? "bg-action text-on-action" : "text-forest"}`}
                  >
                    <BoardIcon id={id} />
                  </span>
                ))}
              </div>
            </fieldset>
            <div className="flex justify-end">
              <VisualButton className="h-8 min-h-8 px-2">{labels.resetAppearance}</VisualButton>
            </div>
          </div>
        )}

        {state.tab === "controls" && (
          <div className="divide-y divide-forest/15 text-sm">
            <div className="flex min-h-10 items-center justify-between gap-3 pb-1.5">
              <span>{labels.step}</span>
              <span className="flex h-8 w-16 items-center rounded-lg border border-forest/20 bg-paper px-2.5 text-ink">
                1
              </span>
            </div>
            <div className="py-1.5">
              <PreviewCheck label={labels.fullscreenControls} checked />
            </div>
            <div className="pt-1.5">
              <PreviewCheck label={labels.autoHideControls} checked />
            </div>
          </div>
        )}

        {state.tab === "timer" && (
          <div className="space-y-1.5 text-sm">
            <PreviewCheck
              label={labels.enableTimer}
              checked={state.timerEnabled}
              target="timer-enable"
              pressed={state.pressed === "timer-enable"}
            />
            {state.timerEnabled && (
              <>
                <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-1.5 border-t border-forest/15 pt-1.5">
                  <div className="grid min-w-0 gap-1">
                    <span className="font-medium">{labels.timerMode}</span>
                    <span className="flex min-h-9 min-w-0 items-center justify-between gap-1 rounded-lg border border-forest/20 bg-paper px-2 text-ink">
                      <span className="min-w-0 leading-tight break-words">{labels.countdown}</span>
                      <ChevronDown aria-hidden="true" className="h-4 w-4 text-forest" />
                    </span>
                  </div>
                  <fieldset className="grid min-w-0 gap-1">
                    <legend className="font-medium">{labels.duration}</legend>
                    <div className="flex items-end gap-1.5">
                      {[labels.hours, labels.minutes, labels.seconds].map((part, index) => (
                        <label key={part} className="grid min-w-0 flex-1 gap-1">
                          <span className="text-xs leading-3 break-words">{part}</span>
                          <span className="flex min-h-9 items-center justify-center rounded-lg border border-forest/20 bg-paper font-display text-base font-bold text-ink tabular-nums">
                            {index === 1 ? "01" : "00"}
                          </span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[1, 3, 5, 10, 15].map((minutes) => (
                    <VisualButton key={minutes} className="h-8 min-h-8 px-2 text-xs">
                      {minutes} {minutes === 1 ? labels.minute : labels.minutes.toLowerCase()}
                    </VisualButton>
                  ))}
                </div>
                <div className="grid gap-0.5 border-t border-forest/15 pt-1">
                  <PreviewCheck label={labels.showTimerHours} checked />
                  <PreviewCheck
                    label={labels.trackPausedTime}
                    checked={state.trackPausedTime}
                    target="timer-paused-time"
                    pressed={state.pressed === "timer-paused-time"}
                  />
                  <PreviewCheck label={labels.pausedScoreNotice} checked />
                </div>
                <details className="border-t border-forest/15 pt-1">
                  <summary className="flex min-h-9 cursor-pointer list-none items-center justify-between rounded-lg px-2 text-sm font-semibold hover:bg-forest/5 [&::-webkit-details-marker]:hidden">
                    {labels.sportsOptions}
                    <ChevronDown aria-hidden="true" className="h-4 w-4" />
                  </summary>
                </details>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
