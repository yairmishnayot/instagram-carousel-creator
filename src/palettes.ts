import type { Roles } from './types';
import { bestRoles } from './variations';
import trendingRaw from './data/coolorsTrending.json';

export interface Palette {
  id: string;
  name: string;
  colors: [string, string, string, string, string];
  defaultRoles: Roles;
}

// Static snapshot of trending palettes from coolors.co (see spec).
export const PALETTES: Palette[] = [
  {
    id: 'ocean',
    name: 'אוקיינוס',
    colors: ['#264653', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51'],
    defaultRoles: { bg: 0, text: 2, accent: 1 },
  },
  {
    id: 'forest',
    name: 'יער',
    colors: ['#606c38', '#283618', '#fefae0', '#dda15e', '#bc6c25'],
    defaultRoles: { bg: 1, text: 2, accent: 3 },
  },
  {
    id: 'sunset',
    name: 'שקיעה',
    colors: ['#003049', '#d62828', '#f77f00', '#fcbf49', '#eae2b7'],
    defaultRoles: { bg: 0, text: 4, accent: 2 },
  },
  {
    id: 'deep-sea',
    name: 'ים עמוק',
    colors: ['#001219', '#005f73', '#0a9396', '#94d2bd', '#e9d8a6'],
    defaultRoles: { bg: 0, text: 4, accent: 2 },
  },
  {
    id: 'tropic',
    name: 'טרופי',
    colors: ['#ef476f', '#ffd166', '#06d6a0', '#118ab2', '#073b4c'],
    defaultRoles: { bg: 4, text: 1, accent: 0 },
  },
  {
    id: 'neon',
    name: 'ניאון',
    colors: ['#ffbe0b', '#fb5607', '#ff006e', '#8338ec', '#3a86ff'],
    defaultRoles: { bg: 3, text: 0, accent: 2 },
  },
  {
    id: 'sky',
    name: 'שמיים',
    colors: ['#8ecae6', '#219ebc', '#023047', '#ffb703', '#fb8500'],
    defaultRoles: { bg: 2, text: 0, accent: 3 },
  },
  {
    id: 'pastel',
    name: 'פסטל',
    colors: ['#f6bd60', '#f7ede2', '#f5cac3', '#84a59d', '#f28482'],
    defaultRoles: { bg: 3, text: 1, accent: 0 },
  },
  {
    id: 'night',
    name: 'לילה',
    colors: ['#0d1b2a', '#1b263b', '#415a77', '#778da9', '#e0e1dd'],
    defaultRoles: { bg: 0, text: 4, accent: 3 },
  },
  {
    id: 'roses',
    name: 'ורדים',
    colors: ['#355070', '#6d597a', '#b56576', '#e56b6f', '#eaac8b'],
    defaultRoles: { bg: 0, text: 4, accent: 3 },
  },
  {
    id: 'wine',
    name: 'יין',
    colors: ['#780000', '#c1121f', '#fdf0d5', '#003049', '#669bbc'],
    defaultRoles: { bg: 0, text: 2, accent: 4 },
  },
  {
    id: 'peach',
    name: 'אפרסק',
    colors: ['#ffcdb2', '#ffb4a2', '#e5989b', '#b5838d', '#6d6875'],
    defaultRoles: { bg: 0, text: 4, accent: 3 },
  },
  {
    id: 'pink',
    name: 'ורוד',
    colors: ['#ffe5ec', '#ffc2d1', '#ffb3c6', '#ff8fab', '#fb6f92'],
    defaultRoles: { bg: 4, text: 0, accent: 1 },
  },
  {
    id: 'sage',
    name: 'מרווה',
    colors: ['#dad7cd', '#a3b18a', '#588157', '#3a5a40', '#344e41'],
    defaultRoles: { bg: 4, text: 0, accent: 1 },
  },
  {
    id: 'autumn',
    name: 'סתיו',
    colors: ['#6f1d1b', '#bb9457', '#432818', '#99582a', '#ffe6a7'],
    defaultRoles: { bg: 2, text: 4, accent: 1 },
  },
  {
    id: 'raspberry',
    name: 'פטל',
    colors: ['#880d1e', '#dd2d4a', '#f26a8d', '#f49cbb', '#cbeef3'],
    defaultRoles: { bg: 0, text: 4, accent: 2 },
  },
  {
    id: 'disco',
    name: 'דיסקו',
    colors: ['#390099', '#9e0059', '#ff0054', '#ff5400', '#ffbd00'],
    defaultRoles: { bg: 0, text: 4, accent: 2 },
  },
  {
    id: 'candy',
    name: 'ממתקים',
    colors: ['#9b5de5', '#f15bb5', '#fee440', '#00bbf9', '#00f5d4'],
    defaultRoles: { bg: 0, text: 2, accent: 4 },
  },
  {
    id: 'black-gold',
    name: 'שחור וזהב',
    colors: ['#000000', '#14213d', '#fca311', '#e5e5e5', '#ffffff'],
    defaultRoles: { bg: 0, text: 4, accent: 2 },
  },
  {
    id: 'golden-summer',
    name: 'קיץ זהוב',
    colors: ['#0d3b66', '#faf0ca', '#f4d35e', '#ee964b', '#f95738'],
    defaultRoles: { bg: 0, text: 1, accent: 2 },
  },
];

// Hebrew names for the trending palettes pulled in from coolorsTrending.json (English
// display name from coolors.co -> short Hebrew name in this app's style).
const TRENDING_NAMES: Record<string, string> = {
  'Pastel Dreamland Adventure': 'חלום פסטלי',
  'Bold Berry': 'פטל נועז',
  'Dark Sunset': 'שקיעה כהה',
  'Fresh Greens': 'ירוק רענן',
  'Earthy Green': 'ירוק אדמה',
  'Peachy Delight': 'עידון אפרסק',
  'Summer Ocean Breeze': 'משב ים קיצי',
  'Ocean Breeze': 'משב ים',
  'Soft Lavender': 'לבנדר רך',
  'Golden Summer Fields': 'שדות קיץ זהובים',
  'Soft Sand': 'חול רך',
  'Earthy Tones': 'גווני אדמה',
  'Pastel Dreams': 'חלומות פסטל',
  'Deep Blue Sea': 'ים כחול עמוק',
  'Vibrant Spring': 'אביב תוסס',
  'Whimsical Dreams': 'חלום קסום',
  'Autumn Sunset': 'שקיעת סתיו',
  'Leafy Green Garden': 'גן עלים ירוק',
  'Monochrome Beach': 'חוף מונוכרום',
  'Bold Hues': 'גוונים נועזים',
  'Turquoise Harmony': 'הרמוניית טורקיז',
  'Cool Waters': 'מים קרירים',
};

interface TrendingEntry {
  name: string;
  colors: string[];
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-+|-+$)/g, '');
}

