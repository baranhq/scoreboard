import { test } from "node:test";
import assert from "node:assert/strict";
import "fake-indexeddb/auto";
import { buttonColors, contrast, validColor } from "../src/lib/colors.ts";
import {
  defaultTimer,
  pausedTimer,
  remainingTime,
  resetTimer,
  isGamePaused,
  parseTimer,
  durationFromParts,
  formatTime,
  MAX_TIMER_DURATION_MS,
  timerRefreshDelay,
} from "../src/lib/timer.ts";
import { newBoard, backup, parseBackup, parseBackupText } from "../src/lib/boards.ts";
import { teamGridClass } from "../src/lib/team-layout.ts";
import { parseAppearance } from "../src/lib/appearance.ts";
import { encodeGame, decodeGame, shareUrl } from "../src/lib/sharing.ts";
import { writeBoards, loadBoards, loadOrCreateBoard } from "../src/store/database.ts";
import {
  homeRoute,
  localizedAlternates,
  pageForPath,
  route,
  translatedPath,
} from "../src/lib/routes.ts";
import { softwareSchema } from "../src/lib/seo-content.ts";
import { shouldKeepFullscreenControlsVisible } from "../src/components/scoreboard/use-fullscreen-controls.ts";

test("custom colours maintain readable controls across RGB colour space", () => {
  for (let r = 0; r <= 255; r += 17)
    for (let g = 0; g <= 255; g += 17)
      for (let b = 0; b <= 255; b += 17) {
        const bg = "#" + [r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("");
        const c = buttonColors(bg);
        assert.ok(contrast(bg, c.primary) >= 3, bg);
        assert.ok(contrast(c.primary, c.text) >= 4.5, bg);
        assert.ok(contrast(bg, c.hover) >= 3, bg);
        assert.ok(contrast(c.hover, c.text) >= 4.5, bg);
        assert.ok(contrast(bg, c.secondaryText) >= 4.5, bg);
      }
  assert.equal(validColor("red; background:url(https://example.org)"), false);
});

test("fullscreen controls ignore sticky touch hover but preserve mouse hover and keyboard focus", () => {
  assert.equal(shouldKeepFullscreenControlsVisible("touch", false, true), false);
  assert.equal(shouldKeepFullscreenControlsVisible("mouse", false, true), true);
  assert.equal(shouldKeepFullscreenControlsVisible("touch", true, false), true);
});

test("pause and disable stop the timer, re-enable restores its configured time", () => {
  const running = { ...defaultTimer, enabled: true, startedAt: 1000 };
  const paused = pausedTimer(running, 6000);
  assert.equal(remainingTime(paused, 999999), 295000);
  assert.equal(isGamePaused(paused), true);
  const disabled = resetTimer(paused, false);
  assert.equal(disabled.startedAt, null);
  assert.equal(disabled.remainingMs, 300000);
  assert.equal(isGamePaused(resetTimer(disabled, true)), false);
  assert.throws(() => parseTimer({ ...defaultTimer, durationMs: -1 }));
  assert.equal(
    parseTimer({
      ...defaultTimer,
      durationMs: MAX_TIMER_DURATION_MS,
      remainingMs: MAX_TIMER_DURATION_MS,
    })?.durationMs,
    MAX_TIMER_DURATION_MS,
  );
  assert.throws(() => parseTimer({ ...defaultTimer, durationMs: MAX_TIMER_DURATION_MS + 1000 }));
  assert.equal(
    parseTimer({
      ...defaultTimer,
      timeoutMs: MAX_TIMER_DURATION_MS,
      timeoutRemainingMs: MAX_TIMER_DURATION_MS,
    })?.timeoutMs,
    MAX_TIMER_DURATION_MS,
  );
  assert.throws(() => parseTimer({ ...defaultTimer, timeoutMs: MAX_TIMER_DURATION_MS + 1000 }));
});
test("duration fields carry extra minutes and seconds into larger units within configured limits", () => {
  assert.equal(durationFromParts(["00", "90", "00"]), 5400000);
  assert.equal(durationFromParts(["00", "00", "90"]), 90000);
  assert.equal(durationFromParts(["01", "60", "00"]), 7200000);
  assert.equal(durationFromParts(["168", "00", "00"]), 168 * 60 * 60 * 1000);
  assert.equal(durationFromParts(["168", "00", "01"]), 168 * 60 * 60 * 1000 + 1000);
  assert.equal(durationFromParts(["999", "59", "59"]), MAX_TIMER_DURATION_MS);
  assert.equal(durationFromParts(["999", "59", "60"]), undefined);
  assert.equal(durationFromParts(["00", "90", "00"], 1800000), undefined);
});
test("timer display can show total minutes instead of hours", () => {
  assert.equal(formatTime(90 * 60_000), "1:30:00");
  assert.equal(formatTime(90 * 60_000, false), "90:00");
  assert.equal(formatTime(MAX_TIMER_DURATION_MS, false), "59999:59");
  assert.equal(parseTimer({ ...defaultTimer, showHours: false })?.showHours, false);
});
test("timer refreshes only at the next displayed second and stops when idle", () => {
  assert.equal(timerRefreshDelay(defaultTimer, 10_000), undefined);
  assert.equal(
    timerRefreshDelay({ ...defaultTimer, startedAt: 100, remainingMs: 5_300 }, 100),
    300,
  );
  assert.equal(
    timerRefreshDelay(
      { ...defaultTimer, mode: "stopwatch", startedAt: 100, remainingMs: 5_300 },
      100,
    ),
    700,
  );
  assert.equal(
    timerRefreshDelay(
      {
        ...defaultTimer,
        timeoutActive: true,
        timeoutMs: 5_300,
        timeoutRemainingMs: 5_300,
        timeoutStartedAt: 100,
      },
      100,
    ),
    300,
  );
  assert.equal(
    timerRefreshDelay({ ...defaultTimer, trackPausedTime: true, pausedAt: 100 }, 400),
    700,
  );
});
test("localized alternates are reciprocal and provide both generic and British English", () => {
  const alternates = localizedAlternates("https://scoreboard.baranhq.com", "help");
  assert.equal(alternates.en, "https://scoreboard.baranhq.com/en/help/");
  assert.equal(alternates["en-GB"], alternates.en);
  assert.equal(alternates.bg, "https://scoreboard.baranhq.com/bg/pomosht/");
  assert.equal(alternates.tr, "https://scoreboard.baranhq.com/tr/yardim/");
  assert.equal(alternates["x-default"], alternates.en);
});
test("scoreboard routes stay localized while the root aliases remain useful", () => {
  assert.equal(homeRoute("en"), "/");
  assert.equal(route("en", "scoreboard"), "/en/scoreboard/");
  assert.equal(route("bg", "scoreboard"), "/bg/scoreboard/");
  assert.equal(route("tr", "scoreboard"), "/tr/scoreboard/");
  assert.equal(pageForPath("/scoreboard"), "scoreboard");
  assert.equal(pageForPath("/bg/scoreboard/"), "scoreboard");
  assert.equal(translatedPath("/scoreboard/", "tr"), "/tr/scoreboard/");

  const homeAlternates = localizedAlternates("https://scoreboard.baranhq.com", "home");
  assert.equal(homeAlternates.en, "https://scoreboard.baranhq.com/");
  assert.equal(homeAlternates.bg, "https://scoreboard.baranhq.com/bg/");
  assert.equal(homeAlternates.tr, "https://scoreboard.baranhq.com/tr/");
  assert.equal(homeAlternates["x-default"], "https://scoreboard.baranhq.com/");

  const scoreboardAlternates = localizedAlternates("https://scoreboard.baranhq.com", "scoreboard");
  assert.equal(scoreboardAlternates.en, "https://scoreboard.baranhq.com/en/scoreboard/");
  assert.equal(scoreboardAlternates["x-default"], scoreboardAlternates.en);
});
test("shared scoreboard snapshots link to the localized application route", () => {
  const board = newBoard("Friendly game", "Team");
  const url = shareUrl(board, "bg", "https://scoreboard.baranhq.com");

  assert.match(url, /^https:\/\/scoreboard\.baranhq\.com\/bg\/scoreboard\/#share=/);
  assert.equal(decodeGame(url.split("#share=")[1]).board.name, "Friendly game");
});
test("software schema uses stable multilingual entities and omits unsupported ratings", () => {
  const en = softwareSchema("en", "https://scoreboard.baranhq.com", "Baran's Scoreboard")[
    "@graph"
  ] as Record<string, unknown>[];
  const bg = softwareSchema("bg", "https://scoreboard.baranhq.com", "Baran's Scoreboard")[
    "@graph"
  ] as Record<string, unknown>[];
  assert.equal(en[0]["@id"], bg[0]["@id"]);
  assert.equal(en[1]["@id"], bg[1]["@id"]);
  assert.deepEqual(en[0].inLanguage, ["en-GB", "bg", "tr"]);
  assert.equal((en[1].offers as { price: number }).price, 0);
  assert.equal(en[1].url, "https://scoreboard.baranhq.com/en/scoreboard/");
  assert.equal(bg[1].url, "https://scoreboard.baranhq.com/bg/scoreboard/");
  assert.deepEqual(en[1].author, {
    "@type": "Person",
    name: "Baran Ahmedov",
    url: "https://baranhq.com/en/",
  });
  assert.equal("aggregateRating" in en[1], false);
  assert.equal("review" in en[1], false);
  assert.equal(en[1].image, "https://scoreboard.baranhq.com/social.png");
  const tr = softwareSchema("tr", "https://scoreboard.baranhq.com", "Baran's Scoreboard")[
    "@graph"
  ] as Record<string, unknown>[];
  assert.equal(tr[1].url, "https://scoreboard.baranhq.com/tr/scoreboard/");
});
test("automatic and fullscreen scoreboard grids use the same team columns", () => {
  for (const count of [1, 2, 3, 4, 5, 9, 10]) {
    const columns = (classes: string) =>
      classes.split(/\s+/).filter((value) => value && value !== "grid" && value !== "auto-rows-fr");
    assert.deepEqual(
      columns(teamGridClass(count, "auto", false)),
      columns(teamGridClass(count, "auto", true)),
    );
  }
  assert.match(teamGridClass(1, "auto", true), /grid-cols-1/);
  assert.match(teamGridClass(4, "auto", false), /grid-cols-2/);
});
test("appearance presets and text scaling validate and preserve larger settings", () => {
  assert.deepEqual(
    parseAppearance({
      scoreSize: "xlarge",
      teamSize: "xlarge",
      textScaleEnabled: true,
      textScale: 160,
      showPausedNotice: false,
    }),
    {
      scoreSize: "xlarge",
      teamSize: "xlarge",
      textScaleEnabled: true,
      textScale: 160,
      showPausedNotice: false,
    },
  );
  assert.throws(() => parseAppearance({ textScale: 165 }));
  assert.throws(() => parseAppearance({ textScale: 75 }));
  assert.throws(() => parseAppearance({ textScaleEnabled: "true" }));
  assert.throws(() => parseAppearance({ showPausedNotice: "true" }));
  assert.throws(() => parseAppearance({ scoreSize: "huge" }));
});
test("backups and URL snapshots preserve customisation and treat markup as plain data", () => {
  const board = newBoard("<img src=x onerror=alert(1)>", "Takım");
  board.accent = "#123456";
  board.icon = "trophy";
  board.teams[0].color = "#ffffff";
  board.teams[0].score = 42;
  const restored = parseBackup(backup([board]))[0];
  assert.equal(restored.name, board.name);
  assert.equal(restored.teams[0].score, 42);
  assert.equal(restored.icon, "trophy");
  assert.notEqual(restored.id, board.id);
  const shared = decodeGame(encodeGame(board));
  assert.equal(shared.sourceId, board.id);
  assert.equal(shared.board.accent, "#123456");
  assert.throws(() => decodeGame("../malicious"));
  assert.throws(() => parseBackup(backup([{ ...board, accent: "javascript:alert(1)" }])));
  assert.throws(() =>
    parseBackup({ ...backup([board]), boards: [{ ...board, icon: "not-an-icon" }] }),
  );
  assert.throws(() => parseBackupText("[".repeat(40) + "0" + "]".repeat(40)));
  assert.throws(() => parseBackup({ ...backup([board]), boards: Array(1001).fill(board) }));
  assert.throws(() =>
    parseBackup({
      ...backup([board]),
      boards: [{ ...board, teams: Array(201).fill(board.teams[0]) }],
    }),
  );
});
test("IndexedDB initialisation is atomic and updates do not duplicate or erase other boards", async () => {
  const [a, b] = await Promise.all([
    loadOrCreateBoard(() => newBoard("First", "Team")),
    loadOrCreateBoard(() => newBoard("Other", "Team")),
  ]);
  assert.equal(a[0].id, b[0].id);
  const first = a[0];
  const second = newBoard("Second", "Отбор");
  await writeBoards([second]);
  await writeBoards([
    { ...first, name: "Renamed", teams: first.teams.map((t) => ({ ...t, score: 7 })) },
  ]);
  const stored = await loadBoards();
  assert.equal(stored.length, 2);
  assert.equal(stored.find((b) => b.id === first.id)?.teams[0].score, 7);
  await writeBoards([], second.id);
  assert.equal((await loadBoards()).length, 1);
});

test("dates display day, month and year without changing stored timestamps", async () => {
  const { europeanDateTime } = await import("../src/lib/dates.ts");
  const { policyDate } = await import("../src/lib/policy-document.ts");
  assert.equal(policyDate("2026-11-02"), "02.11.2026");
  assert.equal(europeanDateTime(new Date(2026, 10, 2, 9, 5).getTime()), "02.11.2026, 09:05");
});
