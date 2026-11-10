import { parseTimer, type GameTimer } from "./timer.ts";
import { isBoardIcon, type BoardIconId } from "./board-icons.ts";
import { parseAppearance, type Appearance } from "./appearance.ts";
import { validColor } from "./colors.ts";
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
};
export const MAX_SCORE = 999999999;
export const MAX_BACKUP_BYTES = 5 * 1024 * 1024;
const MAX_BACKUP_BOARDS = 1000;
// One shared team budget accepts older large local boards without unbounding imports.
const MAX_BACKUP_TOTAL_TEAMS = 5000;
export function validScore(value: number): boolean {
  return Number.isSafeInteger(value) && Math.abs(value) <= MAX_SCORE;
}
export function newBoard(name: string, team: string): Board {
  return {
    id: crypto.randomUUID(),
    name,
    automaticName: true,
    icon: "scoreboard",
    accent: "#285b35",
    updatedAt: Date.now(),
    teams: [1, 2].map((n) => ({
      id: crypto.randomUUID(),
      name: `${team} ${n}`,
      automaticName: true,
      score: 0,
    })),
  };
}
export function backup(boards: Board[]) {
  return { format: "scoreboard", version: 2, boards };
}
export function validateJsonDepth(text: string): void {
  if (new TextEncoder().encode(text).byteLength > MAX_BACKUP_BYTES)
    throw new Error("backup too large");
  let depth = 0,
    quoted = false,
    escaped = false;
  for (const character of text) {
    if (quoted) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === '"') quoted = false;
      continue;
    }
    if (character === '"') {
      quoted = true;
      continue;
    }
    if (character === "{" || character === "[") {
      if (++depth > 32) throw new Error("backup too deep");
    } else if (character === "}" || character === "]") {
      if (--depth < 0) throw new Error("invalid backup");
    }
  }
  if (depth !== 0 || quoted) throw new Error("invalid backup");
}
export function parseBackupText(text: string): Board[] {
  validateJsonDepth(text);
  return parseBackup(JSON.parse(text));
}
export function parseBackup(input: unknown): Board[] {
  if (!input || typeof input !== "object") throw new Error("backup");
  const data = input as Record<string, unknown>;
  if (
    data.format !== "scoreboard" ||
    ![1, 2].includes(data.version as number) ||
    !Array.isArray(data.boards) ||
    data.boards.length > MAX_BACKUP_BOARDS
  )
    throw new Error("format");
  const text = (v: unknown): v is string =>
    typeof v === "string" && v.trim().length > 0 && v.length <= 200;
  let totalTeams = 0;
  return data.boards.map((value: unknown) => {
    if (!value || typeof value !== "object") throw new Error("board");
    const b = value as Record<string, unknown>;
    if (
      !text(b.id) ||
      !text(b.name) ||
      !Array.isArray(b.teams) ||
      b.teams.length < 1 ||
      b.teams.length > MAX_BACKUP_TOTAL_TEAMS ||
      !Number.isSafeInteger(b.updatedAt) ||
      (b.updatedAt as number) < 0
    )
      throw new Error("board");
    totalTeams += b.teams.length;
    if (totalTeams > MAX_BACKUP_TOTAL_TEAMS) throw new Error("backup too large");
    if (b.automaticName !== undefined && typeof b.automaticName !== "boolean")
      throw new Error("name flag");
    if (b.background !== undefined && !validColor(b.background)) throw new Error("background");
    if (b.icon !== undefined && !isBoardIcon(b.icon)) throw new Error("icon");
    if (b.accent !== undefined && !validColor(b.accent)) throw new Error("accent");
    if (b.textColor !== undefined && !validColor(b.textColor)) throw new Error("textColor");
    if (b.color !== undefined && !validColor(b.color)) throw new Error("color");
    return {
      timer: parseTimer(b.timer),
      automaticName: b.automaticName as boolean | undefined,
      background: b.background as string | undefined,
      icon: (b.icon as BoardIconId | undefined) || "scoreboard",
      accent: (b.accent as string | undefined) || "#285b35",
      appearance: parseAppearance(b.appearance),
      textColor: b.textColor as string | undefined,
      color: b.color as string | undefined,
      id: crypto.randomUUID(),
      name: b.name,
      updatedAt: Date.now(),
      teams: b.teams.map((v: unknown) => {
        if (!v || typeof v !== "object") throw new Error("team");
        const t = v as Record<string, unknown>;
        if (!text(t.id) || !text(t.name) || typeof t.score !== "number" || !validScore(t.score))
          throw new Error("team");
        if (t.automaticName !== undefined && typeof t.automaticName !== "boolean")
          throw new Error("name flag");
        if (t.textColor !== undefined && !validColor(t.textColor)) throw new Error("textColor");
        if (t.color !== undefined && !validColor(t.color)) throw new Error("color");
        return {
          id: crypto.randomUUID(),
          name: t.name,
          score: t.score,
          automaticName: t.automaticName as boolean | undefined,
          color: t.color as string | undefined,
          textColor: t.textColor as string | undefined,
        };
      }),
    };
  });
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
