import { test } from "node:test";
import assert from "node:assert/strict";
import "fake-indexeddb/auto";
import * as studioApi from "../src/lib/studio.ts";
import * as bracketApi from "../src/lib/brackets.ts";
import {
  newLeaderboard,
  moveItem,
  removeColumn,
  sortRows,
  parseDocument,
} from "../src/lib/studio.ts";
import { newBracket, bracketRounds, setMatchResult, resizeBracket } from "../src/lib/brackets.ts";
import { saveDocument, listDocuments, deleteDocument } from "../src/store/studio.ts";
import { fromHsl, toHsl } from "../src/lib/colors.ts";
import { applyGraphicPreset, canvasRatios, graphicPresets } from "../src/lib/graphic-style.ts";
import { distributeRows, fitContentToCanvas } from "../src/lib/graphic-layout.ts";
import { previewFieldValue, updatePreviewField } from "../src/lib/studio-edit.ts";
import { advanceStudioDemo, studioDemo } from "../src/lib/studio-demo.ts";
import { getToolTheme, themeLabels, toolThemes, validToolTheme } from "../src/lib/tool-themes.ts";
import { newBoard } from "../src/lib/boards.ts";
import { applyToolTheme } from "../src/lib/board-theme.ts";

test("custom colour values round-trip through the editor's HSL controls", () => {
  for (const color of ["#0d7480", "#b5d78b", "#000000", "#ffffff"]) {
    const [hue, saturation, lightness] = toHsl(color);
    assert.equal(fromHsl(hue, saturation, lightness), color);
  }
});

test("the shared theme catalog has 15 validated, addressable presets", () => {
  assert.equal(toolThemes.length, 15);
  assert.equal(themeLabels.en.length, 15);
  assert.deepEqual(themeLabels.en.slice(-4), [
    "Championship Gold",
    "Pastel",
    "Precision",
    "Colour Block",
  ]);
  assert.ok(toolThemes.every(validToolTheme));
  assert.equal(getToolTheme("championship-gold"), toolThemes[11]);
  assert.equal(getToolTheme("missing-theme"), undefined);
});

test("scoreboard themes update the canvas and preserve teams and their individual colours", () => {
  const board = newBoard("Match 1", "Team");
  assert.equal(board.themeId, "classic-green");
  board.color = "#123456";
  board.teams[0].color = "#aabbcc";
  const themed = applyToolTheme(board, toolThemes[1]);

  assert.equal(themed.background, toolThemes[1].background);
  assert.equal(themed.themeId, toolThemes[1].id);
  assert.equal(themed.color, undefined);
  assert.equal(themed.accent, toolThemes[1].accent);
  assert.equal(themed.teams[0].color, "#aabbcc");
  assert.deepEqual(
    themed.teams.map((team) => [team.name, team.score]),
    board.teams.map((team) => [team.name, team.score]),
  );
  assert.equal(themed.appearance?.cornerRadius, toolThemes[1].radius);
});

test("built-in canvases match their advertised aspect ratios and export sizes", () => {
  assert.deepEqual(canvasRatios.landscape, { width: 1920, height: 1080 });
  assert.deepEqual(canvasRatios.standard, { width: 1600, height: 1200 });
  assert.deepEqual(canvasRatios.square, { width: 1080, height: 1080 });
  assert.deepEqual(canvasRatios.portrait, { width: 1080, height: 1350 });
  assert.deepEqual(canvasRatios.story, { width: 1080, height: 1920 });
});

test("appearance presets keep each saved graphic's existing typography", () => {
  const editorial = applyGraphicPreset({ ...graphicPresets.classic, font: "Georgia" }, "editorial");

  assert.equal(editorial.background, graphicPresets.editorial.background);
  assert.equal(editorial.accent, graphicPresets.editorial.accent);
  assert.equal(editorial.font, "Georgia");
});

test("saved graphics accept bounded canvas sizes while older documents remain valid", () => {
  const board = newLeaderboard();
  const sized = parseDocument({
    ...board,
    gridColumns: 3,
    canvas: { width: 1600, height: 900 },
  });

  assert.equal(sized.kind, "leaderboard");
  if (sized.kind !== "leaderboard") return;
  assert.equal(sized.gridColumns, 3);
  assert.deepEqual(sized.canvas, { width: 1600, height: 900 });

  const legacy = { ...board } as Record<string, unknown>;
  delete legacy.gridColumns;
  delete legacy.canvas;
  assert.equal(parseDocument(legacy).kind, "leaderboard");
  assert.throws(() => parseDocument({ ...board, canvas: { width: 200, height: 900 } }));
  assert.throws(() => parseDocument({ ...board, gridColumns: 4 }));
});

