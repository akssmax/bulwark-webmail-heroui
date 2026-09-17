/**
 * Maps Bulwark Theme API tokens (`--color-*`) onto HeroUI v3 semantic
 * variables (`--accent`, `--surface`, …).
 *
 * HeroUI `--muted` is muted *text*. Bulwark `--color-muted` is a muted
 * *surface*. Never alias those two together.
 */

export const HEROUI_VAR_MAP: ReadonlyArray<readonly [from: string, to: string]> = [
  ['--color-background', '--background'],
  ['--color-foreground', '--foreground'],
  ['--color-primary', '--accent'],
  ['--color-primary-foreground', '--accent-foreground'],
  ['--color-card', '--surface'],
  ['--color-card-foreground', '--surface-foreground'],
  ['--color-popover', '--overlay'],
  ['--color-popover-foreground', '--overlay-foreground'],
  ['--color-destructive', '--danger'],
  ['--color-destructive-foreground', '--danger-foreground'],
  ['--color-success', '--success'],
  ['--color-success-foreground', '--success-foreground'],
  ['--color-warning', '--warning'],
  ['--color-warning-foreground', '--warning-foreground'],
  ['--color-border', '--border'],
  ['--color-border', '--separator'],
  ['--color-ring', '--focus'],
  ['--color-muted-foreground', '--muted'],
  ['--color-secondary', '--default'],
  ['--color-secondary-foreground', '--default-foreground'],
  ['--color-background', '--field-background'],
  ['--color-foreground', '--field-foreground'],
  ['--color-muted-foreground', '--field-placeholder'],
  ['--color-border', '--field-border'],
  ['--radius-md', '--radius'],
];

const DECLARED_RE = /^\s*(--[a-z0-9-]+):\s*(.+);$/i;

export function parseCssVarLines(lines: string[]): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const line of lines) {
    const match = line.match(DECLARED_RE);
    if (match) vars[match[1]] = match[2].trim();
  }
  return vars;
}

/** Emit HeroUI aliases for any Bulwark tokens present in `vars`. */
export function emitHeroUIBridgeFromVars(vars: Record<string, string>): string[] {
  const lines: string[] = [];
  const seen = new Set<string>();
  for (const [from, to] of HEROUI_VAR_MAP) {
    const value = vars[from];
    if (!value || seen.has(to) || vars[to]) continue;
    seen.add(to);
    lines.push(`  ${to}: ${value};`);
  }
  return lines;
}

/** Append HeroUI aliases onto a compiled `:root` / `.dark` declaration list. */
export function withHeroUIAliases(lines: string[]): string[] {
  const extra = emitHeroUIBridgeFromVars(parseCssVarLines(lines));
  if (extra.length === 0) return lines;
  return [...lines, '  /* heroui aliases */', ...extra];
}

export const DARK_THEME_SELECTOR = '.dark, [data-theme="dark"]';
export const LIGHT_THEME_SELECTOR = ':root, [data-theme="light"]';
