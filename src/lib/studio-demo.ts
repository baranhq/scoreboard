import type { Lang } from "./i18n";
import { studioCopy } from "./studio-copy";
import { newLeaderboard, type StudioDocument } from "./studio";
import { newBracket, bracketRounds, setMatchResult } from "./brackets";
export function studioDemo(kind: StudioDocument["kind"], lang: Lang): StudioDocument {
  const t = studioCopy[lang];
  const title = {
    en: ["Weekend league", "The weekend cup"],
    bg: ["Уикенд лига", "Уикенд купа"],
    tr: ["Hafta sonu ligi", "Hafta sonu kupası"],
  }[lang];
  if (kind === "leaderboard") {
    const board = newLeaderboard("demo-leaderboard");
    board.title = title[0];
    board.subtitle = `${t.round} 4`;
    board.columns = [t.team, t.points];
    if (lang !== "en")
      board.rows.forEach((row, i) => {
        row.cells[0] = `${t.team} ${i + 1}`;
      });
    return board;
  }
  let board = newBracket("demo-bracket");
  board.title = title[1];
  board.subtitle = t.participants;
  if (lang !== "en")
    board.participants.forEach((p, i) => {
      p.name = `${t.team} ${i + 1}`;
    });
  for (const match of bracketRounds(board)[0])
    board = setMatchResult(board, match.id, match.players[0], ["2", "1"]);
  return board;
}
