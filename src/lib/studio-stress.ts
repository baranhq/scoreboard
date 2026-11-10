import { newLeaderboard, type StudioDocument } from "./studio.ts";
import { newBracket, resizeBracket } from "./brackets.ts";
export function stressDocument(kind: StudioDocument["kind"]): StudioDocument {
  const names = [
    "Aleksandra Wiśniewska-Kowalczyk",
    "🦊 Fox & <script>alert(1)</script>",
    "ДългоИмеБезИнтервали".repeat(8),
    "Şampiyonlar İstanbul",
    "王秀英",
    "J",
    "",
  ];
  if (kind === "bracket") {
    const board = resizeBracket(newBracket("demo-stress-bracket"), 64);
    return {
      ...board,
      title: "Tournament ".repeat(18),
      participants: board.participants.map((p, i) => ({ ...p, name: names[i % names.length] })),
    };
  }
  const board = newLeaderboard("demo-stress-leaderboard");
  return {
    ...board,
    title: "Championship ".repeat(15),
    columns: Array.from({ length: 10 }, (_, i) => `Long column ${i + 1}`),
    rows: Array.from({ length: 100 }, (_, i) => ({
      id: `stress-${i}`,
      highlighted: i % 4 === 0,
      cells: Array.from({ length: 10 }, (_, c) =>
        c === 0 ? names[i % names.length] : c === 1 ? "-999999999.99" : "Value".repeat(12),
      ),
    })),
  };
}
