import { parseStoredBoard, type Board } from "../lib/boards.ts";
import { parseDocument, type StudioDocument } from "../lib/studio.ts";
import { validTimestamp } from "../lib/dates.ts";
import {
  makeLibraryProject,
  mergeLibraryBackup,
  normaliseFolderName,
  MAX_LIBRARY_FOLDERS,
  parseLibraryBackup,
  parseLibraryFolder,
  parseLibraryProject,
  validateFolderName,
  type LibraryBackup,
  type LibraryFolder,
  type LibraryProject,
  type ProjectData,
  type ProjectType,
} from "../lib/library.ts";

export const DATABASE = "scoreboard";
export const VERSION = 2;
const LEGACY_STUDIO_DATABASE = "scoreboard-studio";
const LEGACY_MIGRATION_KEY = "legacy-import-v1";
const STORAGE_TIMEOUT_MS = 8_000;

let connection: Promise<IDBDatabase> | undefined;
let migration: Promise<void> | undefined;

type LegacyMigration = { migratedAt: number; skipped: number };
type LibrarySnapshot = { projects: LibraryProject[]; folders: LibraryFolder[]; issues: number };
const LIBRARY_CHANGE_EVENT = "scoreboard-library-change";

export function subscribeLibrary(listener: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener(LIBRARY_CHANGE_EVENT, listener);
  const channel =
    typeof BroadcastChannel === "undefined"
      ? undefined
      : new BroadcastChannel("scoreboard-library");
  channel?.addEventListener("message", listener);
  return () => {
    window.removeEventListener(LIBRARY_CHANGE_EVENT, listener);
    channel?.removeEventListener("message", listener);
    channel?.close();
  };
}

function announceLibraryChange(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(LIBRARY_CHANGE_EVENT));
  if (typeof BroadcastChannel !== "undefined") {
    const channel = new BroadcastChannel("scoreboard-library");
    channel.postMessage("changed");
    channel.close();
  }
}

function openDatabase(): Promise<IDBDatabase> {
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
      request.onupgradeneeded = (event) => migrateDatabase(request.result, event.oldVersion);
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
      request.onblocked = () =>
        fail(new Error("Close other Scoreboard tabs to update local storage."));
    });
    connection = pending;
    void pending.catch(() => {
      if (connection === pending) connection = undefined;
    });
  }
  return connection;
}

export function migrateDatabase(db: IDBDatabase, oldVersion: number): void {
  if (oldVersion < 1 && !db.objectStoreNames.contains("boards"))
    db.createObjectStore("boards", { keyPath: "id" });
  if (oldVersion < 2) {
    if (!db.objectStoreNames.contains("projects"))
      db.createObjectStore("projects", { keyPath: "id" });
    if (!db.objectStoreNames.contains("folders"))
      db.createObjectStore("folders", { keyPath: "id" });
    if (!db.objectStoreNames.contains("libraryMeta")) db.createObjectStore("libraryMeta");
  }
}

function transact<T>(
  db: IDBDatabase,
  stores: string | string[],
  mode: IDBTransactionMode,
  run: (tx: IDBTransaction, fail: (error: unknown) => void) => () => T,
): Promise<T> {
  return new Promise((resolve, reject) => {
    let tx: IDBTransaction | undefined;
    let finish: () => T;
    let operationError: unknown;
    let settled = false;
    const timeout = setTimeout(() => {
      operationError = new Error("Storage transaction timed out");
      try {
        tx?.abort();
      } catch {
        rejectOnce(operationError);
      }
    }, STORAGE_TIMEOUT_MS);
    const rejectOnce = (error: unknown) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      reject(error);
    };
    try {
      const transaction = db.transaction(stores, mode);
      tx = transaction;
      finish = run(transaction, (error) => {
        operationError = error;
        try {
          transaction.abort();
        } catch {
          rejectOnce(error);
        }
      });
    } catch (error) {
      try {
        tx?.abort();
      } catch {
        // The operation already failed; retain its original error.
      }
      rejectOnce(error);
      return;
    }
    if (!tx) {
      rejectOnce(new Error("Storage transaction could not be opened."));
      return;
    }
    const transaction = tx;
    transaction.oncomplete = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      try {
        resolve(finish());
      } catch (error) {
        reject(error);
      }
    };
    transaction.onerror = () => {
      if (!settled)
        rejectOnce(operationError ?? transaction.error ?? new Error("Storage transaction failed"));
    };
    transaction.onabort = () => {
      if (!settled)
        rejectOnce(operationError ?? transaction.error ?? new Error("Storage transaction aborted"));
    };
  });
}

