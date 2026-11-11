"use client";
import { Pin, Save, Share2, Star, X } from "lucide-react";
import dynamic from "next/dynamic";
import { BoardIcon } from "./board-icon";
import { foreground, validColor } from "@/lib/colors";
import type { CSSProperties } from "react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Lang, Messages } from "@/lib/i18n";
import { download, newBoard, validScore, displayBoard, type Board, type Team } from "@/lib/boards";
import { resolveAppearance } from "@/lib/appearance";
import { useFullscreenControls } from "./use-fullscreen-controls";
import { decodeGame } from "@/lib/sharing";
import { isGamePaused, type GameTimer } from "@/lib/timer";
import { TimerDisplay } from "./game-timer";
import { Customization } from "./customization";
import { teamGridClass } from "@/lib/team-layout";
import { loadBoards, loadOrCreateBoard, writeBoards } from "@/store/database";
import { Button, Modal } from "../ui/ui";
import { TeamPanel } from "./team-panel";
import { track } from "@/lib/analytics";
import { repo } from "@/lib/site";
import { getToolTheme, toolThemes } from "@/lib/tool-themes";
import { applyToolTheme } from "@/lib/board-theme";
import { exportElementPng } from "@/lib/export-png";
type Action = { title: string; value?: string; numeric?: boolean; run: (value: string) => void };
type TeamBounds = { left: number; top: number; width: number; height: number };
const ShareDialog = dynamic(() => import("./share-dialog").then((module) => module.ShareDialog));
const initialBoardId = "scoreboard-initial-placeholder";

function readTeamBounds(grid: HTMLElement): Map<string, TeamBounds> {
  const bounds = new Map<string, TeamBounds>();
  const origin = grid.getBoundingClientRect();

  grid.querySelectorAll<HTMLElement>("[data-scoreboard-team]").forEach((team) => {
    const rect = team.getBoundingClientRect();
    const id = team.dataset.scoreboardTeam;
    if (!id) return;

    bounds.set(id, {
      left: rect.left - origin.left,
      top: rect.top - origin.top,
      width: rect.width,
      height: rect.height,
    });
  });

  return bounds;
}

function initialBoard(t: Messages): Board {
  return applyToolTheme(
    {
      id: initialBoardId,
      name: t.board,
      automaticName: true,
      icon: "scoreboard",
      accent: "#285b35",
      updatedAt: 0,
      teams: [1, 2].map((n) => ({
        id: `${initialBoardId}-${n}`,
        name: `${t.team} ${n}`,
        automaticName: true,
        score: 0,
      })),
    },
    toolThemes[0],
  );
}

function boardWithTheme(
  name: string,
  teamName: string,
  theme: NonNullable<ReturnType<typeof getToolTheme>>,
): Board {
  return applyToolTheme(newBoard(name, teamName), theme);
}

