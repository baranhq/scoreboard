import { validColor } from "./colors.ts";
export type ToolTheme = {
  titleVisible?: boolean;
  subtitleVisible?: boolean;
  showScores?: boolean;
  connectorColor?: string;
  connectorWidth?: number;
  roundGap?: number;
  matchGap?: number;

  gradient?: boolean;
  backgroundEnd?: string;
  accent: string;
  background: string;
  textColor: string;
  borderColor: string;
  radius: number;
  borderWidth: number;
  density: "compact" | "spacious";
};
export const themeLabels = {
  en: [
    "Classic Green",
    "Modern Broadcast",
    "Dark Stadium",
    "Clean Minimal",
    "Black & White",
    "Retro Scoreboard",
    "Editorial",
    "High Contrast",
    "Neon Night",
    "Warm Paper",
    "Tournament Pro",
    "Colourful Competition",
  ],
  bg: [
    "Класическо зелено",
    "Модерно излъчване",
    "Тъмен стадион",
    "Изчистен",
    "Черно и бяло",
    "Ретро табло",
    "Редакционен",
    "Висок контраст",
    "Неонова нощ",
    "Топла хартия",
    "Турнир Про",
    "Цветно състезание",
  ],
  tr: [
    "Klasik Yeşil",
    "Modern Yayın",
    "Karanlık Stadyum",
    "Sade",
    "Siyah Beyaz",
    "Retro Skor",
    "Editoryal",
    "Yüksek Kontrast",
    "Neon Gece",
    "Sıcak Kağıt",
    "Turnuva Pro",
    "Renkli Yarışma",
  ],
};
const colors = [
  ["#285b35", "#f2f4eb", "#17291c"],
  ["#ccf86b", "#14251b", "#f5f2e8"],
  ["#f4bc50", "#181c24", "#f3f4f6"],
  ["#353f39", "#ffffff", "#111111"],
  ["#000000", "#ffffff", "#000000"],
  ["#ffbf47", "#212817", "#ffe7a2"],
  ["#a43f28", "#fff3df", "#30251f"],
  ["#ffff00", "#000000", "#ffffff"],
  ["#7bf9ad", "#161324", "#ffffff"],
  ["#775b40", "#f4e8d1", "#362b22"],
  ["#d7e7ee", "#243b42", "#ffffff"],
  ["#a54488", "#fff0dc", "#442840"],
];
export const toolThemes: ToolTheme[] = colors.map(([accent, background, textColor], index) => ({
  titleVisible: true,
  subtitleVisible: true,
  showScores: true,
  connectorColor: accent,
  connectorWidth: 2,
  roundGap: 260,
  matchGap: 40,
  gradient: false,
  backgroundEnd: background,
  accent,
  background,
  textColor,
  borderColor: accent,
  radius: [8, 0, 12, 0, 0, 2, 0, 0, 16, 4, 6, 20][index],
  borderWidth: [1, 2, 1, 0, 2, 3, 0, 3, 1, 1, 2, 2][index],
  density: index % 2 ? "compact" : "spacious",
}));
export function validToolTheme(value: unknown): value is ToolTheme {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  for (const key of ["titleVisible", "subtitleVisible", "showScores"])
    if (v[key] !== undefined && typeof v[key] !== "boolean") return false;
  if (v.connectorColor !== undefined && !validColor(v.connectorColor)) return false;
  for (const [key, min, max] of [
    ["connectorWidth", 0, 8],
    ["roundGap", 240, 400],
    ["matchGap", 8, 100],
  ] as const)
    if (
      v[key] !== undefined &&
      (typeof v[key] !== "number" || !Number.isFinite(v[key]) || v[key] < min || v[key] > max)
    )
      return false;
  return (
    (v.gradient === undefined || typeof v.gradient === "boolean") &&
    (v.backgroundEnd === undefined || validColor(v.backgroundEnd)) &&
    [v.accent, v.background, v.textColor, v.borderColor].every(validColor) &&
    typeof v.radius === "number" &&
    v.radius >= 0 &&
    v.radius <= 40 &&
    typeof v.borderWidth === "number" &&
    v.borderWidth >= 0 &&
    v.borderWidth <= 8 &&
    ["compact", "spacious"].includes(String(v.density))
  );
}

export function cleanToolTheme(value: ToolTheme): ToolTheme {
  const {
    titleVisible,
    subtitleVisible,
    showScores,
    connectorColor,
    connectorWidth,
    roundGap,
    matchGap,
    accent,
    background,
    textColor,
    borderColor,
    radius,
    borderWidth,
    density,
    gradient,
    backgroundEnd,
  } = value;
  return {
    titleVisible,
    subtitleVisible,
    showScores,
    connectorColor,
    connectorWidth,
    roundGap,
    matchGap,
    accent,
    background,
    textColor,
    borderColor,
    radius,
    borderWidth,
    density,
    gradient,
    backgroundEnd,
  };
}
