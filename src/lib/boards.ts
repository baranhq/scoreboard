import { parseTimer, type GameTimer } from "./timer.ts";
import { isBoardIcon, type BoardIconId } from "./board-icons.ts";
import { parseAppearance, type Appearance } from "./appearance.ts";
import { validColor } from "./colors.ts";
import { applyToolTheme } from "./board-theme.ts";
import { toolThemes } from "./tool-themes.ts";
import { validCanvasSize, type CanvasSize } from "./graphic-style.ts";
import { parseJsonText, validateJsonText } from "./untrusted-json.ts";
import { onlyKeys } from "./validation.ts";
import { validTimestamp } from "./dates.ts";
export type Team = {
  id: string;
  name: string;
  score: number;
  automaticName?: boolean;
  color?: string;
  textColor?: string;
};
export type Board = {
  id: string;
  name: string;
  teams: Team[];
  automaticName?: boolean;
  icon?: BoardIconId;
  accent?: string;
  background?: string;
  timer?: GameTimer;
  shareKey?: string;
  updatedAt: number;
  color?: string;
  textColor?: string;
  appearance?: Partial<Appearance>;
  themeId?: string;
  canvas?: CanvasSize;
  exportScale?: 1 | 2;
};
export const MAX_SCORE = 999999999;
export const MAX_BACKUP_BYTES = 5 * 1024 * 1024;
const MAX_BACKUP_BOARDS = 1000;
// One shared team budget accepts older large local boards without unbounding imports.
const MAX_BACKUP_TOTAL_TEAMS = 5000;
const MAX_SHARE_KEY_LENGTH = 32768;
const validText = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0 && value.length <= 200;
export function validScore(value: number): boolean {
  return Number.isSafeInteger(value) && Math.abs(value) <= MAX_SCORE;
}
export function newBoard(name: string, team: string): Board {
  const board: Board = {
    id: crypto.randomUUID(),
    name,
    automaticName: true,
    icon: "scoreboard",
    updatedAt: Date.now(),
    exportScale: 1,
    teams: [1, 2].map((n) => ({
      id: crypto.randomUUID(),
      name: `${team} ${n}`,
      automaticName: true,
      score: 0,
    })),
  };
  return applyToolTheme(board, toolThemes[0]);
}
export function backup(boards: Board[]) {
  return {
    format: "scoreboard",
    version: 2,
    boards: boards.map((board) => {
      const exported = parseStoredBoard(board);
      delete exported.shareKey;
      return exported;
    }),
  };
}
export function validateJsonDepth(text: string): void {
  validateJsonText(text, MAX_BACKUP_BYTES);
}
export function parseBackupText(text: string): Board[] {
  return parseBackup(parseJsonText(text, MAX_BACKUP_BYTES));
}
export function parseBackup(input: unknown): Board[] {
  if (!input || typeof input !== "object") throw new Error("backup");
  const data = input as Record<string, unknown>;
  if (
    !onlyKeys(data, ["format", "version", "boards"]) ||
    data.format !== "scoreboard" ||
    ![1, 2].includes(data.version as number) ||
    !Array.isArray(data.boards) ||
    data.boards.length > MAX_BACKUP_BOARDS
  )
    throw new Error("format");
  let totalTeams = 0;
  return data.boards.map((value: unknown) => {
    const board = parseBoard(value, true);
    totalTeams += board.teams.length;
    if (totalTeams > MAX_BACKUP_TOTAL_TEAMS) throw new Error("backup too large");
    return board;
  });
}

export function parseStoredBoard(value: unknown): Board {
  return parseBoard(value, false);
}