function readLegacyStudioDocuments(): Promise<unknown[]> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const timeout = setTimeout(
      () => fail(new Error("Older project storage could not be read.")),
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
      request = indexedDB.open(LEGACY_STUDIO_DATABASE, 1);
    } catch (error) {
      fail(error);
      return;
    }
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains("documents"))
        request.result.createObjectStore("documents", { keyPath: "id" });
    };
    request.onsuccess = () => {
      const openedDb = request.result;
      if (settled) {
        openedDb.close();
        return;
      }
      if (!openedDb.objectStoreNames.contains("documents")) {
        openedDb.close();
        fail(new Error("Older project storage has an unexpected format."));
        return;
      }
      const tx = openedDb.transaction("documents", "readonly");
      const recordsRequest = tx.objectStore("documents").getAll();
      tx.oncomplete = () => {
        openedDb.close();
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        resolve(recordsRequest.result as unknown[]);
      };
      tx.onerror = tx.onabort = () => {
        openedDb.close();
        fail(tx.error ?? new Error("Older project storage could not be read."));
      };
    };
    request.onerror = () =>
      fail(request.error ?? new Error("Older project storage could not be opened."));
    request.onblocked = () =>
      fail(new Error("Close other Scoreboard tabs to finish the storage update."));
  });
}

async function migrateLegacyData(db: IDBDatabase): Promise<void> {
  const marker = await transact(db, "libraryMeta", "readonly", (tx) => {
    const request = tx.objectStore("libraryMeta").get(LEGACY_MIGRATION_KEY);
    return () => request.result as LegacyMigration | undefined;
  });
  if (marker) return;

  const oldBoards = await transact(db, "boards", "readonly", (tx) => {
    const request = tx.objectStore("boards").getAll();
    return () => request.result as unknown[];
  });
  const oldDocuments = await readLegacyStudioDocuments();
  const projects: LibraryProject[] = [];
  let skipped = 0;
  for (const old of oldBoards) {
    try {
      projects.push(makeLibraryProject(parseStoredBoard(old)));
    } catch {
      skipped++;
    }
  }
  for (const old of oldDocuments) {
    try {
      projects.push(makeLibraryProject(parseDocument(old)));
    } catch {
      skipped++;
    }
  }

  await transact(db, ["projects", "libraryMeta"], "readwrite", (tx, fail) => {
    const projectStore = tx.objectStore("projects");
    const markerStore = tx.objectStore("libraryMeta");
    const markerRequest = markerStore.get(LEGACY_MIGRATION_KEY);
    let existingIds = new Set<string>();
    let complete = false;
    markerRequest.onsuccess = () => {
      if (markerRequest.result) {
        complete = true;
        return;
      }
      const existingRequest = projectStore.getAll();
      existingRequest.onsuccess = () => {
        try {
          existingIds = new Set(
            (existingRequest.result as { id?: unknown }[])
              .map((record) => record.id)
              .filter((id): id is string => typeof id === "string"),
          );
          for (const oldProject of projects) {
            let id = oldProject.id;
            while (existingIds.has(id)) id = crypto.randomUUID();
            existingIds.add(id);
            const data =
              id === oldProject.id ? oldProject.data : ({ ...oldProject.data, id } as ProjectData);
            projectStore.add({ ...oldProject, id, data });
          }
          markerStore.put({ migratedAt: Date.now(), skipped }, LEGACY_MIGRATION_KEY);
          complete = true;
        } catch (error) {
          fail(error);
        }
      };
      existingRequest.onerror = () =>
        fail(existingRequest.error ?? new Error("Storage migration failed."));
    };
    markerRequest.onerror = () =>
      fail(markerRequest.error ?? new Error("Storage migration failed."));
    return () => {
      if (!complete) throw new Error("Storage migration did not complete.");
    };
  });
}

