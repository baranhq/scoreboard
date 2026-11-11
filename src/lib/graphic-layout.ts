import { bracketRounds, type Bracket } from "./brackets.ts";
const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
function units(character: string): number {
  if (/^[MWÆŒШЩЖЮФМЫЪ]/u.test(character)) return 1.1;
  if (/^[mwæœшщжюфмыъ]/u.test(character)) return 1.05;
  if (/^[il|.,:;!'’]/u.test(character)) return 0.35;
  if (/^I/u.test(character)) return 0.5;
  if (/^\s/u.test(character)) return 0.4;
  if (/^\p{Lu}/u.test(character)) return 0.9;
  if (/^[\p{Ll}\p{N}]/u.test(character)) return 0.75;
  return 1.2;
}
// Conservative em estimates account for wide letters and intact grapheme clusters.
export function wrapText(text: string, limit: number): string[] {
  const lines: string[] = [];
  let line = "";
  let width = 0;
  for (const word of text.split(/\s+/)) {
    const characters = [...segmenter.segment(word)].map((part) => part.segment);
    const wordWidth = characters.reduce((sum, character) => sum + units(character), 0);
    if (line && width + 0.4 + wordWidth > limit) {
      lines.push(line);
      line = "";
      width = 0;
    }
    for (const character of characters) {
      const next = units(character);
      if (width + next > limit + 0.001 && line) {
        lines.push(line);
        line = "";
        width = 0;
      }
      line += character;
      width += next;
    }
    if (line) {
      line += " ";
      width += 0.4;
    }
  }
  if (line.trim() || !lines.length) lines.push(line.trimEnd());
  return lines.map((value) => value.trimEnd());
}
export function bracketLayout(board: Bracket) {
  const rounds = bracketRounds(board);
  const split = board.layout === "split" && rounds.length > 1;
  const textLines = Math.max(
    1,
    ...board.participants.map((p) => wrapText(p.name, 196 / 16).length),
  );
  const rowHeight = Math.max(44, textLines * 21 + 16);
  const cardHeight = rowHeight * 2;
  const pitch = cardHeight + 40;
  const width = (split ? rounds.length * 2 - 1 : rounds.length) * 260 + 40;
  const header =
    100 +
    wrapText(board.title, (width - 80) / 36).length * 47 +
    wrapText(board.subtitle, (width - 80) / 20).length * 26;
  const fieldHeight = (rounds[0].length / (split ? 2 : 1)) * pitch;
  const footerHeight = Math.max(
    50,
    ...board.participants.map((p) => wrapText(p.name, (width - 80) / 18).length * 26 + 30),
  );
  const height = header + fieldHeight + footerHeight;
  const nodes = rounds.flatMap((matches, round) =>
    matches.map((match, index) => {
      const final = round === rounds.length - 1;
      const right = split && !final && index >= matches.length / 2;
      const localIndex = right ? index - matches.length / 2 : index;
      return {
        ...match,
        round,
        index,
        x: 40 + (right ? rounds.length * 2 - 2 - round : round) * 260,
        y:
          header +
          (split && final ? fieldHeight / 2 : (localIndex + 0.5) * 2 ** round * pitch) -
          cardHeight / 2,
        right,
      };
    }),
  );
  return {
    nodes,
    width,
    height,
    cardHeight,
    rowHeight,
    header,
    footerY: header + fieldHeight + 20,
  };
}
