import { graphicPresets, type GraphicBase } from "./graphic-style.ts";
export type MatchResult = { winner: string | null; scores: [string, string] };
export type Bracket = GraphicBase & {
  kind: "bracket";
  layout: "single" | "split";
  participants: { id: string; name: string }[];
  results: Record<string, MatchResult>;
};
export type BracketMatch = {
  id: string;
  players: [string | null, string | null];
  winner: string | null;
  scores: [string, string];
  pending: boolean;
};
export function newBracket(id = crypto.randomUUID()): Bracket {
  return {
    version: 1,
    id,
    kind: "bracket",
    title: "The weekend cup",
    subtitle: "One tournament. One champion.",
    updatedAt: 0,
    style: { ...graphicPresets.night },
    layout: "split",
    participants: ["Falcons", "Foxes", "Owls", "Bears", "Wolves", "Lions", "Hawks", "Otters"].map(
      (name, i) => ({ id: `player-${i}`, name }),
    ),
    results: {},
  };
}
export function resizeBracket(board: Bracket, count: number): Bracket {
  if (!Number.isInteger(count) || count < 2 || count > 64)
    throw new Error("Participant count must be 2–64");
  return {
    ...board,
    results: {},
    participants: Array.from(
      { length: count },
      (_, i) => board.participants[i] || { id: crypto.randomUUID(), name: `${i + 1}` },
    ),
  };
}
export function bracketRounds(board: Bracket): BracketMatch[][] {
  const size = 2 ** Math.ceil(Math.log2(board.participants.length));
  let seeds = [1, 2];
  while (seeds.length < size) {
    const next = seeds.length * 2 + 1;
    seeds = seeds.flatMap((seed) => [seed, next - seed]);
  }
  let slots = seeds.map((seed) => ({
    player: board.participants[seed - 1]?.id || null,
    pending: false,
  }));
  const rounds: BracketMatch[][] = [];
  while (slots.length > 1) {
    const round = slots.reduce<BracketMatch[]>((all, left, i) => {
      if (i % 2) return all;
      const right = slots[i + 1];
      const id = `${rounds.length}-${i / 2}`;
      const result = board.results[id];
      const players: BracketMatch["players"] = [left.player, right.player];
      const pending = left.pending || right.pending;
      const bye = !pending && players.filter(Boolean).length === 1;
      const winner = bye
        ? players.find(Boolean)!
        : !pending && players.every(Boolean) && result?.winner && players.includes(result.winner)
          ? result.winner
          : null;
      all.push({ id, players, winner, pending, scores: result?.scores || ["", ""] });
      return all;
    }, []);
    rounds.push(round);
    slots = round.map((match) => ({
      player: match.winner,
      pending: !match.winner && (match.pending || match.players.some(Boolean)),
    }));
  }
  return rounds;
}
export function setMatchResult(
  board: Bracket,
  id: string,
  winner: string | null,
  scores: [string, string],
): Bracket {
  const rounds = bracketRounds(board);
  const match = rounds.flat().find((m) => m.id === id);
  if (
    !match ||
    !match.players.every(Boolean) ||
    (winner !== null && !match.players.includes(winner)) ||
    scores.some((score) => score.length > 12)
  )
    throw new Error("Invalid match result");
  const results = { ...board.results, [id]: { winner, scores } };
  if (match.winner !== winner) {
    let [round, index] = id.split("-").map(Number);
    while (++round < rounds.length) {
      index = Math.floor(index / 2);
      delete results[`${round}-${index}`];
    }
  }
  return { ...board, results };
}