export function Scoreboard({ lang, t }: { lang: Lang; t: Messages }) {
  const [boards, setBoards] = useState<Board[]>(() => [initialBoard(t)]);
  const current = useRef(boards);
  const [id, setId] = useState<string>(initialBoardId);
  const [ready, setReady] = useState(false);
  const [undoBoards, setUndoBoards] = useState<Board[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showStarPrompt, setShowStarPrompt] = useState(true);
  const themeLaunchHandled = useRef(false);
  const [pending, setPending] = useState(0);
  const [dialogMode, setDialogMode] = useState<"save" | "share">();
  const [full, setFull] = useState(false);
  const [action, setAction] = useState<Action>();
  const [value, setValue] = useState("");
  const display = useRef<HTMLDivElement>(null);
  const teamGridRef = useRef<HTMLDivElement>(null);
  const boardOutputRef = useRef<HTMLDivElement>(null);
  const teamLayoutSnapshotRef = useRef<Map<string, TeamBounds> | null>(null);
  const storedBoard = boards.find((b) => b.id === id);
  const board = storedBoard ? displayBoard(storedBoard, t) : undefined;
  const exportBoard = useCallback(async () => {
    if (!boardOutputRef.current || !board) throw new Error("Preview is unavailable");
    await exportElementPng(
      boardOutputRef.current,
      board.name,
      board.canvas,
      board.exportScale ?? 1,
    );
  }, [board]);
  const teamOrderKey = board?.teams.map((team) => team.id).join("\u0000") ?? "";
  const appearance = resolveAppearance(board?.appearance);
  const controls = useFullscreenControls(full, appearance.autoHideControls);
  const changeFullscreen = useCallback((next: boolean) => {
    setFull(next);
    window.dispatchEvent(new CustomEvent("scoreboard-fullscreen-change", { detail: next }));
  }, []);
  const replace = useCallback((items: Board[]) => {
    current.current = items;
    setBoards(items);
  }, []);
  useLayoutEffect(() => {
    const previousBounds = teamLayoutSnapshotRef.current;
    teamLayoutSnapshotRef.current = null;
    const grid = teamGridRef.current;

    if (!previousBounds || !grid || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const elements = new Map<string, HTMLElement>();
    grid.querySelectorAll<HTMLElement>("[data-scoreboard-team]").forEach((team) => {
      const id = team.dataset.scoreboardTeam;
      if (id) elements.set(id, team);
    });

    const animations: Animation[] = [];
    readTeamBounds(grid).forEach((next, id) => {
      const previous = previousBounds.get(id);
      const element = elements.get(id);
      if (!previous || !element) return;

      const x = previous.left - next.left;
      const y = previous.top - next.top;
      const scaleX = next.width ? previous.width / next.width : 1;
      const scaleY = next.height ? previous.height / next.height : 1;
      if (
        Math.abs(x) < 1 &&
        Math.abs(y) < 1 &&
        Math.abs(scaleX - 1) < 0.01 &&
        Math.abs(scaleY - 1) < 0.01
      ) {
        return;
      }

      animations.push(
        element.animate(
          [
            {
              transform: `translate(${x}px, ${y}px) scale(${scaleX}, ${scaleY})`,
              transformOrigin: "top left",
            },
            { transform: "translate(0, 0) scale(1, 1)", transformOrigin: "top left" },
          ],
          { duration: 320, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
        ),
      );
    });

    return () => animations.forEach((animation) => animation.cancel());
  }, [teamOrderKey]);
  const persist = useCallback(
    (items: Board[], removeId?: string) => {
      setPending((n) => n + 1);
      void writeBoards(items, removeId)
        .then(() => setError(""))
        .catch(() => setError(t.storageError))
        .finally(() => setPending((n) => n - 1));
    },
    [t.storageError],
  );
  useEffect(() => {
    let alive = true;
    const openGame = async () => {
      const fragment = location.hash;
      const search = new URLSearchParams(location.search);
      const hasSharedTarget = fragment.startsWith("#share=") || fragment.startsWith("#board=");
      const launchTheme =
        !themeLaunchHandled.current && !hasSharedTarget && search.get("new") === "1"
          ? getToolTheme(search.get("theme"))
          : undefined;
      if (fragment.startsWith("#share=") || fragment.startsWith("#board="))
        history.replaceState(null, "", location.pathname + location.search);
      try {
        let items = await loadBoards();
        if (!alive) return;
        let requested: string | null = null;
        if (fragment.startsWith("#share=")) {
          const incoming = decodeGame(fragment.slice(7));
          const existing = items.find(
            (b) => b.id === incoming.sourceId || b.shareKey === incoming.key,
          );
          if (existing) requested = existing.id;
          else {
            const copy = { ...incoming.board, shareKey: incoming.key };
            await writeBoards([copy]);
            items = [...items, copy];
            requested = copy.id;
          }
        } else {
          if (launchTheme && !fragment.startsWith("#board=")) {
            const fresh = boardWithTheme(t.board, t.team, launchTheme);
            items = [...items, fresh];
            requested = fresh.id;
            themeLaunchHandled.current = true;
            window.history.replaceState(window.history.state, "", window.location.pathname);
          } else {
            if (!items.length) items = await loadOrCreateBoard(() => newBoard(t.board, t.team));
            requested = fragment.startsWith("#board=")
              ? decodeURIComponent(fragment.slice(7))
              : null;
            try {
              requested ??= localStorage.getItem("scoreboard-active");
            } catch {}
          }
        }
        if (alive) {
          replace(items);
          setId(items.some((b) => b.id === requested) ? requested! : items[0]?.id);
          setReady(true);
        }
      } catch {
        if (alive) {
          const fallback = launchTheme
            ? boardWithTheme(t.board, t.team, launchTheme)
            : newBoard(t.board, t.team);
          if (launchTheme) {
            themeLaunchHandled.current = true;
            window.history.replaceState(window.history.state, "", window.location.pathname);
          }
          replace([fallback]);
          setId(fallback.id);
          setReady(true);
          setError(fragment.startsWith("#share=") ? t.shareInvalid : t.storageError);
        }
      } finally {
        window.dispatchEvent(new Event("scoreboard-ready"));
      }
    };
    void openGame();
    window.addEventListener("hashchange", openGame);
    return () => {
      alive = false;
      window.removeEventListener("hashchange", openGame);
    };
  }, [replace, t.board, t.team, t.storageError, t.shareInvalid]);
  useEffect(() => {
    if (ready && id !== initialBoardId) {
      try {
        localStorage.setItem("scoreboard-active", id);
      } catch {}
    }
  }, [id, ready]);
  const update = useCallback(
    (change: (b: Board) => Board) => {
      const all = current.current;
      const old = all.find((b) => b.id === id);
      if (!old) return;
      const changed = change(old);
      const orderChanged =
        old.teams.length !== changed.teams.length ||
        old.teams.some((team, index) => team.id !== changed.teams[index]?.id);
      if (orderChanged && teamGridRef.current) {
        teamLayoutSnapshotRef.current = readTeamBounds(teamGridRef.current);
      }
      setUndoBoards((previous) => [...previous.slice(-49), old]);
      const next = { ...changed, updatedAt: Date.now() };
      replace(all.map((b) => (b.id === id ? next : b)));
      persist([next]);
    },
    [id, persist, replace],
  );
  const teamEdit = (teamId: string, change: Partial<Team>) => {
    if (
      change.score !== undefined &&
      isGamePaused(current.current.find((b) => b.id === id)?.timer)
    ) {
      if (appearance.showPausedNotice) setNotice(t.matchPaused);
      return;
    }
    update((b) => ({
      ...b,
      teams: b.teams.map((team) => (team.id === teamId ? { ...team, ...change } : team)),
    }));
  };
  const score = useCallback(
    (teamId: string, amount: number) => {
      if (isGamePaused(current.current.find((b) => b.id === id)?.timer)) {
        if (appearance.showPausedNotice) setNotice(t.matchPaused);
        return;
      }
      update((b) => ({
        ...b,
        teams: b.teams.map((team) =>
          team.id === teamId && Math.abs(team.score + amount) <= 999999999
            ? { ...team, score: team.score + amount }
            : team,
        ),
      }));
    },
    [update, id, t.matchPaused, appearance.showPausedNotice],
  );
  const toggleFull = useCallback(async () => {
    if (full) {
      if (document.fullscreenElement) await document.exitFullscreen().catch(() => {});
      changeFullscreen(false);
    } else {
      changeFullscreen(true);
      track("enter_fullscreen");
      await display.current?.requestFullscreen?.().catch(() => {});
    }
  }, [full, changeFullscreen]);
  useEffect(() => {
    const change = () => {
      if (!document.fullscreenElement) changeFullscreen(false);
    };
    const key = (e: KeyboardEvent) => {
      if (
        !ready ||
        (e.target instanceof HTMLElement &&
          (e.target.closest("input,textarea,select,dialog") || e.target.isContentEditable)) ||
        e.ctrlKey ||
        e.metaKey ||
        e.altKey
      )
        return;
      if (e.key === "Escape") changeFullscreen(false);
      if (action || dialogMode || !board) return;
      if (e.key.toLowerCase() === "f") {
        e.preventDefault();
        void toggleFull();
      }
      const team = board.teams[Number(e.key) - 1];
      if ((e.key === "1" || e.key === "2") && team) score(team.id, appearance.increment);
    };
    document.addEventListener("fullscreenchange", change);
    window.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("fullscreenchange", change);
      window.removeEventListener("keydown", key);
    };
  }, [toggleFull, changeFullscreen, action, dialogMode, board, score, appearance.increment, ready]);
  const saveNamed = async (name: string): Promise<Board> => {
    const latest = current.current.find((b) => b.id === id);
    if (!latest) throw new Error("missing");
    const next = { ...latest, name, automaticName: false, updatedAt: Date.now() };
    replace(current.current.map((b) => (b.id === id ? next : b)));
    try {
      await writeBoards([next]);
      setError("");
      return next;
    } catch {
      setError(t.storageError);
      throw new Error("save");
    }
  };
  const changeTimer = useCallback((timer: GameTimer) => update((b) => ({ ...b, timer })), [update]);
  useEffect(() => {
    if (!notice) return;
    if (!appearance.showPausedNotice || !isGamePaused(storedBoard?.timer)) {
      setNotice("");
      return;
    }
    const timeoutId = window.setTimeout(() => setNotice(""), 4000);
    return () => window.clearTimeout(timeoutId);
  }, [notice, appearance.showPausedNotice, storedBoard?.timer]);
  const ask = (title: string, run: Action["run"], initial?: string) => {
    setValue(initial ?? "");
    setAction({ title, run, value: initial });
  };
  const addBoard = () => {
    const b = newBoard(t.board, t.team);
    replace([...current.current, b]);
    setId(b.id);
    persist([b]);
    track("create_scoreboard");
  };
  return (
    <div
      onPointerMove={controls.reveal}
      onPointerDown={controls.reveal}
      onKeyDownCapture={controls.reveal}
      onFocusCapture={controls.reveal}
      ref={display}
      className={
        full
          ? `fixed inset-0 z-40 overflow-auto bg-paper ${!controls.visible ? "cursor-none [&_*]:cursor-none" : ""}`
          : ""
      }
    >
      <main
        id="main"
        className={
          full
            ? "relative mx-auto flex h-dvh max-w-[160rem] flex-col p-3 sm:p-4"
            : "mx-auto max-w-7xl px-4 pt-2 pb-8 sm:px-6 sm:pt-3 sm:pb-10"
        }
      >
        <h1 className="sr-only">{t.scoreboardPageTitle}</h1>

        {showStarPrompt && !full && (
          <div
            role="status"
            className="mb-3 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-2 gap-y-1.5 rounded-lg border border-forest/15 bg-surface px-2.5 py-2 text-sm sm:flex sm:gap-3"
          >
            <span className="row-span-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-forest/10">
              <Star aria-hidden="true" className="h-4 w-4 text-forest" />
            </span>
            <p className="col-start-2 row-start-1 min-w-0 text-sm leading-5 text-ink/85 sm:flex-1">
              {t.githubStarNote}
            </p>
            <a
              href={repo}
              target="_blank"
              rel="noopener noreferrer"
              className="col-start-2 row-start-2 inline-flex min-h-8 shrink-0 items-center justify-self-start rounded-md px-2 text-sm font-semibold text-forest transition-colors duration-150 hover:bg-forest/10 hover:text-forest focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest motion-reduce:transition-none sm:ml-auto"
            >
              {t.githubStarAction}
            </a>
            <Button
              aria-label={t.close}
              onClick={() => setShowStarPrompt(false)}
              className="col-start-3 row-span-2 row-start-1 min-h-8 min-w-8 shrink-0 p-1.5"
            >
              <X aria-hidden="true" className="h-4 w-4" />
            </Button>
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="fixed right-4 bottom-4 z-50 flex w-fit max-w-[min(24rem,calc(100vw-2rem))] items-start gap-3 rounded-xl border border-forest/20 bg-paper px-4 py-3 text-ink shadow-lg motion-safe:animate-[appear_160ms_ease-out] motion-reduce:animate-none"
          >
            <p className="min-w-0 flex-1 text-sm leading-5 break-words sm:text-base sm:leading-6">
              {notice}
            </p>
            <Button aria-label={t.close} onClick={() => setNotice("")} className="shrink-0 px-3">
              ×
            </Button>
          </div>
        )}
        {error && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-red-300 bg-red-50 p-4 text-base text-red-900 dark:bg-red-950/40 dark:text-red-200"
          >
            {error} <Button onClick={() => persist(boards)}>{t.retry}</Button>
            <Button onClick={() => download(boards)}>{t.export}</Button>
          </div>
        )}
        {!ready && (
          <p aria-live="polite" className="py-2 text-center">
            {t.loading}
          </p>
        )}
        <div
          aria-busy={!ready}
          inert={!ready}
          className={full ? "flex min-h-0 flex-1 flex-col" : ""}
        >
          {board ? (
            <section aria-label={t.board} className="flex min-h-0 flex-1 flex-col">
              {full ? (
                <div
                  className={`absolute top-3 right-3 z-30 flex items-center gap-1 rounded-xl border border-forest/25 bg-paper p-1 text-ink shadow-sm transition-opacity duration-150 motion-reduce:transition-none ${controls.visible ? "opacity-100" : "pointer-events-none opacity-0"}`}
                >
                  <Button
                    aria-label={t.keepVisible}
                    aria-pressed={!appearance.autoHideControls}
                    className="aria-pressed:border-forest/35 aria-pressed:bg-forest/10 aria-pressed:text-forest"
                    onClick={() =>
                      update((b) => ({
                        ...b,
                        appearance: {
                          ...b.appearance,
                          autoHideControls: !appearance.autoHideControls,
                        },
                      }))
                    }
                  >
                    <Pin aria-hidden="true" className="h-5 w-5" />
                  </Button>
                  <Button onClick={() => void toggleFull()} aria-label={t.exit}>
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5 fill-none stroke-current"
                      strokeWidth="1.8"
                      aria-hidden="true"
                    >
                      <path d="M8 3v5H3m13-5v5h5M8 21v-5H3m13 5v-5h5" />
                    </svg>
                    <span className="hidden sm:inline">{t.exitShort}</span>
                  </Button>
                </div>
              ) : (
                <>
                  {" "}
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <h2 className="min-w-0 font-display text-xl font-bold tracking-tight break-words sm:text-2xl">
                      <span className="flex min-w-0 items-start gap-2">
                        <span
                          style={
                            {
                              "--accent": validColor(board.accent)
                                ? board.accent
                                : "var(--color-forest)",
                              "--accent-text": validColor(board.accent)
                                ? foreground(board.accent)
                                : "var(--color-on-action)",
                            } as CSSProperties
                          }
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)] text-[var(--accent-text)]"
                        >
                          <BoardIcon id={board.icon} />
                        </span>
                        <label className="min-w-0 flex-1">
                          <span className="sr-only">{t.boardName}</span>
                          <input
                            aria-label={t.boardName}
                            maxLength={200}
                            value={board.name}
                            disabled={!ready}
                            onChange={(event) =>
                              update((current) => ({
                                ...current,
                                name: event.target.value,
                                automaticName: false,
                              }))
                            }
                            className="min-h-10 w-full min-w-0 border-b border-transparent bg-transparent px-1 font-display text-xl font-bold tracking-tight text-ink hover:border-forest/25 focus-visible:border-forest focus-visible:outline-none sm:text-2xl"
                          />
                        </label>
                      </span>
                    </h2>
                    <div className="flex shrink-0 items-center gap-2">
                      {pending > 0 && (
                        <span role="status" className="hidden text-base text-forest sm:inline">
                          {t.saving}
                        </span>
                      )}
                      {full && (
                        <>
                          <Button
                            aria-label={t.keepVisible}
                            aria-pressed={!appearance.autoHideControls}
                            className="aria-pressed:border-forest/35 aria-pressed:bg-forest/10 aria-pressed:text-forest"
                            onClick={() =>
                              update((b) => ({
                                ...b,
                                appearance: {
                                  ...b.appearance,
                                  autoHideControls: !appearance.autoHideControls,
                                },
                              }))
                            }
                          >
                            <Pin aria-hidden="true" className="h-5 w-5" />
                          </Button>
                          <Button
                            aria-label={t.fullscreenControls}
                            aria-pressed={appearance.fullscreenControls}
                            className="aria-pressed:border-forest/35 aria-pressed:bg-forest/10 aria-pressed:text-forest"
                            onClick={() =>
                              update((b) => ({
                                ...b,
                                appearance: {
                                  ...b.appearance,
                                  fullscreenControls: !appearance.fullscreenControls,
                                },
                              }))
                            }
                          >
                            <svg
                              viewBox="0 0 24 24"
                              className="h-5 w-5 fill-none stroke-current"
                              strokeWidth="1.6"
                              aria-hidden="true"
                            >
                              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                              <circle cx="12" cy="12" r="3" />
                              {!appearance.fullscreenControls && <path d="m3 3 18 18" />}
                            </svg>
                          </Button>
                        </>
                      )}
                      <>
                        {!full && (
                          <>
                            <Button onClick={() => setDialogMode("share")}>
                              <Share2 aria-hidden="true" className="h-5 w-5" />
                              <span className="hidden sm:inline">{t.share}</span>
                              <span className="sr-only sm:hidden">{t.share}</span>
                            </Button>
                            <Button primary onClick={() => setDialogMode("save")}>
                              <Save aria-hidden="true" className="h-5 w-5" />
                              {t.saveBoardShort}
                            </Button>
                          </>
                        )}
                      </>
                      <Button
                        aria-label={full ? t.exit : t.fullscreen}
                        onClick={() => void toggleFull()}
                      >
                        <span className="hidden sm:inline">{full ? t.exit : t.fullscreen}</span>
                        <svg
                          viewBox="0 0 24 24"
                          className="h-5 w-5 fill-none stroke-current"
                          strokeWidth="1.8"
                          aria-hidden="true"
                        >
                          {full ? (
                            <path d="M8 3v5H3m13-5v5h5M8 21v-5H3m13 5v-5h5" />
                          ) : (
                            <path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5" />
                          )}
                        </svg>
                      </Button>
                    </div>
                  </div>
                </>
              )}

              <div
                ref={boardOutputRef}
                style={
                  {
                    "--board-background": board.background || "transparent",
                    ...(board.canvas
                      ? {
                          aspectRatio: `${board.canvas.width} / ${board.canvas.height}`,
                          width: `min(100%, ${Math.round(720 * (board.canvas.width / board.canvas.height))}px)`,
                        }
                      : {}),
                  } as CSSProperties
                }
                className={`mx-auto flex min-h-0 min-w-0 flex-col bg-[var(--board-background)] ${board.canvas ? "max-w-full" : "w-full flex-1"} ${board.background ? "rounded-xl p-2" : ""}`}
              >
                {board.timer?.enabled && (
                  <TimerDisplay
                    timer={board.timer}
                    t={t}
                    change={changeTimer}
                    full={full}
                    controlsVisible={controls.visible}
                    textScale={appearance.textScaleEnabled ? appearance.timerScale : 100}
                  />
                )}
                <div
                  ref={teamGridRef}
                  style={{ "--board-background": "transparent" } as CSSProperties}
                  className={`min-h-0 flex-1 gap-3 ${teamGridClass(board.teams.length, appearance.layout, full, board.canvas)}`}
                >
                  {board.teams.map((team, index) => (
                    <TeamPanel
                      key={team.id}
                      team={team}
                      color={board.themeId ? board.background : board.color}
                      textColor={board.textColor}
                      paused={isGamePaused(board.timer)}
                      appearance={appearance}
                      controlsVisible={controls.visible}
                      index={index}
                      count={board.teams.length}
                      full={full}
                      t={t}
                      change={(amount) => score(team.id, amount * appearance.increment)}
                      manual={() => {
                        if (isGamePaused(board.timer)) {
                          if (appearance.showPausedNotice) setNotice(t.matchPaused);
                          return;
                        }
                        setValue(String(team.score));
                        setAction({
                          title: `${team.name}: ${t.score}`,
                          value: String(team.score),
                          numeric: true,
                          run: (value) => teamEdit(team.id, { score: Number(value) }),
                        });
                      }}
                    />
                  ))}
                </div>
              </div>
            </section>
          ) : ready ? (
            <section className="rounded-xl bg-forest/5 px-5 py-12 text-center">
              <h2 className="font-display text-xl font-semibold">{t.empty}</h2>
              <Button onClick={addBoard} className="mt-5">
                {t.create}
              </Button>
            </section>
          ) : null}
          {!full && (
            <>
              {ready && board && (
                <>
                  <div className="mt-3 flex justify-end gap-2">
                    <Button
                      disabled={!undoBoards.some((previous) => previous.id === id)}
                      onClick={() => {
                        const previous = undoBoards.findLast((saved) => saved.id === id);
                        if (!previous) return;
                        const index = undoBoards.lastIndexOf(previous);
                        setUndoBoards(undoBoards.filter((_, position) => position !== index));
                        replace(
                          current.current.map((saved) => (saved.id === id ? previous : saved)),
                        );
                        persist([previous]);
                      }}
                    >
                      {t.undoAction}
                    </Button>
                    <Button
                      onClick={() => {
                        const reset = () =>
                          update((b) => ({
                            ...b,
                            teams: b.teams.map((team) => ({ ...team, score: 0 })),
                          }));

                        ask(t.resetConfirm, reset);
                      }}
                    >
                      ↺ {t.reset}
                    </Button>
                  </div>
                  <Customization
                    lang={lang}
                    board={board}
                    t={t}
                    change={update}
                    exportImage={exportBoard}
                    remove={(teamId) =>
                      ask(t.deleteConfirm, () => {
                        const removeTeam = () =>
                          update((b) => ({
                            ...b,
                            teams: b.teams.filter((team) => team.id !== teamId),
                          }));
                        const team = Array.from(
                          teamGridRef.current?.querySelectorAll<HTMLElement>(
                            "[data-scoreboard-team]",
                          ) ?? [],
                        ).find((element) => element.dataset.scoreboardTeam === teamId);

                        if (
                          !team ||
                          window.matchMedia("(prefers-reduced-motion: reduce)").matches
                        ) {
                          removeTeam();
                          return;
                        }

                        team.inert = true;
                        team.animate(
                          [
                            { opacity: 1, transform: "scale(1)" },
                            { opacity: 0, transform: "scale(0.96)" },
                          ],
                          { duration: 180, easing: "ease-in", fill: "forwards" },
                        ).onfinish = removeTeam;
                      })
                    }
                  />
                </>
              )}
            </>
          )}
        </div>
      </main>
      {action && (
        <Modal title={action.title} close={() => setAction(undefined)} closeLabel={t.close}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (action.numeric && !validScore(Number(value))) {
                setNotice(t.scoreRange);
                return;
              }
              action.run(value.trim());
              setAction(undefined);
            }}
          >
            {action.value !== undefined && (
              <label className="block text-base">
                {t.name}
                <input
                  autoFocus
                  required
                  inputMode={action.numeric ? "numeric" : "text"}
                  pattern={action.numeric ? "-?[0-9]+" : undefined}
                  maxLength={action.numeric ? 10 : 200}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="mt-2 min-h-12 w-full rounded-lg border border-forest/30 bg-surface px-3"
                />
              </label>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <Button type="button" onClick={() => setAction(undefined)}>
                {t.cancel}
              </Button>
              <Button
                primary
                type="submit"
                disabled={
                  action.value !== undefined &&
                  (!value.trim() || (!!action.numeric && !validScore(Number(value))))
                }
              >
                {t.confirm}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {dialogMode && board && (
        <ShareDialog
          board={storedBoard!}
          t={t}
          lang={lang}
          mode={dialogMode}
          save={saveNamed}
          close={() => setDialogMode(undefined)}
        />
      )}
    </div>
  );
}
