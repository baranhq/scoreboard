import { bracketRounds, setMatchResult } from "./brackets.ts";
import { updateLeaderboardCell, type StudioDocument } from "./studio.ts";

export type PreviewField =
  | { kind: "title" }
  | { kind: "subtitle" }
  | { kind: "leaderboard-column"; column: number }
  | { kind: "leaderboard-position"; rowId: string }
  | { kind: "leaderboard-cell"; rowId: string; column: number }
  | { kind: "bracket-participant"; participantId: string; matchId?: string }
  | { kind: "bracket-score"; matchId: string; side: 0 | 1 };

export function previewFieldValue(document: StudioDocument, field: PreviewField): string {
  if (field.kind === "title") return document.title;
  if (field.kind === "subtitle") return document.subtitle;

  if (field.kind === "leaderboard-column" && document.kind === "leaderboard")
    return document.columns[field.column] || "";
  if (field.kind === "leaderboard-position" && document.kind === "leaderboard")
    return document.rows.find((row) => row.id === field.rowId)?.position || "";
  if (field.kind === "leaderboard-cell" && document.kind === "leaderboard")
    return document.rows.find((row) => row.id === field.rowId)?.cells[field.column] || "";
  if (field.kind === "bracket-participant" && document.kind === "bracket")
    return document.participants.find((player) => player.id === field.participantId)?.name || "";
  if (field.kind === "bracket-score" && document.kind === "bracket")
    return (
      bracketRounds(document)
        .flat()
        .find((match) => match.id === field.matchId)?.scores[field.side] || ""
    );

  return "";
}

export function updatePreviewField(
  document: StudioDocument,
  field: PreviewField,
  value: string,
  rankScores = true,
): StudioDocument {
  if (
    value.length >
    (field.kind === "leaderboard-position"
      ? 6
      : field.kind === "bracket-score"
        ? 12
        : field.kind === "leaderboard-column"
          ? 80
          : 200)
  )
    return document;

  if (field.kind === "title" || field.kind === "subtitle")
    return { ...document, [field.kind]: value };

  if (field.kind === "leaderboard-column" && document.kind === "leaderboard")
    return document.columns[field.column] === undefined
      ? document
      : {
          ...document,
          columns: document.columns.map((column, index) =>
            index === field.column ? value : column,
          ),
        };

  if (field.kind === "leaderboard-position" && document.kind === "leaderboard")
    return document.rows.some((row) => row.id === field.rowId)
      ? {
          ...document,
          rows: document.rows.map((row) =>
            row.id === field.rowId ? { ...row, position: value } : row,
          ),
        }
      : document;

  if (field.kind === "leaderboard-cell" && document.kind === "leaderboard")
    return updateLeaderboardCell(
      document,
      field.rowId,
      field.column,
      value,
      rankScores && field.column === 1 ? 1 : undefined,
      rankScores,
    );

  if (field.kind === "bracket-participant" && document.kind === "bracket")
    return document.participants.some((player) => player.id === field.participantId)
      ? {
          ...document,
          participants: document.participants.map((player) =>
            player.id === field.participantId ? { ...player, name: value } : player,
          ),
        }
      : document;

  if (field.kind === "bracket-score" && document.kind === "bracket") {
    const match = bracketRounds(document)
      .flat()
      .find((item) => item.id === field.matchId && item.players.every(Boolean));
    if (!match) return document;

    const scores: [string, string] = [...match.scores];
    scores[field.side] = value;
    return setMatchResult(document, field.matchId, match.winner, scores);
  }

  return document;
}
