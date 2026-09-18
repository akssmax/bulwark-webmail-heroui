import { describe, expect, it } from 'vitest';
import { generateCustomizerTokens } from '@/lib/theme/generate-customizer-theme';
import { compileDraftCss } from '@/lib/theme/custom-theme-store';

describe('generateCustomizerTokens', () => {
  it('generates distinct light and dark primary from accent hue', () => {
    const { light, dark } = generateCustomizerTokens(253.83, 0.0133);
    expect(light.primary).toMatch(/^oklch\(/);
    expect(dark.primary).toBe(light.primary);
    expect(light['muted-foreground']).toMatch(/^oklch\(/);
  });

  it('keeps light secondary darker than background so the swatch is visible', () => {
    const { light } = generateCustomizerTokens(253.83, 0.0133);
    const lightness = (value: string) => Number(value.match(/oklch\(([\d.]+)/)?.[1]);
    expect(lightness(light.secondary)).toBeLessThan(0.96);
    expect(lightness(light.secondary)).toBeLessThan(lightness(light.background));
  });

  it('uses neutralHue for muted tokens while keeping accent hue on primary', () => {
    const accentOnly = generateCustomizerTokens(253.83, 0.0133);
    const withNeutral = generateCustomizerTokens(253.83, 0.0133, 56);
    expect(withNeutral.light.primary).toBe(accentOnly.light.primary);
    expect(withNeutral.light.muted).not.toBe(accentOnly.light.muted);
  });

  it('compiles draft CSS with field-radius override', () => {
    const css = compileDraftCss({
      accent: '#3b82f6',
      backgroundLight: '#ffffff',
      backgroundDark: '#0a0a0a',
      radius: '0.75rem',
      density: 'normal',
      fontSans: 'system-ui, sans-serif',
      accentHue: 208,
      baseChroma: 0.0133,
      neutralHue: 0,
      grayPalette: 'neutral',
      fieldRadiusScale: 1.5,
      presetId: 'custom',
    });
    expect(css).toContain('--color-primary');
    expect(css).toContain('--field-radius: calc(0.75rem * 1.5)');
    expect(css).toContain('--segment:');
    expect(css).toContain('--segment-foreground:');
  });
});
