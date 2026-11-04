import type { Board } from "../lib/boards";
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
      request.onupgradeneeded = (e) => migrate(request.result, e.oldVersion);
      request.onsuccess = () => {
        const db = request.result;
        db.onversionchange = () => {
          db.close();
          connection = undefined;
        };
        resolve(db);
      };
      request.onerror = () => {
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
    tx.oncomplete = () => resolve(request.result as Board[]);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}
// Individual writes prevent unrelated boards in another tab from being overwritten.
export async function writeBoards(boards: Board[], removeId?: string): Promise<void> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("boards", "readwrite");
    const store = tx.objectStore("boards");
    for (const board of boards) store.put(board);
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
      boards = request.result as Board[];
      if (!boards.length) {
        const first = factory();
        store.put(first);
        boards = [first];
      }
    };
    tx.oncomplete = () => resolve(boards);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}
