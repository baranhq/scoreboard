"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Clock3,
  Copy,
  Download,
  Ellipsis,
  FileText,
  Folder,
  FolderInput,
  FolderPlus,
  GitBranch,
  Heart,
  Inbox,
  LayoutGrid,
  List,
  ListOrdered,
  Plus,
  Search,
  Star,
  Trash2,
  Trophy,
  Upload,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { newBoard, parseBackup, displayBoard, MAX_BACKUP_BYTES } from "@/lib/boards";
import { newBracket } from "@/lib/brackets";
import {
  locale,
  libraryCopy,
  interpolate,
  projectCount,
  type LibraryCopy,
} from "@/lib/library-copy";
import {
  groupProjectsByDate,
  filterLibraryProjects,
  MAX_LIBRARY_BACKUP_BYTES,
  makeLibraryBackup,
  parseLibraryBackup,
  sortLibraryProjects,
  type LibraryBackup,
  type LibraryFolder,
  type LibraryProject,
  type LibrarySelection,
  type ProjectDateGroup,
  type ProjectSort,
  type ProjectType,
} from "@/lib/library";
import { route } from "@/lib/routes";
import { studioCopy } from "@/lib/studio-copy";
import { newLeaderboard } from "@/lib/studio";
import { readJsonFile } from "@/lib/untrusted-json";
import {
  createLibraryFolder,
  deleteLibraryFolder,
  deleteLibraryProject,
  duplicateLibraryProject,
  exportLibrary,
  loadLibrary,
  renameLibraryFolder,
  saveBoards,
  saveLibraryBackup,
  saveStudioDocument,
  subscribeLibrary,
  updateLibraryProject,
} from "@/store/library";
import { Button, Modal } from "@/components/ui/ui";
import { Dropdown, MenuItem } from "@/components/ui/dropdown";
import { useConfirmation } from "@/components/ui/use-confirmation";
import type { Lang, Messages } from "@/lib/i18n";

type Selection = LibrarySelection;
type ViewMode = "list" | "grid";
type GroupMode = "modified" | "created" | "none";
type DialogState =
  | { kind: "project-name"; project: LibraryProject }
  | { kind: "folder-name"; folder?: LibraryFolder }
  | { kind: "move"; project: LibraryProject }
  | { kind: "import"; backup: LibraryBackup; legacy: boolean }
  | null;

const groupLabel: Record<ProjectDateGroup, keyof LibraryCopy> = {
  today: "today",
  yesterday: "yesterday",
  "this-week": "thisWeek",
  "this-month": "thisMonth",
  older: "older",
};

function projectHref(lang: Lang, project: LibraryProject): string {
  if (project.type === "scoreboard")
    return `${route(lang, "scoreboard")}#board=${encodeURIComponent(project.id)}`;
  const page = project.type === "leaderboard" ? "leaderboardEditor" : "bracketEditor";
  return `${route(lang, page)}#table=${encodeURIComponent(project.id)}`;
}

function projectIcon(type: ProjectType) {
  if (type === "scoreboard") return Trophy;
  if (type === "leaderboard") return ListOrdered;
  return GitBranch;
}

function projectSummary(
  project: LibraryProject,
  lang: Lang,
  t: (typeof libraryCopy)[Lang],
): string {
  const number = new Intl.NumberFormat(locale[lang]);
  if (project.type === "scoreboard" && "teams" in project.data) {
    const leaders = [...project.data.teams]
      .sort((a, b) => b.score - a.score)
      .slice(0, 2)
      .map((team) => `${team.name} ${number.format(team.score)}`)
      .join(" · ");
    return interpolate(t.teamPreview, { count: project.data.teams.length, leaders });
  }
  if (
    project.type === "leaderboard" &&
    "kind" in project.data &&
    project.data.kind === "leaderboard"
  ) {
    const rows = project.data.rows
      .slice(0, 2)
      .map((row) => {
        const scoreIndex = project.data.totalColumn ?? project.data.columns.length - 1;
        return `${row.cells[0]} ${row.cells[scoreIndex]}`.trim();
      })
      .join(" · ");
    return interpolate(t.leaderboardPreview, { count: project.data.rows.length, leaders: rows });
  }
  if (project.type === "bracket" && "participants" in project.data) {
    const rounds = Math.ceil(Math.log2(project.data.participants.length));
    return interpolate(t.bracketPreview, { count: project.data.participants.length, rounds });
  }
  return "";
}