// Extra palettes sourced from coolors.co's trending list (see data/coolorsTrending.json),
// filtered to standard 5-color palettes and deduped against the curated PALETTES above.
// These back the "disliked palette" swap: when a user dislikes one of the curated palettes,
// it's replaced in the picker by the next one here.
function buildExtraPalettes(): Palette[] {
  const existingKeys = new Set(PALETTES.map((p) => [...p.colors].sort().join(',')));
  const seenKeys = new Set<string>();
  const seenIds = new Set<string>();
  const extras: Palette[] = [];
  for (const entry of trendingRaw as TrendingEntry[]) {
    if (entry.colors.length !== 5) continue;
    const colors = entry.colors.map((c) => c.toLowerCase()) as Palette['colors'];
    const key = [...colors].sort().join(',');
    if (existingKeys.has(key) || seenKeys.has(key)) continue;
    seenKeys.add(key);
    let id = `coolors-${slugify(entry.name)}`;
    while (seenIds.has(id)) id += '-2';
    seenIds.add(id);
    extras.push({
      id,
      name: TRENDING_NAMES[entry.name] ?? entry.name,
      colors,
      defaultRoles: bestRoles(colors),
    });
  }
  return extras;
}

/** Pool of alternate palettes used to backfill the picker when a curated palette is disliked. */
export const EXTRA_PALETTES: Palette[] = buildExtraPalettes();

export const ALL_PALETTES: Palette[] = [...PALETTES, ...EXTRA_PALETTES];

export function getPalette(id: string): Palette {
  return ALL_PALETTES.find((p) => p.id === id) ?? PALETTES[0];
}

/**
 * The palettes the picker should show: the 20 curated palettes plus any pool palettes pulled in
 * to backfill past dislikes (`extraIds`), minus whichever of those are currently disliked.
 * Restoring a disliked palette just un-hides it here — it doesn't evict its replacement, so the
 * grid can grow past 20 once palettes have been disliked and then restored.
 */
export function getVisiblePalettes(dislikedIds: ReadonlySet<string>, extraIds: readonly string[]): Palette[] {
  const universeIds = [...PALETTES.map((p) => p.id), ...extraIds];
  return universeIds.map(getPalette).filter((p) => !dislikedIds.has(p.id));
}

/** The next pool palette not already pulled into the grid, used to backfill a fresh dislike. */
export function pickNextPoolPalette(extraIds: readonly string[]): Palette | undefined {
  return EXTRA_PALETTES.find((p) => !extraIds.includes(p.id));
}

/** Extra role colors available on every palette: index 5 = black, 6 = white. */
export const EXTRA_COLORS = ['#000000', '#ffffff'];

/** Resolves a Color Role index to a color: 0-4 = the palette's colors, 5-6 = black/white. */
export function roleColor(palette: Palette, index: number): string {
  return palette.colors[index] ?? EXTRA_COLORS[index - palette.colors.length] ?? palette.colors[0];
}
