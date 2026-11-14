import { validColor } from "./colors.ts";
import { onlyKeys } from "./validation.ts";

export type ToolTheme = {
  id?: string;
  titleVisible?: boolean;
  subtitleVisible?: boolean;
  rowSeparators?: boolean;
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
export type SavedToolTheme = { id: string; name: string; value: ToolTheme };

const ids = [
  "classic-green",
  "modern-broadcast",
  "stadium-night",
  "clean-minimal",
  "monochrome",
  "retro-digital",
  "editorial",
  "high-contrast",
  "neon-arena",
  "warm-paper",
  "tournament-pro",
  "championship-gold",
  "pastel",
  "precision",
  "colour-block",
] as const;

export const themeLabels = {
  en: [
    "Classic Green",
    "Modern Broadcast",
    "Stadium Night",
    "Clean Minimal",
    "Monochrome",
    "Retro Digital",
    "Editorial",
    "High Contrast",
    "Neon Arena",
    "Warm Paper",
    "Tournament Pro",
    "Championship Gold",
    "Pastel",
    "Precision",
    "Colour Block",
  ],
  bg: [
    "Класическо зелено",
    "Модерно излъчване",
    "Нощен стадион",
    "Изчистен",
    "Монохромен",
    "Ретро дигитален",
    "Редакционен",
    "Висок контраст",
    "Неонова арена",
    "Топла хартия",
    "Професионален турнир",
    "Шампионско злато",
    "Пастелен",
    "Прецизен",
    "Цветни блокове",
  ],
  tr: [
    "Klasik Yeşil",
    "Modern Yayın",
    "Stadyum Gecesi",
    "Sade",
    "Monokrom",
    "Retro Dijital",
    "Editoryal",
    "Yüksek Kontrast",
    "Neon Arena",
    "Sıcak Kâğıt",
    "Profesyonel Turnuva",
    "Şampiyonluk Altını",
    "Pastel",
    "Hassas",
    "Renk Blokları",
  ],
};

type ThemeDefinition = Omit<ToolTheme, "id">;

const definitions: ThemeDefinition[] = [
  {
    accent: "#285b35",
    background: "#f2f4eb",
    textColor: "#17291c",
    borderColor: "#b7c8b7",
    radius: 8,
    borderWidth: 1,
    density: "spacious",
  },
  {
    accent: "#ccf86b",
    background: "#14251b",
    textColor: "#f5f2e8",
    borderColor: "#68816d",
    radius: 4,
    borderWidth: 2,
    density: "compact",
    gradient: true,
    backgroundEnd: "#263d30",
  },
  {
    accent: "#f4bc50",
    background: "#181c24",
    textColor: "#f3f4f6",
    borderColor: "#71757d",
    radius: 0,
    borderWidth: 2,
    density: "compact",
  },
  {
    accent: "#353f39",
    background: "#f7f8f1",
    textColor: "#111111",
    borderColor: "#d9dfd9",
    radius: 10,
    borderWidth: 1,
    density: "spacious",
  },
  {
    accent: "#000000",
    background: "#ffffff",
    textColor: "#000000",
    borderColor: "#000000",
    radius: 0,
    borderWidth: 2,
    density: "compact",
  },
  {
    accent: "#ffbf47",
    background: "#212817",
    textColor: "#ffe7a2",
    borderColor: "#83905d",
    radius: 2,
    borderWidth: 3,
    density: "compact",
  },
  {
    accent: "#a43f28",
    background: "#fff3df",
    textColor: "#30251f",
    borderColor: "#c6a997",
    radius: 0,
    borderWidth: 0,
    density: "spacious",
  },
  {
    accent: "#ffff00",
    background: "#000000",
    textColor: "#ffffff",
    borderColor: "#ffff00",
    radius: 0,
    borderWidth: 3,
    density: "compact",
  },
  {
    accent: "#7bf9ad",
    background: "#161c19",
    textColor: "#f5fff8",
    borderColor: "#4a8c68",
    radius: 8,
    borderWidth: 2,
    density: "compact",
    gradient: true,
    backgroundEnd: "#25362b",
  },
  {
    accent: "#775b40",
    background: "#f4e8d1",
    textColor: "#362b22",
    borderColor: "#cbb99c",
    radius: 2,
    borderWidth: 1,
    density: "spacious",
  },
  {
    accent: "#8fbea0",
    background: "#1e3025",
    textColor: "#f1f5ee",
    borderColor: "#6c9074",
    radius: 6,
    borderWidth: 2,
    density: "compact",
  },
  {
    accent: "#d8b45a",
    background: "#202018",
    textColor: "#fff2c5",
    borderColor: "#8e7741",
    radius: 2,
    borderWidth: 2,
    density: "spacious",
  },
  {
    accent: "#a96d7e",
    background: "#fbf0e8",
    textColor: "#40343b",
    borderColor: "#d9b9c1",
    radius: 16,
    borderWidth: 1,
    density: "spacious",
    gradient: true,
    backgroundEnd: "#edf2e5",
  },
  {
    accent: "#394b41",
    background: "#edf0eb",
    textColor: "#151c17",
    borderColor: "#758078",
    radius: 0,
    borderWidth: 1,
    density: "compact",
  },
  {
    accent: "#d65030",
    background: "#fff0d8",
    textColor: "#321b15",
    borderColor: "#d65030",
    radius: 0,
    borderWidth: 4,
    density: "compact",
    gradient: true,
    backgroundEnd: "#f5d7af",
  },
];

export const toolThemes: ToolTheme[] = definitions.map((theme, index) => ({
  id: ids[index],
  titleVisible: true,
  subtitleVisible: true,
  rowSeparators: false,
  showScores: true,
  connectorColor: theme.accent,
  connectorWidth: Math.max(1, theme.borderWidth),
  roundGap: theme.density === "compact" ? 240 : 300,
  matchGap: theme.density === "compact" ? 28 : 56,
  ...theme,
}));

export function getToolTheme(id: string | null | undefined): ToolTheme | undefined {
  return toolThemes.find((theme) => theme.id === id);
}

export function validToolTheme(value: unknown): value is ToolTheme {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (
    !onlyKeys(v, [
      "id",
      "titleVisible",
      "subtitleVisible",
      "rowSeparators",
      "showScores",
      "connectorColor",
      "connectorWidth",
      "roundGap",
      "matchGap",
      "gradient",
      "backgroundEnd",
      "accent",
      "background",
      "textColor",
      "borderColor",
      "radius",
      "borderWidth",
      "density",
    ])
  )
    return false;
  if (v.id !== undefined && (typeof v.id !== "string" || !/^[a-z0-9-]{1,80}$/.test(v.id)))
    return false;
  for (const key of ["titleVisible", "subtitleVisible", "rowSeparators", "showScores"])
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
    id,
    titleVisible,
    subtitleVisible,
    rowSeparators,
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
    id,
    titleVisible,
    subtitleVisible,
    rowSeparators,
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

export function parseSavedToolThemes(stored: string): SavedToolTheme[] {
  if (stored.length > 128_000) return [];
  try {
    const raw: unknown = JSON.parse(stored);
    if (!Array.isArray(raw)) return [];
    return raw.slice(0, 50).filter((value): value is SavedToolTheme => {
      if (!value || typeof value !== "object" || Array.isArray(value)) return false;
      const item = value as Record<string, unknown>;
      return (
        onlyKeys(item, ["id", "name", "value"]) &&
        typeof item.id === "string" &&
        item.id.length > 0 &&
        item.id.length <= 100 &&
        typeof item.name === "string" &&
        item.name.trim().length > 0 &&
        item.name.length <= 80 &&
        validToolTheme(item.value)
      );
    });
  } catch {
    return [];
  }
}
