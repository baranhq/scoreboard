"use client";
import { Plus, Minus } from "lucide-react";
import { useEffect, useRef, type CSSProperties } from "react";
import { type Team } from "@/lib/boards";
import { teamPalette, readableText, buttonColors, themePaletteColor } from "@/lib/colors";
import type { Appearance } from "@/lib/appearance";
import type { Messages } from "@/lib/i18n";
type Props = {
  className?: string;
  paused?: boolean;
  team: Team;
  color?: string;
  textColor?: string;
  appearance: Appearance;
  controlsVisible: boolean;
  interactive?: boolean;
  showControls?: boolean;
  fitCompactGrid?: boolean;
  index: number;
  count: number;
  full: boolean;
  t: Messages;
  change: (amount: number) => void;
  manual: () => void;
};
export function TeamPanel({
  className = "",
  paused = false,
  team,
  color,
  textColor,
  appearance,
  controlsVisible,
  interactive = true,
  showControls = interactive,
  fitCompactGrid = false,
  index,
  count,
  full,
  t,
  change,
  manual,
}: Props) {
  const scoreValue = useRef<HTMLSpanElement>(null);
  const previousScore = useRef(team.score);
  const palette = teamPalette[index % teamPalette.length];
  const bg = team.color || color || palette.background;
  const darkBg = themePaletteColor(bg, "dark");
  const matchingPalette = teamPalette.find(
    (item) => item.background.toLowerCase() === bg.toLowerCase(),
  );
  const lightButtons = buttonColors(bg),
    darkButtons = buttonColors(darkBg);
  const digits = String(team.score).length;
  const scorePreset = appearance.scoreSize;
  const teamPreset = appearance.teamSize;
  const scoreScale = appearance.textScaleEnabled ? appearance.scoreScale / 100 : 1;
  const teamScale = appearance.textScaleEnabled ? appearance.teamScale / 100 : 1;
  const regularSize = fitCompactGrid
    ? digits > 6
      ? "text-[calc(min(10cqw,2.75rem)*var(--score-text-scale))]"
      : digits > 4
        ? "text-[calc(min(14cqw,3.5rem)*var(--score-text-scale))]"
        : digits > 2
          ? "text-[calc(min(18cqw,4rem)*var(--score-text-scale))]"
          : "text-[calc(min(22cqw,4.5rem)*var(--score-text-scale))]"
    : digits > 6
      ? "text-[calc(13cqw*var(--score-text-scale))]"
      : digits > 4
        ? "text-[calc(20cqw*var(--score-text-scale))]"
        : digits > 2
          ? "text-[calc(30cqw*var(--score-text-scale))]"
          : scorePreset === "small"
            ? "text-[calc(min(38cqw,8rem)*var(--score-text-scale))]"
            : scorePreset === "large"
              ? "text-[calc(min(60cqw,15rem)*var(--score-text-scale))]"
              : scorePreset === "xlarge"
                ? "text-[calc(min(66cqw,17rem)*var(--score-text-scale))]"
                : count > 2
                  ? "text-[calc(min(38cqw,14vw,7rem)*var(--score-text-scale))] sm:text-[calc(min(48cqw,22vw,9rem)*var(--score-text-scale))]"
                  : "text-[calc(min(48cqw,11rem)*var(--score-text-scale))]";
  const fullSize =
    digits > 6
      ? "text-[calc(min(13cqw,16dvh)*var(--score-text-scale))]"
      : digits > 4
        ? "text-[calc(min(20cqw,20dvh)*var(--score-text-scale))]"
        : count <= 2
          ? (
              {
                small: "text-[calc(min(40cqw,26dvh)*var(--score-text-scale))]",
                medium: "text-[calc(min(48cqw,32dvh)*var(--score-text-scale))]",
                large: "text-[calc(min(54cqw,36dvh)*var(--score-text-scale))]",
                xlarge: "text-[calc(min(60cqw,40dvh)*var(--score-text-scale))]",
              } as const
            )[scorePreset]
          : count <= 4
            ? (
                {
                  small: "text-[calc(min(34cqw,19dvh)*var(--score-text-scale))]",
                  medium: "text-[calc(min(42cqw,24dvh)*var(--score-text-scale))]",
                  large: "text-[calc(min(48cqw,27dvh)*var(--score-text-scale))]",
                  xlarge: "text-[calc(min(52cqw,29dvh)*var(--score-text-scale))]",
                } as const
              )[scorePreset]
            : count <= 6
              ? (
                  {
                    small: "text-[calc(min(30cqw,13dvh)*var(--score-text-scale))]",
                    medium: "text-[calc(min(36cqw,16dvh)*var(--score-text-scale))]",
                    large: "text-[calc(min(40cqw,18dvh)*var(--score-text-scale))]",
                    xlarge: "text-[calc(min(44cqw,19dvh)*var(--score-text-scale))]",
                  } as const
                )[scorePreset]
              : "text-[calc(min(28cqw,5dvh)*var(--score-text-scale))]";
  const regularNameSize = (
    {
      small:
        "text-[calc(1rem*var(--team-text-scale))] sm:text-[calc(1.25rem*var(--team-text-scale))]",
      medium:
        "text-[calc(1.25rem*var(--team-text-scale))] sm:text-[calc(1.875rem*var(--team-text-scale))]",
      large:
        "text-[calc(1.5rem*var(--team-text-scale))] sm:text-[calc(2.25rem*var(--team-text-scale))]",
      xlarge:
        "text-[calc(min(20cqw,3rem)*var(--team-text-scale))] sm:text-[calc(min(30cqw,5rem)*var(--team-text-scale))]",
    } as const
  )[teamPreset];
  const fullNameSize =
    count > 6
      ? "text-[calc(clamp(0.75rem,2vh,1.25rem)*var(--team-text-scale))]"
      : (
          {
            small: "text-[calc(clamp(1.5rem,3.5vh,3rem)*var(--team-text-scale))]",
            medium: "text-[calc(clamp(1.75rem,4vh,3.5rem)*var(--team-text-scale))]",
            large: "text-[calc(clamp(2.25rem,5vh,4rem)*var(--team-text-scale))]",
            xlarge: "text-[calc(clamp(3rem,8vh,6.5rem)*var(--team-text-scale))]",
          } as const
        )[teamPreset];
  const teamNameSize = full ? fullNameSize : regularNameSize;
  const scoreButtonSize = full
    ? count > 6
      ? "h-8 w-10 sm:h-8 sm:w-10"
      : "h-12 w-14 sm:h-12 sm:w-20"
    : "h-11 w-12 sm:h-12 sm:w-20";
  const ScoreTag = full || !interactive ? "div" : "button";
  useEffect(() => {
    const element = scoreValue.current;
    if (previousScore.current === team.score) return;
    previousScore.current = team.score;
    if (
      !element ||
      typeof element.animate !== "function" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;

    const animation = element.animate(
      [
        { opacity: 0.75, transform: "translateY(2px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { duration: 130, easing: "ease-out" },
    );
    return () => animation.cancel();
  }, [team.score]);
  const size = full ? fullSize : regularSize;
  return (
    <article
      data-scoreboard-team={team.id}
      style={
        {
          backgroundImage: appearance.gradient
            ? `linear-gradient(135deg, ${bg}, ${appearance.backgroundEnd || bg})`
            : undefined,
          borderRadius: appearance.cornerRadius,
          borderWidth: appearance.borderWidth,
          borderColor: appearance.borderColor,
          "--button-bg": lightButtons.primary,
          "--button-text": lightButtons.text,
          "--button-hover": lightButtons.hover,
          "--button-border": lightButtons.border,
          "--secondary-text": lightButtons.secondaryText,
          "--button-bg-dark": darkButtons.primary,
          "--button-text-dark": darkButtons.text,
          "--button-hover-dark": darkButtons.hover,
          "--button-border-dark": darkButtons.border,
          "--secondary-text-dark": darkButtons.secondaryText,
          "--team-bg": bg,
          "--team-fg": readableText(bg, team.textColor || textColor || matchingPalette?.text),
          "--team-bg-dark": darkBg,
          "--team-fg-dark": readableText(
            darkBg,
            team.textColor || textColor || matchingPalette?.darkText,
          ),
          "--score-text-scale": scoreScale,
          "--team-text-scale": teamScale,
        } as CSSProperties
      }
      className={`[container-type:inline-size] relative flex min-h-0 min-w-0 flex-col items-center justify-center rounded-xl bg-[var(--team-bg)] px-2 text-[var(--team-fg)] transition-colors duration-150 focus-visible:outline-[var(--secondary-text)] disabled:cursor-not-allowed disabled:border-dashed motion-safe:animate-[appear_200ms_ease-out] motion-reduce:transition-none dark:bg-[var(--team-bg-dark)] dark:text-[var(--team-fg-dark)] dark:focus-visible:outline-[var(--secondary-text-dark)] ${className} ${full ? (count > 6 ? "gap-1 py-1" : "gap-2 py-3") : appearance.density === "spacious" ? "py-6 sm:py-10" : "py-3 sm:py-4"}`}
    >
      <h3
        className={`max-w-full rounded px-2 py-1 text-center font-display font-semibold break-words ${teamNameSize}`}
      >
        {team.name}
      </h3>
      <ScoreTag
        data-export-static
        onClick={full || !interactive ? undefined : manual}
        aria-label={`${team.name}: ${t.score} ${team.score}`}
        title={full ? undefined : t.score}
        className={`my-0 w-full overflow-hidden rounded-lg bg-transparent py-1 text-center font-display leading-[1.15] font-bold tracking-[-0.06em] tabular-nums ${full ? "flex min-h-0 flex-1 items-center justify-center" : ""} ${size}`}
      >
        <span ref={scoreValue}>{team.score}</span>
      </ScoreTag>
      <span className="sr-only" aria-live="polite">
        {team.name}: {team.score}
      </span>
      {showControls && (!full || appearance.fullscreenControls) && (
        <div
          data-fullscreen-control
          data-export-hide
          className={`flex items-center ${full && count > 6 ? "gap-1" : "gap-3"} transition-opacity duration-150 motion-reduce:transition-none ${full && !controlsVisible ? "pointer-events-none opacity-0" : "opacity-100"}`}
        >
          <button
            aria-disabled={paused || !interactive}
            disabled={
              !interactive || (!paused && Math.abs(team.score - appearance.increment) > 999999999)
            }
            onClick={() => interactive && change(-1)}
            data-fullscreen-control
            aria-label={`${t.decrement}: ${team.name}`}
            className={`flex ${scoreButtonSize} ${paused ? "cursor-not-allowed" : ""} items-center justify-center rounded-md border border-[var(--button-border)] text-3xl text-[var(--secondary-text)] transition-[color,background-color,border-color] duration-150 hover:bg-[var(--button-hover)] focus-visible:outline-[var(--secondary-text)] active:bg-[var(--button-hover)] disabled:cursor-not-allowed disabled:border-dashed motion-reduce:transition-none dark:border-[var(--button-border-dark)] dark:text-[var(--secondary-text-dark)] dark:hover:bg-[var(--button-hover-dark)] dark:focus-visible:outline-[var(--secondary-text-dark)] dark:active:bg-[var(--button-hover-dark)]`}
          >
            <Minus
              aria-hidden="true"
              className={full && count > 6 ? "h-4 w-4" : "h-6 w-6 sm:h-7 sm:w-7"}
              strokeWidth={2.3}
            />
          </button>
          <button
            aria-disabled={paused || !interactive}
            disabled={
              !interactive || (!paused && Math.abs(team.score + appearance.increment) > 999999999)
            }
            onClick={() => interactive && change(1)}
            data-fullscreen-control
            aria-label={`${t.increment}: ${team.name}`}
            className={`flex ${scoreButtonSize} ${paused ? "cursor-not-allowed" : ""} items-center justify-center rounded-md border border-[var(--button-border)] bg-[var(--button-bg)] text-3xl text-[var(--button-text)] transition-[color,background-color,border-color] duration-150 hover:bg-[var(--button-hover)] focus-visible:outline-[var(--secondary-text)] active:bg-[var(--button-hover)] disabled:cursor-not-allowed disabled:border-dashed motion-reduce:transition-none dark:border-[var(--button-border-dark)] dark:bg-[var(--button-bg-dark)] dark:text-[var(--button-text-dark)] dark:hover:bg-[var(--button-hover-dark)] dark:focus-visible:outline-[var(--secondary-text-dark)] dark:active:bg-[var(--button-hover-dark)]`}
          >
            <Plus
              aria-hidden="true"
              className={full && count > 6 ? "h-4 w-4" : "h-6 w-6 sm:h-7 sm:w-7"}
              strokeWidth={2.3}
            />
          </button>
        </div>
      )}
    </article>
  );
}
