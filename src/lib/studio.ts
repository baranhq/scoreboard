import { graphicPresets, validCanvasSize, type GraphicBase } from "./graphic-style.ts";
export { graphicPresets } from "./graphic-style.ts";
import { validColor } from "./colors.ts";
import { bracketRounds, type Bracket } from "./brackets.ts";
import { parseJsonText } from "./untrusted-json.ts";
import { onlyKeys } from "./validation.ts";
import { validTimestamp } from "./dates.ts";

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
  totalColumn?: number;
};
export type StudioDocument = Leaderboard | Bracket;
export const MAX_STUDIO_BACKUP_BYTES = 2_000_000;

export function parseDocumentText(text: string): StudioDocument {
  return parseDocument(parseJsonText(text, MAX_STUDIO_BACKUP_BYTES));
}

export function duplicateStudioDocument(document: StudioDocument, title: string): StudioDocument {
  return parseDocument({
    ...document,
    id: crypto.randomUUID(),
    title,
    updatedAt: Date.now(),
  });
}
export function newLeaderboard(id = crypto.randomUUID()): Leaderboard {
  return {
    version: 1,
    id,
    kind: "leaderboard",
    title: "Round 1 standings",
    subtitle: "Round 1",
    updatedAt: 0,
    exportScale: 1,
    style: { ...graphicPresets.classic, rowSeparators: false },
    gridColumns: 1,
    columns: ["Team", "Points"],
    rows: ["Team 1", "Team 2", "Team 3"].map((team, index) => ({
      id: `row-${index}`,
      cells: [team, "0"],
      highlighted: false,
    })),
  };
}
export function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (from < 0 || from >= items.length || to < 0 || to >= items.length) return items;
  const next = [...items];
  next.splice(to, 0, next.splice(from, 1)[0]);
  return next;
}
export function nextAvailableName(prefix: string, names: readonly string[]): string {
  const existing = new Set(names);
  let index = 1;
  while (existing.has(`${prefix} ${index}`)) index++;
  return `${prefix} ${index}`;
}
export function removeColumn(board: Leaderboard, index: number): Leaderboard {
  if (
    board.columns.length <= 1 ||
    !Number.isInteger(index) ||
    index < 0 ||
    index >= board.columns.length
  )
    return board;
  return recalculateLeaderboardTotal({
    ...board,
    columns: board.columns.filter((_, i) => i !== index),
    columnWidths: board.columnWidths?.filter((_, i) => i !== index),
    rows: board.rows.map((row) => ({ ...row, cells: row.cells.filter((_, i) => i !== index) })),
    totalColumn:
      board.totalColumn === undefined
        ? undefined
        : board.totalColumn === index
          ? undefined
          : board.totalColumn > index
            ? board.totalColumn - 1
            : board.totalColumn,
  });
}
export function addLeaderboardColumn(board: Leaderboard, name: string): Leaderboard {
  if (board.columns.length >= 10) return board;
  const index = board.totalColumn ?? board.columns.length;
  const columns = [...board.columns];
  columns.splice(index, 0, name);
  const columnWidths = board.columnWidths ? [...board.columnWidths] : undefined;
  columnWidths?.splice(index, 0, 160);
  const rows = board.rows.map((row) => {
    const cells = [...row.cells];
    cells.splice(index, 0, "");
    return { ...row, cells };
  });
  return recalculateLeaderboardTotal({
    ...board,
    columns,
    columnWidths,
    rows,
    totalColumn: board.totalColumn === undefined ? undefined : board.totalColumn + 1,
  });
}
export function moveLeaderboardColumn(board: Leaderboard, from: number, to: number): Leaderboard {
  if (from < 0 || from >= board.columns.length || to < 0 || to >= board.columns.length)
    return board;
  if (board.totalColumn === from) return board;
  const totalColumn = board.totalColumn;
  let movedTotalColumn =
    totalColumn === undefined
      ? undefined
      : from < to && totalColumn > from && totalColumn <= to
        ? totalColumn - 1
        : from > to && totalColumn >= to && totalColumn < from
          ? totalColumn + 1
          : totalColumn;
  if (movedTotalColumn === 0) return board;
  let columns = moveItem(board.columns, from, to);
  let columnWidths = board.columnWidths ? moveItem(board.columnWidths, from, to) : undefined;
  let rows = board.rows.map((row) => ({ ...row, cells: moveItem(row.cells, from, to) }));
  if (movedTotalColumn !== undefined && movedTotalColumn !== columns.length - 1) {
    const last = columns.length - 1;
    const totalIndex = movedTotalColumn;
    columns = moveItem(columns, movedTotalColumn, last);
    columnWidths = columnWidths ? moveItem(columnWidths, movedTotalColumn, last) : undefined;
    rows = rows.map((row) => ({
      ...row,
      cells: moveItem(row.cells, totalIndex, last),
    }));
    movedTotalColumn = last;
  }
  return recalculateLeaderboardTotal({
    ...board,
    columns,
    columnWidths,
    rows,
    totalColumn: movedTotalColumn,
  });
}
export function setLeaderboardTotalColumn(
  board: Leaderboard,
  totalColumn: number | undefined,
): Leaderboard {
  if (
    totalColumn !== undefined &&
    (!Number.isInteger(totalColumn) || totalColumn < 1 || totalColumn >= board.columns.length)
  )
    return board;
  if (totalColumn === undefined)
    return recalculateLeaderboardTotal({ ...board, totalColumn: undefined });
  const last = board.columns.length - 1;
  const columns = totalColumn === last ? board.columns : moveItem(board.columns, totalColumn, last);
  const columnWidths = board.columnWidths
    ? totalColumn === last
      ? board.columnWidths
      : moveItem(board.columnWidths, totalColumn, last)
    : undefined;
  const rows = board.rows.map((row) => ({
    ...row,
    cells: totalColumn === last ? row.cells : moveItem(row.cells, totalColumn, last),
  }));
  return recalculateLeaderboardTotal({
    ...board,
    columns,
    columnWidths,
    rows,
    totalColumn: last,
  });
}
export function recalculateLeaderboardTotal(board: Leaderboard, rankRows = true): Leaderboard {
  const totalColumn = board.totalColumn;
  if (totalColumn === undefined) return board;

  const rows = board.rows.map((row) => {
    const total = row.cells.reduce((sum, cell, index) => {
      if (index === 0 || index === totalColumn || cell.trim() === "") return sum;
      const value = Number(cell);
      return Number.isFinite(value) ? sum + value : sum;
    }, 0);
    const cells = row.cells.map((cell, index) => (index === totalColumn ? String(total) : cell));
    return { ...row, cells };
  });

  return { ...board, rows: rankRows ? sortRows(rows, totalColumn, "desc") : rows };
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
  rankRows = true,
): Leaderboard {
  if (!Number.isInteger(column) || column < 0 || column >= board.columns.length) return board;
  if (column === board.totalColumn) return board;

  const rows = board.rows.map((row) =>
    row.id === rowId
      ? { ...row, cells: row.cells.map((cell, index) => (index === column ? value : cell)) }
      : row,
  );
  if (!board.rows.some((row) => row.id === rowId)) return board;

  const updated = { ...board, rows: rankColumn === column ? sortRows(rows, column, "desc") : rows };
  return board.totalColumn === undefined ? updated : recalculateLeaderboardTotal(updated, rankRows);
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
const documentKeys = [
  "version",
  "id",
  "kind",
  "title",
  "subtitle",
  "updatedAt",
  "style",
  "canvas",
  "exportScale",
  "gridColumns",
  "columnWidths",
  "totalColumn",
  "columns",
  "rows",
  "layout",
  "participants",
  "results",
];
const styleKeys = [
  "titleVisible",
  "subtitleVisible",
  "rowSeparators",
  "showScores",
  "connectorColor",
  "connectorWidth",
  "roundGap",
  "matchGap",
  "gradient",
  "backgroundEnd",
  "preset",
  "radius",
  "borderWidth",
  "borderColor",
  "textColor",
  "density",
  "accent",
  "background",
  "font",
];
export function parseDocument(value: unknown): StudioDocument {
  if (
    !record(value) ||
    !onlyKeys(value, documentKeys) ||
    value.version !== 1 ||
    !text(value.id, 100) ||
    !value.id ||
    !text(value.title) ||
    !text(value.subtitle) ||
    !validTimestamp(value.updatedAt) ||
    !record(value.style)
  )
    throw new Error("Invalid document");
  const style = value.style;
  if (
    !onlyKeys(style, styleKeys) ||
    typeof style.preset !== "string" ||
    !["classic", "editorial", "night"].includes(style.preset) ||
    typeof style.font !== "string" ||
    !["Inter", "Inter Tight", "Georgia"].includes(style.font) ||
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
  for (const key of ["titleVisible", "subtitleVisible", "rowSeparators", "showScores"])
    if (style[key] !== undefined && typeof style[key] !== "boolean")
      throw new Error("Invalid visibility");
  for (const [key, min, max] of [
    ["connectorWidth", 0, 8],
    ["roundGap", 240, 400],
    ["matchGap", 8, 100],
  ] as const)
    if (
      style[key] !== undefined &&
      (typeof style[key] !== "number" ||
        !Number.isFinite(style[key]) ||
        style[key] < min ||
        style[key] > max)
    )
      throw new Error("Invalid layout");
  if (style.connectorColor !== undefined && !validColor(style.connectorColor))
    throw new Error("Invalid connector colour");
  if (style.gradient !== undefined && typeof style.gradient !== "boolean")
    throw new Error("Invalid gradient");
  for (const key of ["borderColor", "textColor", "backgroundEnd"])
    if (style[key] !== undefined && !validColor(style[key]))
      throw new Error("Invalid style colour");
  if (
    style.density !== undefined &&
    (typeof style.density !== "string" || !["compact", "spacious"].includes(style.density))
  )
    throw new Error("Invalid density");
  if (value.canvas !== undefined && !validCanvasSize(value.canvas))
    throw new Error("Invalid canvas");
  if (value.exportScale !== undefined && value.exportScale !== 1 && value.exportScale !== 2)
    throw new Error("Invalid export scale");
  if (value.kind === "leaderboard") {
    if (
      !onlyKeys(value, [
        "version",
        "id",
        "kind",
        "title",
        "subtitle",
        "updatedAt",
        "style",
        "canvas",
        "exportScale",
        "gridColumns",
        "columnWidths",
        "totalColumn",
        "columns",
        "rows",
      ]) ||
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
      value.totalColumn !== undefined &&
      (!Number.isInteger(value.totalColumn) ||
        (value.totalColumn as number) < 1 ||
        (value.totalColumn as number) >= value.columns.length)
    )
      throw new Error("Invalid total column");
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
        !onlyKeys(row, ["id", "cells", "highlighted", "color", "position"]) ||
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
      !onlyKeys(value, [
        "version",
        "id",
        "kind",
        "title",
        "subtitle",
        "updatedAt",
        "style",
        "canvas",
        "exportScale",
        "layout",
        "participants",
        "results",
      ]) ||
      typeof value.layout !== "string" ||
      !["single", "split"].includes(value.layout) ||
      !Array.isArray(value.participants) ||
      value.participants.length < 2 ||
      value.participants.length > 64 ||
      !record(value.results)
    )
      throw new Error("Invalid bracket");
    for (const p of value.participants)
      if (
        !record(p) ||
        !onlyKeys(p, ["id", "name", "color"]) ||
        !text(p.id, 100) ||
        !p.id ||
        !text(p.name) ||
        (p.color !== undefined && !validColor(p.color))
      )
        throw new Error("Invalid participant");
    if (!uniqueIds(value.participants) || Object.keys(value.results).length > 63)
      throw new Error("Invalid participants or results");
    for (const result of Object.values(value.results))
      if (
        !record(result) ||
        !onlyKeys(result, ["winner", "scores"]) ||
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
  const document = structuredClone(value) as StudioDocument;
  if (document.kind !== "leaderboard") return document;
  return document.totalColumn === undefined || document.totalColumn === document.columns.length - 1
    ? recalculateLeaderboardTotal(document)
    : setLeaderboardTotalColumn(document, document.totalColumn);
}
