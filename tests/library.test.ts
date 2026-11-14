import { test } from "node:test";
import assert from "node:assert/strict";
import "fake-indexeddb/auto";
import { newBoard, parseStoredBoard } from "../src/lib/boards.ts";
import { newBracket } from "../src/lib/brackets.ts";
import { newLeaderboard } from "../src/lib/studio.ts";
import {
  groupProjectsByDate,
  filterLibraryProjects,
  makeLibraryBackup,
  makeLibraryProject,
  mergeLibraryBackup,
  parseLibraryBackup,
  parseLibraryBackupText,
  sortLibraryProjects,
  type LibraryFolder,
} from "../src/lib/library.ts";
import { libraryCopy, projectCount } from "../src/lib/library-copy.ts";
import { defaultTimer } from "../src/lib/timer.ts";
import {
  createLibraryFolder,
  deleteLibraryFolder,
  deleteLibraryProject,
  duplicateLibraryProject,
  exportLibrary,
  listStudioDocuments,
  loadBoards,
  loadLibrary,
  readLegacyMigrationStatus,
  renameLibraryFolder,
  saveBoards,
  saveLibraryBackup,
  saveStudioDocument,
  updateLibraryProject,
} from "../src/store/library.ts";

function openDatabase(name: string, version: number): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, version);
    request.onupgradeneeded = () => {
      if (name === "scoreboard" && !request.result.objectStoreNames.contains("boards"))
        request.result.createObjectStore("boards", { keyPath: "id" });
      if (name === "scoreboard-studio" && !request.result.objectStoreNames.contains("documents"))
        request.result.createObjectStore("documents", { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function putRecord(db: IDBDatabase, storeName: string, record: unknown): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, "readwrite");
    tx.objectStore(storeName).put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = tx.onabort = () => reject(tx.error);
  });
}

const project = (type: "scoreboard" | "leaderboard" | "bracket", now: number) => {
  const data =
    type === "scoreboard"
      ? { ...newBoard("Friendly match", "Team"), updatedAt: now }
      : type === "leaderboard"
        ? { ...newLeaderboard(), updatedAt: now }
        : { ...newBracket(), updatedAt: now };
  return makeLibraryProject(data, { createdAt: now });
};

test("library projects validate tool data, type, identity and folder references", () => {
  const now = Date.now();
  const board = project("scoreboard", now);
  const backup = parseLibraryBackup({
    format: "barans-scoreboard-library",
    version: 1,
    folders: [{ id: "folder-one", name: "Club", createdAt: now, updatedAt: now }],
    projects: [{ ...board, folderId: "folder-one" }],
  });

  assert.equal(backup.projects[0].type, "scoreboard");
  assert.throws(() => parseLibraryBackup({ ...backup, projects: [{ ...board, type: "bracket" }] }));
  assert.throws(() => parseLibraryBackup({ ...backup, projects: [{ ...board, id: "different" }] }));
  assert.throws(() =>
    parseLibraryBackup({ ...backup, projects: [{ ...board, folderId: "missing" }] }),
  );

  const polluted = JSON.parse(JSON.stringify(backup)) as Record<string, unknown>;
  Object.defineProperty(polluted, "__proto__", { value: { polluted: true }, enumerable: true });
  assert.throws(() => parseLibraryBackup(polluted));
});

test("library backup text enforces byte and nesting limits before parsing", () => {
  assert.throws(() => parseLibraryBackupText(" ".repeat(10_485_761)));
  assert.throws(() => parseLibraryBackupText("[".repeat(33) + "0" + "]".repeat(33)));
});

test("merge remaps colliding project IDs and reuses same-name folders without overwriting", () => {
  const now = Date.now();
  const existing = project("scoreboard", now);
  const existingFolder = { id: "existing-folder", name: "Club", createdAt: now, updatedAt: now };
  const incoming = parseLibraryBackup({
    format: "barans-scoreboard-library",
    version: 1,
    folders: [{ id: "incoming-folder", name: "Club", createdAt: now, updatedAt: now }],
    projects: [
      makeLibraryProject(
        { ...newBracket(), id: existing.id, updatedAt: now },
        { folderId: "incoming-folder" },
      ),
    ],
  });

  const merged = mergeLibraryBackup([existing], [existingFolder], incoming, "merge");
  assert.equal(merged.projects.length, 2);
  assert.equal(merged.projects[0].id, existing.id);
  assert.notEqual(merged.projects[1].id, existing.id);
  assert.equal(merged.projects[1].type, "bracket");
  assert.equal(merged.projects[1].folderId, existingFolder.id);
  assert.equal(merged.folders.length, 1);
});

