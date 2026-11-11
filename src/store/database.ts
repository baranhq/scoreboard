import { parseStoredBoard, type Board } from "../lib/boards.ts";
export const DATABASE = "scoreboard";
export const VERSION = 1;
let connection: Promise<IDBDatabase> | undefined;
export function migrate(db: IDBDatabase, oldVersion: number) {
  if (oldVersion < 1) db.createObjectStore("boards", { keyPath: "id" });
  // Add future migrations here; never recreate or clear the store.
}
function open(): Promise<IDBDatabase> {
  if (!connection)
    connection = new Promise((resolve, reject) => {
      const request = indexedDB.open(DATABASE, VERSION);
      let expired = false;
      const timeout = setTimeout(() => {
        expired = true;
        connection = undefined;
        reject(new Error("Storage request timed out"));
      }, 8000);
      request.onupgradeneeded = (e) => migrate(request.result, e.oldVersion);
      request.onsuccess = () => {
        clearTimeout(timeout);
        if (expired) {
          request.result.close();
          connection = undefined;
          return;
        }
        const db = request.result;
        db.onversionchange = () => {
          db.close();
          connection = undefined;
        };
        resolve(db);
      };
      request.onerror = () => {
        clearTimeout(timeout);
        connection = undefined;
        reject(request.error);
      };
      request.onblocked = () => {
        connection = undefined;
        reject(new Error("Close other Scoreboard tabs to update storage."));
      };
    });
  return connection;
}
export async function loadBoards(): Promise<Board[]> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("boards", "readonly");
    const request = tx.objectStore("boards").getAll();
    tx.oncomplete = () => {
      try {
        resolve((request.result as unknown[]).map(parseStoredBoard));
      } catch (error) {
        reject(error);
      }
    };
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}
// Individual writes prevent unrelated boards in another tab from being overwritten.
export async function writeBoards(boards: Board[], removeId?: string): Promise<void> {
  const validBoards = boards.map(parseStoredBoard);
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("boards", "readwrite");
    const store = tx.objectStore("boards");
    for (const board of validBoards) store.put(board);
    if (removeId) store.delete(removeId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}
export async function loadOrCreateBoard(factory: () => Board): Promise<Board[]> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("boards", "readwrite");
    const store = tx.objectStore("boards");
    const request = store.getAll();
    let boards: Board[] = [];
    request.onsuccess = () => {
      try {
        boards = (request.result as unknown[]).map(parseStoredBoard);
        if (!boards.length) {
          const first = parseStoredBoard(factory());
          store.put(first);
          boards = [first];
        }
      } catch (error) {
        tx.abort();
        reject(error);
      }
    };
    tx.oncomplete = () => resolve(boards);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}
