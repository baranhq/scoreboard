import type { Board } from "../lib/boards.ts";
import { loadBoards, loadOrCreateBoard, migrateDatabase, saveBoards } from "./library.ts";

export const DATABASE = "scoreboard";
export const VERSION = 2;
export const migrate = migrateDatabase;
export { loadBoards, loadOrCreateBoard };

// Keep the editor's existing API while storing all project types together.
export function writeBoards(boards: Board[], removeId?: string): Promise<void> {
  return saveBoards(boards, removeId);
}
