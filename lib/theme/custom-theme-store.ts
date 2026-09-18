import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { compileAdvancedTheme } from '@/lib/theme-compiler';
import type { ThemeDensity, ThemeManifest } from '@/lib/plugin-types';
import { injectCustomThemeCSS, removeCustomThemeCSS } from '@/lib/theme-loader';
import { getOklchChannels, toOklchCss } from '@/lib/color-transform';
import { customizerTokensToThemeTokenSet } from '@/lib/theme/generate-customizer-theme';
import {
  DEFAULT_GRAY_PALETTE_ID,
  type GrayPaletteId,
} from '@/lib/theme/gray-palettes';
import { DARK_THEME_SELECTOR, LIGHT_THEME_SELECTOR } from '@/lib/theme/heroui-bridge';

export {
  DEFAULT_GRAY_PALETTE_ID,
  GRAY_PALETTES,
  LIGHT_BACKGROUND_SWATCHES,
  DARK_BACKGROUND_SWATCHES,
  grayPaletteToDraft,
  getGrayPalette,
  matchGrayPalette,
  type GrayPaletteId,
} from '@/lib/theme/gray-palettes';

export interface CustomThemeDraft {
  accent: string;
  backgroundLight: string;
  backgroundDark: string;
  radius: string;
  density: ThemeDensity;
  fontSans: string;
  enabled: boolean;
  /** HeroUI-style accent hue (OKLCH degrees). */
  accentHue: number;
  /** Neutral chroma mixed into grays. */
  baseChroma: number;
  /** Hue for neutral surfaces (borders, muted, sidebar). */
  neutralHue: number;
  /** Tailwind-style gray family preset. */
  grayPalette: GrayPaletteId;
  /** Multiplier for `--field-radius` relative to `--radius`. */
  fieldRadiusScale: number;
  /** `custom` uses generated tokens; otherwise a built-in theme id. */
  presetId: 'custom' | string;
}

export const DEFAULT_CUSTOM_THEME: Omit<CustomThemeDraft, 'enabled'> = {
  accent: '#3b82f6',
  backgroundLight: '#ffffff',
  backgroundDark: '#0a0a0a',
  radius: '0.75rem',
  density: 'normal',
  fontSans: 'var(--font-geist-sans), system-ui, sans-serif',
  accentHue: 253.83,
  baseChroma: 0.0133,
  neutralHue: 0,
  grayPalette: DEFAULT_GRAY_PALETTE_ID,
  fieldRadiusScale: 1.5,
  presetId: 'custom',
};

export const BRAND_SWATCHES = [
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#d946ef',
  '#f43f5e',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#14b8a6',
  '#0ea5e9',
] as const;

export const RADIUS_PRESETS = [
  { id: 'sharp', label: 'Sharp', value: '0.25rem', short: 'S' },
  { id: 'default', label: 'Default', value: '0.5rem', short: 'M' },
  { id: 'rounded', label: 'Rounded', value: '0.75rem', short: 'M' },
  { id: 'pill', label: 'Soft', value: '1rem', short: 'L' },
] as const;

export const FIELD_RADIUS_PRESETS = [
  { id: 'sm', label: 'Small', scale: 1 },
  { id: 'md', label: 'Medium', scale: 1.25 },
  { id: 'lg', label: 'Large', scale: 1.5 },
  { id: 'xl', label: 'Extra large', scale: 2 },
] as const;

