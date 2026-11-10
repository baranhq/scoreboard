"use client";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/ui";
import { bracketRounds, resizeBracket, setMatchResult, type Bracket } from "@/lib/brackets";
import type { Lang } from "@/lib/i18n";
import { studioCopy } from "@/lib/studio-copy";
import { studioDemo } from "@/lib/studio-demo";
import { moveItem } from "@/lib/studio";
import { StressControls } from "./stress-controls";
import { useDocument } from "./use-document";
import { EditorShell, inputClass } from "./editor-shell";
export function BracketEditor({ lang }: { lang: Lang }) {
  const t = studioCopy[lang];
  const initial = useMemo(() => studioDemo("bracket", lang), [lang]);
  const state = useDocument(initial, t);
  const board = state.document as Bracket;
  const [count, setCount] = useState("");
  const [selectedRound, setSelectedRound] = useState(0);
  const rounds = bracketRounds(board);
  const round = Math.min(selectedRound, rounds.length - 1);
  const participantName = (id: string | null) =>
    board.participants.find((p) => p.id === id)?.name || t.pending;
  const reorder = (index: number, to: number) =>
    state.change({ ...board, participants: moveItem(board.participants, index, to), results: {} });
  return (
    <EditorShell lang={lang} state={state}>
      <StressControls initial={initial} change={state.change} labels={t} />
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t.participants}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="grid gap-1 text-sm font-semibold">
              {t.count}
              <input
                type="number"
                min={2}
                max={64}
                step={1}
                value={count || board.participants.length}
                onChange={(e) => setCount(e.target.value)}
                className={inputClass}
              />
            </label>
            <Button
              className="mt-2"
              disabled={
                !count ||
                !Number.isInteger(Number(count)) ||
                Number(count) < 2 ||
                Number(count) > 64 ||
                Number(count) === board.participants.length
              }
              onClick={() => {
                state.change(resizeBracket(board, Number(count)));
                setCount("");
                setSelectedRound(0);
              }}
            >
              {t.apply}
            </Button>
          </div>
          <label className="grid content-start gap-1 text-sm font-semibold">
            {t.layout}
            <select
              value={board.layout}
              className={inputClass}
              onChange={(e) =>
                state.change({ ...board, layout: e.target.value as Bracket["layout"] })
              }
            >
              <option value="single">{t.single}</option>
              <option value="split">{t.split}</option>
            </select>
          </label>
        </div>
        <p className="text-sm leading-relaxed text-ink/75">{t.resetWarning}</p>
        <ol className="grid max-h-80 gap-2 overflow-auto overscroll-contain pr-1 sm:grid-cols-2">
          {board.participants.map((p, i) => (
            <li key={p.id} className="flex min-w-0 items-center gap-1">
              <span className="w-6 shrink-0 text-sm tabular-nums">{i + 1}</span>
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
              <div className="flex shrink-0 flex-col">
                <button
                  className="min-h-9 min-w-9 rounded text-sm hover:bg-forest/10"
                  disabled={i === 0}
                  aria-label={`${t.up} ${i + 1}`}
                  onClick={() => reorder(i, i - 1)}
                >
                  ↑
                </button>
                <button
                  className="min-h-9 min-w-9 rounded text-sm hover:bg-forest/10"
                  disabled={i === board.participants.length - 1}
                  aria-label={`${t.down} ${i + 1}`}
                  onClick={() => reorder(i, i + 1)}
                >
                  ↓
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
            <fieldset key={match.id} className="space-y-2 rounded-lg border border-forest/20 p-3">
              <legend className="px-1 text-sm font-semibold">
                {t.match} {index + 1}
              </legend>
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
                    onChange={(e) =>
                      state.change(
                        setMatchResult(board, match.id, e.target.value || null, match.scores),
                      )
                    }
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
            </fieldset>
          ))}
        </div>
      </section>
    </EditorShell>
  );
}
