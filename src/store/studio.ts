import { parseDocument, type StudioDocument } from "../lib/studio.ts";

// A separate database preserves the original Scoreboard store and its version contract.
function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("scoreboard-studio", 1);
    let expired = false;
    const timeout = setTimeout(() => {
      expired = true;
      reject(new Error("Storage request timed out"));
    }, 8000);
    request.onupgradeneeded = () =>
      request.result.createObjectStore("documents", { keyPath: "id" });
    request.onsuccess = () => {
      clearTimeout(timeout);
      if (expired) request.result.close();
      else resolve(request.result);
    };
    request.onerror = () => {
      clearTimeout(timeout);
      reject(request.error);
    };
    request.onblocked = () => reject(new Error("Storage is blocked"));
  });
}
async function transaction<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("documents", mode);
    const request = run(tx.objectStore("documents"));
    tx.oncomplete = () => {
      db.close();
      resolve(request.result);
    };
    tx.onerror = tx.onabort = () => {
      db.close();
      reject(tx.error);
    };
  });
}
export async function listDocuments(): Promise<StudioDocument[]> {
  const values: unknown[] = await transaction("readonly", (store) => store.getAll());
  return values.map(parseDocument).sort((a, b) => b.updatedAt - a.updatedAt);
}
export async function readDocument(id: string): Promise<StudioDocument | undefined> {
  const value: unknown = await transaction("readonly", (store) => store.get(id));
  return value === undefined ? undefined : parseDocument(value);
}
export async function saveDocument(document: StudioDocument): Promise<void> {
  const valid = parseDocument(document);
  await transaction("readwrite", (store) => store.put(valid));
}
export async function deleteDocument(id: string): Promise<void> {
  await transaction("readwrite", (store) => store.delete(id));
}
