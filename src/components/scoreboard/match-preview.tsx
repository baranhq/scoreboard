import type { CSSProperties } from "react";
import type { Board } from "@/lib/boards";
import { readableText, teamPalette, themePaletteColor, validColor } from "@/lib/colors";
export function MatchPreview({ board }: { board: Board }) {
  return (
    <span className="flex flex-wrap gap-x-3 gap-y-2">
      {board.teams.slice(0, 6).map((team, index) => {
        const color = validColor(team.color)
          ? team.color
          : validColor(board.color)
            ? board.color
            : board.themeId && validColor(board.background)
              ? board.background
              : teamPalette[index % teamPalette.length].background;
        const palette = teamPalette.find(
          (item) => item.background.toLowerCase() === color.toLowerCase(),
        );
        const darkColor = themePaletteColor(color, "dark");
        const lightText = readableText(color, team.textColor || board.textColor || palette?.text);
        const darkText = readableText(
          darkColor,
          team.textColor || board.textColor || palette?.darkText,
        );
        return (
          <span
            key={team.id}
            style={
              {
                "--preview-bg": color,
                "--preview-fg": lightText,
                "--preview-bg-dark": darkColor,
                "--preview-fg-dark": darkText,
              } as CSSProperties
            }
            className="inline-flex min-w-0 items-center gap-1.5 rounded-lg border border-black/10 bg-[var(--preview-bg)] px-2 py-1 text-sm font-medium text-[var(--preview-fg)] sm:gap-2 sm:px-2.5 sm:py-1.5 dark:border-white/10 dark:bg-[var(--preview-bg-dark)] dark:text-[var(--preview-fg-dark)]"
          >
            <span className="max-w-20 truncate sm:max-w-28">{team.name}</span>
            <strong className="font-display text-base font-bold tabular-nums sm:text-lg">
              {team.score}
            </strong>
          </span>
        );
      })}
      {board.teams.length > 6 && (
        <span className="self-center text-base">+{board.teams.length - 6}</span>
      )}
    </span>
  );
}
