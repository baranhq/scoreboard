import { backup, parseBackup, validateJsonDepth, type Board } from "./boards.ts";
import { pausedTimer } from "./timer.ts";
export const MAX_SHARE_LENGTH = 32768;
export function encodeGame(board: Board): string {
  const snapshot = {
    ...board,
    timer: board.timer ? pausedTimer(board.timer) : undefined,
    shareKey: undefined,
  };
  const bytes = new TextEncoder().encode(JSON.stringify(backup([snapshot])));
  if (bytes.length > 24000) throw new Error("too large");
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
export function decodeGame(encoded: string): { board: Board; sourceId: string; key: string } {
  if (!encoded || encoded.length > MAX_SHARE_LENGTH || !/^[A-Za-z0-9_-]+$/.test(encoded))
    throw new Error("invalid link");
  const binary = atob(encoded.replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  validateJsonDepth(text);
  const raw = JSON.parse(text);
  const boards = parseBackup(raw);
  if (boards.length !== 1) throw new Error("one game required");
  return { board: boards[0], sourceId: raw.boards[0].id, key: encoded };
}
export function shareUrl(board: Board): string {
  return `${location.origin}${location.pathname}#share=${encodeGame(board)}`;
}
