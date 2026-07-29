import type { DesignSnapshot, FavoriteDesign } from './types';

const KEY = 'carousel-favorites-v1';

export function newFavoriteId(): string {
  return crypto.randomUUID();
}

export function loadFavorites(): FavoriteDesign[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveFavorites(favorites: FavoriteDesign[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(favorites));
  } catch {
    // Quota/private-mode failures are non-fatal; favorites just don't persist.
  }
}

/** Strips ids and triggers a download of every favorite as a single JSON file. */
export function downloadFavorites(favorites: FavoriteDesign[]): void {
  const designs: DesignSnapshot[] = favorites.map(({ id: _id, ...design }) => design);
  const blob = new Blob([JSON.stringify(designs, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `favorites-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function isDesignSnapshot(v: unknown): v is DesignSnapshot {
  if (!v || typeof v !== 'object') return false;
  const d = v as Record<string, unknown>;
  const roles = d.roles as Record<string, unknown> | undefined;
  return (
    typeof d.paletteId === 'string' &&
    !!roles &&
    typeof roles.bg === 'number' &&
    typeof roles.text === 'number' &&
    typeof roles.accent === 'number' &&
    (d.size === 'S' || d.size === 'M' || d.size === 'L') &&
    (d.align === 'right' || d.align === 'center') &&
    (d.background === 'solid' || d.background === 'blurred') &&
    typeof d.backdropId === 'string' &&
    typeof d.cardInset === 'number' &&
    typeof d.fontId === 'string' &&
    (d.logoStyle === 'circle' || d.logoStyle === 'cutout') &&
    (d.ratio === '4:5' || d.ratio === '1:1') &&
    typeof d.showBadge === 'boolean'
  );
}

/** Parses a favorites JSON export (or a single design object) into fresh FavoriteDesigns. Throws on invalid input. */
export function parseFavoritesFile(text: string): FavoriteDesign[] {
  const parsed = JSON.parse(text);
  const list = Array.isArray(parsed) ? parsed : [parsed];
  const designs = list.filter(isDesignSnapshot);
  if (designs.length === 0) throw new Error('הקובץ אינו מכיל עיצובים מועדפים תקינים');
  return designs.map((design) => ({ ...design, id: newFavoriteId() }));
}

/** True when two designs render identically (slide style + every carousel-wide visual setting). */
export function sameDesign(a: DesignSnapshot, b: DesignSnapshot): boolean {
  return (
    a.paletteId === b.paletteId &&
    a.size === b.size &&
    a.align === b.align &&
    a.roles.bg === b.roles.bg &&
    a.roles.text === b.roles.text &&
    a.roles.accent === b.roles.accent &&
    a.background === b.background &&
    a.backdropId === b.backdropId &&
    a.cardInset === b.cardInset &&
    a.fontId === b.fontId &&
    a.logo === b.logo &&
    a.logoStyle === b.logoStyle &&
    a.ratio === b.ratio &&
    a.showBadge === b.showBadge
  );
}
