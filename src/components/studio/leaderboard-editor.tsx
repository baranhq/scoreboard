"use client";
import { ArrowDown, ArrowUp, ArrowLeft, ArrowRight, Trash2, Star, Plus } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/ui";
import { moveItem, removeColumn, sortRows, type Leaderboard } from "@/lib/studio";
import type { Lang } from "@/lib/i18n";
import { studioCopy } from "@/lib/studio-copy";
import { studioDemo } from "@/lib/studio-demo";
import { StressControls } from "./stress-controls";
import { useDocument } from "./use-document";
import { EditorShell, inputClass } from "./editor-shell";
export function LeaderboardEditor({ lang }: { lang: Lang }) {
  const t = studioCopy[lang];
  const initial = useMemo(() => studioDemo("leaderboard", lang), [lang]);
  const state = useDocument(initial, t);
  const board = state.document as Leaderboard;
  const changeCell = (row: number, column: number, value: string) =>
    state.change({
      ...board,
      rows: board.rows.map((r, i) =>
        i === row ? { ...r, cells: r.cells.map((cell, j) => (j === column ? value : cell)) } : r,
      ),
    });
  return (
    <EditorShell lang={lang} state={state}>
      <StressControls initial={initial} change={state.change} labels={t} />
      <section className="min-w-0 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">
            {t.rows} & {t.columns}
          </h2>
          <span className="text-sm tabular-nums">
            {board.rows.length}/100 · {board.columns.length}/10
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            disabled={board.rows.length >= 100}
            onClick={() =>
              state.change({
                ...board,
                rows: [
                  ...board.rows,
                  {
                    id: crypto.randomUUID(),
                    cells: board.columns.map(() => ""),
                    highlighted: false,
                  },
                ],
              })
            }
          >
            <Plus size={16} />
            {t.addRow}
          </Button>
          <Button
            disabled={board.columns.length >= 10}
            onClick={() =>
              state.change({
                ...board,
                columns: [...board.columns, `${t.column} ${board.columns.length + 1}`],
                rows: board.rows.map((r) => ({ ...r, cells: [...r.cells, ""] })),
              })
            }
          >
            <Plus size={16} />
            {t.addColumn}
          </Button>
        </div>
        <div
          tabIndex={0}
          aria-label={`${t.rows} & ${t.columns}`}
          className="max-h-[65svh] overflow-auto overscroll-contain rounded-lg border border-forest/25"
        >
          <table className="w-full border-collapse text-base">
            <thead className="sticky top-0 z-10 bg-paper">
              <tr>
                <th scope="col" className="p-2 text-sm">
                  #
                </th>
                {board.columns.map((column, i) => (
                  <th scope="col" key={i} className="min-w-52 border-l border-forest/15 p-2">
                    <input
                      aria-label={`${t.column} ${i + 1}`}
                      className={inputClass}
                      maxLength={80}
                      value={column}
                      onChange={(e) =>
                        state.change({
                          ...board,
                          columns: board.columns.map((c, j) => (j === i ? e.target.value : c)),
                        })
                      }
                    />
                    <div className="mt-1 flex flex-wrap gap-1">
                      <IconButton
                        label={`${t.left}: ${column}`}
                        disabled={i === 0}
                        onClick={() =>
                          state.change({
                            ...board,
                            columns: moveItem(board.columns, i, i - 1),
                            rows: board.rows.map((r) => ({
                              ...r,
                              cells: moveItem(r.cells, i, i - 1),
                            })),
                          })
                        }
                      >
                        <ArrowLeft size={14} />
                      </IconButton>
                      <IconButton
                        label={`${t.right}: ${column}`}
                        disabled={i === board.columns.length - 1}
                        onClick={() =>
                          state.change({
                            ...board,
                            columns: moveItem(board.columns, i, i + 1),
                            rows: board.rows.map((r) => ({
                              ...r,
                              cells: moveItem(r.cells, i, i + 1),
                            })),
                          })
                        }
                      >
                        <ArrowRight size={14} />
                      </IconButton>
                      <IconButton
                        label={`${t.sortAsc}: ${column}`}
                        onClick={() =>
                          state.change({ ...board, rows: sortRows(board.rows, i, "asc") })
                        }
                      >
                        <ArrowUp size={14} />
                      </IconButton>
                      <IconButton
                        label={`${t.sortDesc}: ${column}`}
                        onClick={() =>
                          state.change({ ...board, rows: sortRows(board.rows, i, "desc") })
                        }
                      >
                        <ArrowDown size={14} />
                      </IconButton>
                      <IconButton
                        label={`${t.remove}: ${column}`}
                        disabled={board.columns.length <= 1}
                        onClick={() => state.change(removeColumn(board, i))}
                      >
                        <Trash2 size={14} />
                      </IconButton>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {board.rows.map((row, index) => (
                <tr key={row.id} className={row.highlighted ? "bg-forest/10" : ""}>
                  <th scope="row" className="min-w-28 border-t border-forest/15 p-2 text-sm">
                    <input
                      aria-label={`${t.position} ${index + 1}`}
                      className={`${inputClass} !w-20 text-center tabular-nums`}
                      maxLength={6}
                      placeholder={String(index + 1)}
                      value={row.position || ""}
                      onChange={(e) =>
                        state.change({
                          ...board,
                          rows: board.rows.map((r) =>
                            r.id === row.id ? { ...r, position: e.target.value } : r,
                          ),
                        })
                      }
                    />
                    <div className="mt-1 grid grid-cols-2 gap-1">
                      <IconButton
                        label={`${t.up} ${index + 1}`}
                        disabled={index === 0}
                        onClick={() =>
                          state.change({ ...board, rows: moveItem(board.rows, index, index - 1) })
                        }
                      >
                        <ArrowUp size={14} />
                      </IconButton>
                      <IconButton
                        label={`${t.down} ${index + 1}`}
                        disabled={index === board.rows.length - 1}
                        onClick={() =>
                          state.change({ ...board, rows: moveItem(board.rows, index, index + 1) })
                        }
                      >
                        <ArrowDown size={14} />
                      </IconButton>
                      <IconButton
                        label={`${t.highlight} ${index + 1}`}
                        pressed={row.highlighted}
                        onClick={() =>
                          state.change({
                            ...board,
                            rows: board.rows.map((r) =>
                              r.id === row.id ? { ...r, highlighted: !r.highlighted } : r,
                            ),
                          })
                        }
                      >
                        <Star size={14} fill={row.highlighted ? "currentColor" : "none"} />
                      </IconButton>
                      <IconButton
                        label={`${t.remove} ${index + 1}`}
                        disabled={board.rows.length <= 1}
                        onClick={() =>
                          state.change({
                            ...board,
                            rows: board.rows.filter((r) => r.id !== row.id),
                          })
                        }
                      >
                        <Trash2 size={14} />
                      </IconButton>
                    </div>
                  </th>
                  {row.cells.map((cell, column) => (
                    <td key={column} className="border-t border-l border-forest/15 p-2">
                      <input
                        className={inputClass}
                        aria-label={`${t.rows} ${index + 1}, ${board.columns[column]}`}
                        maxLength={200}
                        value={cell}
                        onChange={(e) => changeCell(index, column, e.target.value)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </EditorShell>
  );
}
function IconButton({
  label,
  disabled,
  pressed,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  pressed?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-md border border-forest/20 text-forest hover:bg-forest/10 active:bg-forest/20"
    >
      {children}
    </button>
  );
}
