import { graphicPresets, type GraphicBase } from "./graphic-style.ts";
export { graphicPresets } from "./graphic-style.ts";
import { validColor } from "./colors.ts";
import { bracketRounds, type Bracket } from "./brackets.ts";

export type LeaderboardRow = {
  color?: string;
  id: string;
  cells: string[];
  highlighted: boolean;
  position?: string;
};
export type Leaderboard = GraphicBase & {
  kind: "leaderboard";
  gridColumns?: 1 | 2 | 3;
  columnWidths?: number[];
  columns: string[];
  rows: LeaderboardRow[];
};
export type StudioDocument = Leaderboard | Bracket;
export function newLeaderboard(id = crypto.randomUUID()): Leaderboard {
  return {
    version: 1,
    id,
    kind: "leaderboard",
    title: "Round 1 standings",
    subtitle: "Round 1",
    updatedAt: 0,
    style: { ...graphicPresets.classic },
    gridColumns: 1,
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
    columnWidths: board.columnWidths?.filter((_, i) => i !== index),
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
export function updateLeaderboardCell(
  board: Leaderboard,
  rowId: string,
  column: number,
  value: string,
  rankColumn?: number,
): Leaderboard {
  if (!Number.isInteger(column) || column < 0 || column >= board.columns.length) return board;

  const rows = board.rows.map((row) =>
    row.id === rowId
      ? { ...row, cells: row.cells.map((cell, index) => (index === column ? value : cell)) }
      : row,
  );
  if (!board.rows.some((row) => row.id === rowId)) return board;

  return { ...board, rows: rankColumn === column ? sortRows(rows, column, "desc") : rows };
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
  for (const [key, max] of [
    ["radius", 40],
    ["borderWidth", 8],
  ] as const) {
    if (
      style[key] !== undefined &&
      (typeof style[key] !== "number" ||
        !Number.isFinite(style[key]) ||
        style[key] < 0 ||
        style[key] > max)
    )
      throw new Error("Invalid style dimension");
  }
  if (style.gradient !== undefined && typeof style.gradient !== "boolean")
    throw new Error("Invalid gradient");
  for (const key of ["borderColor", "textColor", "backgroundEnd"])
    if (style[key] !== undefined && !validColor(style[key]))
      throw new Error("Invalid style colour");
  if (style.density !== undefined && !["compact", "spacious"].includes(String(style.density)))
    throw new Error("Invalid density");
  if (
    value.canvas !== undefined &&
    (!record(value.canvas) ||
      !Number.isInteger(value.canvas.width) ||
      !Number.isInteger(value.canvas.height) ||
      Number(value.canvas.width) < 320 ||
      Number(value.canvas.width) > 4096 ||
      Number(value.canvas.height) < 320 ||
      Number(value.canvas.height) > 4096)
  )
    throw new Error("Invalid canvas");
  if (value.kind === "leaderboard") {
    if (
      (value.gridColumns !== undefined &&
        value.gridColumns !== 1 &&
        value.gridColumns !== 2 &&
        value.gridColumns !== 3) ||
      !Array.isArray(value.columns) ||
      value.columns.length < 1 ||
      value.columns.length > 10 ||
      !value.columns.every((c) => text(c, 80)) ||
      !Array.isArray(value.rows) ||
      value.rows.length > 100
    )
      throw new Error("Invalid table size");
    if (
      value.columnWidths !== undefined &&
      (!Array.isArray(value.columnWidths) ||
        value.columnWidths.length !== value.columns.length ||
        !value.columnWidths.every(
          (width) =>
            typeof width === "number" && Number.isFinite(width) && width >= 80 && width <= 800,
        ))
    )
      throw new Error("Invalid column widths");
    for (const row of value.rows) {
      if (
        !record(row) ||
        !text(row.id, 100) ||
        !row.id ||
        typeof row.highlighted !== "boolean" ||
        (row.color !== undefined && !validColor(row.color)) ||
        (row.position !== undefined && !text(row.position, 6)) ||
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
