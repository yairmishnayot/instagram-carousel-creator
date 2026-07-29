const DISLIKED_KEY = 'disliked-palettes-v1';
const EXTRA_KEY = 'active-extra-palettes-v1';

function loadIdList(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

function saveIdList(key: string, ids: string[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(ids));
  } catch {
    // Quota/private-mode failures are non-fatal; the list just doesn't persist.
  }
}

export const loadDislikedPaletteIds = () => loadIdList(DISLIKED_KEY);
export const saveDislikedPaletteIds = (ids: string[]) => saveIdList(DISLIKED_KEY, ids);

/** Pool palettes pulled into the grid to backfill past dislikes; grows over time, never shrinks on restore. */
export const loadExtraPaletteIds = () => loadIdList(EXTRA_KEY);
export const saveExtraPaletteIds = (ids: string[]) => saveIdList(EXTRA_KEY, ids);
