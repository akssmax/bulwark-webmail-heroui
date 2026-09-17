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
      fieldRadiusScale: 1.5,
      presetId: 'custom',
    });
    expect(css).toContain('--color-primary');
    expect(css).toContain('--field-radius: calc(0.75rem * 1.5)');
  });
});
