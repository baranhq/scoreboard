import type { Ref } from "react";
import type { Bracket } from "@/lib/brackets";
import type { Leaderboard, StudioDocument } from "@/lib/studio";
import { foreground } from "@/lib/colors";
import { bracketLayout, wrapText } from "@/lib/graphic-layout";
import type { StudioCopy } from "@/lib/studio-copy";

function Lines({
  text,
  x,
  y,
  size = 22,
  width,
  fill,
  weight = 500,
}: {
  text: string;
  x: number;
  y: number;
  size?: number;
  width: number;
  fill: string;
  weight?: number;
}) {
  return (
    <text x={x} y={y} fill={fill} fontSize={size} fontWeight={weight}>
      <title>{text}</title>
      {wrapText(text, width).map((line, i) => (
        <tspan key={i} x={x} dy={i ? size * 1.3 : 0}>
          {line || "\u00a0"}
        </tspan>
      ))}
    </text>
  );
}
function Heading({ doc, width, text }: { doc: StudioDocument; width: number; text: string }) {
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
      />
      <Lines
        text={doc.subtitle}
        x={40}
        y={76 + titleLines * 47}
        size={20}
        width={(width - 80) / 20}
        fill={text}
      />
    </>
  );
}
export function LeaderboardGraphic({
  board,
  labels,
  svgRef,
}: {
  board: Leaderboard;
  labels: StudioCopy;
  svgRef?: Ref<SVGSVGElement>;
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
  const width = 148 + widths.reduce((sum, w) => sum + w, 0);
  const header =
    110 +
    wrapText(board.title, (width - 80) / 36).length * 47 +
    wrapText(board.subtitle, (width - 80) / 20).length * 26;
  const columnHeight =
    Math.max(...board.columns.map((c, i) => wrapText(c, (widths[i] - 32) / 18).length)) * 28 + 22;
  const rows = board.rows.reduce<(Leaderboard["rows"][number] & { y: number; height: number })[]>(
    (all, row) => {
      const height = Math.max(
        64,
        ...row.cells.map((cell, i) => wrapText(cell, (widths[i] - 32) / 22).length * 29 + 26),
      );
      const previous = all.at(-1);
      return [
        ...all,
        { ...row, y: previous ? previous.y + previous.height : header + columnHeight, height },
      ];
    },
    [],
  );
  const last = rows.at(-1)!;
  const height = last.y + last.height + 44;
  const text = foreground(board.style.background);
  const onAccent = foreground(board.style.accent);
  return (
    <svg
      ref={svgRef}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label={`${board.title}: ${board.rows.length} ${labels.rows}`}
      className="block h-auto w-full"
      fontFamily={`${board.style.font}, Arial, sans-serif`}
    >
      <title>{board.title}</title>
      <rect width={width} height={height} fill={board.style.background} />
      <Heading doc={board} width={width} text={text} />
      <Lines text="#" x={52} y={header + 26} width={3} fill={text} size={18} />
      {board.columns.map((column, i) => (
        <Lines
          key={i}
          text={column}
          x={108 + widths.slice(0, i).reduce((a, b) => a + b, 0)}
          y={header + 26}
          width={(widths[i] - 32) / 18}
          fill={text}
          size={18}
          weight={600}
        />
      ))}
      {rows.map((row, index) => (
        <g key={row.id}>
          <rect
            x={40}
            y={row.y}
            width={width - 80}
            height={row.height - 4}
            rx={board.style.preset === "editorial" ? 0 : 6}
            fill={row.highlighted ? board.style.accent : text}
            fillOpacity={row.highlighted ? 1 : index % 2 === 0 ? 0.06 : 0.025}
          />
          <text
            x={58}
            y={row.y + 40}
            fontSize={Math.min(24, 60 / Math.max(1, (row.position || String(index + 1)).length))}
            fontWeight={700}
            fill={row.highlighted ? onAccent : text}
          >
            {row.position || index + 1}
          </text>
          {row.cells.map((cell, i) => (
            <Lines
              key={i}
              text={cell}
              x={108 + widths.slice(0, i).reduce((a, b) => a + b, 0)}
              y={row.y + 39}
              width={(widths[i] - 32) / 22}
              fill={row.highlighted ? onAccent : text}
              weight={i === 0 ? 600 : 500}
            />
          ))}
        </g>
      ))}
    </svg>
  );
}
export function BracketGraphic({
  board,
  labels,
  svgRef,
}: {
  board: Bracket;
  labels: StudioCopy;
  svgRef?: Ref<SVGSVGElement>;
}) {
  const { nodes, width, height, rowHeight, cardHeight, footerY } = bracketLayout(board);
  const text = foreground(board.style.background);
  const onAccent = foreground(board.style.accent);
  const name = (id: string | null) =>
    board.participants.find((p) => p.id === id)?.name || labels.pending;
  return (
    <svg
      ref={svgRef}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label={board.title}
      className="block h-auto w-full"
      fontFamily={`${board.style.font}, Arial, sans-serif`}
    >
      <title>{board.title}</title>
      <rect width={width} height={height} fill={board.style.background} />
      <Heading doc={board} width={width} text={text} />
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
              />
              {node.scores[i] && (
                <text
                  x={node.x + 206}
                  y={node.y + i * rowHeight + rowHeight - 8}
                  textAnchor="end"
                  fontSize={12}
                  fill={id && node.winner === id ? onAccent : text}
                >
                  {node.scores[i]}
                </text>
              )}
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
    </svg>
  );
}
export function Graphic({
  document,
  labels,
  svgRef,
}: {
  document: StudioDocument;
  labels: StudioCopy;
  svgRef?: Ref<SVGSVGElement>;
}) {
  return document.kind === "leaderboard" ? (
    <LeaderboardGraphic board={document} labels={labels} svgRef={svgRef} />
  ) : (
    <BracketGraphic board={document} labels={labels} svgRef={svgRef} />
  );
}
