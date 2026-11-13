"use client";
import Link from "next/link";
import { SavedGraphics } from "@/components/studio/saved-graphics";
import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import type { Lang, Messages } from "@/lib/i18n";
import { europeanDateTime } from "@/lib/dates";
import {
  type Board,
  download,
  newBoard,
  parseBackup,
  displayBoard,
  MAX_BACKUP_BYTES,
} from "@/lib/boards";
import { readJsonFile } from "@/lib/untrusted-json";
import { foreground, validColor } from "@/lib/colors";
import { loadBoards, writeBoards } from "@/store/database";
import { route } from "@/lib/routes";
import { Button, Modal } from "../ui/ui";
import { Pencil, Palette, Copy, Download, Trash2, ChevronDown, Share2 } from "lucide-react";
import { Dropdown, MenuItem } from "../ui/dropdown";
import { MatchPreview } from "./match-preview";
import { ShareDialog } from "./share-dialog";
import { BoardIcon } from "./board-icon";
import { BoardIdentity } from "./board-identity";
import { studioCopy } from "@/lib/studio-copy";
import { useConfirmation } from "@/components/ui/use-confirmation";

function readSavedBoardPositions(list: HTMLUListElement | null) {
  if (!list) return null;

  const positions = new Map<string, DOMRect>();
  list.querySelectorAll<HTMLElement>("[data-saved-board]").forEach((row) => {
    const id = row.dataset.savedBoard;
    if (id) positions.set(id, row.getBoundingClientRect());
  });
  return positions;
}

