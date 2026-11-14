import { parseStoredBoard, type Board } from "./boards.ts";
import { validTimestamp } from "./dates.ts";
import { parseDocument, type StudioDocument } from "./studio.ts";
import { parseJsonText } from "./untrusted-json.ts";
import { onlyKeys } from "./validation.ts";

export type ProjectType = "scoreboard" | "leaderboard" | "bracket";
export type ProjectData = Board | StudioDocument;
type LibraryProjectBase<Type extends ProjectType, Data extends ProjectData> = {
  id: string;
  type: Type;
  name: string;
  createdAt: number;
  updatedAt: number;
  folderId: string | null;
  favorite: boolean;
  data: Data;
};
export type LibraryProject =
  | LibraryProjectBase<"scoreboard", Board>
  | LibraryProjectBase<"leaderboard", Extract<StudioDocument, { kind: "leaderboard" }>>
  | LibraryProjectBase<"bracket", Extract<StudioDocument, { kind: "bracket" }>>;
export type LibraryFolder = {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
};
export type LibraryBackup = {
  format: "barans-scoreboard-library";
  version: 1;
  projects: LibraryProject[];
  folders: LibraryFolder[];
};
export type ProjectSort = "recent" | "oldest" | "name-asc" | "name-desc" | "created";
export type ProjectDateGroup = "today" | "yesterday" | "this-week" | "this-month" | "older";
export type LibrarySelection = {
  kind: "all" | "recent" | "favorites" | "unfiled" | "folder";
  id?: string;
};

export const MAX_LIBRARY_BACKUP_BYTES = 10 * 1024 * 1024;
const MAX_PROJECTS = 1500;
export const MAX_LIBRARY_FOLDERS = 200;
const MAX_BACKUP_TEAMS = 5000;
const MAX_ID_LENGTH = 120;
const MAX_FOLDER_NAME_LENGTH = 80;
const MAX_PROJECT_NAME_LENGTH = 200;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value);
const validId = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0 && value.length <= MAX_ID_LENGTH;
const cleanName = (value: unknown, maxLength: number): value is string =>
  typeof value === "string" &&
  value.trim().length > 0 &&
  value.length <= maxLength &&
  !/[\u0000-\u001f\u007f]/.test(value);

function projectName(data: ProjectData): string {
  return "name" in data ? data.name : data.title;
}

function projectTimestamp(data: ProjectData): number {
  return data.updatedAt;
}

function projectType(data: ProjectData): ProjectType {
  if ("teams" in data) return "scoreboard";
  return data.kind;
}

export function makeLibraryProject(
  input: ProjectData,
  metadata: Partial<Pick<LibraryProject, "createdAt" | "updatedAt" | "folderId" | "favorite">> = {},
): LibraryProject {
  const data = "teams" in input ? parseStoredBoard(input) : parseDocument(input);
  const updatedAt = metadata.updatedAt ?? projectTimestamp(data);
  const createdAt = metadata.createdAt ?? updatedAt;
  return parseLibraryProject({
    id: data.id,
    type: projectType(data),
    name: projectName(data),
    createdAt,
    updatedAt,
    folderId: metadata.folderId ?? null,
    favorite: metadata.favorite ?? false,
    data,
  });
}

export function parseLibraryProject(value: unknown): LibraryProject {
  if (
    !isRecord(value) ||
    !onlyKeys(value, [
      "id",
      "type",
      "name",
      "createdAt",
      "updatedAt",
      "folderId",
      "favorite",
      "data",
    ]) ||
    !validId(value.id) ||
    !cleanName(value.name, MAX_PROJECT_NAME_LENGTH) ||
    !validTimestamp(value.createdAt) ||
    !validTimestamp(value.updatedAt) ||
    (value.folderId !== null && !validId(value.folderId)) ||
    typeof value.favorite !== "boolean"
  ) {
    throw new Error("Invalid library project");
  }

  const common = {
    id: value.id,
    name: value.name,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
    folderId: value.folderId,
    favorite: value.favorite,
  };
  if (value.type === "scoreboard") {
    const data = parseStoredBoard(value.data);
    if (data.id !== value.id || data.name !== value.name || data.updatedAt !== value.updatedAt)
      throw new Error("Project metadata does not match its document");
    return { ...common, type: "scoreboard", data };
  }
  if (value.type === "leaderboard") {
    const data = parseDocument(value.data);
    if (
      data.kind !== "leaderboard" ||
      data.id !== value.id ||
      data.title !== value.name ||
      data.updatedAt !== value.updatedAt
    )
      throw new Error("Project metadata does not match its document");
    return { ...common, type: "leaderboard", data };
  }
  if (value.type === "bracket") {
    const data = parseDocument(value.data);
    if (
      data.kind !== "bracket" ||
      data.id !== value.id ||
      data.title !== value.name ||
      data.updatedAt !== value.updatedAt
    )
      throw new Error("Project metadata does not match its document");
    return { ...common, type: "bracket", data };
  }
  throw new Error("Invalid project type");
}

