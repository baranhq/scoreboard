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
  assert.equal(moved[2].cells[0], "Falcons");
  assert.equal(board.rows[0].cells[0], "Falcons");
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
  assert.equal(rows[0].cells[0], "Foxes");
  assert.equal(rows[1].cells[0], "Owls");
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
