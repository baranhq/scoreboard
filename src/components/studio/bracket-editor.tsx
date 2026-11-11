"use client";
import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/ui";
import {
  newBracket,
  bracketRounds,
  setBracketParticipants,
  setMatchResult,
  hasDependentResults,
  type Bracket,
} from "@/lib/brackets";
import { nextAvailableName } from "@/lib/studio";
import type { Lang } from "@/lib/i18n";
import { studioCopy } from "@/lib/studio-copy";
import { useDocument } from "./use-document";
import { CanvasControls } from "./canvas-controls";
import { EditorShell, inputClass, ThemeControls, VisibilitySettings } from "./editor-shell";
import { useListMotion } from "./use-list-motion";
export function BracketEditor({ lang }: { lang: Lang }) {
  const t = studioCopy[lang];
  const initial = useMemo(() => {
    const bracket = newBracket();

    return {
      ...bracket,
      title: t.bracket,
      subtitle: "",
      participants: bracket.participants.map((player, index) => ({
        ...player,
        name: `${t.participant} ${index + 1}`,
      })),
    };
  }, [t.bracket, t.participant]);
  const state = useDocument(initial, t);
  const board = state.document as Bracket;
  const [count, setCount] = useState<string | null>(null);
  const [selectedRound, setSelectedRound] = useState(0);
  const { list: participantList, capture: captureParticipants } = useListMotion<HTMLOListElement>();
  const rounds = bracketRounds(board);
  const round = Math.min(selectedRound, rounds.length - 1);
  const participantName = (id: string | null) =>
    board.participants.find((p) => p.id === id)?.name || t.pending;
  const applyParticipants = async (participants: Bracket["participants"]) => {
    const next = setBracketParticipants(board, participants);
    const losesResults = Object.keys(board.results).some(
      (matchId) => JSON.stringify(board.results[matchId]) !== JSON.stringify(next.results[matchId]),
    );
    if (losesResults) {
      const choice = await state.confirm(t.participantChangeWarning, {
        cancelLabel: t.stay,
        confirmLabel: t.continue,
      });
      if (choice !== "confirm") return false;
    }
    captureParticipants();
    state.change(next);
    return true;
  };
  const updateCount = (value: string) => {
    const nextCount = Number(value);
    if (!Number.isInteger(nextCount) || nextCount < 2 || nextCount > 64) {
      setCount(null);
      return;
    }
    if (nextCount === board.participants.length) {
      setCount(null);
      return;
    }
    const participants = board.participants.slice(0, nextCount);
    while (participants.length < nextCount) {
      participants.push({
        id: crypto.randomUUID(),
        name: nextAvailableName(
          t.participant,
          participants.map((participant) => participant.name),
        ),
      });
    }
    void applyParticipants(participants).then(() => setCount(null));
  };
  return (
    <EditorShell
      lang={lang}
      state={state}
      confirmationDialog={state.confirmationDialog}
      design={<ThemeControls document={board} change={state.change} lang={lang} />}
      settings={
        <div className="space-y-5">
          <label className="grid gap-1 text-sm font-semibold">
            {t.layout}
            <select
              value={board.layout}
              className={inputClass}
              onChange={(event) =>
                state.change({ ...board, layout: event.target.value as Bracket["layout"] })
              }
            >
              <option value="single">{t.single}</option>
              <option value="split">{t.split}</option>
            </select>
          </label>
          <VisibilitySettings document={board} change={state.change} lang={lang} />
        </div>
      }
      exportPanel={
        <div className="space-y-5">
          <CanvasControls
            canvas={board.canvas}
            exportScale={board.exportScale}
            changeCanvas={(canvas) => state.change({ ...board, canvas })}
            changeExportScale={(exportScale) => state.change({ ...board, exportScale })}
            lang={lang}
          />
          <div className="flex flex-wrap gap-2 border-t border-forest/20 pt-4">
            <Button disabled={!state.ready} onClick={state.backup}>
              {t.backup}
            </Button>
            <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 border border-forest/25 px-4 text-sm font-medium text-forest focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-forest">
              {t.import}
              <input
                type="file"
                accept="application/json,.json"
                disabled={!state.ready || state.busy}
                className="sr-only"
                aria-label={t.import}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void state.importFile(file);
                  event.target.value = "";
                }}
              />
            </label>
          </div>
        </div>
      }
    >
      <section className="space-y-3">
        <label className="grid gap-1 text-sm font-semibold">
          {t.title}
          <input
            className={inputClass}
            maxLength={200}
            value={board.title}
            onChange={(event) => state.change({ ...board, title: event.target.value })}
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          {t.subtitle}
          <input
            className={inputClass}
            maxLength={200}
            value={board.subtitle}
            onChange={(event) => state.change({ ...board, subtitle: event.target.value })}
          />
        </label>
        <h2 className="text-lg font-semibold">{t.participants}</h2>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <label className="grid min-w-40 gap-1 text-sm font-semibold">
            {t.count}
            <input
              type="number"
              min={2}
              max={64}
              step={1}
              value={count ?? board.participants.length}
              onChange={(event) => setCount(event.target.value)}
              onBlur={() => updateCount(count ?? String(board.participants.length))}
              onKeyDown={(event) => {
                if (event.key === "Enter") event.currentTarget.blur();
              }}
              className={inputClass}
            />
          </label>
          <Button
            disabled={board.participants.length >= 64}
            onClick={() =>
              void applyParticipants([
                ...board.participants,
                {
                  id: crypto.randomUUID(),
                  name: nextAvailableName(
                    t.participant,
                    board.participants.map((participant) => participant.name),
                  ),
                },
              ])
            }
          >
            <Plus aria-hidden="true" size={16} />
            {t.addParticipant}
          </Button>
        </div>
        <ol
          ref={participantList}
          className="grid max-h-80 gap-2 overflow-auto overscroll-contain pr-1"
        >
          {board.participants.map((p, i) => (
            <li
              key={p.id}
              data-motion-item={p.id}
              className="grid min-w-0 grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-2"
            >
              <span className="text-sm text-ink/65 tabular-nums">{i + 1}</span>
              <input
                aria-label={`${t.participant} ${i + 1}`}
                maxLength={200}
                value={p.name}
                className={inputClass}
                onChange={(e) =>
                  state.change({
                    ...board,
                    participants: board.participants.map((player) =>
                      player.id === p.id ? { ...player, name: e.target.value } : player,
                    ),
                  })
                }
              />
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  className="min-h-11 min-w-11 rounded-md border border-forest/20 text-sm hover:bg-forest/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest disabled:opacity-40 motion-safe:transition-colors motion-safe:duration-150 motion-reduce:transition-none"
                  disabled={i === 0}
                  aria-label={`${t.up} ${i + 1}`}
                  onClick={() => {
                    const participants = [...board.participants];
                    [participants[i - 1], participants[i]] = [participants[i], participants[i - 1]];
                    void applyParticipants(participants);
                  }}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="min-h-11 min-w-11 rounded-md border border-forest/20 text-sm hover:bg-forest/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest disabled:opacity-40 motion-safe:transition-colors motion-safe:duration-150 motion-reduce:transition-none"
                  disabled={i === board.participants.length - 1}
                  aria-label={`${t.down} ${i + 1}`}
                  onClick={() => {
                    const participants = [...board.participants];
                    [participants[i], participants[i + 1]] = [participants[i + 1], participants[i]];
                    void applyParticipants(participants);
                  }}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-forest/20 text-forest hover:bg-forest/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest disabled:opacity-40 motion-safe:transition-colors motion-safe:duration-150 motion-reduce:transition-none"
                  aria-label={`${t.remove} ${p.name}`}
                  title={`${t.remove} ${p.name}`}
                  disabled={board.participants.length <= 2}
                  onClick={() =>
                    void applyParticipants(
                      board.participants.filter((player) => player.id !== p.id),
                    )
                  }
                >
                  <Trash2 aria-hidden="true" size={16} />
                </button>
              </div>
            </li>
          ))}
        </ol>
      </section>
      <section className="space-y-3 border-t border-forest/20 pt-4">
        <h2 className="text-lg font-semibold">{t.results}</h2>
        <p className="text-sm leading-relaxed text-ink/75">{t.resultsHint}</p>
        <label className="grid gap-1 text-sm font-semibold">
          {t.round}
          <select
            className={inputClass}
            value={round}
            onChange={(e) => setSelectedRound(Number(e.target.value))}
          >
            {rounds.map((_, i) => (
              <option key={i} value={i}>
                {i === rounds.length - 1 ? t.final : `${t.round} ${i + 1}`}
              </option>
            ))}
          </select>
        </label>
        <div className="max-h-[32rem] space-y-3 overflow-auto overscroll-contain pr-1">
          {rounds[round].map((match, index) => (
            <details
              key={match.id}
              open={index === 0}
              className="space-y-2 border-t border-forest/20 py-3"
            >
              <summary className="min-h-11 cursor-pointer py-2 text-sm font-semibold">
                {t.match} {index + 1}
              </summary>
              {match.players.map((id, side) => (
                <div key={side} className="flex min-w-0 items-center gap-2">
                  <span className="min-w-0 flex-1 text-base [overflow-wrap:anywhere]">
                    {id ? participantName(id) : match.pending ? t.pending : t.bye}
                  </span>
                  <input
                    aria-label={`${t.score}: ${id ? participantName(id) : t.pending}`}
                    className={`${inputClass} !w-20 shrink-0 text-center tabular-nums`}
                    maxLength={12}
                    inputMode="numeric"
                    disabled={!match.players.every(Boolean)}
                    value={match.scores[side]}
                    onChange={(e) => {
                      const scores: [string, string] = [...match.scores];
                      scores[side] = e.target.value;
                      state.change(setMatchResult(board, match.id, match.winner, scores));
                    }}
                  />
                </div>
              ))}
              {match.players.every(Boolean) ? (
                <label className="grid gap-1 text-sm font-semibold">
                  {t.winner}
                  <select
                    className={inputClass}
                    value={match.winner || ""}
                    onChange={(event) => {
                      const winner = event.currentTarget.value || null;
                      void (async () => {
                        if (
                          match.winner &&
                          match.winner !== winner &&
                          hasDependentResults(board, match.id)
                        ) {
                          const choice = await state.confirm(t.confirmClearResults, {
                            cancelLabel: t.stay,
                            confirmLabel: t.continue,
                          });
                          if (choice !== "confirm") return;
                        }
                        state.change(setMatchResult(board, match.id, winner, match.scores));
                      })();
                    }}
                  >
                    <option value="">{t.noWinner}</option>
                    {match.players.map((id) => (
                      <option key={id} value={id!}>
                        {participantName(id)}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <p className="text-sm text-ink/75">
                  {match.winner
                    ? `${t.winner}: ${participantName(match.winner)} (${t.bye})`
                    : t.pending}
                </p>
              )}
            </details>
          ))}
        </div>
      </section>
    </EditorShell>
  );
}
