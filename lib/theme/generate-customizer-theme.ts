import type { ThemeTokenSet } from '@/lib/plugin-types';

function oklch(L: number, C: number, H: number): string {
  const l = Number(L.toFixed(4));
  const c = Number(Math.max(0, C).toFixed(4));
  const h = Number(H.toFixed(2));
  return `oklch(${l} ${c} ${h})`;
}

/** HeroUI-style palette from accent hue + neutral chroma (base). */
export function generateCustomizerTokens(
  accentHue: number,
  baseChroma: number,
  neutralHue?: number,
): { light: Record<string, string>; dark: Record<string, string>; common: Record<string, string> } {
  const hue = ((accentHue % 360) + 360) % 360;
  const neutral = neutralHue == null ? hue : ((neutralHue % 360) + 360) % 360;
  const base = Math.max(0, Math.min(baseChroma, 0.06));
  const surfaceChroma = Math.min(base * 0.12, 0.006);
  const borderChroma = Math.min(base * 0.35, 0.014);
  const accent = oklch(0.6231, 0.188, hue);

  const light: Record<string, string> = {
    primary: accent,
    background: base < 0.002 ? oklch(1, 0, neutral) : oklch(0.985, surfaceChroma, neutral),
    foreground: oklch(0.208, Math.max(base * 3, 0.004), neutral),
    secondary: oklch(0.945, Math.max(surfaceChroma, 0.006), neutral),
    'secondary-foreground': oklch(0.208, Math.max(base * 3, 0.004), neutral),
    muted: oklch(0.968, surfaceChroma, neutral),
    'muted-foreground': oklch(0.554, base, neutral),
    accent: oklch(0.932, Math.max(base * 2.2, 0.02), hue),
    'accent-foreground': oklch(0.424, 0.18, hue),
    border: oklch(0.929, borderChroma, neutral),
    input: oklch(0.929, borderChroma, neutral),
    ring: accent,
    card: base < 0.002 ? oklch(1, 0, neutral) : oklch(0.995, surfaceChroma * 0.5, neutral),
    popover: base < 0.002 ? oklch(1, 0, neutral) : oklch(0.995, surfaceChroma * 0.5, neutral),
    sidebar: oklch(0.984, surfaceChroma, neutral),
    'sidebar-foreground': oklch(0.208, Math.max(base * 3, 0.004), neutral),
    'sidebar-border': oklch(0.929, borderChroma, neutral),
    'sidebar-accent': oklch(0.968, surfaceChroma, neutral),
    'sidebar-accent-foreground': oklch(0.208, Math.max(base * 3, 0.004), neutral),
    selection: oklch(0.932, Math.max(base * 2.2, 0.02), hue),
    'selection-foreground': oklch(0.424, 0.18, hue),
    unread: accent,
  };

  const dark: Record<string, string> = {
    primary: accent,
    background: oklch(0.145, Math.max(base * 0.35, 0.004), neutral),
    foreground: oklch(0.985, Math.min(base * 0.15, 0.008), neutral),
    secondary: oklch(0.269, Math.max(base * 0.45, 0.005), neutral),
    'secondary-foreground': oklch(0.985, Math.min(base * 0.15, 0.008), neutral),
    muted: oklch(0.269, Math.max(base * 0.45, 0.005), neutral),
    'muted-foreground': oklch(0.716, Math.max(base * 0.85, 0.01), neutral),
    accent: oklch(0.379, 0.138, hue),
    'accent-foreground': oklch(0.932, Math.max(base * 2.2, 0.02), hue),
    border: oklch(0.35, Math.max(base * 0.2, 0.004), neutral),
    input: oklch(0.269, Math.max(base * 0.45, 0.005), neutral),
    ring: oklch(0.87, Math.min(base * 0.2, 0.01), neutral),
    card: oklch(0.191, Math.max(base * 0.3, 0.004), neutral),
    popover: oklch(0.226, Math.max(base * 0.35, 0.005), neutral),
    sidebar: oklch(0.145, Math.max(base * 0.35, 0.004), neutral),
    'sidebar-foreground': oklch(0.985, Math.min(base * 0.15, 0.008), neutral),
    'sidebar-border': oklch(0.269, Math.max(base * 0.45, 0.005), neutral),
    'sidebar-accent': oklch(0.218, Math.max(base * 0.4, 0.005), neutral),
    'sidebar-accent-foreground': oklch(0.985, Math.min(base * 0.15, 0.008), neutral),
    selection: oklch(0.6231, 0.188, hue) + ' / 0.25',
    'selection-foreground': oklch(0.809, 0.096, hue),
    unread: oklch(0.714, 0.143, hue),
  };

  const common: Record<string, string> = {
    ring: accent,
    unread: accent,
  };

  return { light, dark, common };
}

export function customizerTokensToThemeTokenSet(
  accentHue: number,
  baseChroma: number,
  neutralHue?: number,
): ThemeTokenSet {
  const generated = generateCustomizerTokens(accentHue, baseChroma, neutralHue);
  return {
    common: generated.common,
    light: generated.light,
    dark: generated.dark,
  };
}

/** CSS gradient for the accent hue slider track. */
export function accentHueTrackGradient(): string {
  return 'linear-gradient(to right, oklch(0.62 0.19 0), oklch(0.62 0.19 60), oklch(0.62 0.19 120), oklch(0.62 0.19 180), oklch(0.62 0.19 240), oklch(0.62 0.19 300), oklch(0.62 0.19 360))';
}

/** CSS gradient for the neutral base chroma slider. */
export function baseChromaTrackGradient(hue: number): string {
  const h = ((hue % 360) + 360) % 360;
  return `linear-gradient(to right, oklch(0.72 0 ${h}), oklch(0.72 0.04 ${h}))`;
}
