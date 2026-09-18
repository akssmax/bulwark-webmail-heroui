/** Tailwind default neutral families used for theme backgrounds and gray tokens. */
export type GrayPaletteId = "neutral" | "gray" | "zinc" | "slate" | "stone";

export type GrayPaletteShade = "50" | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900" | "950";

export interface GrayPalette {
  id: GrayPaletteId;
  label: string;
  description: string;
  backgroundLight: string;
  backgroundDark: string;
  /** Matches the theme customizer “Base” slider — chroma mixed into neutrals. */
  baseChroma: number;
  /** Hue used for neutral surfaces (borders, muted, sidebar). */
  neutralHue: number;
  swatches: Record<GrayPaletteShade, string>;
}

/** Canonical Tailwind v4 neutral scales (hex). */
export const GRAY_PALETTES: readonly GrayPalette[] = [
  {
    id: "neutral",
    label: "Neutral",
    description: "Achromatic — no undertone",
    backgroundLight: "#fafafa",
    backgroundDark: "#0a0a0a",
    baseChroma: 0.002,
    neutralHue: 0,
    swatches: {
      "50": "#fafafa",
      "100": "#f5f5f5",
      "200": "#e5e5e5",
      "300": "#d4d4d4",
      "400": "#a3a3a3",
      "500": "#737373",
      "600": "#525252",
      "700": "#404040",
      "800": "#262626",
      "900": "#171717",
      "950": "#0a0a0a",
    },
  },
  {
    id: "gray",
    label: "Gray",
    description: "Balanced cool gray",
    backgroundLight: "#f9fafb",
    backgroundDark: "#030712",
    baseChroma: 0.013,
    neutralHue: 264,
    swatches: {
      "50": "#f9fafb",
      "100": "#f3f4f6",
      "200": "#e5e7eb",
      "300": "#d1d5db",
      "400": "#9ca3af",
      "500": "#6b7280",
      "600": "#4b5563",
      "700": "#374151",
      "800": "#1f2937",
      "900": "#111827",
      "950": "#030712",
    },
  },
  {
    id: "zinc",
    label: "Zinc",
    description: "Subtle blue-gray",
    backgroundLight: "#fafafa",
    backgroundDark: "#09090b",
    baseChroma: 0.013,
    neutralHue: 286,
    swatches: {
      "50": "#fafafa",
      "100": "#f4f4f5",
      "200": "#e4e4e7",
      "300": "#d4d4d8",
      "400": "#a1a1aa",
      "500": "#71717a",
      "600": "#52525b",
      "700": "#3f3f46",
      "800": "#27272a",
      "900": "#18181b",
      "950": "#09090b",
    },
  },
  {
    id: "slate",
    label: "Slate",
    description: "Cool blue-gray",
    backgroundLight: "#f8fafc",
    backgroundDark: "#020617",
    baseChroma: 0.018,
    neutralHue: 257,
    swatches: {
      "50": "#f8fafc",
      "100": "#f1f5f9",
      "200": "#e2e8f0",
      "300": "#cbd5e1",
      "400": "#94a3b8",
      "500": "#64748b",
      "600": "#475569",
      "700": "#334155",
      "800": "#1e293b",
      "900": "#0f172a",
      "950": "#020617",
    },
  },
  {
    id: "stone",
    label: "Stone",
    description: "Warm gray with sand undertone",
    backgroundLight: "#fafaf9",
    backgroundDark: "#0c0a09",
    baseChroma: 0.012,
    neutralHue: 56,
    swatches: {
      "50": "#fafaf9",
      "100": "#f5f5f4",
      "200": "#e7e5e4",
      "300": "#d6d3d1",
      "400": "#a8a29e",
      "500": "#78716c",
      "600": "#57534e",
      "700": "#44403c",
      "800": "#292524",
      "900": "#1c1917",
      "950": "#0c0a09",
    },
  },
] as const;

export const DEFAULT_GRAY_PALETTE_ID: GrayPaletteId = "neutral";

export function getGrayPalette(id: GrayPaletteId): GrayPalette {
  return GRAY_PALETTES.find((palette) => palette.id === id) ?? GRAY_PALETTES[0];
}

export function grayPaletteToDraft(id: GrayPaletteId) {
  const palette = getGrayPalette(id);
  return {
    grayPalette: id,
    backgroundLight: palette.backgroundLight,
    backgroundDark: palette.backgroundDark,
    baseChroma: palette.baseChroma,
    neutralHue: palette.neutralHue,
  };
}

function normalizeHex(color: string): string {
  return color.trim().toLowerCase();
}

/** Returns the palette id when light/dark backgrounds match a preset pair. */
export function matchGrayPalette(backgroundLight: string, backgroundDark: string): GrayPaletteId | null {
  const light = normalizeHex(backgroundLight);
  const dark = normalizeHex(backgroundDark);
  return (
    GRAY_PALETTES.find(
      (palette) =>
        normalizeHex(palette.backgroundLight) === light &&
        normalizeHex(palette.backgroundDark) === dark,
    )?.id ?? null
  );
}

/** Swatches shown inside background color pickers. */
export const LIGHT_BACKGROUND_SWATCHES = [
  "#ffffff",
  ...GRAY_PALETTES.map((palette) => palette.backgroundLight),
] as const;

export const DARK_BACKGROUND_SWATCHES = [
  "#000000",
  ...GRAY_PALETTES.map((palette) => palette.backgroundDark),
] as const;