export const FONT_PRESETS = [
  { id: 'geist', label: 'Geist', value: 'var(--font-geist-sans), system-ui, sans-serif' },
  { id: 'system', label: 'System', value: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
  { id: 'inter', label: 'Inter', value: 'var(--font-geist-sans), Inter, system-ui, sans-serif' },
  { id: 'serif', label: 'Serif', value: 'Georgia, "Times New Roman", serif' },
  { id: 'mono', label: 'Mono', value: 'var(--font-geist-mono), ui-monospace, monospace' },
] as const;

interface CustomThemeState extends CustomThemeDraft {
  setDraft: (patch: Partial<CustomThemeDraft>) => void;
  applyDraft: () => void;
  resetDraft: () => void;
  initialize: () => void;
  /** Live preview: enable custom theme and repaint (design-system dock). */
  previewLive: (patch?: Partial<CustomThemeDraft>) => void;
}

function draftToManifest(draft: Omit<CustomThemeDraft, 'enabled'>): ThemeManifest {
  const generated = customizerTokensToThemeTokenSet(
    draft.accentHue,
    draft.baseChroma,
    draft.neutralHue,
  );
  const lightBg = toOklchCss(draft.backgroundLight);
  const darkBg = toOklchCss(draft.backgroundDark);
  return {
    id: 'custom-brand',
    name: 'Custom brand',
    version: '1.0.0',
    author: 'Theme builder',
    description: 'Live brand theme from the in-app builder',
    type: 'theme',
    variants: ['light', 'dark'],
    apiVersion: 2,
    derive: true,
    density: draft.density,
    radii: {
      sm: `calc(${draft.radius} * 0.5)`,
      md: draft.radius,
      lg: `calc(${draft.radius} * 1.5)`,
      xl: `calc(${draft.radius} * 2)`,
      full: '9999px',
    },
    typography: { fontSans: draft.fontSans },
    tokens: {
      ...generated,
      light: {
        ...generated.light,
        background: lightBg,
        card: lightBg,
        popover: lightBg,
      },
      dark: {
        ...generated.dark,
        background: darkBg,
        card: darkBg,
      },
    },
  };
}

function fieldRadiusBlock(draft: Omit<CustomThemeDraft, 'enabled'>): string {
  const fieldRadius = `calc(${draft.radius} * ${draft.fieldRadiusScale})`;
  return `${LIGHT_THEME_SELECTOR}, ${DARK_THEME_SELECTOR} {\n  --field-radius: ${fieldRadius};\n}`;
}

export function compileDraftCss(draft: Omit<CustomThemeDraft, 'enabled'>): string {
  const compiled = compileAdvancedTheme(draftToManifest(draft));
  const extras = fieldRadiusBlock(draft);
  return [compiled.css, extras].filter(Boolean).join('\n\n');
}

export function buildThemeZipManifest(draft: Omit<CustomThemeDraft, 'enabled'>): ThemeManifest {
  return {
    ...draftToManifest(draft),
    id: 'brand-custom',
    name: 'Brand custom',
    description: 'Exported from the webmail theme builder',
  };
}

function paint(draft: CustomThemeDraft) {
  if (typeof document === 'undefined') return;
  if (!draft.enabled || draft.presetId !== 'custom') {
    removeCustomThemeCSS();
    return;
  }
  injectCustomThemeCSS(compileDraftCss(draft));
}

function normalizeDraft(patch: Partial<CustomThemeDraft>, current: CustomThemeDraft): CustomThemeDraft {
  const next = { ...current, ...patch };
  if (patch.accent && patch.accentHue === undefined) {
    const channels = getOklchChannels(patch.accent);
    if (channels) next.accentHue = channels.H;
  }
  if (patch.accentHue !== undefined && patch.accent === undefined) {
    next.accent = `oklch(0.6231 0.188 ${next.accentHue})`;
  }
  return next;
}

export const useCustomThemeStore = create<CustomThemeState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_CUSTOM_THEME,
      enabled: false,

      setDraft: (patch) => {
        const next = normalizeDraft(patch, get());
        set(next);
        if (next.enabled && next.presetId === 'custom') paint(next);
      },

      applyDraft: () => {
        const next = { ...get(), enabled: true, presetId: 'custom' as const };
        set({ enabled: true, presetId: 'custom' });
        paint(next);
      },

      previewLive: (patch) => {
        const next = normalizeDraft({ ...patch, enabled: true, presetId: 'custom' }, get());
        set(next);
        paint(next);
      },

      resetDraft: () => {
        set({ ...DEFAULT_CUSTOM_THEME, enabled: false });
        removeCustomThemeCSS();
      },

      initialize: () => {
        paint(get());
      },
    }),
    {
      name: 'custom-theme-draft',
      partialize: (state) => ({
        accent: state.accent,
        backgroundLight: state.backgroundLight,
        backgroundDark: state.backgroundDark,
        radius: state.radius,
        density: state.density,
        fontSans: state.fontSans,
        enabled: state.enabled,
        accentHue: state.accentHue,
        baseChroma: state.baseChroma,
        neutralHue: state.neutralHue,
        grayPalette: state.grayPalette,
        fieldRadiusScale: state.fieldRadiusScale,
        presetId: state.presetId,
      }),
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<CustomThemeDraft>),
        accentHue: (persisted as Partial<CustomThemeDraft>)?.accentHue ?? DEFAULT_CUSTOM_THEME.accentHue,
        baseChroma: (persisted as Partial<CustomThemeDraft>)?.baseChroma ?? DEFAULT_CUSTOM_THEME.baseChroma,
        neutralHue: (persisted as Partial<CustomThemeDraft>)?.neutralHue ?? DEFAULT_CUSTOM_THEME.neutralHue,
        grayPalette: (persisted as Partial<CustomThemeDraft>)?.grayPalette ?? DEFAULT_CUSTOM_THEME.grayPalette,
        fieldRadiusScale: (persisted as Partial<CustomThemeDraft>)?.fieldRadiusScale ?? DEFAULT_CUSTOM_THEME.fieldRadiusScale,
        presetId: (persisted as Partial<CustomThemeDraft>)?.presetId ?? 'custom',
      }),
    },
  ),
);
