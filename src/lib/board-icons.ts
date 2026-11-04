export const iconIds = [
  "scoreboard",
  "football",
  "ball",
  "volleyball",
  "trophy",
  "medal",
  "school",
  "book",
  "teams",
  "game",
  "flag",
  "timer",
] as const;
export type BoardIconId = (typeof iconIds)[number];
export const isBoardIcon = (value: unknown): value is BoardIconId =>
  typeof value === "string" && iconIds.includes(value as BoardIconId);