test("date grouping uses local calendar days and Monday week boundaries", () => {
  const now = new Date(2026, 10, 14, 12).getTime(); // Saturday, local time
  const dates = [
    ["today", new Date(2026, 10, 14, 8).getTime()],
    ["yesterday", new Date(2026, 10, 13, 23).getTime()],
    ["this-week", new Date(2026, 10, 9, 9).getTime()],
    ["this-month", new Date(2026, 10, 2, 9).getTime()],
    ["older", new Date(2026, 9, 31, 23).getTime()],
  ] as const;
  const projects = dates.map(([name, updatedAt]) => ({
    ...project("scoreboard", updatedAt),
    name,
  }));

  assert.deepEqual(
    groupProjectsByDate(projects, now).map(({ key, projects: items }) => [
      key,
      items.map((item) => item.name),
    ]),
    dates.map(([key]) => [key, [key]]),
  );
  assert.deepEqual(
    sortLibraryProjects(projects, "name-asc", "en").map((item) => item.name),
    ["older", "this-month", "this-week", "today", "yesterday"],
  );
});

test("library filtering searches project and folder names with locale-aware casing", () => {
  const now = Date.now();
  const folder: LibraryFolder = {
    id: "folder-one",
    name: "Işık turnuvası",
    createdAt: now,
    updatedAt: now,
  };
  const attached = {
    ...project("bracket", now),
    name: "Bahar kupası",
    folderId: folder.id,
    favorite: true,
  };
  const unfiled = project("leaderboard", now);
  const folders = new Map([[folder.id, folder]]);

  assert.deepEqual(
    filterLibraryProjects(
      [attached, unfiled],
      { selection: { kind: "all" }, type: "all", search: "ışık", folders, now },
      "tr",
    ).map(({ id }) => id),
    [attached.id],
  );
  assert.deepEqual(
    filterLibraryProjects(
      [attached, unfiled],
      { selection: { kind: "favorites" }, type: "bracket", search: "", folders, now },
      "tr",
    ).map(({ id }) => id),
    [attached.id],
  );
  assert.deepEqual(
    filterLibraryProjects(
      [attached, unfiled],
      { selection: { kind: "unfiled" }, type: "all", search: "", folders, now },
      "en",
    ).map(({ id }) => id),
    [unfiled.id],
  );
});

test("all supported tool kinds survive versioned backup validation", () => {
  const now = Date.now();
  const parsed = parseLibraryBackup({
    format: "barans-scoreboard-library",
    version: 1,
    folders: [],
    projects: [project("scoreboard", now), project("leaderboard", now), project("bracket", now)],
  });

  assert.deepEqual(
    parsed.projects.map((item) => item.type),
    ["scoreboard", "leaderboard", "bracket"],
  );

  const privateLinkBoard = makeLibraryProject({
    ...newBoard("Shared game", "Team"),
    shareKey: "share-token",
    updatedAt: now,
  });
  const exported = makeLibraryBackup([privateLinkBoard], []);
  assert.equal("shareKey" in exported.projects[0].data, false);
});

test("an oversized library export fails instead of producing a backup the importer rejects", () => {
  const template = newLeaderboard();
  const columns = Array.from({ length: 10 }, () => "C".repeat(80));
  const rows = Array.from({ length: 100 }, (_, index) => ({
    id: `row-${index}`,
    cells: Array.from({ length: 10 }, () => "x".repeat(200)),
    highlighted: false,
  }));
  const projects = Array.from({ length: 60 }, (_, index) =>
    makeLibraryProject({
      ...template,
      id: `big-${index}`,
      title: `Large ${index}`,
      columns,
      rows: rows.map((row) => ({ ...row, id: `${index}-${row.id}` })),
    }),
  );

  assert.throws(() => makeLibraryBackup(projects, []), /too large/);
});

