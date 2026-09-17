type RGB = { r: number; g: number; b: number; a?: number };

const namedColors: Record<string, string> = {
  transparent: 'rgba(0,0,0,0)',
  black: '#000000',
  white: '#ffffff',
  red: '#ff0000',
  green: '#008000',
  blue: '#0000ff',
  yellow: '#ffff00',
  cyan: '#00ffff',
  magenta: '#ff00ff',
  gray: '#808080',
  grey: '#808080',
  silver: '#c0c0c0',
  maroon: '#800000',
  olive: '#808000',
  lime: '#00ff00',
  aqua: '#00ffff',
  teal: '#008080',
  navy: '#000080',
  fuchsia: '#ff00ff',
  purple: '#800080',
};

export function parseColor(colorString: string): RGB | null {
  if (!colorString || typeof colorString !== 'string') {
    return null;
  }

  const color = colorString.trim().toLowerCase();

  if (color === 'inherit' || color === 'currentcolor') {
    return null;
  }

  if (namedColors[color]) {
    return parseColor(namedColors[color]);
  }

  if (color === 'transparent') {
    return { r: 0, g: 0, b: 0, a: 0 };
  }

  const hexMatch = color.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hexMatch) {
    const hex = hexMatch[1];
    if (hex.length === 3) {
      return {
        r: parseInt(hex[0] + hex[0], 16),
        g: parseInt(hex[1] + hex[1], 16),
        b: parseInt(hex[2] + hex[2], 16),
      };
    }
    return {
      r: parseInt(hex.substr(0, 2), 16),
      g: parseInt(hex.substr(2, 2), 16),
      b: parseInt(hex.substr(4, 2), 16),
    };
  }

  const rgbMatch = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 10);
    const g = parseInt(rgbMatch[2], 10);
    const b = parseInt(rgbMatch[3], 10);
    const a = rgbMatch[4] ? parseFloat(rgbMatch[4]) : undefined;

    if (r > 255 || g > 255 || b > 255 || r < 0 || g < 0 || b < 0) {
      return null;
    }
    if (a !== undefined && (a < 0 || a > 1)) {
      return null;
    }

    return { r, g, b, a };
  }

  const hslMatch = color.match(/^hsla?\((\d+),\s*([\d.]+)%,\s*([\d.]+)%(?:,\s*([\d.]+))?\)$/);
  if (hslMatch) {
    const h = parseInt(hslMatch[1], 10) / 360;
    const s = parseFloat(hslMatch[2]) / 100;
    const l = parseFloat(hslMatch[3]) / 100;
    const a = hslMatch[4] ? parseFloat(hslMatch[4]) : undefined;

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    return {
      r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
      g: Math.round(hue2rgb(p, q, h) * 255),
      b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
      a,
    };
  }

  const oklchMatch = color.match(
    /^oklch\(\s*([0-9.]+%?)\s+([0-9.]+%?)\s+(-?[0-9.]+(?:deg)?|none)(?:\s*\/\s*([0-9.]+%?))?\s*\)$/i,
  );
  if (oklchMatch) {
    const L = parseOklchChannel(oklchMatch[1], 1);
    const C = parseOklchChannel(oklchMatch[2], 0.4);
    const hueRaw = oklchMatch[3];
    const H = hueRaw === 'none' ? 0 : parseFloat(hueRaw);
    const a = oklchMatch[4] === undefined ? undefined : parseOklchChannel(oklchMatch[4], 1);
    return oklchToRgb(L, C, H, a);
  }

  return null;
}

function parseOklchChannel(raw: string, percentScale: number): number {
  if (raw.endsWith('%')) return (parseFloat(raw) / 100) * percentScale;
  return parseFloat(raw);
}

function srgbChannelToLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function linearToSrgbChannel(channel: number): number {
  const c = channel <= 0.0031308 ? 12.92 * channel : 1.055 * channel ** (1 / 2.4) - 0.055;
  return Math.round(Math.min(255, Math.max(0, c * 255)));
}