test("duplicating a saved graphic preserves its content and gives it an independent identity", () => {
  const source = newLeaderboard("source-table");
  source.rows[0].cells[1] = "91";
  source.rows[0].highlighted = true;
  source.canvas = { width: 1600, height: 1200 };

  const duplicate = studioApi.duplicateStudioDocument(source, "Weekend copy");

  assert.notEqual(duplicate.id, source.id);
  assert.equal(duplicate.title, "Weekend copy");
  assert.ok(duplicate.updatedAt >= source.updatedAt);
  assert.deepEqual(duplicate.canvas, source.canvas);
  assert.equal(duplicate.kind, "leaderboard");
  if (duplicate.kind !== "leaderboard") return;
  assert.deepEqual(duplicate.rows, source.rows);
  assert.notEqual(duplicate.rows, source.rows);
});

test("leaderboard rows split into balanced, ordered columns", () => {
  const board = newLeaderboard();
  const rows = Array.from({ length: 8 }, (_, index) => ({ id: String(index) }));
  const groups = distributeRows(rows, 3);

  assert.deepEqual(
    groups.map((group) => group.length),
    [3, 3, 2],
  );
  assert.deepEqual(
    groups.flat().map((row) => row.id),
    rows.map((row) => row.id),
  );
  assert.equal(distributeRows(board.rows, 1).length, 1);
});

test("graphic content stays centered and uncropped inside custom canvas ratios", () => {
  assert.deepEqual(fitContentToCanvas(1200, 800, 1600, 900), {
    scale: 1.125,
    x: 125,
    y: 0,
  });
  assert.deepEqual(fitContentToCanvas(1200, 800, 900, 1600), {
    scale: 0.75,
    x: 0,
    y: 500,
  });
});

test("preview edits update the selected leaderboard cell and bracket participant", () => {
  const leaderboard = newLeaderboard("leaderboard");
  const scoreTarget = { kind: "leaderboard-cell", rowId: "row-1", column: 1 } as const;
  const updatedLeaderboard = updatePreviewField(leaderboard, scoreTarget, "51");
  assert.equal(previewFieldValue(updatedLeaderboard, scoreTarget), "51");
  assert.equal(updatedLeaderboard.kind, "leaderboard");
  if (updatedLeaderboard.kind !== "leaderboard") return;
  assert.deepEqual(
    updatedLeaderboard.rows.map((row) => row.cells[0]),
    ["Team 2", "Team 1", "Team 3", "Team 4"],
  );

  const bracket = newBracket("bracket");
  const target = { kind: "bracket-participant", participantId: "player-0" } as const;
  const updatedBracket = updatePreviewField(bracket, target, "Participant 9");
  assert.equal(previewFieldValue(updatedBracket, target), "Participant 9");
});

test("preview edits can change a bracket score without losing its result", () => {
  const board = resizeBracket(newBracket(), 4);
  const match = bracketRounds(board)[0][0];
  const target = { kind: "bracket-score", matchId: match.id, side: 0 } as const;
  const withWinner = setMatchResult(board, match.id, match.players[0], ["2", "1"]);
  const updated = updatePreviewField(withWinner, target, "3");

  assert.equal(previewFieldValue(updated, target), "3");
  assert.equal(updated.kind, "bracket");
  if (updated.kind !== "bracket") return;
  assert.equal(bracketRounds(updated)[0][0].winner, match.players[0]);
});

test("editing a ranked score immediately updates leaderboard order", () => {
  const updateLeaderboardCell = (
    studioApi as unknown as {
      updateLeaderboardCell?: (
        board: ReturnType<typeof newLeaderboard>,
        rowId: string,
        column: number,
        value: string,
        rankColumn?: number,
      ) => ReturnType<typeof newLeaderboard>;
    }
  ).updateLeaderboardCell;
  assert.equal(typeof updateLeaderboardCell, "function");
  if (!updateLeaderboardCell) return;

  const board = newLeaderboard();
  const updated = updateLeaderboardCell(board, "row-1", 1, "50", 1);
  assert.deepEqual(
    updated.rows.map((row) => row.cells[0]),
    ["Team 2", "Team 1", "Team 3", "Team 4"],
  );
});

test("detects entered later-round data before a feeder result is changed", () => {
  const hasDependentResults = (
    bracketApi as unknown as {
      hasDependentResults?: (board: ReturnType<typeof newBracket>, matchId: string) => boolean;
    }
  ).hasDependentResults;
  assert.equal(typeof hasDependentResults, "function");
  if (!hasDependentResults) return;

  let board = resizeBracket(newBracket(), 4);
  const firstRound = bracketRounds(board)[0];
  board = setMatchResult(board, firstRound[0].id, firstRound[0].players[0]!, ["2", "1"]);
  board = setMatchResult(board, firstRound[1].id, firstRound[1].players[0]!, ["2", "1"]);
  const semifinal = bracketRounds(board)[1][0];
  board = setMatchResult(board, semifinal.id, null, ["3", "2"]);

  assert.equal(hasDependentResults(board, firstRound[0].id), true);
  assert.equal(hasDependentResults(board, "invalid-match"), false);
});

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