export function SavedBoards({ lang, t }: { lang: Lang; t: Messages }) {
  const router = useRouter();
  const { confirm, dialog } = useConfirmation(studioCopy[lang]);
  const [boards, setBoards] = useState<Board[]>([]);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<string>();
  const [sharing, setSharing] = useState<Board>();
  const [action, setAction] = useState<{
    title: string;
    value?: string;
    run: (name: string) => Promise<void>;
  } | null>(null);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const layoutSnapshot = useRef<Map<string, DOMRect> | null>(null);
  const enteringBoardIds = useRef(new Set<string>());

  useLayoutEffect(() => {
    const previous = layoutSnapshot.current;
    layoutSnapshot.current = null;
    if (!previous || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      enteringBoardIds.current.clear();
      return;
    }

    const animations: Animation[] = [];
    list.current?.querySelectorAll<HTMLElement>("[data-saved-board]").forEach((row) => {
      const id = row.dataset.savedBoard;
      if (!id) return;

      const oldPosition = previous.get(id);
      if (!oldPosition && enteringBoardIds.current.has(id)) {
        animations.push(
          row.animate(
            [
              { opacity: 0, transform: "translate3d(0, -6px, 0)" },
              { opacity: 1, transform: "translate3d(0, 0, 0)" },
            ],
            { duration: 220, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
          ),
        );
        return;
      }
      if (!oldPosition) return;

      const offsetY = oldPosition.top - row.getBoundingClientRect().top;
      if (offsetY === 0) return;
      animations.push(
        row.animate(
          [{ transform: `translate3d(0, ${offsetY}px, 0)` }, { transform: "translate3d(0, 0, 0)" }],
          { duration: 320, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
        ),
      );
    });
    enteringBoardIds.current.clear();
    return () => animations.forEach((animation) => animation.cancel());
  }, [boards]);

  useEffect(() => {
    void loadBoards()
      .then((items) => {
        setBoards(items);
        setReady(true);
      })
      .catch(() => {
        setMessage(t.storageError);
        setReady(true);
      });
  }, [t.storageError]);
  const handleSave = async (b: Board, animateListChange = false) => {
    // This helper runs after a save action; the value is intentionally not render-pure.
    // eslint-disable-next-line react-hooks/purity
    const next = { ...b, updatedAt: Date.now() };
    try {
      await writeBoards([next]);
      if (animateListChange) {
        layoutSnapshot.current = readSavedBoardPositions(list.current);
        if (!boards.some((old) => old.id === b.id)) enteringBoardIds.current.add(b.id);
      }
      setBoards((all) => [...all.filter((old) => old.id !== b.id), next]);
    } catch (error) {
      setMessage(t.storageError);
      throw error;
    }
  };
  const ask = (title: string, run: (name: string) => Promise<void>, initial?: string) => {
    setValue(initial || "");
    setAction({ title, run, value: initial });
  };
  const create = async () => {
    setBusy(true);
    try {
      const b = newBoard(t.board, t.team);
      await writeBoards([b]);
      router.push(`${route(lang, "scoreboard")}#board=${b.id}`);
    } catch {
      setMessage(t.storageError);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      {dialog}
      <main id="main" className="mx-auto max-w-6xl px-4 py-3 sm:px-6 sm:py-5">
        <div className="mb-4 grid gap-3 border-b border-forest/20 pb-3 sm:mb-5 sm:flex sm:flex-wrap sm:items-center sm:justify-between sm:pb-4">
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{t.saved}</h1>
          <div className="grid gap-2 sm:flex">
            <Button
              primary
              className="w-full justify-center !px-2 whitespace-nowrap sm:w-auto sm:!px-4"
              disabled={!ready || busy}
              onClick={() => void create()}
            >
              ＋ {t.newScoreboard}
            </Button>
            <Dropdown
              label={
                <>
                  {t.backupMenu}
                  <ChevronDown aria-hidden="true" className="h-4 w-4" />
                </>
              }
              ariaLabel={t.backupMenu}
              triggerClassName="w-full justify-center sm:w-auto"
            >
              <MenuItem
                disabled={!boards.length}
                onClick={() => {
                  download(boards);
                }}
              >
                {t.export}
              </MenuItem>
              <MenuItem disabled={!ready || busy} onClick={() => input.current?.click()}>
                {t.import}
              </MenuItem>
            </Dropdown>
          </div>
        </div>
        <input
          ref={input}
          type="file"
          accept=".json,application/json"
          hidden
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            setBusy(true);
            try {
              if (file.size > MAX_BACKUP_BYTES) throw new Error();
              const items = parseBackup(await readJsonFile(file, MAX_BACKUP_BYTES));
              const teamCount = items.reduce((total, item) => total + item.teams.length, 0);
              const summary = t.importSummary
                .replace("{boards}", String(items.length))
                .replace("{teams}", String(teamCount));
              const choice = await confirm(`${summary}\n\n${t.importNote}\n\n${t.importConfirm}`, {
                cancelLabel: t.cancel,
                confirmLabel: studioCopy[lang].continue,
              });
              if (choice !== "confirm") return;
              await writeBoards(items);
              layoutSnapshot.current = readSavedBoardPositions(list.current);
              items.forEach((item) => enteringBoardIds.current.add(item.id));
              setBoards((all) => [...all, ...items]);
              setMessage(t.imported);
            } catch {
              setMessage(t.importError);
            } finally {
              setBusy(false);
            }
          }}
        />
        <SavedGraphics lang={lang} />
        {message && (
          <p role="status" className="mb-4 rounded-lg border border-forest/20 px-4 py-3 text-base">
            {message}
          </p>
        )}
        {!ready ? (
          <p className="py-8">{t.loading}</p>
        ) : !boards.length ? (
          <div className="border-y border-forest/20 py-6">
            <p className="mb-4 text-base">{t.emptyText}</p>
            <Button primary onClick={() => void create()}>
              {t.create}
            </Button>
          </div>
        ) : (
          <>
            {boards.length >= 6 && (
              <>
                <label className="sr-only" htmlFor="board-search">
                  {t.search}
                </label>
                <input
                  id="board-search"
                  type="search"
                  placeholder={t.search}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="mb-4 min-h-12 w-full rounded-md border border-forest/25 bg-surface px-3 text-base"
                />
              </>
            )}
            <ul ref={list} className="grid gap-2 sm:gap-3">
              {boards
                .filter((b) =>
                  b.name.toLocaleLowerCase(lang).includes(search.toLocaleLowerCase(lang)),
                )
                .sort((a, b) => b.updatedAt - a.updatedAt)
                .map((raw) => {
                  const b = displayBoard(raw, t);
                  const accent = validColor(b.accent) ? b.accent : "#285b35";
                  return (
                    <li
                      key={b.id}
                      data-saved-board={b.id}
                      className="relative rounded-xl border border-forest/20 bg-surface p-1 transition-colors duration-150 focus-within:z-20 hover:border-forest/35 has-[details[open]]:z-40 motion-reduce:transition-none"
                    >
                      <div className="group relative rounded-lg transition-colors duration-150 focus-within:bg-forest/5 hover:bg-forest/5 motion-reduce:transition-none">
                        <Link
                          href={`${route(lang, "scoreboard")}#board=${b.id}`}
                          className="grid grid-cols-[auto_minmax(0,1fr)_2.75rem] items-center gap-2 rounded-lg p-2 sm:grid-cols-[auto_minmax(10rem,1fr)_minmax(12rem,1.5fr)] sm:gap-3 sm:p-3 sm:pr-28"
                        >
                          <span
                            style={
                              {
                                "--accent": accent,
                                "--accent-text": foreground(accent),
                              } as CSSProperties
                            }
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)] text-[var(--accent-text)] sm:h-12 sm:w-12"
                          >
                            <BoardIcon id={b.icon} />
                          </span>
                          <span className="min-w-0">
                            <span className="block font-display text-lg font-bold break-words sm:text-xl">
                              {b.name}
                            </span>
                            <span className="mt-1 flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-0.5">
                              <time
                                dateTime={new Date(b.updatedAt).toISOString()}
                                className="text-sm text-forest/90 sm:text-base"
                              >
                                {europeanDateTime(b.updatedAt)}
                              </time>
                            </span>
                          </span>
                          <span aria-hidden="true" className="block h-11 w-11 sm:hidden" />
                          <span className="col-span-3 min-w-0 sm:col-span-1">
                            <MatchPreview board={b} />
                          </span>
                        </Link>
                        <div className="absolute top-1 right-1 z-10 sm:top-3 sm:right-2">
                          <Dropdown
                            label={
                              <>
                                {t.actions}
                                <ChevronDown aria-hidden="true" className="h-4 w-4" />
                              </>
                            }
                            ariaLabel={`${t.more}: ${b.name}`}
                          >
                            <div className="grid grid-cols-2 gap-1 border-b border-forest/15 pb-2 [&_button]:min-h-14 [&_button]:flex-col [&_button]:justify-center [&_button]:gap-1 [&_button]:px-2 [&_button]:text-center [&_svg]:h-5 [&_svg]:w-5">
                              <MenuItem
                                disabled={busy}
                                onClick={() =>
                                  ask(
                                    t.boardName,
                                    async (name) =>
                                      handleSave({ ...b, name, automaticName: false }),
                                    b.name,
                                  )
                                }
                              >
                                <Pencil aria-hidden="true" className="h-4 w-4" />
                                {t.rename}
                              </MenuItem>
                              <MenuItem
                                onClick={() => setEditing(editing === b.id ? undefined : b.id)}
                              >
                                <Palette aria-hidden="true" className="h-4 w-4" />
                                {t.customize}
                              </MenuItem>
                              <MenuItem
                                disabled={busy}
                                onClick={async () => {
                                  setBusy(true);
                                  try {
                                    await handleSave(
                                      {
                                        ...b,
                                        id: crypto.randomUUID(),
                                        teams: b.teams.map((team) => ({
                                          ...team,
                                          id: crypto.randomUUID(),
                                        })),
                                      },
                                      true,
                                    );
                                  } catch {
                                    setMessage(t.storageError);
                                  } finally {
                                    setBusy(false);
                                  }
                                }}
                              >
                                <Copy aria-hidden="true" className="h-4 w-4" />
                                {t.duplicate}
                              </MenuItem>
                              <MenuItem onClick={() => setSharing(raw)}>
                                <Share2 aria-hidden="true" className="h-4 w-4" />
                                {t.share}
                              </MenuItem>
                            </div>
                            <MenuItem
                              className="mt-1"
                              onClick={() => {
                                download([raw]);
                              }}
                            >
                              <Download aria-hidden="true" className="h-4 w-4" />
                              {t.exportOne}
                            </MenuItem>
                            <div className="my-1 border-t border-forest/15" />
                            <MenuItem
                              danger
                              disabled={busy}
                              onClick={() =>
                                ask(t.deleteConfirm, async () => {
                                  await writeBoards([], b.id);
                                  layoutSnapshot.current = readSavedBoardPositions(list.current);
                                  setBoards((all) => all.filter((old) => old.id !== b.id));
                                })
                              }
                            >
                              <Trash2 aria-hidden="true" className="h-4 w-4" />
                              {t.remove}
                            </MenuItem>
                          </Dropdown>
                        </div>
                      </div>
                      {editing === b.id && (
                        <section
                          aria-labelledby={`customize-${b.id}`}
                          className="mt-2 rounded-xl border border-forest/20 bg-paper p-3 motion-safe:animate-[appear_180ms_ease-out] motion-reduce:animate-none sm:p-4"
                        >
                          <div className="mb-3 flex items-center justify-between gap-3 border-b border-forest/15 pb-2">
                            <h2
                              id={`customize-${b.id}`}
                              className="font-display text-lg font-bold sm:text-xl"
                            >
                              {t.customize}
                            </h2>
                            <Button onClick={() => setEditing(undefined)} aria-label={t.close}>
                              ×
                            </Button>
                          </div>
                          <BoardIdentity
                            board={b}
                            t={t}
                            change={(next) => {
                              void handleSave(next).catch(() => {});
                            }}
                          />
                        </section>
                      )}
                    </li>
                  );
                })}
            </ul>
          </>
        )}
      </main>
      {action && (
        <Modal
          title={action.title}
          close={() => {
            if (!busy) setAction(null);
          }}
          closeLabel={t.close}
          closeDisabled={busy}
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              try {
                await action.run(value.trim());
                setAction(null);
              } catch {
                setMessage(t.storageError);
              } finally {
                setBusy(false);
              }
            }}
          >
            {action.value !== undefined && (
              <label className="grid gap-2 text-base">
                {t.name}
                <input
                  autoFocus
                  required
                  maxLength={200}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="min-h-12 rounded-md border border-forest/25 bg-surface px-3"
                />
              </label>
            )}
            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" disabled={busy} onClick={() => setAction(null)}>
                {t.cancel}
              </Button>
              <Button
                primary
                type="submit"
                disabled={busy || (action.value !== undefined && !value.trim())}
              >
                {t.confirm}
              </Button>
            </div>
          </form>
        </Modal>
      )}
      {sharing && (
        <ShareDialog
          board={sharing}
          t={t}
          lang={lang}
          mode="share"
          save={async (name) => {
            const next = { ...sharing, name };
            await handleSave(next);
            return next;
          }}
          close={() => setSharing(undefined)}
        />
      )}
    </>
  );
}