async function openLibrary(): Promise<IDBDatabase> {
  const db = await openDatabase();
  if (!migration) {
    const pending = migrateLegacyData(db);
    migration = pending;
    void pending.catch(() => {
      if (migration === pending) migration = undefined;
    });
  }
  await migration;
  return db;
}

export async function loadLibrary(): Promise<LibrarySnapshot> {
  const db = await openLibrary();
  const result = await transact(db, ["projects", "folders", "libraryMeta"], "readonly", (tx) => {
    const projectsRequest = tx.objectStore("projects").getAll();
    const foldersRequest = tx.objectStore("folders").getAll();
    const migrationRequest = tx.objectStore("libraryMeta").get(LEGACY_MIGRATION_KEY);
    return () => ({
      projectValues: projectsRequest.result as unknown[],
      folderValues: foldersRequest.result as unknown[],
      marker: migrationRequest.result as LegacyMigration | undefined,
    });
  });
  const folders: LibraryFolder[] = [];
  let issues = result.marker?.skipped ?? 0;
  for (const raw of result.folderValues) {
    try {
      folders.push(parseLibraryFolder(raw));
    } catch {
      issues++;
    }
  }
  const folderIds = new Set(folders.map((folder) => folder.id));
  const projects: LibraryProject[] = [];
  for (const raw of result.projectValues) {
    try {
      const project = parseLibraryProject(raw);
      if (project.folderId && !folderIds.has(project.folderId)) {
        projects.push({ ...project, folderId: null });
        issues++;
      } else projects.push(project);
    } catch {
      issues++;
    }
  }
  return { projects, folders, issues };
}

function parseProjectRecord(value: unknown): LibraryProject {
  return parseLibraryProject(value);
}

function getRecord(store: IDBObjectStore, id: string): IDBRequest<unknown> {
  if (!id || id.length > 120) throw new Error("Invalid project ID");
  return store.get(id);
}

function preserveMetadata(data: ProjectData, previous: LibraryProject | undefined): LibraryProject {
  if (previous && previous.type !== ("teams" in data ? "scoreboard" : data.kind))
    throw new Error("Project type cannot change");
  return makeLibraryProject(
    data,
    previous
      ? {
          createdAt: previous.createdAt,
          folderId: previous.folderId,
          favorite: previous.favorite,
        }
      : undefined,
  );
}

export async function saveBoards(boards: Board[], removeId?: string): Promise<void> {
  const valid = boards.map(parseStoredBoard);
  if (new Set(valid.map((board) => board.id)).size !== valid.length)
    throw new Error("Duplicate scoreboard ID");
  const db = await openLibrary();
  await transact(db, "projects", "readwrite", (tx, fail) => {
    const store = tx.objectStore("projects");
    let remaining = valid.length + (removeId ? 1 : 0);
    const done = () => {
      remaining--;
    };
    for (const board of valid) {
      const request = getRecord(store, board.id);
      request.onsuccess = () => {
        try {
          const previous =
            request.result === undefined ? undefined : parseProjectRecord(request.result);
          if (previous && previous.type !== "scoreboard")
            throw new Error("Project ID is already in use");
          store.put(preserveMetadata(board, previous));
          done();
        } catch (error) {
          fail(error);
        }
      };
      request.onerror = () => fail(request.error ?? new Error("Could not read saved project."));
    }
    if (removeId) {
      const request = getRecord(store, removeId);
      request.onsuccess = () => {
        try {
          if (
            request.result !== undefined &&
            parseProjectRecord(request.result).type === "scoreboard"
          )
            store.delete(removeId);
          done();
        } catch (error) {
          fail(error);
        }
      };
      request.onerror = () => fail(request.error ?? new Error("Could not read saved project."));
    }
    return () => {
      if (remaining > 0) throw new Error("Project save did not complete.");
    };
  });
  if (valid.length || removeId) announceLibraryChange();
}

export async function loadBoards(): Promise<Board[]> {
  const db = await openLibrary();
  return transact(db, "projects", "readonly", (tx) => {
    const request = tx.objectStore("projects").getAll();
    return () =>
      (request.result as unknown[])
        .filter((value) => (value as { type?: unknown })?.type === "scoreboard")
        .map(parseProjectRecord)
        .map((project) => {
          if (project.type !== "scoreboard") throw new Error("Invalid scoreboard project");
          return project.data as Board;
        });
  });
}

