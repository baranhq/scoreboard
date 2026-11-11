export type Appearance = {
  gradient?: boolean;
  backgroundEnd?: string;
  cornerRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  scoreSize: "small" | "medium" | "large" | "xlarge";
  teamSize: "small" | "medium" | "large" | "xlarge";
  layout: "auto" | "horizontal" | "vertical" | "grid";
  density: "compact" | "spacious";
  textScaleEnabled: boolean;
  textScale?: number;
  scoreScale: number;
  teamScale: number;
  timerScale: number;
  showPausedNotice: boolean;
  fullscreenControls: boolean;
  increment: number;
  autoHideControls: boolean;
};
export const defaults: Appearance = {
  scoreSize: "medium",
  teamSize: "medium",
  layout: "auto",
  density: "compact",
  textScaleEnabled: false,
  scoreScale: 100,
  teamScale: 100,
  timerScale: 100,
  showPausedNotice: true,
  fullscreenControls: true,
  increment: 1,
  autoHideControls: true,
};
export function resolveAppearance(input?: Partial<Appearance>): Appearance {
  const legacyScale = input?.textScale ?? 100;
  return {
    ...defaults,
    ...input,
    scoreScale: input?.scoreScale ?? legacyScale,
    teamScale: input?.teamScale ?? legacyScale,
    timerScale: input?.timerScale ?? legacyScale,
  };
}
export function parseAppearance(input: unknown): Partial<Appearance> | undefined {
  if (input === undefined) return undefined;
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("appearance");
  const a = input as Record<string, unknown>;
  for (const [key, max] of [
    ["cornerRadius", 40],
    ["borderWidth", 8],
  ] as const)
    if (
      a[key] !== undefined &&
      (typeof a[key] !== "number" || !Number.isFinite(a[key]) || a[key] < 0 || a[key] > max)
    )
      throw new Error("appearance");
  if (
    a.borderColor !== undefined &&
    (typeof a.borderColor !== "string" || !/^#[0-9a-f]{6}$/i.test(a.borderColor))
  )
    throw new Error("appearance");
  if (a.gradient !== undefined && typeof a.gradient !== "boolean") throw new Error("appearance");
  if (
    a.backgroundEnd !== undefined &&
    (typeof a.backgroundEnd !== "string" || !/^#[0-9a-f]{6}$/i.test(a.backgroundEnd))
  )
    throw new Error("appearance");
  const result: Record<string, unknown> = {};
  for (const key of ["gradient", "backgroundEnd"]) if (a[key] !== undefined) result[key] = a[key];
  for (const key of ["cornerRadius", "borderWidth", "borderColor"])
    if (a[key] !== undefined) result[key] = a[key];
  for (const [key, values] of Object.entries({
    scoreSize: ["small", "medium", "large", "xlarge"],
    teamSize: ["small", "medium", "large", "xlarge"],
    layout: ["auto", "horizontal", "vertical", "grid"],
    density: ["compact", "spacious"],
  })) {
    if (a[key] !== undefined) {
      if (!values.includes(a[key] as string)) throw new Error("appearance");
      result[key] = a[key];
    }
  }
  for (const key of ["textScale", "scoreScale", "teamScale", "timerScale"])
    if (a[key] !== undefined) {
      const max = key === "textScale" ? 160 : 240;
      if (
        typeof a[key] !== "number" ||
        !Number.isInteger(a[key]) ||
        a[key] < 80 ||
        a[key] > max ||
        a[key] % 5 !== 0
      )
        throw new Error(key);
      result[key] = a[key];
    }
  for (const key of [
    "textScaleEnabled",
    "showPausedNotice",
    "fullscreenControls",
    "autoHideControls",
  ])
    if (a[key] !== undefined) {
      if (typeof a[key] !== "boolean") throw new Error("appearance");
      result[key] = a[key];
    }
  if (a.increment !== undefined) {
    if (
      typeof a.increment !== "number" ||
      !Number.isInteger(a.increment) ||
      a.increment < 1 ||
      a.increment > 1000
    )
      throw new Error("increment");
    result.increment = a.increment;
  }
  return result as Partial<Appearance>;
}
