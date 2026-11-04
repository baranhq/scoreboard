import type { CSSProperties } from "react";
import type { Board } from "@/lib/boards";
import { readableText, teamPalette, validColor } from "@/lib/colors";
export function MatchPreview({ board }: { board: Board }) {
  if (board.teams.length === 2) {
    const [a, b] = board.teams;
    return (
      <span className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
        <span className="min-w-0 text-right text-base font-medium break-words">{a.name}</span>
        <strong className="font-display text-3xl font-bold tabular-nums">
          {a.score} <span className="font-normal text-forest/70">:</span> {b.score}
        </strong>
        <span className="min-w-0 text-base font-medium break-words">{b.name}</span>
      </span>
    );
  }
  return (
    <span className="flex flex-wrap gap-2">
      {board.teams.slice(0, 6).map((team, index) => {
        const color = validColor(team.color)
          ? team.color
          : validColor(board.color)
            ? board.color
            : teamPalette[index % teamPalette.length].background;
        return (
          <span
            key={team.id}
            style={{ "--preview-bg": color, "--preview-fg": readableText(color) } as CSSProperties}
            className="inline-flex items-center gap-2 rounded-md bg-[var(--preview-bg)] px-2 py-1 text-base text-[var(--preview-fg)]"
          >
            <span className="break-words">{team.name}</span>
            <strong className="font-display text-xl font-bold tabular-nums">{team.score}</strong>
          </span>
        );
      })}
      {board.teams.length > 6 && (
        <span className="self-center text-base">+{board.teams.length - 6}</span>
      )}
    </span>
  );
}
