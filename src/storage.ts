import type { Carousel } from './types';
import { PALETTES } from './palettes';

const KEY = 'carousel-draft-v1';

export function newSlideId(): string {
  return crypto.randomUUID();
}

export function emptyCarousel(): Carousel {
  return {
    title: '',
    paletteId: PALETTES[0].id,
    showBadge: true,
    slides: [
      { id: newSlideId(), heading: '', body: '', style: { size: 'M', align: 'right' } },
    ],
  };
}

export function loadDraft(): Carousel {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyCarousel();
    const parsed = JSON.parse(raw) as Carousel;
    if (!Array.isArray(parsed.slides) || parsed.slides.length === 0) return emptyCarousel();
    return parsed;
  } catch {
    return emptyCarousel();
  }
}

export function saveDraft(carousel: Carousel): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(carousel));
  } catch {
    // Quota/private-mode failures are non-fatal; the editor keeps working.
  }
}
