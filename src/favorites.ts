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
