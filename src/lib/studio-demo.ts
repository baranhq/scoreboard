import type { Lang } from "./i18n";
import { studioCopy } from "./studio-copy.ts";
import { newLeaderboard, updateLeaderboardCell, type StudioDocument } from "./studio.ts";
import { newBracket, bracketRounds, resizeBracket, setMatchResult } from "./brackets.ts";
export function studioDemo(kind: StudioDocument["kind"], lang: Lang): StudioDocument {
  const t = studioCopy[lang];
  const title = {
    en: ["Round 1 standings", "Tournament bracket"],
    bg: ["Класиране, кръг 1", "Турнирна схема"],
    tr: ["Tur 1 sıralaması", "Turnuva tablosu"],
  }[lang];
  if (kind === "leaderboard") {
    const board = newLeaderboard("demo-leaderboard");
    board.title = title[0];
    board.subtitle = `${t.round} 1`;
    board.columns = [t.team, t.points];
    board.rows = [
      ["Baran's Team", "42"],
      ["Team 2", "38"],
      ["Team 3", "35"],
      ["Team 4", "29"],
    ].map((cells, index) => ({
      id: `row-${index}`,
      cells,
      highlighted: index === 0,
    }));
    return board;
  }
  let board = resizeBracket(newBracket("demo-bracket"), 4);
  board.title = title[1];
  board.subtitle = t.participants;
  board.layout = "single";
  for (const match of bracketRounds(board)[0].slice(0, 1))
    board = setMatchResult(board, match.id, match.players[0], ["2", "1"]);
  return board;
}

export function advanceStudioDemo(
  current: StudioDocument,
  initial: StudioDocument,
  step: number,
): StudioDocument {
  if (current.kind !== initial.kind) return initial;

  if (current.kind === "leaderboard" && initial.kind === "leaderboard") {
    if (step % 3 === 0) return updateLeaderboardCell(current, "row-1", 1, "43", 1);
    if (step % 3 === 1) return updateLeaderboardCell(current, "row-2", 1, "46", 1);
    return initial;
  }

  if (current.kind === "bracket" && initial.kind === "bracket") {
    const match = bracketRounds(current)
      .flat()
      .find((item) => item.players.every(Boolean) && !item.winner);
    return match ? setMatchResult(current, match.id, match.players[0], ["2", "1"]) : initial;
  }

  return initial;
}