export function parseLibraryFolder(value: unknown): LibraryFolder {
  if (
    !isRecord(value) ||
    !onlyKeys(value, ["id", "name", "createdAt", "updatedAt"]) ||
    !validId(value.id) ||
    !cleanName(value.name, MAX_FOLDER_NAME_LENGTH) ||
    !validTimestamp(value.createdAt) ||
    !validTimestamp(value.updatedAt)
  ) {
    throw new Error("Invalid library folder");
  }
  return {
    id: value.id,
    name: value.name.trim(),
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
  };
}

export function normaliseFolderName(name: string): string {
  return name.trim().normalize("NFKC").toLowerCase();
}

export function validateFolderName(name: string): string {
  const trimmed = name.trim();
  if (!cleanName(trimmed, MAX_FOLDER_NAME_LENGTH)) throw new Error("Invalid folder name");
  return trimmed;
}

export function parseLibraryBackupText(text: string): LibraryBackup {
  return parseLibraryBackup(parseJsonText(text, MAX_LIBRARY_BACKUP_BYTES, 40));
}

export function parseLibraryBackup(value: unknown): LibraryBackup {
  if (
    !isRecord(value) ||
    !onlyKeys(value, ["format", "version", "projects", "folders"]) ||
    value.format !== "barans-scoreboard-library" ||
    value.version !== 1 ||
    !Array.isArray(value.projects) ||
    value.projects.length > MAX_PROJECTS ||
    !Array.isArray(value.folders) ||
    value.folders.length > MAX_LIBRARY_FOLDERS
  ) {
    throw new Error("Unsupported library backup");
  }

  const folders = value.folders.map(parseLibraryFolder);
  const folderIds = new Set<string>();
  const folderNames = new Set<string>();
  for (const folder of folders) {
    const normalisedName = normaliseFolderName(folder.name);
    if (folderIds.has(folder.id) || folderNames.has(normalisedName))
      throw new Error("Duplicate library folder");
    folderIds.add(folder.id);
    folderNames.add(normalisedName);
  }

  const projectIds = new Set<string>();
  let teamCount = 0;
  const projects = value.projects.map((raw) => {
    const project = parseLibraryProject(raw);
    if (projectIds.has(project.id)) throw new Error("Duplicate library project");
    if (project.folderId && !folderIds.has(project.folderId))
      throw new Error("Missing project folder");
    projectIds.add(project.id);
    if (project.type === "scoreboard") {
      teamCount += project.data.teams.length;
      if (teamCount > MAX_BACKUP_TEAMS) throw new Error("Library backup is too large");
      // Sharing tokens are deliberately excluded from backups.
      const data = { ...project.data };
      delete data.shareKey;
      return { ...project, data };
    }
    return project;
  });

  return { format: "barans-scoreboard-library", version: 1, projects, folders };
}

export function makeLibraryBackup(
  projects: LibraryProject[],
  folders: LibraryFolder[],
): LibraryBackup {
  const backup = parseLibraryBackup({
    format: "barans-scoreboard-library",
    version: 1,
    projects,
    folders,
  });
  if (new TextEncoder().encode(JSON.stringify(backup)).byteLength > MAX_LIBRARY_BACKUP_BYTES)
    throw new Error("Library backup is too large");
  return backup;
}

export function mergeLibraryBackup(
  currentProjects: LibraryProject[],
  currentFolders: LibraryFolder[],
  incoming: LibraryBackup,
  mode: "merge" | "replace",
): Pick<LibraryBackup, "projects" | "folders"> {
  const projects = mode === "replace" ? [] : currentProjects.map(parseLibraryProject);
  const folders = mode === "replace" ? [] : currentFolders.map(parseLibraryFolder);
  const folderIdMap = new Map<string, string>();
  const existingFolders = new Map(
    folders.map((folder) => [normaliseFolderName(folder.name), folder.id]),
  );

  for (const folder of incoming.folders) {
    const existingId = existingFolders.get(normaliseFolderName(folder.name));
    if (existingId) {
      folderIdMap.set(folder.id, existingId);
      continue;
    }
    const id = folders.some((existing) => existing.id === folder.id)
      ? crypto.randomUUID()
      : folder.id;
    const copy = { ...folder, id };
    folders.push(copy);
    folderIdMap.set(folder.id, id);
    existingFolders.set(normaliseFolderName(copy.name), id);
  }

  const ids = new Set(projects.map((project) => project.id));
  for (const incomingProject of incoming.projects) {
    let id = incomingProject.id;
    while (ids.has(id)) id = crypto.randomUUID();
    ids.add(id);
    const data =
      id === incomingProject.id
        ? incomingProject.data
        : ({ ...incomingProject.data, id } as ProjectData);
    projects.push(
      makeLibraryProject(data, {
        createdAt: incomingProject.createdAt,
        updatedAt: incomingProject.updatedAt,
        folderId: incomingProject.folderId
          ? (folderIdMap.get(incomingProject.folderId) ?? null)
          : null,
        favorite: incomingProject.favorite,
      }),
    );
  }

  if (projects.length > MAX_PROJECTS || folders.length > MAX_LIBRARY_FOLDERS)
    throw new Error("Library is too large to merge this backup");
  let teamCount = 0;
  for (const project of projects) {
    if (project.type === "scoreboard") {
      teamCount += project.data.teams.length;
      if (teamCount > MAX_BACKUP_TEAMS)
        throw new Error("Library is too large to merge this backup");
    }
  }

  return { projects, folders };
}