type Oklch = { L: number; C: number; H: number; a?: number };

function rgbToOklch(rgb: RGB): Oklch {
  const lr = srgbChannelToLinear(rgb.r);
  const lg = srgbChannelToLinear(rgb.g);
  const lb = srgbChannelToLinear(rgb.b);
  const l = 0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb;
  const m = 0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb;
  const s = 0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb;
  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);
  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const b = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;
  const C = Math.hypot(a, b);
  let H = Math.atan2(b, a) * (180 / Math.PI);
  if (H < 0) H += 360;
  return { L, C, H, a: rgb.a };
}

function oklchToRgb(L: number, C: number, H: number, a?: number): RGB {
  const hue = (H * Math.PI) / 180;
  const aLab = C * Math.cos(hue);
  const bLab = C * Math.sin(hue);
  const l_ = L + 0.3963377774 * aLab + 0.2158037573 * bLab;
  const m_ = L - 0.1055613458 * aLab - 0.0638541728 * bLab;
  const s_ = L - 0.0894841775 * aLab - 1.2914855480 * bLab;
  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;
  const r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const b = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;
  return {
    r: linearToSrgbChannel(r),
    g: linearToSrgbChannel(g),
    b: linearToSrgbChannel(b),
    a,
  };
}

function formatOklchNumber(value: number, digits: number): string {
  const rounded = Number(value.toFixed(digits));
  return Object.is(rounded, -0) ? '0' : String(rounded);
}

function formatOklch(color: Oklch): string {
  const L = formatOklchNumber(Math.min(1, Math.max(0, color.L)), 4);
  const C = formatOklchNumber(Math.max(0, color.C), 4);
  const H = color.C < 0.0005 ? '0' : formatOklchNumber(color.H, 2);
  if (color.a !== undefined && color.a < 1) {
    return `oklch(${L} ${C} ${H} / ${formatOklchNumber(color.a, 3)})`;
  }
  return `oklch(${L} ${C} ${H})`;
}

/** OKLCH channels for a parseable CSS color. */
export function getOklchChannels(color: string): Oklch | null {
  const trimmed = color.trim();
  const oklchMatch = trimmed.match(
    /^oklch\(\s*([0-9.]+%?)\s+([0-9.]+%?)\s+(-?[0-9.]+(?:deg)?|none)(?:\s*\/\s*([0-9.]+%?))?\s*\)$/i,
  );
  if (oklchMatch) {
    const hueRaw = oklchMatch[3];
    return {
      L: parseOklchChannel(oklchMatch[1], 1),
      C: parseOklchChannel(oklchMatch[2], 0.4),
      H: hueRaw === 'none' ? 0 : parseFloat(hueRaw),
      a: oklchMatch[4] === undefined ? undefined : parseOklchChannel(oklchMatch[4], 1),
    };
  }
  const rgb = parseColor(trimmed);
  if (!rgb) return null;
  return rgbToOklch(rgb);
}

