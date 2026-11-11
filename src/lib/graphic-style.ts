export type GraphicStyle = {
  gradient?: boolean;
  backgroundEnd?: string;
  preset: "classic" | "editorial" | "night";
  radius?: number;
  borderWidth?: number;
  borderColor?: string;
  textColor?: string;
  density?: "compact" | "spacious";
  accent: string;
  background: string;
  font: "Inter" | "Inter Tight" | "Georgia";
};
export type GraphicBase = {
  version: 1;
  id: string;
  title: string;
  subtitle: string;
  updatedAt: number;
  style: GraphicStyle;
  canvas?: { width: number; height: number };
};

export const canvasRatios = {
  landscape: { width: 1600, height: 900 },
  portrait: { width: 1080, height: 1350 },
  square: { width: 1080, height: 1080 },
  story: { width: 1080, height: 1920 },
} as const;

export const graphicPresets: Record<GraphicStyle["preset"], GraphicStyle> = {
  classic: { preset: "classic", accent: "#285b35", background: "#f2f4eb", font: "Inter Tight" },
  editorial: { preset: "editorial", accent: "#9c3d19", background: "#fff4df", font: "Inter Tight" },
  night: { preset: "night", accent: "#b5d78b", background: "#18251f", font: "Inter Tight" },
};

export function applyGraphicPreset(
  current: GraphicStyle,
  preset: GraphicStyle["preset"],
): GraphicStyle {
  return { ...graphicPresets[preset], font: current.font };
}
