import { describe, it, expect } from 'vitest';
import { emitHeroUIBridgeFromVars, withHeroUIAliases } from '../theme/heroui-bridge';

describe('heroui-bridge', () => {
  it('maps primary to accent and muted-foreground to muted text', () => {
    const lines = emitHeroUIBridgeFromVars({
      '--color-primary': '#1373d9',
      '--color-primary-foreground': '#ffffff',
      '--color-muted': '#f1f5f9',
      '--color-muted-foreground': '#64748b',
      '--color-background': '#ffffff',
      '--color-foreground': '#0f172a',
    });
    const css = lines.join('\n');
    expect(css).toContain('--accent: #1373d9');
    expect(css).toContain('--muted: #64748b');
    expect(css).not.toContain('--muted: #f1f5f9');
    expect(css).toContain('--background: #ffffff');
  });

  it('appends aliases after compiled token lines', () => {
    const out = withHeroUIAliases(['  --color-primary: #000;']);
    expect(out.some((line) => line.includes('--accent: #000'))).toBe(true);
  });

  it('maps card to the selected-tab pill and foreground to the pill label', () => {
    const lines = emitHeroUIBridgeFromVars({
      '--color-card': '#ffffff',
      '--color-background': '#f8fafc',
      '--color-foreground': '#0f172a',
    });
    const css = lines.join('\n');
    expect(css).toContain('--segment: #ffffff');
    expect(css).not.toContain('--segment: #f8fafc');
    expect(css).toContain('--segment-foreground: #0f172a');
  });

  it('falls back to background for the pill when card is absent', () => {
    const lines = emitHeroUIBridgeFromVars({
      '--color-background': '#f8fafc',
      '--color-foreground': '#0f172a',
    });
    const css = lines.join('\n');
    expect(css).toContain('--segment: #f8fafc');
    expect(css).toContain('--segment-foreground: #0f172a');
  });
});
