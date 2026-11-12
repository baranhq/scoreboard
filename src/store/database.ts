import { parseStoredBoard, type Board } from "../lib/boards.ts";
export const DATABASE = "scoreboard";
export const VERSION = 1;
const STORAGE_TIMEOUT_MS = 8000;
let connection: Promise<IDBDatabase> | undefined;
export function migrate(db: IDBDatabase, oldVersion: number) {
  if (oldVersion < 1) db.createObjectStore("boards", { keyPath: "id" });
  // Add future migrations here; never recreate or clear the store.
}
function open(): Promise<IDBDatabase> {
  if (!connection) {
    const pending = new Promise<IDBDatabase>((resolve, reject) => {
      let settled = false;
      const timeout = setTimeout(
        () => fail(new Error("Storage request timed out")),
        STORAGE_TIMEOUT_MS,
      );
      const fail = (error: unknown) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        reject(error);
      };
      let request: IDBOpenDBRequest;
      try {
        request = indexedDB.open(DATABASE, VERSION);
      } catch (error) {
        fail(error);
        return;
      }
      request.onupgradeneeded = (e) => migrate(request.result, e.oldVersion);
      request.onsuccess = () => {
        const db = request.result;
        if (settled) {
          db.close();
          return;
        }
        settled = true;
        clearTimeout(timeout);
        db.onversionchange = () => {
          db.close();
          connection = undefined;
        };
        resolve(db);
      };
      request.onerror = () => fail(request.error ?? new Error("Storage request failed"));
      request.onblocked = () => fail(new Error("Close other Scoreboard tabs to update storage."));
    });
    connection = pending;
    void pending.catch(() => {
      if (connection === pending) connection = undefined;
    });
  }
  return connection;
}
function waitForTransaction<T>(tx: IDBTransaction, result: () => T): Promise<T> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = () => {
      if (settled) return false;
      settled = true;
      clearTimeout(timeout);
      return true;
    };
    const timeout = setTimeout(() => {
      if (!finish()) return;
      reject(new Error("Storage transaction timed out"));
      try {
        tx.abort();
      } catch {}
    }, STORAGE_TIMEOUT_MS);
    tx.oncomplete = () => {
      if (!finish()) return;
      try {
        resolve(result());
      } catch (error) {
        reject(error);
      }
    };
    tx.onerror = () => {
      if (finish()) reject(tx.error ?? new Error("Storage transaction failed"));
    };
    tx.onabort = () => {
      if (finish()) reject(tx.error ?? new Error("Storage transaction aborted"));
    };
  });
}
export async function loadBoards(): Promise<Board[]> {
  const db = await open();
  const tx = db.transaction("boards", "readonly");
  const request = tx.objectStore("boards").getAll();
  return waitForTransaction(tx, () => (request.result as unknown[]).map(parseStoredBoard));
}
// Individual writes prevent unrelated boards in another tab from being overwritten.
export async function writeBoards(boards: Board[], removeId?: string): Promise<void> {
  const validBoards = boards.map(parseStoredBoard);
  const db = await open();
  const tx = db.transaction("boards", "readwrite");
  const store = tx.objectStore("boards");
  for (const board of validBoards) store.put(board);
  if (removeId) store.delete(removeId);
  return waitForTransaction(tx, () => undefined);
}
export async function loadOrCreateBoard(factory: () => Board): Promise<Board[]> {
  const db = await open();
  const tx = db.transaction("boards", "readwrite");
  const store = tx.objectStore("boards");
  const request = store.getAll();
  let boards: Board[] = [];
  let failure: unknown;
  let failed = false;
  const completion = waitForTransaction(tx, () => {
    if (failed) throw failure;
    return boards;
  });
  request.onsuccess = () => {
    try {
      boards = (request.result as unknown[]).map(parseStoredBoard);
      if (!boards.length) {
        const first = parseStoredBoard(factory());
        store.put(first);
        boards = [first];
      }
    } catch (error) {
      failure = error;
      failed = true;
      tx.abort();
    }
  };
  return completion.catch((error) => {
    throw failed ? failure : error;
  });
}
