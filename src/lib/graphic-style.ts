export type GraphicStyle = {
  preset: "classic" | "editorial" | "night";
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
};

export const graphicPresets: Record<GraphicStyle["preset"], GraphicStyle> = {
  classic: { preset: "classic", accent: "#285b35", background: "#f2f4eb", font: "Inter Tight" },
  editorial: { preset: "editorial", accent: "#9c3d19", background: "#fff4df", font: "Georgia" },
  night: { preset: "night", accent: "#b5d78b", background: "#18251f", font: "Inter" },
};