export async function loadOrCreateBoard(factory: () => Board): Promise<Board[]> {
  const db = await openLibrary();
  let created = false;
  const result = await transact(db, "projects", "readwrite", (tx, fail) => {
    const store = tx.objectStore("projects");
    const request = store.getAll();
    let result: Board[] = [];
    request.onsuccess = () => {
      try {
        const projects = (request.result as unknown[])
          .filter((value) => (value as { type?: unknown })?.type === "scoreboard")
          .map(parseProjectRecord);
        result = projects
          .filter((project) => project.type === "scoreboard")
          .map((project) => project.data as Board);
        if (!result.length) {
          const first = parseStoredBoard(factory());
          const collision = (request.result as { id?: unknown }[]).some(
            (record) => record.id === first.id,
          );
          if (collision) throw new Error("Project ID is already in use");
          store.add(makeLibraryProject(first));
          result = [first];
          created = true;
        }
      } catch (error) {
        fail(error);
      }
    };
    request.onerror = () => fail(request.error ?? new Error("Could not load saved projects."));
    return () => result;
  });
  if (created) announceLibraryChange();
  return result;
}

export async function listStudioDocuments(): Promise<StudioDocument[]> {
  const { projects } = await loadLibrary();
  return projects
    .filter((project) => project.type !== "scoreboard")
    .map((project) => project.data as StudioDocument)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function readStudioDocument(id: string): Promise<StudioDocument | undefined> {
  if (!id || id.length > 120) return undefined;
  const db = await openLibrary();
  return transact(db, "projects", "readonly", (tx) => {
    const request = tx.objectStore("projects").get(id);
    return () => {
      if (request.result === undefined) return undefined;
      const project = parseProjectRecord(request.result);
      return project.type === "scoreboard" ? undefined : (project.data as StudioDocument);
    };
  });
}

export async function saveStudioDocument(document: StudioDocument): Promise<void> {
  const valid = parseDocument(document);
  const db = await openLibrary();
  await transact(db, "projects", "readwrite", (tx, fail) => {
    const store = tx.objectStore("projects");
    const request = getRecord(store, valid.id);
    request.onsuccess = () => {
      try {
        const previous =
          request.result === undefined ? undefined : parseProjectRecord(request.result);
        if (previous?.type === "scoreboard") throw new Error("Project ID is already in use");
        store.put(preserveMetadata(valid, previous));
      } catch (error) {
        fail(error);
      }
    };
    request.onerror = () => fail(request.error ?? new Error("Could not read saved project."));
    return () => undefined;
  });
  announceLibraryChange();
}

export async function deleteLibraryProject(id: string, expected?: ProjectType): Promise<void> {
  if (!id || id.length > 120) throw new Error("Invalid project ID");
  const db = await openLibrary();
  let deleted = false;
  await transact(db, "projects", "readwrite", (tx, fail) => {
    const store = tx.objectStore("projects");
    const request = store.get(id);
    request.onsuccess = () => {
      try {
        if (request.result === undefined) return;
        const project = parseProjectRecord(request.result);
        if (!expected || project.type === expected) {
          store.delete(id);
          deleted = true;
        }
      } catch (error) {
        fail(error);
      }
    };
    request.onerror = () => fail(request.error ?? new Error("Could not read saved project."));
    return () => undefined;
  });
  if (deleted) announceLibraryChange();
}

export async function updateLibraryProject(
  id: string,
  patch: { name?: string; favorite?: boolean; folderId?: string | null },
): Promise<LibraryProject> {
  const db = await openLibrary();
  let updated: LibraryProject | undefined;
  await transact(db, ["projects", "folders"], "readwrite", (tx, fail) => {
    const projectStore = tx.objectStore("projects");
    const folderStore = tx.objectStore("folders");
    const request = projectStore.get(id);
    request.onsuccess = () => {
      try {
        const current = parseProjectRecord(request.result);
        const save = (folderId: string | null) => {
          let data = current.data;
          let updatedAt = current.updatedAt;
          if (patch.name !== undefined) {
            const name = patch.name.trim();
            if (!name || name.length > 200 || /[\u0000-\u001f\u007f]/.test(name))
              throw new Error("Invalid project name");
            updatedAt = Date.now();
            data =
              "teams" in data
                ? { ...data, name, automaticName: false, updatedAt }
                : { ...data, title: name, updatedAt };
          }
          updated = makeLibraryProject(data, {
            createdAt: current.createdAt,
            updatedAt,
            folderId,
            favorite: patch.favorite ?? current.favorite,
          });
          projectStore.put(updated);
        };
        if (patch.folderId === undefined) save(current.folderId);
        else if (patch.folderId === null) save(null);
        else {
          const folderRequest = folderStore.get(patch.folderId);
          folderRequest.onsuccess = () => {
            if (folderRequest.result === undefined) fail(new Error("Folder not found"));
            else save(patch.folderId ?? null);
          };
          folderRequest.onerror = () =>
            fail(folderRequest.error ?? new Error("Could not read folder."));
        }
      } catch (error) {
        fail(error);
      }
    };
    request.onerror = () => fail(request.error ?? new Error("Could not read saved project."));
    return () => {
      if (!updated) throw new Error("Project update did not complete.");
      return updated;
    };
  });
  if (!updated) throw new Error("Project update did not complete.");
  announceLibraryChange();
  return updated;
}

export async function duplicateLibraryProject(
  project: LibraryProject,
  copyLabel: string,
): Promise<LibraryProject> {
  const suffix = ` (${copyLabel})`;
  const name = `${project.name.slice(0, 200 - suffix.length)}${suffix}`;
  const id = crypto.randomUUID();
  const data =
    "teams" in project.data
      ? {
          ...project.data,
          id,
          name,
          automaticName: false,
          updatedAt: Date.now(),
          shareKey: undefined,
          teams: project.data.teams.map((team) => ({ ...team, id: crypto.randomUUID() })),
        }
      : { ...project.data, id, title: name, updatedAt: Date.now() };
  const duplicate = makeLibraryProject(data, {
    createdAt: Date.now(),
    folderId: project.folderId,
  });
  const db = await openLibrary();
  await transact(db, "projects", "readwrite", (tx, fail) => {
    const store = tx.objectStore("projects");
    const request = store.get(id);
    request.onsuccess = () => {
      if (request.result !== undefined) fail(new Error("Could not allocate a new project ID."));
      else store.add(duplicate);
    };
    request.onerror = () => fail(request.error ?? new Error("Could not add project copy."));
    return () => undefined;
  });
  announceLibraryChange();
  return duplicate;
}

export async function createLibraryFolder(name: string): Promise<LibraryFolder> {
  const cleaned = validateFolderName(name);
  const folder: LibraryFolder = {
    id: crypto.randomUUID(),
    name: cleaned,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  const db = await openLibrary();
  await transact(db, "folders", "readwrite", (tx, fail) => {
    const store = tx.objectStore("folders");
    const request = store.getAll();
    request.onsuccess = () => {
      try {
        const folders = (request.result as unknown[]).map(parseLibraryFolder);
        if (folders.length >= MAX_LIBRARY_FOLDERS) throw new Error("Folder limit reached.");
        if (folders.some((item) => normaliseFolderName(item.name) === normaliseFolderName(cleaned)))
          throw new Error("A folder with this name already exists.");
        store.add(folder);
      } catch (error) {
        fail(error);
      }
    };
    request.onerror = () => fail(request.error ?? new Error("Could not read folders."));
    return () => folder;
  });
  announceLibraryChange();
  return folder;
}

export async function renameLibraryFolder(id: string, name: string): Promise<LibraryFolder> {
  const cleaned = validateFolderName(name);
  const db = await openLibrary();
  let renamed: LibraryFolder | undefined;
  await transact(db, "folders", "readwrite", (tx, fail) => {
    const store = tx.objectStore("folders");
    const foldersRequest = store.getAll();
    foldersRequest.onsuccess = () => {
      try {
        const folders = (foldersRequest.result as unknown[]).map(parseLibraryFolder);
        const current = folders.find((folder) => folder.id === id);
        if (!current) throw new Error("Folder not found");
        if (
          folders.some(
            (folder) =>
              folder.id !== id && normaliseFolderName(folder.name) === normaliseFolderName(cleaned),
          )
        )
          throw new Error("A folder with this name already exists.");
        renamed = { ...current, name: cleaned, updatedAt: Date.now() };
        store.put(renamed);
      } catch (error) {
        fail(error);
      }
    };
    foldersRequest.onerror = () =>
      fail(foldersRequest.error ?? new Error("Could not read folders."));
    return () => {
      if (!renamed) throw new Error("Folder rename did not complete.");
      return renamed;
    };
  });
  if (!renamed) throw new Error("Folder rename did not complete.");
  announceLibraryChange();
  return renamed;
}

export async function deleteLibraryFolder(id: string): Promise<void> {
  const db = await openLibrary();
  await transact(db, ["projects", "folders"], "readwrite", (tx, fail) => {
    const projects = tx.objectStore("projects");
    const folders = tx.objectStore("folders");
    const folderRequest = folders.get(id);
    folderRequest.onsuccess = () => {
      if (folderRequest.result === undefined) return;
      const projectRequest = projects.getAll();
      projectRequest.onsuccess = () => {
        try {
          for (const raw of projectRequest.result as unknown[]) {
            const project = parseProjectRecord(raw);
            if (project.folderId === id) projects.put({ ...project, folderId: null });
          }
          folders.delete(id);
        } catch (error) {
          fail(error);
        }
      };
      projectRequest.onerror = () =>
        fail(projectRequest.error ?? new Error("Could not move folder projects."));
    };
    folderRequest.onerror = () => fail(folderRequest.error ?? new Error("Could not read folder."));
    return () => undefined;
  });
  announceLibraryChange();
}

export async function saveLibraryBackup(
  backup: LibraryBackup,
  mode: "merge" | "replace",
): Promise<void> {
  const validated = parseLibraryBackup(backup);
  const db = await openLibrary();
  await transact(db, ["projects", "folders"], "readwrite", (tx, fail) => {
    const projectsStore = tx.objectStore("projects");
    const foldersStore = tx.objectStore("folders");
    const projectsRequest = projectsStore.getAll();
    const foldersRequest = foldersStore.getAll();
    let pendingReads = 2;
    let currentProjects: LibraryProject[] = [];
    let currentFolders: LibraryFolder[] = [];
    const apply = () => {
      if (--pendingReads > 0) return;
      try {
        const result = mergeLibraryBackup(currentProjects, currentFolders, validated, mode);
        projectsStore.clear();
        foldersStore.clear();
        result.projects.forEach((project) => projectsStore.put(parseLibraryProject(project)));
        result.folders.forEach((folder) => foldersStore.put(parseLibraryFolder(folder)));
      } catch (error) {
        fail(error);
      }
    };
    projectsRequest.onsuccess = () => {
      try {
        currentProjects =
          mode === "replace" ? [] : (projectsRequest.result as unknown[]).map(parseLibraryProject);
        apply();
      } catch (error) {
        fail(error);
      }
    };
    foldersRequest.onsuccess = () => {
      try {
        currentFolders =
          mode === "replace" ? [] : (foldersRequest.result as unknown[]).map(parseLibraryFolder);
        apply();
      } catch (error) {
        fail(error);
      }
    };
    projectsRequest.onerror = () =>
      fail(projectsRequest.error ?? new Error("Could not read projects."));
    foldersRequest.onerror = () =>
      fail(foldersRequest.error ?? new Error("Could not read folders."));
    return () => undefined;
  });
  announceLibraryChange();
}

export async function exportLibrary(): Promise<{
  projects: LibraryProject[];
  folders: LibraryFolder[];
}> {
  const db = await openLibrary();
  return transact(db, ["projects", "folders"], "readonly", (tx) => {
    const projectsRequest = tx.objectStore("projects").getAll();
    const foldersRequest = tx.objectStore("folders").getAll();
    return () => ({
      projects: (projectsRequest.result as unknown[]).map(parseLibraryProject),
      folders: (foldersRequest.result as unknown[]).map(parseLibraryFolder),
    });
  });
}

export async function readLegacyMigrationStatus(): Promise<LegacyMigration | undefined> {
  const db = await openLibrary();
  return transact(db, "libraryMeta", "readonly", (tx) => {
    const request = tx.objectStore("libraryMeta").get(LEGACY_MIGRATION_KEY);
    return () => request.result as LegacyMigration | undefined;
  });
}
