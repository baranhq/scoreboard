import { validColor } from "./colors.ts";
import { bracketRounds, type Bracket } from "./brackets.ts";

export type GraphicStyle = {
  preset: "classic" | "editorial" | "night";
  accent: string;
  background: string;
  font: "Inter" | "Inter Tight" | "Georgia";
};
export type GraphicBase = {
  version: 1;
  id: string;
  title: string;
  subtitle: string;
  updatedAt: number;
  style: GraphicStyle;
};
export type LeaderboardRow = { id: string; cells: string[]; highlighted: boolean };
export type Leaderboard = GraphicBase & {
  kind: "leaderboard";
  columns: string[];
  rows: LeaderboardRow[];
};
export type StudioDocument = Leaderboard | Bracket;
export const graphicPresets: Record<GraphicStyle["preset"], GraphicStyle> = {
  classic: { preset: "classic", accent: "#285b35", background: "#f2f4eb", font: "Inter Tight" },
  editorial: { preset: "editorial", accent: "#9c3d19", background: "#fff4df", font: "Georgia" },
  night: { preset: "night", accent: "#b5d78b", background: "#18251f", font: "Inter" },
};
export function newLeaderboard(id = crypto.randomUUID()): Leaderboard {
  return {
    version: 1,
    id,
    kind: "leaderboard",
    title: "Weekend league",
    subtitle: "The standings · Round 4",
    updatedAt: 0,
    style: { ...graphicPresets.classic },
    columns: ["Team", "Points"],
    rows: [
      ["Team 1", "42"],
      ["Team 2", "38"],
      ["Team 3", "35"],
      ["Team 4", "29"],
    ].map((cells, i) => ({ id: `row-${i}`, cells, highlighted: i === 0 })),
  };
}
export function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (from < 0 || from >= items.length || to < 0 || to >= items.length) return items;
  const next = [...items];
  next.splice(to, 0, next.splice(from, 1)[0]);
  return next;
}
export function removeColumn(board: Leaderboard, index: number): Leaderboard {
  if (board.columns.length <= 1) return board;
  return {
    ...board,
    columns: board.columns.filter((_, i) => i !== index),
    rows: board.rows.map((row) => ({ ...row, cells: row.cells.filter((_, i) => i !== index) })),
  };
}
export function sortRows(
  rows: LeaderboardRow[],
  column: number,
  order: "asc" | "desc",
): LeaderboardRow[] {
  return [...rows].sort((a, b) => {
    const left = a.cells[column].trim();
    const right = b.cells[column].trim();
    const numeric =
      left !== "" &&
      right !== "" &&
      Number.isFinite(Number(left)) &&
      Number.isFinite(Number(right));
    const result = numeric
      ? Number(left) - Number(right)
      : left.localeCompare(right, undefined, { numeric: true });
    return order === "asc" ? result : -result;
  });
}
function record(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
function text(value: unknown, max = 200): value is string {
  return typeof value === "string" && value.length <= max;
}
function uniqueIds(items: { id: string }[]) {
  return new Set(items.map((item) => item.id)).size === items.length;
}
export function parseDocument(value: unknown): StudioDocument {
  if (
    !record(value) ||
    value.version !== 1 ||
    !text(value.id, 100) ||
    !value.id ||
    !text(value.title) ||
    !text(value.subtitle) ||
    !Number.isSafeInteger(value.updatedAt) ||
    Number(value.updatedAt) < 0 ||
    !record(value.style)
  )
    throw new Error("Invalid document");
  const style = value.style;
  if (
    !["classic", "editorial", "night"].includes(String(style.preset)) ||
    !["Inter", "Inter Tight", "Georgia"].includes(String(style.font)) ||
    !validColor(style.accent) ||
    !validColor(style.background)
  )
    throw new Error("Invalid style");
  if (value.kind === "leaderboard") {
    if (
      !Array.isArray(value.columns) ||
      value.columns.length < 1 ||
      value.columns.length > 10 ||
      !value.columns.every((c) => text(c, 80)) ||
      !Array.isArray(value.rows) ||
      value.rows.length < 1 ||
      value.rows.length > 100
    )
      throw new Error("Invalid table size");
    for (const row of value.rows) {
      if (
        !record(row) ||
        !text(row.id, 100) ||
        !row.id ||
        typeof row.highlighted !== "boolean" ||
        !Array.isArray(row.cells) ||
        row.cells.length !== value.columns.length ||
        !row.cells.every((cell) => text(cell))
      )
        throw new Error("Invalid row");
    }
    if (!uniqueIds(value.rows)) throw new Error("Duplicate rows");
  } else if (value.kind === "bracket") {
    if (
      !["single", "split"].includes(String(value.layout)) ||
      !Array.isArray(value.participants) ||
      value.participants.length < 2 ||
      value.participants.length > 64 ||
      !record(value.results)
    )
      throw new Error("Invalid bracket");
    for (const p of value.participants)
      if (!record(p) || !text(p.id, 100) || !p.id || !text(p.name))
        throw new Error("Invalid participant");
    if (!uniqueIds(value.participants) || Object.keys(value.results).length > 63)
      throw new Error("Invalid participants or results");
    for (const result of Object.values(value.results))
      if (
        !record(result) ||
        !(result.winner === null || text(result.winner, 100)) ||
        !Array.isArray(result.scores) ||
        result.scores.length !== 2 ||
        !result.scores.every((s) => text(s, 12))
      )
        throw new Error("Invalid result");
    const matches = bracketRounds(value as Bracket).flat();
    for (const [key, result] of Object.entries(value.results)) {
      const match = matches.find((m) => m.id === key);
      if (
        !record(result) ||
        !match ||
        !match.players.every(Boolean) ||
        (result.winner !== null &&
          (typeof result.winner !== "string" || !match.players.includes(result.winner)))
      )
        throw new Error("Invalid progression");
    }
  } else throw new Error("Unknown document kind");
  return structuredClone(value) as StudioDocument;
}
