import type { Ref } from "react";
import type { Bracket } from "@/lib/brackets";
import type { Leaderboard, StudioDocument } from "@/lib/studio";
import { foreground } from "@/lib/colors";
import { bracketLayout, distributeRows, fitContentToCanvas, wrapText } from "@/lib/graphic-layout";
import type { StudioCopy } from "@/lib/studio-copy";
import type { PreviewField } from "@/lib/studio-edit";

function Lines({
  text,
  x,
  y,
  size = 22,
  width,
  fill,
  weight = 500,
  edit,
  labels,
  onEdit,
  anchor = "start",
}: {
  text: string;
  x: number;
  y: number;
  size?: number;
  width: number;
  fill: string;
  weight?: number;
  edit?: PreviewField;
  labels?: StudioCopy;
  onEdit?: (field: PreviewField) => void;
  anchor?: "start" | "middle" | "end";
}) {
  const editable = !!edit && !!labels && !!onEdit;
  const openEdit = () => {
    if (edit) onEdit?.(edit);
  };
  return (
    <text
      x={x}
      y={y}
      fill={fill}
      fontSize={size}
      fontWeight={weight}
      textAnchor={anchor}
      role={editable ? "button" : undefined}
      tabIndex={editable ? 0 : undefined}
      aria-label={editable && labels ? `${labels.clickToEdit}: ${text}` : undefined}
      className={
        editable ? "cursor-text outline-none hover:underline focus-visible:underline" : undefined
      }
      onClick={editable ? openEdit : undefined}
      onKeyDown={
        editable
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openEdit();
              }
            }
          : undefined
      }
    >
      <title>{text}</title>
      {wrapText(text, width).map((line, i) => (
        <tspan key={i} x={x} dy={i ? size * 1.3 : 0}>
          {line || "\u00a0"}
        </tspan>
      ))}
    </text>
  );
}
function Heading({
  doc,
  width,
  text,
  labels,
  onEdit,
}: {
  doc: StudioDocument;
  width: number;
  text: string;
  labels: StudioCopy;
  onEdit?: (field: PreviewField) => void;
}) {
  const titleLines = wrapText(doc.title, (width - 80) / 36).length;
  return (
    <>
      <rect width={width} height={8} fill={doc.style.accent} />
      <Lines
        text={doc.title}
        x={40}
        y={66}
        size={36}
        width={(width - 80) / 36}
        fill={text}
        weight={700}
        edit={{ kind: "title" }}
        labels={onEdit ? labels : undefined}
        onEdit={onEdit}
      />
      <Lines
        text={doc.subtitle}
        x={40}
        y={76 + titleLines * 47}
        size={20}
        width={(width - 80) / 20}
        fill={text}
        edit={{ kind: "subtitle" }}
        labels={onEdit ? labels : undefined}
        onEdit={onEdit}
      />
    </>
  );
}
export function LeaderboardGraphic({
  board,
  labels,
  svgRef,
  onEdit,
}: {
  board: Leaderboard;
  labels: StudioCopy;
  svgRef?: Ref<SVGSVGElement>;
  onEdit?: (field: PreviewField) => void;
}) {
  const widths = board.columns.map((column, i) =>
    Math.max(
      i === 0 ? 300 : 160,
      Math.min(
        480,
        Math.max(column.length, ...board.rows.map((row) => Array.from(row.cells[i]).length)) * 14 +
          40,
      ),
    ),
  );
  const columnWidth = 68 + widths.reduce((sum, w) => sum + w, 0);
  const groups = distributeRows(board.rows, board.gridColumns || 1);
  const groupGap = 32;
  const width = 80 + groups.length * columnWidth + (groups.length - 1) * groupGap;
  const header =
    110 +
    wrapText(board.title, (width - 80) / 36).length * 47 +
    wrapText(board.subtitle, (width - 80) / 20).length * 26;
  const columnHeight =
    Math.max(...board.columns.map((c, i) => wrapText(c, (widths[i] - 32) / 18).length)) * 28 + 22;
  const rowStart = header + columnHeight;
  const rowGroups = groups.map((group, groupIndex) => {
    let y = rowStart;
    const x = 40 + groupIndex * (columnWidth + groupGap);
    return group.map((row) => {
      const index = board.rows.findIndex((item) => item.id === row.id);
      const rank = row.position || String(index + 1);
      const height = Math.max(
        64,
        wrapText(rank, 3).length * 24 + 26,
        ...row.cells.map((cell, i) => wrapText(cell, (widths[i] - 32) / 22).length * 29 + 26),
      );
      const placement = { row, index, x, y, height };
      y += height;
      return placement;
    });
  });
  const height = Math.max(...rowGroups.map((rows) => rows.at(-1)!.y + rows.at(-1)!.height)) + 44;
  const rows = rowGroups.flat();
  const outputWidth = board.canvas?.width || width;
  const outputHeight = board.canvas?.height || height;
  const placement = fitContentToCanvas(width, height, outputWidth, outputHeight);
  const text = foreground(board.style.background);
  const onAccent = foreground(board.style.accent);
  return (
    <svg
      ref={svgRef}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${outputWidth} ${outputHeight}`}
      width={outputWidth}
      height={outputHeight}
      role={onEdit ? "group" : "img"}
      aria-label={
        onEdit
          ? `${board.title}. ${labels.clickToEdit}`
          : `${board.title}: ${board.rows.length} ${labels.rows}`
      }
      className="block h-auto w-full"
      fontFamily={`${board.style.font}, Arial, sans-serif`}
    >
      <title>{board.title}</title>
      <rect width={outputWidth} height={outputHeight} fill={board.style.background} />
      <g transform={`translate(${placement.x} ${placement.y}) scale(${placement.scale})`}>
        <Heading doc={board} width={width} text={text} labels={labels} onEdit={onEdit} />
        {groups.map((_, groupIndex) => {
          const x = 40 + groupIndex * (columnWidth + groupGap);
          return (
            <g key={groupIndex}>
              <Lines text="#" x={x + 12} y={header + 26} width={3} fill={text} size={18} />
              {board.columns.map((column, i) => (
                <Lines
                  key={i}
                  text={column}
                  x={x + 68 + widths.slice(0, i).reduce((a, b) => a + b, 0)}
                  y={header + 26}
                  width={(widths[i] - 32) / 18}
                  fill={text}
                  size={18}
                  weight={600}
                  edit={{ kind: "leaderboard-column", column: i }}
                  labels={onEdit ? labels : undefined}
                  onEdit={onEdit}
                />
              ))}
            </g>
          );
        })}
        {rows.map((row) => (
          <g
            key={row.row.id}
            transform={`translate(${row.x} ${row.y})`}
            className="motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
          >
            <rect
              x={0}
              y={0}
              width={columnWidth}
              height={row.height - 4}
              rx={board.style.preset === "editorial" ? 0 : 6}
              fill={row.row.highlighted ? board.style.accent : text}
              fillOpacity={row.row.highlighted ? 1 : row.index % 2 === 0 ? 0.06 : 0.025}
            />
            <Lines
              text={row.row.position || String(row.index + 1)}
              x={12}
              y={40}
              size={Math.min(24, 60 / String(row.row.position || row.index + 1).length)}
              width={3}
              fill={row.row.highlighted ? onAccent : text}
              weight={700}
              edit={{ kind: "leaderboard-position", rowId: row.row.id }}
              labels={onEdit ? labels : undefined}
              onEdit={onEdit}
            />
            {row.row.cells.map((cell, i) => (
              <Lines
                key={i}
                text={cell}
                x={68 + widths.slice(0, i).reduce((a, b) => a + b, 0)}
                y={39}
                width={(widths[i] - 32) / 22}
                fill={row.row.highlighted ? onAccent : text}
                weight={i === 0 ? 600 : 500}
                edit={{ kind: "leaderboard-cell", rowId: row.row.id, column: i }}
                labels={onEdit ? labels : undefined}
                onEdit={onEdit}
              />
            ))}
          </g>
        ))}
      </g>
    </svg>
  );
}
export function BracketGraphic({
  board,
  labels,
  svgRef,
  onEdit,
}: {
  board: Bracket;
  labels: StudioCopy;
  svgRef?: Ref<SVGSVGElement>;
  onEdit?: (field: PreviewField) => void;
}) {
  const { nodes, width, height, rowHeight, cardHeight, footerY } = bracketLayout(board);
  const outputWidth = board.canvas?.width || width;
  const outputHeight = board.canvas?.height || height;
  const placement = fitContentToCanvas(width, height, outputWidth, outputHeight);
  const text = foreground(board.style.background);
  const onAccent = foreground(board.style.accent);
  const name = (id: string | null) =>
    board.participants.find((p) => p.id === id)?.name || labels.pending;
  return (
    <svg
      ref={svgRef}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${outputWidth} ${outputHeight}`}
      width={outputWidth}
      height={outputHeight}
      role={onEdit ? "group" : "img"}
      aria-label={onEdit ? `${board.title}. ${labels.clickToEdit}` : board.title}
      className="block h-auto w-full"
      fontFamily={`${board.style.font}, Arial, sans-serif`}
    >
      <title>{board.title}</title>
      <rect width={outputWidth} height={outputHeight} fill={board.style.background} />
      <g transform={`translate(${placement.x} ${placement.y}) scale(${placement.scale})`}>
        <Heading doc={board} width={width} text={text} labels={labels} onEdit={onEdit} />
        {nodes
          .filter((node) => node.round > 0)
          .flatMap((node) =>
            [0, 1].map((side) => {
              const child = nodes.find(
                (n) => n.round === node.round - 1 && n.index === node.index * 2 + side,
              )!;
              const fromX = child.x + (child.right ? 0 : 220);
              const toX = node.x + (child.right ? 220 : 0);
              const fromY = child.y + cardHeight / 2;
              const toY = node.y + cardHeight / 2;
              return (
                <path
                  key={`${node.id}-${side}`}
                  d={`M${fromX},${fromY} H${(fromX + toX) / 2} V${toY} H${toX}`}
                  fill="none"
                  stroke={text}
                  strokeOpacity={0.4}
                  strokeWidth={2}
                />
              );
            }),
          )}
        {nodes.map((node) => (
          <g key={node.id}>
            <text x={node.x} y={node.y - 12} fill={text} fontSize={13} fontWeight={600}>
              {node.round === Math.log2(nodes.length + 1) - 1
                ? labels.final
                : `${labels.round} ${node.round + 1}`}{" "}
              · {node.index + 1}
            </text>
            <rect
              x={node.x}
              y={node.y}
              width={220}
              height={cardHeight}
              rx={6}
              fill={text}
              fillOpacity={0.06}
              stroke={text}
              strokeOpacity={0.28}
            />
            {node.players.map((id, i) => (
              <g key={i}>
                {id && node.winner === id && (
                  <rect
                    x={node.x}
                    y={node.y + i * rowHeight}
                    width={220}
                    height={rowHeight}
                    rx={5}
                    fill={board.style.accent}
                  />
                )}
                <Lines
                  text={id ? name(id) : node.pending ? labels.pending : labels.bye}
                  x={node.x + 12}
                  y={node.y + i * rowHeight + 25}
                  width={196 / 16}
                  size={16}
                  fill={id && node.winner === id ? onAccent : text}
                  weight={node.winner === id ? 700 : 500}
                  edit={id ? { kind: "bracket-participant", participantId: id } : undefined}
                  labels={onEdit ? labels : undefined}
                  onEdit={onEdit}
                />
                <Lines
                  text={node.scores[i] || "—"}
                  x={node.x + 206}
                  y={node.y + i * rowHeight + rowHeight - 8}
                  width={8}
                  size={12}
                  fill={id && node.winner === id ? onAccent : text}
                  anchor="end"
                  edit={
                    id && node.players.every(Boolean)
                      ? { kind: "bracket-score", matchId: node.id, side: i as 0 | 1 }
                      : undefined
                  }
                  labels={onEdit ? labels : undefined}
                  onEdit={onEdit}
                />
              </g>
            ))}
            <line
              x1={node.x}
              x2={node.x + 220}
              y1={node.y + rowHeight}
              y2={node.y + rowHeight}
              stroke={text}
              strokeOpacity={0.2}
            />
          </g>
        ))}
        {nodes.at(-1)?.winner && (
          <Lines
            text={`${labels.champion}: ${name(nodes.at(-1)!.winner)}`}
            x={40}
            y={footerY}
            width={(width - 80) / 18}
            size={18}
            fill={text}
            weight={700}
          />
        )}
      </g>
    </svg>
  );
}
export function Graphic({
  document,
  labels,
  svgRef,
  onEdit,
}: {
  document: StudioDocument;
  labels: StudioCopy;
  svgRef?: Ref<SVGSVGElement>;
  onEdit?: (field: PreviewField) => void;
}) {
  return document.kind === "leaderboard" ? (
    <LeaderboardGraphic board={document} labels={labels} svgRef={svgRef} onEdit={onEdit} />
  ) : (
    <BracketGraphic board={document} labels={labels} svgRef={svgRef} onEdit={onEdit} />
  );
}