function parseBoard(value: unknown, renewIdentity: boolean): Board {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("board");
  const b = value as Record<string, unknown>;
  if (
    !onlyKeys(b, [
      "id",
      "name",
      "teams",
      "automaticName",
      "icon",
      "accent",
      "background",
      "timer",
      "shareKey",
      "updatedAt",
      "color",
      "textColor",
      "appearance",
      "themeId",
      "canvas",
      "exportScale",
    ]) ||
    !validText(b.id) ||
    !validText(b.name) ||
    !Array.isArray(b.teams) ||
    b.teams.length < 1 ||
    b.teams.length > MAX_BACKUP_TOTAL_TEAMS ||
    !validTimestamp(b.updatedAt)
  )
    throw new Error("board");
  if (b.automaticName !== undefined && typeof b.automaticName !== "boolean")
    throw new Error("name flag");
  if (b.background !== undefined && !validColor(b.background)) throw new Error("background");
  if (b.icon !== undefined && !isBoardIcon(b.icon)) throw new Error("icon");
  if (b.accent !== undefined && !validColor(b.accent)) throw new Error("accent");
  if (b.textColor !== undefined && !validColor(b.textColor)) throw new Error("textColor");
  if (b.color !== undefined && !validColor(b.color)) throw new Error("color");
  if (
    b.themeId !== undefined &&
    (typeof b.themeId !== "string" || !/^[a-z0-9-]{1,80}$/.test(b.themeId))
  )
    throw new Error("theme");
  if (b.canvas !== undefined && !validCanvasSize(b.canvas)) throw new Error("canvas");
  if (b.exportScale !== undefined && b.exportScale !== 1 && b.exportScale !== 2)
    throw new Error("export scale");
  if (
    b.shareKey !== undefined &&
    (typeof b.shareKey !== "string" ||
      b.shareKey.length > MAX_SHARE_KEY_LENGTH ||
      !/^[A-Za-z0-9_-]+$/.test(b.shareKey))
  )
    throw new Error("share key");

  const teams = b.teams.map((v: unknown) => {
    if (!v || typeof v !== "object" || Array.isArray(v)) throw new Error("team");
    const t = v as Record<string, unknown>;
    if (
      !onlyKeys(t, ["id", "name", "score", "automaticName", "color", "textColor"]) ||
      !validText(t.id) ||
      !validText(t.name) ||
      typeof t.score !== "number" ||
      !validScore(t.score)
    )
      throw new Error("team");
    if (t.automaticName !== undefined && typeof t.automaticName !== "boolean")
      throw new Error("name flag");
    if (t.textColor !== undefined && !validColor(t.textColor)) throw new Error("textColor");
    if (t.color !== undefined && !validColor(t.color)) throw new Error("color");
    return {
      id: renewIdentity ? crypto.randomUUID() : t.id,
      name: t.name,
      score: t.score,
      automaticName: t.automaticName as boolean | undefined,
      color: t.color as string | undefined,
      textColor: t.textColor as string | undefined,
    };
  });

  return {
    timer: parseTimer(b.timer),
    automaticName: b.automaticName as boolean | undefined,
    background: b.background as string | undefined,
    icon: (b.icon as BoardIconId | undefined) || "scoreboard",
    accent: (b.accent as string | undefined) || "#285b35",
    appearance: parseAppearance(b.appearance),
    textColor: b.textColor as string | undefined,
    color: b.color as string | undefined,
    themeId: b.themeId as string | undefined,
    canvas: b.canvas as CanvasSize | undefined,
    exportScale: b.exportScale as 1 | 2 | undefined,
    id: renewIdentity ? crypto.randomUUID() : (b.id as string),
    name: b.name as string,
    updatedAt: renewIdentity ? Date.now() : (b.updatedAt as number),
    teams,
    ...(!renewIdentity && b.shareKey ? { shareKey: b.shareKey as string } : {}),
  };
}
export function download(boards: Board[]) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(backup(boards), null, 2)], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = "scoreboard-backup.json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function displayBoard(board: Board, labels: { board: string; team: string }): Board {
  const defaultBoard = [
    "Scoreboard",
    "Табло за резултати",
    "Skor tabelası",
    "Skor panosu",
  ].includes(board.name);
  return {
    ...board,
    name: board.automaticName !== false && defaultBoard ? labels.board : board.name,
    teams: board.teams.map((team) => {
      const match = /^(?:Team|Отбор|Takım) (\d+)$/.exec(team.name);
      return team.automaticName !== false && match
        ? { ...team, name: `${labels.team} ${match[1]}` }
        : team;
    }),
  };
}
