import type { FavoriteDesign } from '../types';
import { getPalette, roleColor } from '../palettes';

interface Props {
  favorites: FavoriteDesign[];
  onApply: (favoriteId: string) => void;
  onRemove: (favoriteId: string) => void;
}

const SIZE_LABELS = { S: 'קטן', M: 'בינוני', L: 'גדול' } as const;
const ALIGN_LABELS = { right: 'ימין', center: 'מרכז' } as const;
const BACKGROUND_LABELS = { solid: 'צבע אחיד', blurred: 'רקע מטושטש' } as const;

export default function FavoritesPanel({ favorites, onApply, onRemove }: Props) {
  if (favorites.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-neutral-300 px-3 py-4 text-center text-xs text-neutral-400">
        אין עדיין עיצובים מועדפים. לחצו על ⭐ ליד שקופית כדי לשמור את העיצוב שלה לכאן.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {favorites.map((fav) => {
        const palette = getPalette(fav.paletteId);
        return (
          <div key={fav.id} className="rounded-xl border border-neutral-200 p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="flex" aria-hidden>
                  {(['bg', 'text', 'accent'] as const).map((role) => (
                    <span
                      key={role}
                      className="-me-1.5 h-5 w-5 rounded-full border border-white last:me-0"
                      style={{ background: roleColor(palette, fav.roles[role]) }}
                    />
                  ))}
                </span>
                <span className="text-xs font-medium text-neutral-700">{palette.name}</span>
              </div>
              <button
                type="button"
                title="הסרה מהמועדפים"
                aria-label="הסרה מהמועדפים"
                onClick={() => onRemove(fav.id)}
                className="rounded-md px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-50"
              >
                הסרה
              </button>
            </div>
            <p className="mt-1.5 text-[11px] text-neutral-400">
              גודל: {SIZE_LABELS[fav.size]} · יישור: {ALIGN_LABELS[fav.align]} · {BACKGROUND_LABELS[fav.background]} · יחס{' '}
              {fav.ratio} · לוגו: {fav.logo ? 'יש' : 'אין'}
            </p>
            <button
              type="button"
              onClick={() => onApply(fav.id)}
              title="מחליף את עיצוב כל השקופיות ואת רקע/פונט/לוגו/יחס הקרוסלה בעיצוב הזה"
              className="mt-2 w-fit rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:border-[#E1306C] hover:text-[#E1306C]"
            >
              החלה על כל השקופיות
            </button>
          </div>
        );
      })}
    </div>
  );
}
