import { useId, type Ref } from "react";
import type { Bracket } from "@/lib/brackets";
import type { Leaderboard, StudioDocument } from "@/lib/studio";
import { foreground, readableText } from "@/lib/colors";
import {
  bracketLayout,
  distributeRows,
  fitContentToCanvas,
  graphicHeaderHeight,
  wrapText,
} from "@/lib/graphic-layout";
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
  onEdit?: (field: PreviewField, target: SVGTextElement) => void;
  anchor?: "start" | "middle" | "end";
}) {
  const editable = !!edit && !!labels && !!onEdit;
  const openEdit = (target: SVGTextElement) => {
    if (edit) onEdit?.(edit, target);
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
      className={`motion-safe:transition-[fill] motion-safe:duration-150 motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${editable ? "cursor-text outline-none hover:underline focus-visible:underline" : ""}`}
      onClick={editable ? (event) => openEdit(event.currentTarget) : undefined}
      onKeyDown={
        editable
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openEdit(event.currentTarget);
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
  onEdit?: (field: PreviewField, target: SVGTextElement) => void;
}) {
  const titleLines =
    doc.style.titleVisible === false || !doc.title.trim()
      ? 0
      : wrapText(doc.title, (width - 80) / 36).length;
  return (
    <>
      {doc.style.titleVisible !== false && !!doc.title.trim() && (
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
      )}
      {doc.style.subtitleVisible !== false && !!doc.subtitle.trim() && (
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
      )}
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
  onEdit?: (field: PreviewField, target: SVGTextElement) => void;
}) {
  const widths = board.columns.map(
    (column, i) =>
      board.columnWidths?.[i] ??
      Math.max(
        i === 0 ? 300 : 160,
        Math.min(
          480,
          Math.max(column.length, ...board.rows.map((row) => Array.from(row.cells[i]).length)) *
            14 +
            40,
        ),
      ),
  );
  const columnWidth = 68 + widths.reduce((sum, w) => sum + w, 0);
  const groups = distributeRows(board.rows, board.gridColumns || 1);
  if (!groups.length) groups.push([]);
  const groupGap = 32;
  const width = 80 + groups.length * columnWidth + (groups.length - 1) * groupGap;
  const header = graphicHeaderHeight(board, width);
  const columnHeight =
    Math.max(...board.columns.map((c, i) => wrapText(c, (widths[i] - 32) / 18).length)) * 28 + 22;
  const rowStart = header + columnHeight;
  const rowGroups = groups.map((group, groupIndex) => {
    let y = rowStart;
    const x = 40 + groupIndex * (columnWidth + groupGap);
    return group.map((row) => {
      const index = board.rows.findIndex((item) => item.id === row.id);
      const rank =
        board.totalColumn === undefined ? row.position || String(index + 1) : String(index + 1);
      const height = Math.max(
        board.style.density === "spacious" ? 88 : 64,
        wrapText(rank, 3).length * 24 + 26,
        ...row.cells.map((cell, i) => wrapText(cell, (widths[i] - 32) / 22).length * 29 + 26),
      );
      const placement = { row, index, rank, x, y, height };
      y += height + (board.style.rowSeparators ? 12 : 8);
      return placement;
    });
  });
  const height = Math.max(rowStart + 72, ...rowGroups.flat().map((row) => row.y + row.height)) + 44;
  const rows = rowGroups.flat();
  const outputWidth = board.canvas?.width || width;
  const outputHeight = board.canvas?.height || height;
  const placement = fitContentToCanvas(width, height, outputWidth, outputHeight);
  const gradientId = useId();
  const text = readableText(board.style.background, board.style.textColor);
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
      <defs>
        <linearGradient id={gradientId} x2="1" y2="1">
          <stop
            stopColor={board.style.background}
            className="motion-safe:transition-[stop-color] motion-safe:duration-200 motion-safe:ease-out motion-reduce:transition-none"
          />
          <stop
            offset="1"
            stopColor={board.style.backgroundEnd || board.style.accent}
            className="motion-safe:transition-[stop-color] motion-safe:duration-200 motion-safe:ease-out motion-reduce:transition-none"
          />
        </linearGradient>
      </defs>
      <rect
        width={outputWidth}
        height={outputHeight}
        fill={board.style.gradient ? `url(#${gradientId})` : board.style.background}
        className="motion-safe:transition-[fill] motion-safe:duration-200 motion-safe:ease-out motion-reduce:transition-none"
      />
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
                  x={
                    i === board.columns.length - 1
                      ? x + columnWidth - 12
                      : x + 68 + widths.slice(0, i).reduce((a, b) => a + b, 0)
                  }
                  y={header + 26}
                  width={(widths[i] - 32) / 18}
                  fill={text}
                  size={18}
                  weight={600}
                  anchor={i === board.columns.length - 1 ? "end" : "start"}
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
            className="motion-safe:transition-transform motion-safe:duration-[250ms] motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
          >
            <rect
              x={0}
              y={0}
              width={columnWidth}
              height={row.height}
              rx={board.style.radius ?? (board.style.preset === "editorial" ? 0 : 8)}
              stroke={
                board.style.rowSeparators ? board.style.borderColor || board.style.accent : "none"
              }
              strokeWidth={
                board.style.rowSeparators ? Math.min(board.style.borderWidth ?? 1, 1.5) : 0
              }
              strokeOpacity={board.style.rowSeparators ? 0.28 : 0}
              className="motion-safe:transition-[fill,fill-opacity,stroke,stroke-opacity,stroke-width] motion-safe:duration-200 motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
              fill={row.row.color || (row.row.highlighted ? board.style.accent : text)}
              fillOpacity={
                row.row.color || row.row.highlighted ? 1 : row.index % 2 === 0 ? 0.09 : 0.045
              }
            />
            <Lines
              text={row.rank}
              x={12}
              y={40}
              size={Math.min(24, 60 / row.rank.length)}
              width={3}
              fill={
                row.row.color ? foreground(row.row.color) : row.row.highlighted ? onAccent : text
              }
              weight={700}
              edit={
                board.totalColumn === undefined
                  ? { kind: "leaderboard-position", rowId: row.row.id }
                  : undefined
              }
              labels={onEdit && board.totalColumn === undefined ? labels : undefined}
              onEdit={board.totalColumn === undefined ? onEdit : undefined}
            />
            {row.row.cells.map((cell, i) => (
              <Lines
                key={i}
                text={cell}
                x={
                  i === board.columns.length - 1
                    ? columnWidth - 12
                    : 68 + widths.slice(0, i).reduce((a, b) => a + b, 0)
                }
                y={39}
                width={(widths[i] - 32) / 22}
                fill={
                  row.row.color ? foreground(row.row.color) : row.row.highlighted ? onAccent : text
                }
                weight={
                  i === board.totalColumn || i === board.columns.length - 1
                    ? 700
                    : i === 0
                      ? 600
                      : 500
                }
                anchor={i === board.columns.length - 1 ? "end" : "start"}
                edit={
                  i === board.totalColumn
                    ? undefined
                    : { kind: "leaderboard-cell", rowId: row.row.id, column: i }
                }
                labels={onEdit && i !== board.totalColumn ? labels : undefined}
                onEdit={i === board.totalColumn ? undefined : onEdit}
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
  onEdit?: (field: PreviewField, target: SVGTextElement) => void;
}) {
  const { nodes, width, height, rowHeight, cardHeight, footerY } = bracketLayout(board);
  const outputWidth = board.canvas?.width || width;
  const outputHeight = board.canvas?.height || height;
  const placement = fitContentToCanvas(width, height, outputWidth, outputHeight);
  const gradientId = useId();
  const text = readableText(board.style.background, board.style.textColor);
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
      <defs>
        <linearGradient id={gradientId} x2="1" y2="1">
          <stop
            stopColor={board.style.background}
            className="motion-safe:transition-[stop-color] motion-safe:duration-200 motion-safe:ease-out motion-reduce:transition-none"
          />
          <stop
            offset="1"
            stopColor={board.style.backgroundEnd || board.style.accent}
            className="motion-safe:transition-[stop-color] motion-safe:duration-200 motion-safe:ease-out motion-reduce:transition-none"
          />
        </linearGradient>
        <clipPath id={`${gradientId}-match`} clipPathUnits="userSpaceOnUse">
          <rect width={220} height={cardHeight} rx={board.style.radius ?? 8} />
        </clipPath>
      </defs>
      <rect
        width={outputWidth}
        height={outputHeight}
        fill={board.style.gradient ? `url(#${gradientId})` : board.style.background}
        className="motion-safe:transition-[fill] motion-safe:duration-200 motion-safe:ease-out motion-reduce:transition-none"
      />
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
              const advanced = !!child.winner && node.players.includes(child.winner);
              const connectorColor = board.style.connectorColor || board.style.borderColor || text;
              const connectorWidth = board.style.connectorWidth ?? board.style.borderWidth ?? 1.5;
              return (
                <path
                  key={`${node.id}-${side}`}
                  d={`M${fromX},${fromY} H${(fromX + toX) / 2} V${toY} H${toX}`}
                  fill="none"
                  stroke={advanced ? board.style.accent : connectorColor}
                  strokeOpacity={advanced ? 0.58 : 0.22}
                  strokeWidth={
                    advanced ? Math.min(connectorWidth, 2) : Math.min(connectorWidth, 1.4)
                  }
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="motion-safe:transition-[stroke,stroke-opacity,stroke-width] motion-safe:duration-200 motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
                />
              );
            }),
          )}
        {nodes.map((node) => (
          <g
            key={node.id}
            transform={`translate(${node.x} ${node.y})`}
            className="motion-safe:transition-transform motion-safe:duration-[250ms] motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
          >
            <text x={0} y={-12} fill={text} fillOpacity={0.76} fontSize={13} fontWeight={600}>
              {node.round === Math.log2(nodes.length + 1) - 1
                ? labels.final
                : `${labels.round} ${node.round + 1}`}{" "}
              · {node.index + 1}
            </text>
            <rect
              x={0}
              y={0}
              width={220}
              height={cardHeight}
              rx={board.style.radius ?? 8}
              fill={text}
              fillOpacity={0.045}
              stroke="none"
            />
            {node.players.map((id, i) => {
              const participant = board.participants.find((player) => player.id === id);
              const highlighted = !!id && (node.winner === id || !!participant?.color);
              const rowColor =
                node.winner === id ? board.style.accent : participant?.color || "transparent";
              const rowText =
                node.winner === id
                  ? onAccent
                  : participant?.color
                    ? foreground(participant.color)
                    : text;

              return (
                <g key={i}>
                  <rect
                    x={0}
                    y={i * rowHeight}
                    width={220}
                    height={rowHeight}
                    rx={Math.min(board.style.radius ?? 8, 4)}
                    clipPath={`url(#${gradientId}-match)`}
                    fill={rowColor}
                    fillOpacity={highlighted ? 1 : 0}
                    className="motion-safe:transition-[fill,fill-opacity] motion-safe:duration-200 motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
                  />
                  <Lines
                    text={id ? name(id) : node.pending ? labels.pending : labels.bye}
                    x={12}
                    y={i * rowHeight + 25}
                    width={196 / 16}
                    size={16}
                    fill={rowText}
                    weight={node.winner === id ? 700 : 500}
                    edit={id ? { kind: "bracket-participant", participantId: id } : undefined}
                    labels={onEdit ? labels : undefined}
                    onEdit={onEdit}
                  />
                  {board.style.showScores !== false && (
                    <Lines
                      text={node.scores[i] || "—"}
                      x={206}
                      y={i * rowHeight + rowHeight - 8}
                      width={8}
                      size={12}
                      fill={rowText}
                      anchor="end"
                      edit={
                        id && node.players.every(Boolean)
                          ? { kind: "bracket-score", matchId: node.id, side: i as 0 | 1 }
                          : undefined
                      }
                      labels={onEdit ? labels : undefined}
                      onEdit={onEdit}
                    />
                  )}
                </g>
              );
            })}
            <line
              x1={12}
              x2={208}
              y1={rowHeight}
              y2={rowHeight}
              stroke={board.style.borderColor || text}
              strokeOpacity={0.2}
              className="motion-safe:transition-[stroke,stroke-opacity] motion-safe:duration-[180ms] motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
            />
            <rect
              x={0}
              y={0}
              width={220}
              height={cardHeight}
              rx={board.style.radius ?? 8}
              fill="none"
              stroke={board.style.borderColor || text}
              strokeOpacity={0.24}
              strokeWidth={Math.min(board.style.borderWidth ?? 1, 1.5)}
              pointerEvents="none"
              className="motion-safe:transition-[stroke,stroke-opacity,stroke-width] motion-safe:duration-[180ms] motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none"
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
  onEdit?: (field: PreviewField, target: SVGTextElement) => void;
}) {
  return document.kind === "leaderboard" ? (
    <LeaderboardGraphic board={document} labels={labels} svgRef={svgRef} onEdit={onEdit} />
  ) : (
    <BracketGraphic board={document} labels={labels} svgRef={svgRef} onEdit={onEdit} />
  );
}