/** Convert any parseable color to Tailwind-friendly `oklch()` CSS. */
export function toOklchCss(color: string): string {
  const trimmed = color.trim();
  if (/^oklch\(/i.test(trimmed)) return trimmed;
  const rgb = parseColor(trimmed);
  if (!rgb) return color;
  return formatOklch(rgbToOklch(rgb));
}

/** Rewrite `--color-*` custom properties in a CSS string to `oklch()`. */
export function rewriteColorCustomProperties(css: string): string {
  return css.replace(
    /(--color-[a-z0-9-]+\s*:\s*)([^;}{]+)/gi,
    (full, prefix: string, value: string) => {
      const trimmed = value.trim();
      if (/^var\(/i.test(trimmed) || /^oklch\(/i.test(trimmed)) return full;
      return `${prefix}${toOklchCss(trimmed)}`;
    },
  );
}

export function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const val = c / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function isDarkColor(colorString: string): boolean {
  const rgb = parseColor(colorString);
  if (!rgb) return false;
  const luminance = getLuminance(rgb.r, rgb.g, rgb.b);
  return luminance < 0.5;
}

export function transformColorForDarkMode(colorString: string): string {
  const rgb = parseColor(colorString);
  if (!rgb) return colorString;

  if (rgb.a !== undefined && rgb.a < 0.1) {
    return colorString;
  }

  const luminance = getLuminance(rgb.r, rgb.g, rgb.b);

  if (luminance >= 0.6) return colorString;

  const blendFactor = 0.85 - (luminance / 0.6) * 0.55;

  const r = Math.min(255, Math.round(rgb.r + (255 - rgb.r) * blendFactor));
  const g = Math.min(255, Math.round(rgb.g + (255 - rgb.g) * blendFactor));
  const b = Math.min(255, Math.round(rgb.b + (255 - rgb.b) * blendFactor));

  return rgb.a !== undefined ? `rgba(${r}, ${g}, ${b}, ${rgb.a})` : `rgb(${r}, ${g}, ${b})`;
}

export function transformBgColorForDarkMode(colorString: string): string {
  const rgb = parseColor(colorString);
  if (!rgb) return colorString;

  if (rgb.a !== undefined && rgb.a < 0.1) {
    return colorString;
  }

  const luminance = getLuminance(rgb.r, rgb.g, rgb.b);

  if (luminance < 0.2) return colorString;

  const blendFactor = Math.min(0.9, (luminance - 0.2) * 1.125);
  const darkR = 30, darkG = 31, darkB = 38;

  const r = Math.max(0, Math.round(rgb.r + (darkR - rgb.r) * blendFactor));
  const g = Math.max(0, Math.round(rgb.g + (darkG - rgb.g) * blendFactor));
  const b = Math.max(0, Math.round(rgb.b + (darkB - rgb.b) * blendFactor));

  return rgb.a !== undefined ? `rgba(${r}, ${g}, ${b}, ${rgb.a})` : `rgb(${r}, ${g}, ${b})`;
}

export function transformInlineStyles(cssText: string, theme: 'light' | 'dark'): string {
  if (theme !== 'dark' || !cssText) {
    return cssText;
  }

  const styleProps = cssText.split(';').map((prop) => prop.trim()).filter(Boolean);

  const transformedProps = styleProps.map((prop) => {
    const colonIndex = prop.indexOf(':');
    if (colonIndex === -1) return prop;

    const property = prop.slice(0, colonIndex).trim();
    const value = prop.slice(colonIndex + 1).trim();

    if (property === 'color') {
      const hasImportant = value.includes('!important');
      const colorValue = value.replace('!important', '').trim();
      const transformed = transformColorForDarkMode(colorValue);
      return `${property}: ${transformed}${hasImportant ? ' !important' : ''}`;
    }

    if (property === 'background-color') {
      const hasImportant = value.includes('!important');
      const colorValue = value.replace('!important', '').trim();
      const transformed = transformBgColorForDarkMode(colorValue);
      return `${property}: ${transformed}${hasImportant ? ' !important' : ''}`;
    }

    if (property === 'background' && !value.includes('url(')) {
      const colorMatch = value.match(/#[0-9a-f]{3,6}|rgba?\([^)]+\)|hsla?\([^)]+\)|[a-z]+/i);
      if (colorMatch) {
        const hasImportant = value.includes('!important');
        const originalColor = colorMatch[0];
        const transformed = transformBgColorForDarkMode(originalColor);
        const newValue = value.replace(originalColor, transformed);
        return `${property}: ${newValue.replace('!important', '').trim()}${hasImportant ? ' !important' : ''}`;
      }
    }

    if (property === 'border-color') {
      const hasImportant = value.includes('!important');
      const colorValue = value.replace('!important', '').trim();
      const transformed = transformColorForDarkMode(colorValue);
      return `${property}: ${transformed}${hasImportant ? ' !important' : ''}`;
    }

    return prop;
  });

  return transformedProps.join('; ');
}
