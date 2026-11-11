import type { Board } from "./boards.ts";
import type { ToolTheme } from "./tool-themes.ts";

export function applyToolTheme(board: Board, theme: ToolTheme): Board {
  return {
    ...board,
    accent: theme.accent,
    background: theme.background,
    color: undefined,
    textColor: theme.textColor,
    appearance: {
      ...board.appearance,
      gradient: theme.gradient,
      backgroundEnd: theme.backgroundEnd,
      borderColor: theme.borderColor,
      borderWidth: theme.borderWidth,
      cornerRadius: theme.radius,
      density: theme.density,
    },
  };
}