test("library controls are localised and project counts follow each language", () => {
  assert.deepEqual(Object.keys(libraryCopy.en).sort(), Object.keys(libraryCopy.bg).sort());
  assert.deepEqual(Object.keys(libraryCopy.en).sort(), Object.keys(libraryCopy.tr).sort());
  assert.equal(projectCount(1, "en"), "1 project");
  assert.equal(projectCount(2, "en"), "2 projects");
  assert.equal(projectCount(2, "bg"), "2 таблици");
  assert.equal(projectCount(2, "tr"), "2 tablo");
});

test("first library open migrates saved scoreboards and Studio documents without deleting legacy records", async () => {
  const freshBoard = newBoard("Legacy scoreboard", "Team");
  const oldBoard = {
    ...freshBoard,
    updatedAt: Date.now(),
    color: "#224466",
    textColor: "#ffffff",
    themeId: "classic-green",
    timer: defaultTimer,
    shareKey: "previous-share-key",
    teams: freshBoard.teams.map((team, index) => ({
      ...team,
      color: index ? "#884422" : "#225588",
    })),
  };
  const oldLeaderboard = { ...newLeaderboard(), title: "Legacy standings", updatedAt: Date.now() };
  const oldBracket = { ...newBracket(), title: "Legacy bracket", updatedAt: Date.now() };
  const boardDb = await openDatabase("scoreboard", 1);
  await putRecord(boardDb, "boards", oldBoard);
  await putRecord(boardDb, "boards", { id: "malformed-legacy", teams: "not a list" });
  boardDb.close();
  const studioDb = await openDatabase("scoreboard-studio", 1);
  await putRecord(studioDb, "documents", oldLeaderboard);
  await putRecord(studioDb, "documents", oldBracket);
  studioDb.close();

  const library = await loadLibrary();
  assert.deepEqual(library.projects.map((item) => item.type).sort(), [
    "bracket",
    "leaderboard",
    "scoreboard",
  ]);
  assert.deepEqual(
    (await loadBoards()).find((board) => board.id === oldBoard.id),
    parseStoredBoard(oldBoard),
  );
  assert.equal((await listStudioDocuments()).length, 2);
  const migrationStatus = await readLegacyMigrationStatus();
  assert.equal(typeof migrationStatus?.migratedAt, "number");
  assert.equal(migrationStatus?.skipped, 1);
  assert.equal(library.issues, 1);
  assert.equal((await loadLibrary()).projects.length, library.projects.length);

  const verifyDb = await openDatabase("scoreboard", 2);
  const oldValue = await new Promise<unknown>((resolve, reject) => {
    const tx = verifyDb.transaction("boards", "readonly");
    const request = tx.objectStore("boards").get(oldBoard.id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  verifyDb.close();
  assert.deepEqual(oldValue, oldBoard);
});

test("folder and project operations persist metadata and retain editable document data", async () => {
  const now = Date.now();
  const board = {
    ...newBoard("Practice", "Side"),
    shareKey: "share-link-token",
    updatedAt: now,
  };
  const leaderboardBase = newLeaderboard();
  const leaderboard = {
    ...leaderboardBase,
    updatedAt: now,
    title: "Quiz standings",
    columnWidths: [180, 140],
    rows: leaderboardBase.rows.map((row, index) => ({
      ...row,
      cells: [index ? "East" : "West", index ? "8" : "13"],
      highlighted: index === 0,
    })),
  };
  const bracketBase = newBracket();
  const bracket = {
    ...bracketBase,
    updatedAt: now,
    title: "Weekend cup",
    layout: "single" as const,
    participants: bracketBase.participants.map((participant, index) => ({
      ...participant,
      name: `Club ${index + 1}`,
    })),
  };
  await saveBoards([board]);
  await saveStudioDocument(leaderboard);
  await saveStudioDocument(bracket);
  await assert.rejects(saveStudioDocument({ ...leaderboard, id: board.id }));
  await assert.rejects(saveBoards([{ ...board, id: leaderboard.id }]));
  const folder = await createLibraryFolder("Weekend matches");
  await assert.rejects(createLibraryFolder(" weekend matches "));

  const savedStudioProjects = (await loadLibrary()).projects;
  const savedLeaderboard = savedStudioProjects.find((item) => item.id === leaderboard.id);
  const savedBracket = savedStudioProjects.find((item) => item.id === bracket.id);
  assert.deepEqual(savedLeaderboard?.data, leaderboard);
  assert.deepEqual(savedBracket?.data, bracket);

  await updateLibraryProject(board.id, { favorite: true, folderId: folder.id });
  const renamed = await updateLibraryProject(leaderboard.id, { name: "Quiz rankings" });
  assert.equal("kind" in renamed.data && renamed.data.kind, "leaderboard");
  assert.equal("title" in renamed.data && renamed.data.title, "Quiz rankings");

  const changedBoard = { ...board, teams: board.teams.map((team) => ({ ...team, score: 9 })) };
  await saveBoards([changedBoard]);
  const refreshed = await loadLibrary();
  const savedBoard = refreshed.projects.find((item) => item.id === board.id)!;
  assert.equal(savedBoard.favorite, true);
  assert.equal(savedBoard.folderId, folder.id);
  assert.equal("teams" in savedBoard.data && savedBoard.data.teams[0].score, 9);

  const duplicate = await duplicateLibraryProject(savedBoard, "copy");
  assert.notEqual(duplicate.id, board.id);
  assert.equal(duplicate.folderId, folder.id);
  assert.equal("teams" in duplicate.data && duplicate.data.shareKey, undefined);
  assert.equal(
    "teams" in duplicate.data && duplicate.data.teams[0].id === board.teams[0].id,
    false,
  );

  const renamedFolder = await renameLibraryFolder(folder.id, "Club games");
  assert.equal(renamedFolder.name, "Club games");
  await deleteLibraryFolder(folder.id);
  const afterDelete = await loadLibrary();
  assert.equal(afterDelete.projects.find((item) => item.id === board.id)?.folderId, null);
  assert.equal(
    afterDelete.folders.some((item) => item.id === folder.id),
    false,
  );
  await deleteLibraryProject(duplicate.id, duplicate.type);
});

test("backup import merges with collision remapping and replaces atomically after validation", async () => {
  const current = await exportLibrary();
  const existing = current.projects[0];
  assert.ok(existing);
  const incoming = parseLibraryBackup({
    format: "barans-scoreboard-library",
    version: 1,
    folders: [
      { id: "backup-folder", name: "Away games", createdAt: Date.now(), updatedAt: Date.now() },
    ],
    projects: [{ ...existing, folderId: "backup-folder", favorite: false }],
  });
  await saveLibraryBackup(incoming, "merge");
  let merged = await exportLibrary();
  assert.equal(merged.projects.length, current.projects.length + 1);
  const importedCopy = merged.projects.find(
    (item) => item.id !== existing.id && item.name === existing.name,
  );
  assert.ok(importedCopy);
  assert.notEqual(importedCopy.id, existing.id);
  assert.ok(merged.folders.some((item) => item.name === "Away games"));

  const beforeInvalid = await exportLibrary();
  await assert.rejects(saveLibraryBackup({ ...incoming, version: 9 } as never, "replace"));
  assert.deepEqual(await exportLibrary(), beforeInvalid);

  await saveLibraryBackup(incoming, "replace");
  merged = await exportLibrary();
  assert.equal(merged.projects.length, 1);
  assert.equal(merged.projects[0].id, existing.id);
  assert.equal(merged.folders.length, 1);

  const db = await openDatabase("scoreboard", 2);
  await putRecord(db, "projects", { id: "damaged-project", type: "unknown" });
  db.close();
  assert.equal((await loadLibrary()).issues, 2);
  await saveLibraryBackup(incoming, "replace");
  assert.equal((await loadLibrary()).issues, 1);
  assert.deepEqual(await exportLibrary(), {
    projects: incoming.projects,
    folders: incoming.folders,
  });
});