test("leaderboard demo updates standings and resets its animation loop", () => {
  const initial = studioDemo("leaderboard", "en");
  const firstChange = advanceStudioDemo(initial, initial, 0);
  assert.equal(firstChange.kind, "leaderboard");
  if (firstChange.kind !== "leaderboard") return;
  assert.equal(firstChange.rows[0].id, "row-1");
  assert.equal(firstChange.rows[0].cells[1], "43");

  const secondChange = advanceStudioDemo(firstChange, initial, 1);
  assert.equal(secondChange.kind, "leaderboard");
  if (secondChange.kind !== "leaderboard") return;
  assert.equal(secondChange.rows[0].id, "row-2");
  assert.equal(secondChange.rows[0].cells[1], "46");

  assert.deepEqual(advanceStudioDemo(secondChange, initial, 2), initial);
});

test("bracket demo advances match results through the final", () => {
  const initial = studioDemo("bracket", "en");
  const advanced = advanceStudioDemo(initial, initial, 0);
  if (initial.kind !== "bracket" || advanced.kind !== "bracket") return;
  assert.ok(bracketRounds(advanced)[0][1].winner);
  assert.equal(bracketRounds(advanced)[1][0].winner, null);
  const final = advanceStudioDemo(advanced, initial, 1);
  if (final.kind !== "bracket") return;
  assert.ok(bracketRounds(final)[1][0].winner);
  assert.deepEqual(advanceStudioDemo(final, initial, 2), initial);
  assert.notDeepEqual(advanced.results, initial.results);
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

test("blank leaderboards remain valid editable documents", () => {
  const board = { ...newLeaderboard(), rows: [] };
  assert.deepEqual(parseDocument(board), board);
});
test("new graphic appearance fields reject unsafe stored values", () => {
  const board = newLeaderboard();
  assert.throws(() => parseDocument({ ...board, style: { ...board.style, radius: -1 } }));
  assert.throws(() =>
    parseDocument({ ...board, style: { ...board.style, textColor: "url(example)" } }),
  );
  assert.deepEqual(
    parseDocument({ ...board, style: { ...board.style, radius: 20, borderWidth: 3 } }).style.radius,
    20,
  );
});

test("manual leaderboard edits do not silently reorder rows", () => {
  const board = newLeaderboard();
  const next = studioApi.updateLeaderboardCell(board, board.rows[3].id, 1, "999");
  assert.deepEqual(
    next.rows.map((row) => row.id),
    board.rows.map((row) => row.id),
  );
});
test("column width overrides and row colours round-trip through saved graphics", () => {
  const board = newLeaderboard();
  const edited = {
    ...board,
    columnWidths: [400, 180],
    rows: board.rows.map((row) => ({ ...row, color: "#285b35" })),
  };
  assert.deepEqual(parseDocument(edited), edited);
  assert.deepEqual(removeColumn(edited, 1).columnWidths, [400]);
  assert.throws(() => parseDocument({ ...edited, columnWidths: [0, 180] }));
});

test("manual preview edits preserve row ordering", () => {
  const board = newLeaderboard();
  const edited = updatePreviewField(
    board,
    { kind: "leaderboard-cell", rowId: board.rows[3].id, column: 1 },
    "999",
    false,
  );
  assert.equal(edited.kind, "leaderboard");
  if (edited.kind === "leaderboard")
    assert.deepEqual(
      edited.rows.map((row) => row.id),
      board.rows.map((row) => row.id),
    );
});

test("advanced bracket appearance validates and preserves optional fields", () => {
  const board = newBracket();
  const customized = {
    ...board,
    style: {
      ...board.style,
      titleVisible: false,
      showScores: false,
      roundGap: 320,
      matchGap: 70,
      connectorWidth: 4,
      connectorColor: "#285b35",
    },
    participants: board.participants.map((player) => ({ ...player, color: "#367747" })),
  };
  assert.deepEqual(parseDocument(customized), customized);
  assert.throws(() =>
    parseDocument({ ...customized, style: { ...customized.style, roundGap: 10 } }),
  );
  assert.throws(() =>
    parseDocument({
      ...customized,
      participants: board.participants.map((player) => ({ ...player, color: "invalid" })),
    }),
  );
});