export function groupProjectsByDate(
  projects: LibraryProject[],
  now = Date.now(),
  by: "modified" | "created" = "modified",
): { key: ProjectDateGroup; projects: LibraryProject[] }[] {
  const groups = new Map<ProjectDateGroup, LibraryProject[]>([
    ["today", []],
    ["yesterday", []],
    ["this-week", []],
    ["this-month", []],
    ["older", []],
  ]);
  for (const project of projects) {
    const timestamp = by === "created" ? project.createdAt : project.updatedAt;
    groups.get(dateGroup(timestamp, now))?.push(project);
  }
  return [...groups]
    .filter(([, items]) => items.length > 0)
    .map(([key, items]) => ({ key, projects: items }));
}

function dateGroup(timestamp: number, nowTimestamp: number): ProjectDateGroup {
  const date = new Date(timestamp);
  const now = new Date(nowTimestamp);
  const dayNumber = (value: Date) =>
    Date.UTC(value.getFullYear(), value.getMonth(), value.getDate());
  const elapsedDays = Math.floor((dayNumber(now) - dayNumber(date)) / 86_400_000);
  if (elapsedDays <= 0) return "today";
  if (elapsedDays === 1) return "yesterday";
  const mondayOffset = (now.getDay() + 6) % 7;
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - mondayOffset);
  if (dayNumber(date) >= dayNumber(monday)) return "this-week";
  if (date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth())
    return "this-month";
  return "older";
}

export function sortLibraryProjects(
  projects: LibraryProject[],
  sort: ProjectSort,
  lang: "en" | "bg" | "tr",
): LibraryProject[] {
  return [...projects].sort((a, b) => {
    if (sort === "oldest") return a.updatedAt - b.updatedAt || a.name.localeCompare(b.name, lang);
    if (sort === "created") return b.createdAt - a.createdAt || a.name.localeCompare(b.name, lang);
    if (sort === "name-asc")
      return a.name.localeCompare(b.name, lang, { sensitivity: "base", numeric: true });
    if (sort === "name-desc")
      return b.name.localeCompare(a.name, lang, { sensitivity: "base", numeric: true });
    return b.updatedAt - a.updatedAt || a.name.localeCompare(b.name, lang);
  });
}

export function filterLibraryProjects(
  projects: LibraryProject[],
  options: {
    selection: LibrarySelection;
    type: ProjectType | "all";
    search: string;
    folders: ReadonlyMap<string, LibraryFolder>;
    now?: number;
  },
  lang: "en" | "bg" | "tr",
): LibraryProject[] {
  const now = options.now ?? Date.now();
  let result = projects;
  if (options.selection.kind === "recent") {
    const cutoff = now - 7 * 86_400_000;
    result = result.filter((project) => project.updatedAt >= cutoff);
  } else if (options.selection.kind === "favorites") {
    result = result.filter((project) => project.favorite);
  } else if (options.selection.kind === "unfiled") {
    result = result.filter((project) => !project.folderId);
  } else if (options.selection.kind === "folder") {
    result = result.filter((project) => project.folderId === options.selection.id);
  }
  if (options.type !== "all") result = result.filter((project) => project.type === options.type);
  const query = options.search
    .trim()
    .toLocaleLowerCase(lang === "en" ? "en-GB" : lang === "bg" ? "bg-BG" : "tr-TR");
  if (!query) return result;
  return result.filter((project) => {
    const folderName = project.folderId ? (options.folders.get(project.folderId)?.name ?? "") : "";
    return `${project.name} ${folderName}`
      .toLocaleLowerCase(lang === "en" ? "en-GB" : lang === "bg" ? "bg-BG" : "tr-TR")
      .includes(query);
  });
}