function downloadJson(filename: string, value: unknown): void {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function safeFilename(value: string): string {
  return (
    value
      .normalize("NFKC")
      .replace(/[^\p{L}\p{N}-]+/gu, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80) || "project"
  );
}

function storageErrorMessage(error: unknown, t: LibraryCopy): string {
  if (error instanceof Error && /close other .* tabs/i.test(error.message)) return t.closeOtherTabs;
  return t.storageError;
}

export function SavedBoards({ lang, t: appMessages }: { lang: Lang; t: Messages }) {
  const t = libraryCopy[lang];
  const studio = studioCopy[lang];
  const [projects, setProjects] = useState<LibraryProject[]>([]);
  const [folders, setFolders] = useState<LibraryFolder[]>([]);
  const [issues, setIssues] = useState(0);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [selection, setSelection] = useState<Selection>({ kind: "all" });
  const [search, setSearch] = useState("");
  const [type, setType] = useState<ProjectType | "all">("all");
  const [sort, setSort] = useState<ProjectSort>("recent");
  const [group, setGroup] = useState<GroupMode>("modified");
  const [view, setView] = useState<ViewMode>("list");
  const [dialog, setDialog] = useState<DialogState>(null);
  const [dialogValue, setDialogValue] = useState("");
  const [dialogError, setDialogError] = useState("");
  const [moveTo, setMoveTo] = useState<string>("");
  const fileInput = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { confirm, dialog: confirmationDialog } = useConfirmation({
    confirmationTitle: studio.confirmationTitle,
    cancel: t.cancel,
    continue: t.confirm,
    close: studio.close,
  });

  const refresh = useCallback(async () => {
    try {
      const snapshot = await loadLibrary();
      setProjects(snapshot.projects);
      setFolders(snapshot.folders);
      setSelection((current) =>
        current.kind === "folder" && !snapshot.folders.some((folder) => folder.id === current.id)
          ? { kind: "all" }
          : current,
      );
      setIssues(snapshot.issues);
      setReady(true);
    } catch (error) {
      setMessage(storageErrorMessage(error, t));
      setReady(true);
    }
  }, [t.storageError]);

  useEffect(() => {
    void refresh();
    return subscribeLibrary(() => void refresh());
  }, [refresh]);

  const folderById = useMemo(
    () => new Map(folders.map((folder) => [folder.id, folder])),
    [folders],
  );
  const recentCount = useMemo(() => {
    const cutoff = Date.now() - 7 * 86_400_000;
    return projects.filter((project) => project.updatedAt >= cutoff).length;
  }, [projects]);
  const favoriteCount = useMemo(
    () => projects.filter((project) => project.favorite).length,
    [projects],
  );
  const unfiledCount = useMemo(
    () => projects.filter((project) => !project.folderId).length,
    [projects],
  );
  const folderCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const project of projects)
      if (project.folderId) counts.set(project.folderId, (counts.get(project.folderId) ?? 0) + 1);
    return counts;
  }, [projects]);

  const visibleProjects = useMemo(() => {
    return sortLibraryProjects(
      filterLibraryProjects(projects, { selection, type, search, folders: folderById }, lang),
      sort,
      lang,
    );
  }, [folderById, lang, projects, search, selection, sort, type]);

  const groupedProjects = useMemo(() => {
    if (group === "none") return [{ key: "projects" as const, projects: visibleProjects }];
    return groupProjectsByDate(visibleProjects, Date.now(), group);
  }, [group, visibleProjects]);

  const startProject = async (projectType: ProjectType) => {
    if (busy) return;
    setBusy(true);
    setMessage("");
    try {
      const now = Date.now();
      if (projectType === "scoreboard") {
        const board = { ...newBoard(appMessages.board, appMessages.team), updatedAt: now };
        await saveBoards([board]);
        router.push(`${route(lang, "scoreboard")}#board=${encodeURIComponent(board.id)}`);
      } else if (projectType === "leaderboard") {
        const document = { ...newLeaderboard(), title: t.newLeaderboard, updatedAt: now };
        await saveStudioDocument(document);
        router.push(`${route(lang, "leaderboardEditor")}#table=${encodeURIComponent(document.id)}`);
      } else {
        const document = { ...newBracket(), title: t.newBracket, updatedAt: now };
        await saveStudioDocument(document);
        router.push(`${route(lang, "bracketEditor")}#table=${encodeURIComponent(document.id)}`);
      }
    } catch (error) {
      setMessage(storageErrorMessage(error, t));
    } finally {
      setBusy(false);
    }
  };

  const newMenu = (
    <Dropdown
      label={
        <>
          <Plus aria-hidden="true" className="size-4" />
          {t.newProject}
        </>
      }
      ariaLabel={t.newProject}
      disabled={!ready || busy}
      triggerClassName="!min-h-10 !rounded-lg !bg-action !px-3 !text-sm !font-semibold !text-on-action hover:!brightness-95 sm:!min-h-11 sm:!px-4"
    >
      <MenuItem onClick={() => void startProject("scoreboard")}>
        <Trophy aria-hidden="true" className="size-4" />
        {t.newScoreboard}
      </MenuItem>
      <MenuItem onClick={() => void startProject("leaderboard")}>
        <ListOrdered aria-hidden="true" className="size-4" />
        {t.newLeaderboard}
      </MenuItem>
      <MenuItem onClick={() => void startProject("bracket")}>
        <GitBranch aria-hidden="true" className="size-4" />
        {t.newBracket}
      </MenuItem>
    </Dropdown>
  );

  const openFolderDialog = (folder?: LibraryFolder) => {
    setDialogValue(folder?.name ?? "");
    setDialogError("");
    setDialog({ kind: "folder-name", folder });
  };

  const deleteFolder = async (folder: LibraryFolder) => {
    const choice = await confirm(interpolate(t.folderDeleteQuestion, { name: folder.name }), {
      confirmLabel: t.deleteFolder,
      cancelLabel: t.cancel,
    });
    if (choice !== "confirm") return;
    setBusy(true);
    try {
      await deleteLibraryFolder(folder.id);
      if (selection.kind === "folder" && selection.id === folder.id) setSelection({ kind: "all" });
      setMessage(t.folderSaved);
      await refresh();
    } catch (error) {
      setMessage(storageErrorMessage(error, t));
    } finally {
      setBusy(false);
    }
  };

  const removeProject = async (project: LibraryProject) => {
    const choice = await confirm(interpolate(t.deleteProjectQuestion, { name: project.name }), {
      confirmLabel: t.delete,
      cancelLabel: t.cancel,
    });
    if (choice !== "confirm") return;
    setBusy(true);
    try {
      await deleteLibraryProject(project.id, project.type);
      setMessage(t.projectDeleted);
      await refresh();
    } catch (error) {
      setMessage(storageErrorMessage(error, t));
    } finally {
      setBusy(false);
    }
  };

  const exportOne = (project: LibraryProject) => {
    try {
      const folder = project.folderId ? folderById.get(project.folderId) : undefined;
      const backup = makeLibraryBackup([project], folder ? [folder] : []);
      downloadJson(`scoreboard-${safeFilename(project.name)}.json`, backup);
    } catch (error) {
      setMessage(
        error instanceof Error && /close other .* tabs/i.test(error.message)
          ? storageErrorMessage(error, t)
          : t.exportError,
      );
    }
  };

  const exportAll = async () => {
    setBusy(true);
    setMessage("");
    try {
      const library = await exportLibrary();
      const backup = makeLibraryBackup(library.projects, library.folders);
      downloadJson("barans-scoreboard-library.json", backup);
    } catch (error) {
      setMessage(
        error instanceof Error && /close other .* tabs/i.test(error.message)
          ? storageErrorMessage(error, t)
          : t.exportError,
      );
    } finally {
      setBusy(false);
    }
  };

  const chooseBackup = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setMessage("");
    try {
      const raw = await readJsonFile(file, MAX_LIBRARY_BACKUP_BYTES, 40);
      let backup: LibraryBackup;
      let legacy = false;
      if (
        raw &&
        typeof raw === "object" &&
        !Array.isArray(raw) &&
        (raw as { format?: unknown }).format === "scoreboard"
      ) {
        if (file.size > MAX_BACKUP_BYTES) throw new Error("Older backup is too large");
        const boards = parseBackup(raw);
        backup = makeLibraryBackup(
          boards.map((board) => {
            const now = Date.now();
            return {
              id: board.id,
              type: "scoreboard" as const,
              name: board.name,
              createdAt: board.updatedAt,
              updatedAt: board.updatedAt,
              folderId: null,
              favorite: false,
              data: board,
            };
          }),
          [],
        );
        legacy = true;
      } else backup = parseLibraryBackup(raw);
      setDialog({ kind: "import", backup, legacy });
    } catch {
      setMessage(t.importError);
    } finally {
      setBusy(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const confirmImport = async (mode: "merge" | "replace") => {
    if (!dialog || dialog.kind !== "import" || busy) return;
    setBusy(true);
    setMessage("");
    try {
      if (mode === "replace") {
        const choice = await confirm(t.replaceQuestion, {
          confirmLabel: t.replace,
          cancelLabel: t.cancel,
        });
        if (choice !== "confirm") return;
      }
      await saveLibraryBackup(dialog.backup, mode);
      setDialog(null);
      setMessage(t.imported);
      await refresh();
    } catch (error) {
      setDialog(null);
      setMessage(
        error instanceof Error && /close other .* tabs/i.test(error.message)
          ? storageErrorMessage(error, t)
          : t.importError,
      );
    } finally {
      setBusy(false);
    }
  };

  const saveDialog = async () => {
    if (!dialog || busy) return;
    setBusy(true);
    setMessage("");
    setDialogError("");
    try {
      if (dialog.kind === "project-name") {
        await updateLibraryProject(dialog.project.id, { name: dialogValue });
        setMessage(t.saved);
      } else if (dialog.kind === "folder-name") {
        if (dialog.folder) await renameLibraryFolder(dialog.folder.id, dialogValue);
        else await createLibraryFolder(dialogValue);
        setMessage(t.folderSaved);
      } else if (dialog.kind === "move") {
        await updateLibraryProject(dialog.project.id, { folderId: moveTo || null });
        setMessage(t.saved);
      }
      setDialog(null);
      setDialogError("");
      await refresh();
    } catch (error) {
      if (error instanceof Error && error.message === "A folder with this name already exists.")
        setDialogError(t.folderExists);
      else if (error instanceof Error && error.message === "Folder limit reached.")
        setDialogError(t.folderLimit);
      else if (error instanceof Error && error.message === "Invalid folder name")
        setDialogError(interpolate(t.invalidName, { count: 80 }));
      else if (error instanceof Error && error.message === "Invalid project name")
        setDialogError(interpolate(t.invalidName, { count: 200 }));
      else setDialogError(storageErrorMessage(error, t));
    } finally {
      setBusy(false);
    }
  };

  const selectFolder = (folder: LibraryFolder) => setSelection({ kind: "folder", id: folder.id });
  const selectedLabel =
    selection.kind === "folder"
      ? (folderById.get(selection.id ?? "")?.name ?? t.all)
      : selection.kind === "all"
        ? t.all
        : selection.kind === "recent"
          ? t.recent
          : selection.kind === "favorites"
            ? t.favorites
            : t.unfiled;

  const renderVirtualSelection = (): ReactNode => (
    <>
      <SectionButton
        icon={<Inbox aria-hidden="true" />}
        label={t.all}
        count={projects.length}
        selected={selection.kind === "all"}
        onClick={() => setSelection({ kind: "all" })}
      />
      <SectionButton
        icon={<Clock3 aria-hidden="true" />}
        label={t.recent}
        count={recentCount}
        selected={selection.kind === "recent"}
        onClick={() => setSelection({ kind: "recent" })}
      />
      <SectionButton
        icon={<Heart aria-hidden="true" />}
        label={t.favorites}
        count={favoriteCount}
        selected={selection.kind === "favorites"}
        onClick={() => setSelection({ kind: "favorites" })}
      />
      <SectionButton
        icon={<Folder aria-hidden="true" />}
        label={t.unfiled}
        count={unfiledCount}
        selected={selection.kind === "unfiled"}
        onClick={() => setSelection({ kind: "unfiled" })}
      />
    </>
  );

  const renderFolders = (mobile = false): ReactNode =>
    folders.map((folder) => (
      <div
        key={folder.id}
        className={`group/folder flex min-w-0 items-center ${mobile ? "shrink-0" : ""}`}
      >
        <button
          type="button"
          onClick={() => selectFolder(folder)}
          aria-pressed={selection.kind === "folder" && selection.id === folder.id}
          className={`flex min-h-10 min-w-0 flex-1 items-center gap-2 rounded-lg px-2.5 text-left text-sm transition-colors motion-reduce:transition-none ${selection.kind === "folder" && selection.id === folder.id ? "bg-action/10 font-semibold text-action" : "hover:bg-forest/5"} ${mobile ? "max-w-52" : ""}`}
        >
          <Folder aria-hidden="true" className="size-4 shrink-0" />
          <span className="min-w-0 flex-1 truncate">{folder.name}</span>
          <span className="shrink-0 text-xs text-ink/70">{folderCounts.get(folder.id) ?? 0}</span>
        </button>
        <Dropdown
          label={<Ellipsis aria-hidden="true" className="size-4" />}
          ariaLabel={`${t.manageFolders}: ${folder.name}`}
          fitViewport
          triggerClassName="!min-h-9 !min-w-9 !px-2 opacity-70 hover:!opacity-100"
        >
          <MenuItem onClick={() => openFolderDialog(folder)}>
            <FileText aria-hidden="true" className="size-4" />
            {t.rename}
          </MenuItem>
          <MenuItem danger onClick={() => void deleteFolder(folder)}>
            <Trash2 aria-hidden="true" className="size-4" />
            {t.deleteFolder}
          </MenuItem>
        </Dropdown>
      </div>
    ));

  const typeCounts = {
    scoreboard: projects.filter((project) => project.type === "scoreboard").length,
    leaderboard: projects.filter((project) => project.type === "leaderboard").length,
    bracket: projects.filter((project) => project.type === "bracket").length,
  };
  const importCounts =
    dialog?.kind === "import"
      ? {
          scoreboards: dialog.backup.projects.filter((project) => project.type === "scoreboard")
            .length,
          leaderboards: dialog.backup.projects.filter((project) => project.type === "leaderboard")
            .length,
          brackets: dialog.backup.projects.filter((project) => project.type === "bracket").length,
          folders: dialog.backup.folders.length,
        }
      : undefined;
  const searchActive = !!search.trim();
  const hasFilters = searchActive || type !== "all";

  return (
    <main id="main" className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {confirmationDialog}
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4 border-b border-forest/20 pb-5 sm:mb-7 sm:items-end">
        <div className="max-w-2xl min-w-0">
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            {t.title}
          </h1>
          <p className="mt-2 text-sm leading-6 text-ink/75 sm:text-base">{t.description}</p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          {newMenu}
          <Dropdown
            label={
              <>
                <Download aria-hidden="true" className="size-4" />
                {t.backup}
              </>
            }
            ariaLabel={t.backup}
            disabled={!ready || busy}
            triggerClassName="!min-h-10 !rounded-lg !border !border-forest/25 !bg-surface !px-3 !text-sm sm:!min-h-11"
          >
            <MenuItem disabled={!projects.length || busy} onClick={() => void exportAll()}>
              <Download aria-hidden="true" className="size-4" />
              {t.exportLibrary}
            </MenuItem>
            <MenuItem disabled={busy} onClick={() => fileInput.current?.click()}>
              <Upload aria-hidden="true" className="size-4" />
              {t.importBackup}
            </MenuItem>
          </Dropdown>
          <input
            ref={fileInput}
            type="file"
            accept=".json,application/json"
            className="sr-only"
            onChange={(event) => void chooseBackup(event.target.files?.[0])}
          />
        </div>
      </header>

      <p className="mb-5 flex items-start gap-2 text-xs leading-5 text-ink/65 sm:text-sm">
        <FileText aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-action" />
        <span>{t.localNote}</span>
      </p>

      {message && (
        <p
          role="status"
          className="mb-4 rounded-lg border border-forest/20 bg-surface px-3 py-2 text-sm"
        >
          {message}
        </p>
      )}
      {issues > 0 && (
        <p
          role="status"
          className="mb-4 rounded-lg border border-forest/20 bg-surface px-3 py-2 text-sm"
        >
          {t.storageIssues}
        </p>
      )}

      <div className="grid items-start gap-5 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-8">
        <aside aria-label={t.manageFolders} className="min-w-0 lg:sticky lg:top-20">
          <div className="hidden lg:block">
            <div className="flex items-center justify-between px-2 pb-2">
              <h2 className="text-xs font-semibold tracking-wide text-ink/70 uppercase">{t.all}</h2>
              <button
                type="button"
                onClick={() => openFolderDialog()}
                aria-label={t.newFolder}
                title={t.newFolder}
                className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg text-ink/70 transition-colors hover:bg-forest/5 hover:text-action focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action motion-reduce:transition-none"
              >
                <FolderPlus aria-hidden="true" className="size-4" />
              </button>
            </div>
            <nav className="grid gap-0.5" aria-label={t.manageFolders}>
              {renderVirtualSelection()}
            </nav>
            <div className="mt-5 border-t border-forest/15 pt-4">
              <div className="flex items-center justify-between px-2 pb-2">
                <h2 className="text-xs font-semibold tracking-wide text-ink/70 uppercase">
                  {t.manageFolders}
                </h2>
                <span className="text-xs text-ink/70 tabular-nums">{folders.length}</span>
              </div>
              <nav className="grid gap-0.5" aria-label={t.manageFolders}>
                {renderFolders()}
              </nav>
            </div>
          </div>

          <nav
            className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-2 lg:hidden"
            aria-label={t.manageFolders}
          >
            {renderVirtualSelection()}
            {renderFolders(true)}
            <button
              type="button"
              onClick={() => openFolderDialog()}
              aria-label={t.newFolder}
              className="inline-flex min-h-10 min-w-10 shrink-0 items-center justify-center rounded-lg border border-dashed border-forest/30 text-action hover:bg-forest/5 focus-visible:outline-2 focus-visible:outline-action"
            >
              <FolderPlus aria-hidden="true" className="size-4" />
            </button>
          </nav>
        </aside>

        <section aria-labelledby="library-heading" className="min-w-0">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <div className="min-w-0">
              <h2
                id="library-heading"
                className="font-display text-xl font-bold tracking-tight sm:text-2xl"
              >
                {selectedLabel}
              </h2>
              <p className="mt-1 text-sm text-ink/65">
                {projectCount(visibleProjects.length, lang)}
              </p>
            </div>
            {selection.kind === "folder" && selection.id && folderById.has(selection.id) && (
              <Button onClick={() => openFolderDialog(folderById.get(selection.id!))}>
                <FileText aria-hidden="true" className="size-4" />
                {t.rename}
              </Button>
            )}
          </div>

          <div className="mb-4 grid gap-2 sm:grid-cols-[minmax(12rem,1fr)_auto] sm:items-center">
            <label className="relative block min-w-0">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink/70"
              />
              <span className="sr-only">{t.search}</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t.searchPlaceholder}
                className="min-h-11 w-full rounded-lg border border-forest/20 bg-surface pr-10 pl-10 text-sm text-ink placeholder:text-ink/70 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-action"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label={t.clearSearch}
                  className="absolute top-1/2 right-2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-ink/70 hover:bg-forest/10 focus-visible:outline-2 focus-visible:outline-action"
                >
                  <X aria-hidden="true" className="size-4" />
                </button>
              )}
            </label>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-end">
              <label className="sr-only" htmlFor="library-type">
                {t.type}
              </label>
              <select
                id="library-type"
                value={type}
                onChange={(event) => setType(event.target.value as ProjectType | "all")}
                className="min-h-10 min-w-0 rounded-lg border border-forest/20 bg-surface px-2 text-sm focus-visible:outline-2 focus-visible:outline-action sm:px-3"
              >
                <option value="all">{t.allTypes}</option>
                <option value="scoreboard">
                  {t.scoreboard} · {typeCounts.scoreboard}
                </option>
                <option value="leaderboard">
                  {t.leaderboard} · {typeCounts.leaderboard}
                </option>
                <option value="bracket">
                  {t.bracket} · {typeCounts.bracket}
                </option>
              </select>
              <label className="sr-only" htmlFor="library-sort">
                {t.sort}
              </label>
              <select
                id="library-sort"
                value={sort}
                onChange={(event) => setSort(event.target.value as ProjectSort)}
                className="min-h-10 min-w-0 rounded-lg border border-forest/20 bg-surface px-2 text-sm focus-visible:outline-2 focus-visible:outline-action sm:px-3"
              >
                <option value="recent">{t.sortRecent}</option>
                <option value="oldest">{t.sortOldest}</option>
                <option value="name-asc">{t.sortNameAsc}</option>
                <option value="name-desc">{t.sortNameDesc}</option>
                <option value="created">{t.sortCreated}</option>
              </select>
            </div>
          </div>

          <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-forest/15 pb-3">
            <div className="flex min-w-0 items-center gap-2">
              <label className="sr-only" htmlFor="library-group">
                {t.group}
              </label>
              <select
                id="library-group"
                value={group}
                onChange={(event) => setGroup(event.target.value as GroupMode)}
                className="min-h-9 max-w-52 rounded-lg border border-transparent bg-transparent px-2 text-xs font-medium text-ink/70 hover:border-forest/15 focus-visible:outline-2 focus-visible:outline-action"
              >
                <option value="modified">{t.groupModified}</option>
                <option value="created">{t.groupCreated}</option>
                <option value="none">{t.groupNone}</option>
              </select>
            </div>
            <div className="flex items-center gap-1" role="group" aria-label={t.view}>
              <button
                type="button"
                aria-label={t.listView}
                aria-pressed={view === "list"}
                onClick={() => setView("list")}
                className={`inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-action motion-reduce:transition-none ${view === "list" ? "bg-action/10 text-action" : "text-ink/65 hover:bg-forest/5"}`}
              >
                <List aria-hidden="true" className="size-4" />
              </button>
              <button
                type="button"
                aria-label={t.gridView}
                aria-pressed={view === "grid"}
                onClick={() => setView("grid")}
                className={`inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-action motion-reduce:transition-none ${view === "grid" ? "bg-action/10 text-action" : "text-ink/65 hover:bg-forest/5"}`}
              >
                <LayoutGrid aria-hidden="true" className="size-4" />
              </button>
            </div>
          </div>

          {!ready ? (
            <p className="py-12 text-center text-sm text-ink/65">{t.loading}</p>
          ) : projects.length === 0 ? (
            <div className="rounded-xl border border-dashed border-forest/25 bg-surface/60 px-5 py-10 text-center sm:py-14">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-action/10 text-action">
                <Folder aria-hidden="true" className="size-6" />
              </div>
              <h3 className="font-display text-xl font-bold">{t.emptyTitle}</h3>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-ink/70">{t.emptyText}</p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">{newMenu}</div>
            </div>
          ) : visibleProjects.length === 0 ? (
            <EmptyFiltered
              title={emptyTitle(selection, hasFilters, type, t)}
              text={emptyText(selection, hasFilters, type, t)}
              actionLabel={hasFilters ? t.clearFilters : undefined}
              onClear={
                hasFilters
                  ? () => {
                      setSearch("");
                      setType("all");
                    }
                  : undefined
              }
              icon={
                searchActive || type !== "all" ? (
                  <Search aria-hidden="true" />
                ) : (
                  <Inbox aria-hidden="true" />
                )
              }
            />
          ) : (
            <div className="grid gap-6">
              {groupedProjects.map(({ key, projects: grouped }) => (
                <section key={key} aria-labelledby={`date-group-${key}`} className="min-w-0">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <h3 id={`date-group-${key}`} className="text-sm font-semibold text-ink/75">
                      {key === "projects" ? t.projectsHeading : t[groupLabel[key]]}
                    </h3>
                    <span className="text-xs text-ink/70 tabular-nums">{grouped.length}</span>
                  </div>
                  <ul
                    className={
                      view === "grid" ? "grid gap-2 sm:grid-cols-2 xl:grid-cols-3" : "grid gap-1.5"
                    }
                  >
                    {grouped.map((project) => (
                      <ProjectRow
                        key={project.id}
                        project={project}
                        lang={lang}
                        t={t}
                        appMessages={appMessages}
                        studio={studio}
                        folderName={
                          project.folderId ? folderById.get(project.folderId)?.name : undefined
                        }
                        view={view}
                        busy={busy}
                        onRename={() => {
                          setDialogValue(project.name);
                          setDialogError("");
                          setDialog({ kind: "project-name", project });
                        }}
                        onDuplicate={() => {
                          setBusy(true);
                          void duplicateLibraryProject(project, studio.copySuffix)
                            .then(() => refresh())
                            .then(() => setMessage(t.saved))
                            .catch((error) => setMessage(storageErrorMessage(error, t)))
                            .finally(() => setBusy(false));
                        }}
                        onMove={() => {
                          setMoveTo(project.folderId ?? "");
                          setDialogError("");
                          setDialog({ kind: "move", project });
                        }}
                        onFavorite={() => {
                          setBusy(true);
                          void updateLibraryProject(project.id, { favorite: !project.favorite })
                            .then(() => refresh())
                            .catch((error) => setMessage(storageErrorMessage(error, t)))
                            .finally(() => setBusy(false));
                        }}
                        onExport={() => exportOne(project)}
                        onDelete={() => void removeProject(project)}
                      />
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </section>
      </div>

      {dialog && (
        <Modal
          title={
            dialog.kind === "project-name"
              ? t.renameProjectTitle
              : dialog.kind === "folder-name"
                ? dialog.folder
                  ? t.renameFolderTitle
                  : t.createFolderTitle
                : dialog.kind === "move"
                  ? t.moveTitle
                  : t.importTitle
          }
          close={() => {
            if (!busy) setDialog(null);
          }}
          closeLabel={studio.close}
          closeDisabled={busy}
          size={dialog.kind === "import" ? "wide" : "default"}
        >
          {dialog.kind === "import" && importCounts ? (
            <div>
              <p className="text-base leading-6">{interpolate(t.importSummary, importCounts)}</p>
              {dialog.legacy && <p className="mt-2 text-sm text-ink/65">{t.oldBackup}</p>}
              <div className="mt-4 rounded-lg border border-forest/20 p-3">
                <h3 className="text-sm font-semibold">{t.importPreview}</h3>
                <ul className="mt-2 grid max-h-36 gap-1 overflow-y-auto text-sm text-ink/75">
                  {dialog.backup.projects.slice(0, 6).map((project) => (
                    <li key={project.id} className="flex min-w-0 items-center gap-2">
                      <span className="shrink-0 text-xs text-ink/70">
                        {project.type === "scoreboard"
                          ? t.scoreboard
                          : project.type === "leaderboard"
                            ? t.leaderboard
                            : t.bracket}
                      </span>
                      <span className="min-w-0 truncate">{project.name}</span>
                    </li>
                  ))}
                </ul>
                {dialog.backup.projects.length > 6 && (
                  <p className="mt-1 text-xs text-ink/70">
                    {interpolate(t.moreProjects, { count: dialog.backup.projects.length - 6 })}
                  </p>
                )}
                {dialog.backup.folders.length > 0 && (
                  <p className="mt-2 line-clamp-2 text-xs break-words text-ink/70">
                    {t.manageFolders}:{" "}
                    {dialog.backup.folders.map((folder) => folder.name).join(" · ")}
                  </p>
                )}
              </div>
              <p className="mt-4 rounded-lg bg-forest/5 p-3 text-sm leading-6 text-ink/75">
                {t.mergeNote}
              </p>
              <div className="mt-3 rounded-lg border border-forest/20 p-3 text-sm leading-6 text-ink/75">
                {t.replaceNote}
              </div>
              <div className="mt-6 flex flex-wrap justify-end gap-2">
                <Button disabled={busy} onClick={() => setDialog(null)}>
                  {t.cancel}
                </Button>
                <Button disabled={busy} onClick={() => void confirmImport("merge")}>
                  {t.merge}
                </Button>
                <Button primary disabled={busy} onClick={() => void confirmImport("replace")}>
                  {t.replace}
                </Button>
              </div>
            </div>
          ) : dialog.kind === "move" ? (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void saveDialog();
              }}
            >
              <label className="grid gap-2 text-sm font-medium">
                {t.moveTitle}
                <select
                  value={moveTo}
                  onChange={(event) => setMoveTo(event.target.value)}
                  className="min-h-11 rounded-lg border border-forest/25 bg-surface px-3 text-base focus-visible:outline-2 focus-visible:outline-action"
                >
                  <option value="">{t.folderUnfiled}</option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
              </label>
              {dialogError && (
                <p role="alert" className="mt-3 text-sm text-red-800 dark:text-red-300">
                  {dialogError}
                </p>
              )}
              <div className="mt-6 flex justify-end gap-2">
                <Button type="button" disabled={busy} onClick={() => setDialog(null)}>
                  {t.cancel}
                </Button>
                <Button type="submit" primary disabled={busy}>
                  {t.save}
                </Button>
              </div>
            </form>
          ) : (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void saveDialog();
              }}
            >
              <label className="grid gap-2 text-sm font-medium">
                {dialog.kind === "folder-name" ? t.folderName : t.projectName}
                <input
                  autoFocus
                  required
                  maxLength={dialog.kind === "folder-name" ? 80 : 200}
                  value={dialogValue}
                  onChange={(event) => setDialogValue(event.target.value)}
                  className="min-h-11 rounded-lg border border-forest/25 bg-surface px-3 text-base focus-visible:outline-2 focus-visible:outline-action"
                />
              </label>
              {dialogError && (
                <p role="alert" className="mt-3 text-sm text-red-800 dark:text-red-300">
                  {dialogError}
                </p>
              )}
              <div className="mt-6 flex justify-end gap-2">
                <Button type="button" disabled={busy} onClick={() => setDialog(null)}>
                  {t.cancel}
                </Button>
                <Button type="submit" primary disabled={busy || !dialogValue.trim()}>
                  {t.save}
                </Button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </main>
  );
}

function SectionButton({
  icon,
  label,
  count,
  selected,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  count: number;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex min-h-10 min-w-fit items-center gap-2 rounded-lg px-2.5 text-left text-sm transition-colors motion-reduce:transition-none lg:min-w-0 ${selected ? "bg-action/10 font-semibold text-action" : "hover:bg-forest/5"}`}
    >
      <span className="size-4 shrink-0">{icon}</span>
      <span className="whitespace-nowrap lg:flex-1">{label}</span>
      <span className="text-xs text-ink/70 tabular-nums">{count}</span>
    </button>
  );
}

function EmptyFiltered({
  title,
  text,
  actionLabel,
  onClear,
  icon,
}: {
  title: string;
  text: string;
  actionLabel?: string;
  onClear?: () => void;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-forest/25 bg-surface/60 px-4 py-10 text-center sm:py-12">
      <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-lg bg-forest/5 text-action">
        {icon}
      </div>
      <h3 className="font-display text-lg font-bold">{title}</h3>
      <p className="mt-2 text-sm text-ink/70">{text}</p>
      {actionLabel && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="mt-4 min-h-10 rounded-lg px-3 text-sm font-semibold text-action hover:bg-action/10 focus-visible:outline-2 focus-visible:outline-action"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function emptyTitle(
  selection: Selection,
  filters: boolean,
  type: ProjectType | "all",
  t: (typeof libraryCopy)[Lang],
): string {
  if (filters && type !== "all") return t.noTypeResultsTitle;
  if (filters) return t.noResultsTitle;
  if (selection.kind === "folder") return t.emptyFolderTitle;
  if (selection.kind === "recent") return t.emptyRecentTitle;
  if (selection.kind === "favorites") return t.emptyFavoritesTitle;
  if (selection.kind === "unfiled") return t.emptyUnfiledTitle;
  return t.noResultsTitle;
}

function emptyText(
  selection: Selection,
  filters: boolean,
  type: ProjectType | "all",
  t: LibraryCopy,
): string {
  if (filters && type !== "all") return t.noTypeResultsText;
  if (filters) return t.noResultsText;
  if (selection.kind === "folder") return t.emptyFolderText;
  if (selection.kind === "recent") return t.emptyRecentText;
  if (selection.kind === "favorites") return t.emptyFavoritesText;
  if (selection.kind === "unfiled") return t.emptyUnfiledText;
  return t.noResultsText;
}

function ProjectRow({
  project,
  lang,
  t,
  appMessages,
  studio,
  folderName,
  view,
  busy,
  onRename,
  onDuplicate,
  onMove,
  onFavorite,
  onExport,
  onDelete,
}: {
  project: LibraryProject;
  lang: Lang;
  t: (typeof libraryCopy)[Lang];
  appMessages: Messages;
  studio: (typeof studioCopy)[Lang];
  folderName?: string;
  view: ViewMode;
  busy: boolean;
  onRename: () => void;
  onDuplicate: () => void;
  onMove: () => void;
  onFavorite: () => void;
  onExport: () => void;
  onDelete: () => void;
}) {
  const Icon = projectIcon(project.type);
  const displayName =
    project.type === "scoreboard" && "teams" in project.data
      ? displayBoard(project.data, appMessages).name
      : project.name;
  const date = new Intl.DateTimeFormat(locale[lang], {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(project.updatedAt);
  const preview = projectSummary(project, lang, t);
  const typeLabel =
    project.type === "scoreboard"
      ? t.scoreboard
      : project.type === "leaderboard"
        ? t.leaderboard
        : t.bracket;

  return (
    <li
      className={`group min-w-0 rounded-xl border border-forest/15 bg-surface transition-colors duration-150 hover:border-forest/30 motion-reduce:transition-none ${view === "grid" ? "h-full" : ""}`}
    >
      <div
        className={`flex min-w-0 items-start gap-3 p-3 sm:items-center ${view === "grid" ? "h-full flex-col sm:items-start" : ""}`}
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-action/10 text-action">
          <Icon aria-hidden="true" className="size-5" />
        </span>
        <div className={`min-w-0 flex-1 ${view === "grid" ? "w-full" : ""}`}>
          <div className="flex min-w-0 items-start gap-2">
            <div className="min-w-0 flex-1">
              <Link
                href={projectHref(lang, project)}
                className="inline-flex min-h-7 max-w-full items-center gap-1 text-base font-semibold [overflow-wrap:anywhere] hover:text-action focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action"
              >
                <span className="truncate">{displayName}</span>
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-3.5 shrink-0 opacity-0 transition-opacity group-focus-within:opacity-70 group-hover:opacity-70 motion-reduce:transition-none"
                />
              </Link>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink/65">
                <span>{typeLabel}</span>
                <span aria-hidden="true">·</span>
                <time dateTime={new Date(project.updatedAt).toISOString()}>{date}</time>
                {folderName && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="truncate">{folderName}</span>
                  </>
                )}
              </div>
              <p className="mt-1 max-w-full truncate text-xs text-ink/70 sm:text-sm">{preview}</p>
            </div>
            {project.favorite && (
              <Star
                aria-label={t.favorites}
                className="mt-1 size-4 shrink-0 fill-action text-action"
              />
            )}
          </div>
        </div>
        <div
          className={`flex shrink-0 items-center gap-1 ${view === "grid" ? "mt-auto w-full justify-end border-t border-forest/10 pt-2" : "ml-auto"}`}
        >
          <Dropdown
            label={<Ellipsis aria-hidden="true" className="size-5" />}
            ariaLabel={`${t.actions}: ${displayName}`}
            disabled={busy}
            fitViewport
            triggerClassName="!min-h-10 !min-w-10 !rounded-lg !px-2 text-ink/65 hover:!bg-forest/10"
          >
            <MenuItem onClick={onRename}>
              <FileText aria-hidden="true" className="size-4" />
              {t.rename}
            </MenuItem>
            <MenuItem onClick={onDuplicate}>
              <Copy aria-hidden="true" className="size-4" />
              {t.duplicate}
            </MenuItem>
            <MenuItem onClick={onMove}>
              <FolderInput aria-hidden="true" className="size-4" />
              {t.move}
            </MenuItem>
            <MenuItem onClick={onFavorite}>
              <Heart aria-hidden="true" className="size-4" />
              {project.favorite ? t.unfavorite : t.favorite}
            </MenuItem>
            <MenuItem onClick={onExport}>
              <Download aria-hidden="true" className="size-4" />
              {t.exportProject}
            </MenuItem>
            <div className="my-1 border-t border-forest/15" />
            <MenuItem danger onClick={onDelete}>
              <Trash2 aria-hidden="true" className="size-4" />
              {t.delete}
            </MenuItem>
          </Dropdown>
        </div>
      </div>
    </li>
  );
}
