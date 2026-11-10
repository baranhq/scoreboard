import { test } from "node:test";
import assert from "node:assert/strict";
import "fake-indexeddb/auto";
import {
  newLeaderboard,
  moveItem,
  removeColumn,
  sortRows,
  parseDocument,
} from "../src/lib/studio.ts";
import { newBracket, bracketRounds, setMatchResult, resizeBracket } from "../src/lib/brackets.ts";
import { saveDocument, listDocuments, deleteDocument } from "../src/store/studio.ts";

test("moving rows keeps values attached; removing a column removes its cells", () => {
  const board = newLeaderboard();
  const moved = moveItem(board.rows, 0, 2);
  assert.equal(moved[2].cells[0], "Team 1");
  assert.equal(board.rows[0].cells[0], "Team 1");
  assert.deepEqual(moveItem(board.rows, 0, -1), board.rows);
  const trimmed = removeColumn(board, 0);
  assert.equal(trimmed.columns.length, 1);
  assert.deepEqual(trimmed.rows[0].cells, ["42"]);
  assert.equal(removeColumn(trimmed, 0).columns.length, 1);
});

test("numeric sorting keeps participants and highlights together", () => {
  const board = newLeaderboard();
  board.rows[0].cells[1] = "9";
  board.rows[1].cells[1] = "100";
  const rows = sortRows(board.rows, 1, "desc");
  assert.equal(rows[0].cells[0], "Team 2");
  assert.equal(rows[1].cells[0], "Team 3");
});

test("byes advance automatically without producing a premature champion", () => {
  const board = resizeBracket(newBracket(), 5);
  const rounds = bracketRounds(board);
  assert.equal(rounds.length, 3);
  assert.equal(rounds[0].filter((m) => m.winner).length, 3);
  assert.equal(rounds[2][0].winner, null);
  assert.equal(new Set(rounds[0].flatMap((m) => m.players).filter(Boolean)).size, 5);
});

test("changing an upstream winner invalidates downstream results", () => {
  let board = resizeBracket(newBracket(), 4);
  let rounds = bracketRounds(board);
  board = setMatchResult(board, "0-0", rounds[0][0].players[0]!, ["2", "1"]);
  board = setMatchResult(board, "0-1", rounds[0][1].players[0]!, ["3", "0"]);
  rounds = bracketRounds(board);
  board = setMatchResult(board, "1-0", rounds[1][0].players[0]!, ["1", "0"]);
  assert.ok(bracketRounds(board)[1][0].winner);
  board = setMatchResult(board, "0-0", bracketRounds(board)[0][0].players[1]!, ["0", "2"]);
  assert.equal(bracketRounds(board)[1][0].winner, null);
  assert.equal(board.results["1-0"], undefined);
  assert.throws(() => setMatchResult(board, "0-0", "unknown", ["0", "0"]));
});

test("document parsing rejects corrupt, oversized and hostile data", () => {
  const board = newLeaderboard();
  assert.deepEqual(parseDocument(board), board);
  assert.throws(() => parseDocument({ ...board, version: 99 }));
  assert.throws(() =>
    parseDocument({ ...board, style: { ...board.style, accent: "url(https://bad)" } }),
  );
  assert.throws(() => parseDocument({ ...board, rows: Array(101).fill(board.rows[0]) }));
  assert.throws(() => parseDocument({ ...board, rows: [{ ...board.rows[0], cells: [] }] }));
  assert.throws(() =>
    parseDocument({
      ...newBracket(),
      results: { "0-0": { winner: "missing", scores: ["1", "0"] } },
    }),
  );
  assert.throws(() => resizeBracket(newBracket(), 65));
});

test("new storage reopens documents without overwriting other saves", async () => {
  const a = newLeaderboard();
  const b = newBracket();
  await saveDocument(a);
  await saveDocument(b);
  a.title = "Updated";
  await saveDocument(a);
  const saved = await listDocuments();
  assert.equal(saved.length, 2);
  assert.equal(saved.find((d) => d.id === a.id)?.title, "Updated");
  await deleteDocument(a.id);
  assert.equal((await listDocuments())[0].id, b.id);
});

test("every supported bracket size resolves to one champion with each participant seeded once", () => {
  for (let count = 2; count <= 64; count++) {
    let board = resizeBracket(newBracket(), count);
    const first = bracketRounds(board)[0];
    assert.equal(new Set(first.flatMap((m) => m.players).filter(Boolean)).size, count);
    for (let round = 0; round < bracketRounds(board).length; round++) {
      for (const match of bracketRounds(board)[round]) {
        if (match.players.every(Boolean))
          board = setMatchResult(board, match.id, match.players[0], ["1", "0"]);
      }
    }
    assert.ok(bracketRounds(board).at(-1)![0].winner, `count ${count}`);
    assert.deepEqual(parseDocument(board), board);
  }
});

test("maximum-size stress documents validate without affecting demo records", async () => {
  const { stressDocument } = await import("../src/lib/studio-stress.ts");
  for (const kind of ["leaderboard", "bracket"] as const) {
    const doc = stressDocument(kind);
    assert.deepEqual(parseDocument(doc), doc);
    assert.ok(doc.id.startsWith("demo-"));
  }
});

test("split layouts put the final between both wings and keep nodes inside the image", async () => {
  const { bracketLayout, wrapText } = await import("../src/lib/graphic-layout.ts");
  assert.deepEqual(wrapText("abcdefghij", 4), ["abcde", "fghij"]);
  for (const count of [2, 3, 8, 32, 64]) {
    const board = resizeBracket(newBracket(), count);
    board.participants[0].name = "W".repeat(200);
    const layout = bracketLayout(board);
    for (const node of layout.nodes) {
      assert.ok(node.x >= 0 && node.x + 220 <= layout.width);
      assert.ok(node.y >= layout.header && node.y + layout.cardHeight <= layout.height);
    }
    const final = layout.nodes.at(-1)!;
    if (count > 2) {
      assert.ok(final.x > layout.nodes[0].x);
      assert.ok(
        final.x < layout.nodes[Math.floor(layout.nodes.length / 2) - 1].x ||
          layout.nodes.some((node) => node.x > final.x),
      );
    }
  }
});

test("shrinking and growing a reordered bracket never duplicates participant identities", () => {
  let board = newBracket();
  board.participants = moveItem(board.participants, 7, 0);
  board = resizeBracket(board, 2);
  board = resizeBracket(board, 8);
  assert.equal(new Set(board.participants.map((p) => p.id)).size, 8);
  assert.deepEqual(parseDocument(board), board);
});

test("text wrapping budgets wide glyphs and preserves emoji graphemes", async () => {
  const { wrapText } = await import("../src/lib/graphic-layout.ts");
  assert.deepEqual(wrapText("W".repeat(12), 196 / 16), ["W".repeat(11), "W"]);
  assert.deepEqual(wrapText("Points", 128 / 18), ["Points"]);
  assert.deepEqual(wrapText("👩🏽‍💻👩🏽‍💻", 1.3), ["👩🏽‍💻", "👩🏽‍💻"]);
});
