import type { Roles } from './types';
import type { Palette } from './palettes';

function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const chan = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * chan((n >> 16) & 255) + 0.7152 * chan((n >> 8) & 255) + 0.0722 * chan(n & 255);
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const sameRoles = (a: Roles, b: Roles) => a.bg === b.bg && a.text === b.text && a.accent === b.accent;

// Slide text is large (>=30px effective), so thresholds start looser than the
// WCAG 4.5 body-text bar. Soft palettes (pastels, all-bright neons) can't meet
// the strict bar at all, so thresholds relax step by step until enough
// combinations exist to make cycling worthwhile.
const THRESHOLDS: [text: number, accent: number][] = [
  [3.5, 2.2],
  [3.0, 1.8],
  [2.5, 1.5],
  [2.0, 1.3],
  [1.5, 1.15],
];
const MIN_USEFUL = 6;

const cache = new Map<string, Roles[]>();

function collect(palette: Palette, minText: number, minAccent: number): { roles: Roles; score: number }[] {
  const scored: { roles: Roles; score: number }[] = [];
  for (let bg = 0; bg < 5; bg++) {
    for (let text = 0; text < 5; text++) {
      if (text === bg) continue;
      const textContrast = contrast(palette.colors[bg], palette.colors[text]);
      if (textContrast < minText) continue;
      for (let accent = 0; accent < 5; accent++) {
        if (accent === bg || accent === text) continue;
        const accentContrast = contrast(palette.colors[bg], palette.colors[accent]);
        if (accentContrast < minAccent) continue;
        scored.push({ roles: { bg, text, accent }, score: textContrast + accentContrast });
      }
    }
  }
  return scored;
}

/**
 * Readable (bg, text, accent) combinations of a Palette, best contrast first.
 * The palette's default roles always lead the list.
 */
export function getVariations(palette: Palette): Roles[] {
  const cached = cache.get(palette.id);
  if (cached) return cached;

  let scored: { roles: Roles; score: number }[] = [];
  for (const [minText, minAccent] of THRESHOLDS) {
    scored = collect(palette, minText, minAccent);
    if (scored.length >= MIN_USEFUL) break;
  }
  scored.sort((a, b) => b.score - a.score);

  const result = [palette.defaultRoles, ...scored.map((s) => s.roles).filter((r) => !sameRoles(r, palette.defaultRoles))];
  cache.set(palette.id, result);
  return result;
}

export function variationIndex(variations: Roles[], current: Roles): number {
  const i = variations.findIndex((v) => sameRoles(v, current));
  return i === -1 ? 0 : i;
}
