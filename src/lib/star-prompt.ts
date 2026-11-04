export const STAR_PROMPT_KEY = "scoreboard-star-prompt";
export const WEEK = 7 * 24 * 60 * 60 * 1000;
export type StarPreference = { clicked?: boolean; lastVisit?: number; dismissedUntil?: number };
export function shouldShowStar(p: StarPreference, now: number): boolean {
  return (
    !p.clicked &&
    !((p.dismissedUntil ?? 0) > now) &&
    (!Number.isFinite(p.lastVisit) || now - (p.lastVisit ?? 0) >= WEEK)
  );
}
export function readStarPreference(raw: string | null): StarPreference {
  try {
    const value = JSON.parse(raw || "{}");
    if (!value || typeof value !== "object") return {};
    return {
      clicked: value.clicked === true,
      lastVisit: typeof value.lastVisit === "number" ? value.lastVisit : undefined,
      dismissedUntil: typeof value.dismissedUntil === "number" ? value.dismissedUntil : undefined,
    };
  } catch {
    return {};
  }
}
