"use client";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Minus,
  Pencil,
  Plus,
  Star,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { ColorControl, accentColors } from "./color-control";
import { Button, Modal } from "@/components/ui/ui";
import {
  newLeaderboard,
  moveItem,
  nextAvailableName,
  removeColumn,
  sortRows,
  updateLeaderboardCell,
  type Leaderboard,
} from "@/lib/studio";
import type { Lang } from "@/lib/i18n";
import { studioCopy } from "@/lib/studio-copy";
import { useDocument } from "./use-document";
import { CanvasControls } from "./canvas-controls";
import { EditorShell, inputClass, ThemeControls, VisibilitySettings } from "./editor-shell";
import { useListMotion } from "./use-list-motion";
export function LeaderboardEditor({ lang }: { lang: Lang }) {
  const t = studioCopy[lang];
  const initial = useMemo(() => {
    const board = newLeaderboard();

    return {
      ...board,
      title: t.leaderboard,
      subtitle: "",
      columns: [t.team, t.points],
      rows: board.rows.map((row, index) => ({
        ...row,
        cells: [`${t.team} ${index + 1}`, "0"],
      })),
    };
  }, [t.leaderboard, t.points, t.team]);
  const state = useDocument(initial, t);
  const board = state.document as Leaderboard;
  const { list: rowList, capture: captureRows } = useListMotion<HTMLTableSectionElement>();
  const [sortColumn, setSortColumn] = useState("1");
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const editingRow = board.rows.find((row) => row.id === editingRowId);
  const changeCell = (rowId: string, column: number, value: string) =>
    state.change(updateLeaderboardCell(board, rowId, column, value));
  const setRows = (rows: Leaderboard["rows"]) => {
    if (rows.map((row) => row.id).join("\u0000") !== board.rows.map((row) => row.id).join("\u0000"))
      captureRows();
    state.change({ ...board, rows });
  };
  return (
    <EditorShell
      lang={lang}
      state={state}
      confirmationDialog={state.confirmationDialog}
      design={<ThemeControls document={board} change={state.change} lang={lang} />}
      settings={
        <div className="space-y-5">
          <fieldset className="space-y-3">
            <legend className="mb-2 font-semibold">{t.leaderboardLayout}</legend>
            <div className="flex flex-wrap gap-2" role="group" aria-label={t.leaderboardLayout}>
              {([1, 2, 3] as const).map((gridColumns) => (
                <Button
                  key={gridColumns}
                  aria-pressed={(board.gridColumns || 1) === gridColumns}
                  accent={(board.gridColumns || 1) === gridColumns}
                  onClick={() => state.change({ ...board, gridColumns })}
                >
                  {gridColumns === 1
                    ? t.oneColumn
                    : gridColumns === 2
                      ? t.twoColumns
                      : t.threeColumns}
                </Button>
              ))}
            </div>
          </fieldset>
          <fieldset className="space-y-3 border-t border-forest/20 pt-4">
            <legend className="mb-2 font-semibold">{t.rankingRules}</legend>
            <label className="grid gap-1 text-sm font-semibold">
              {t.sortBy}
              <select
                className={inputClass}
                value={sortColumn}
                onChange={(event) => setSortColumn(event.target.value)}
              >
                {board.columns.map((column, index) => (
                  <option key={index} value={index}>
                    {column || `${t.column} ${index + 1}`}
                  </option>
                ))}
              </select>
            </label>
            <p className="text-sm leading-5 text-ink/75">{t.manualOrderHint}</p>
            <div className="flex flex-wrap gap-2">
              <Button
                disabled={!board.rows.length}
                onClick={() => setRows(sortRows(board.rows, Number(sortColumn), "desc"))}
              >
                {t.sortDesc}
              </Button>
              <Button
                disabled={!board.rows.length}
                onClick={() => setRows(sortRows(board.rows, Number(sortColumn), "asc"))}
              >
                {t.sortAsc}
              </Button>
            </div>
          </fieldset>
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
            <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-forest/25 px-4 text-sm font-medium text-forest transition-colors focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-forest hover:bg-forest/5 has-[:disabled]:pointer-events-none has-[:disabled]:opacity-50">
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
      <section className="min-w-0 space-y-3">
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
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-forest/20 pt-4">
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
            onClick={() => {
              const teamColumn = Math.max(0, board.columns.indexOf(t.team));
              const pointsColumn = Math.max(
                teamColumn === 0 ? 1 : 0,
                board.columns.indexOf(t.points),
              );
              const name = nextAvailableName(
                t.team,
                board.rows.map((row) => row.cells[teamColumn] || ""),
              );
              setRows([
                ...board.rows,
                {
                  id: crypto.randomUUID(),
                  cells: board.columns.map((_, index) =>
                    index === teamColumn ? name : index === pointsColumn ? "0" : "",
                  ),
                  highlighted: false,
                },
              ]);
            }}
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
                columnWidths: board.columnWidths ? [...board.columnWidths, 160] : undefined,
                rows: board.rows.map((r) => ({ ...r, cells: [...r.cells, ""] })),
              })
            }
          >
            <Plus size={16} />
            {t.addColumn}
          </Button>
        </div>
        {board.rows.length === 0 && (
          <p className="text-sm leading-5 text-ink/75">{t.emptyLeaderboard}</p>
        )}
        <div
          data-editor-table
          tabIndex={0}
          aria-label={`${t.rows} & ${t.columns}`}
          className="max-h-[min(54dvh,34rem)] max-w-full [scrollbar-gutter:stable] overflow-auto overscroll-contain rounded-lg border border-forest/25"
        >
          <table className="w-max min-w-full border-collapse text-sm sm:text-base">
            <thead className="sticky top-0 z-10 bg-paper">
              <tr>
                <th scope="col" className="p-2 text-sm">
                  #
                </th>
                {board.columns.map((column, i) => (
                  <th
                    scope="col"
                    key={i}
                    className="min-w-28 border-l border-forest/15 p-1.5 sm:min-w-36 sm:p-2"
                  >
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
                    <details className="mt-1">
                      <summary className="cursor-pointer py-2 text-xs font-medium text-action">
                        {t.editing}
                      </summary>
                      <label className="grid gap-1 py-2 text-xs font-medium">
                        {t.width}
                        <input
                          type="number"
                          min="80"
                          max="800"
                          value={board.columnWidths?.[i] ?? (i === 0 ? 300 : 160)}
                          className={inputClass}
                          onChange={(e) => {
                            const width = Number(e.target.value);
                            if (width >= 80 && width <= 800)
                              state.change({
                                ...board,
                                columnWidths: board.columns.map((_, index) =>
                                  index === i
                                    ? width
                                    : (board.columnWidths?.[index] ?? (index === 0 ? 300 : 160)),
                                ),
                              });
                          }}
                        />
                      </label>
                      <div className="flex flex-wrap gap-1">
                        <IconButton
                          label={`${t.left}: ${column}`}
                          disabled={i === 0}
                          onClick={() =>
                            state.change({
                              ...board,
                              columns: moveItem(board.columns, i, i - 1),
                              columnWidths: board.columnWidths
                                ? moveItem(board.columnWidths, i, i - 1)
                                : undefined,
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
                              columnWidths: board.columnWidths
                                ? moveItem(board.columnWidths, i, i + 1)
                                : undefined,
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
                    </details>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody ref={rowList}>
              {board.rows.map((row, index) => (
                <tr
                  key={row.id}
                  data-motion-item={row.id}
                  className={row.highlighted ? "bg-forest/10" : ""}
                >
                  <th
                    scope="row"
                    className="min-w-28 border-t border-forest/15 p-1.5 text-sm sm:p-2"
                  >
                    <div className="flex items-center justify-center gap-1">
                      <input
                        aria-label={`${t.position} ${index + 1}`}
                        className={`${inputClass} !w-14 px-1.5 text-center tabular-nums sm:!w-20 sm:px-3`}
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
                      <button
                        type="button"
                        aria-label={`${t.editing}: ${row.cells[0] || `${t.rows} ${index + 1}`}`}
                        title={t.editing}
                        onClick={() => setEditingRowId(row.id)}
                        className="inline-flex min-h-11 min-w-9 shrink-0 items-center justify-center rounded-md border border-forest/20 text-forest hover:bg-forest/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
                      >
                        <Pencil aria-hidden="true" size={15} />
                      </button>
                    </div>
                    <details className="mt-1">
                      <summary className="cursor-pointer py-2 text-xs font-medium text-action">
                        {t.advanced}
                      </summary>
                      <div className="grid grid-cols-2 gap-1">
                        <IconButton
                          label={`${t.up} ${index + 1}`}
                          disabled={index === 0}
                          onClick={() => setRows(moveItem(board.rows, index, index - 1))}
                        >
                          <ArrowUp size={14} />
                        </IconButton>
                        <IconButton
                          label={`${t.down} ${index + 1}`}
                          disabled={index === board.rows.length - 1}
                          onClick={() => setRows(moveItem(board.rows, index, index + 1))}
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
                          onClick={() => setRows(board.rows.filter((r) => r.id !== row.id))}
                        >
                          <Trash2 size={14} />
                        </IconButton>
                      </div>
                      <ColorControl
                        label={t.background}
                        value={row.color || board.style.accent}
                        colors={accentColors}
                        copy={t}
                        change={(color) =>
                          state.change({
                            ...board,
                            rows: board.rows.map((item) =>
                              item.id === row.id ? { ...item, color } : item,
                            ),
                          })
                        }
                      />
                    </details>
                  </th>
                  {row.cells.map((cell, column) => {
                    const numericValue = Number(cell);
                    const numeric = cell.trim() !== "" && Number.isFinite(numericValue);
                    const adjust = (amount: number) =>
                      changeCell(row.id, column, String(numericValue + amount));
                    const label = `${t.rows} ${index + 1}, ${board.columns[column]}`;

                    return (
                      <td key={column} className="border-t border-l border-forest/15 p-2">
                        <div className="flex min-w-0 items-center gap-1">
                          {numeric && column > 0 && (
                            <button
                              type="button"
                              aria-label={`${t.decreasePoints}: ${label}`}
                              title={t.decreasePoints}
                              onClick={() => adjust(-1)}
                              className="inline-flex min-h-10 min-w-9 items-center justify-center rounded-md border border-forest/20 text-forest hover:bg-forest/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest motion-safe:transition-colors motion-safe:duration-150 motion-reduce:transition-none sm:min-h-11 sm:min-w-10"
                            >
                              <Minus aria-hidden="true" size={15} />
                            </button>
                          )}
                          <input
                            className={`${inputClass} min-w-20 flex-1 px-2 sm:min-w-28 sm:px-3 ${numeric && column > 0 ? "text-center tabular-nums" : ""}`}
                            aria-label={label}
                            maxLength={200}
                            inputMode={numeric && column > 0 ? "decimal" : undefined}
                            value={cell}
                            onChange={(event) => changeCell(row.id, column, event.target.value)}
                            onKeyDown={(event) => {
                              if (!numeric || column === 0) return;
                              if (event.key === "ArrowUp" || event.key === "ArrowDown") {
                                event.preventDefault();
                                adjust(event.key === "ArrowUp" ? 1 : -1);
                              }
                            }}
                          />
                          {numeric && column > 0 && (
                            <button
                              type="button"
                              aria-label={`${t.increasePoints}: ${label}`}
                              title={t.increasePoints}
                              onClick={() => adjust(1)}
                              className="inline-flex min-h-10 min-w-9 items-center justify-center rounded-md border border-forest/20 text-forest hover:bg-forest/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest motion-safe:transition-colors motion-safe:duration-150 motion-reduce:transition-none sm:min-h-11 sm:min-w-10"
                            >
                              <Plus aria-hidden="true" size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {editingRow && (
          <Modal
            title={`${t.editing}: ${editingRow.cells[0] || t.rows}`}
            close={() => setEditingRowId(null)}
            closeLabel={t.close}
            size="wide"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-sm font-semibold">
                {t.position}
                <input
                  className={inputClass}
                  maxLength={6}
                  value={editingRow.position || ""}
                  onChange={(event) =>
                    state.change({
                      ...board,
                      rows: board.rows.map((row) =>
                        row.id === editingRow.id ? { ...row, position: event.target.value } : row,
                      ),
                    })
                  }
                />
              </label>
              {board.columns.map((column, index) => (
                <label key={index} className="grid gap-1 text-sm font-semibold">
                  {column || `${t.column} ${index + 1}`}
                  <input
                    className={inputClass}
                    maxLength={200}
                    value={editingRow.cells[index] || ""}
                    onChange={(event) => {
                      const cells = [...editingRow.cells];
                      cells[index] = event.target.value;
                      state.change({
                        ...board,
                        rows: board.rows.map((row) =>
                          row.id === editingRow.id ? { ...row, cells } : row,
                        ),
                      });
                    }}
                  />
                </label>
              ))}
            </div>
          </Modal>
        )}
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
