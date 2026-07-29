import { useLayoutEffect, useRef, useState } from 'react';
import type { Palette } from '../palettes';

interface Props {
  palettes: Palette[];
  value: string;
  onChange: (id: string) => void;
  onDislike: (id: string) => void;
}

const EXIT_MS = 200;

export default function PalettePicker({ palettes, value, onChange, onDislike }: Props) {
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [enteringIds, setEnteringIds] = useState<Set<string>>(new Set());
  const knownIds = useRef<Set<string>>(new Set(palettes.map((p) => p.id)));
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const prevRects = useRef<Map<string, DOMRect>>(new Map());

  // FLIP: when the grid reshuffles (a disliked palette drops out and the rest shift up),
  // move every surviving card back to its previous spot with a transform, then let it
  // transition to its new spot instead of snapping there instantly.
  useLayoutEffect(() => {
    const nextRects = new Map<string, DOMRect>();
    cardRefs.current.forEach((el, id) => nextRects.set(id, el.getBoundingClientRect()));

    nextRects.forEach((rect, id) => {
      const prev = prevRects.current.get(id);
      if (!prev) return;
      const dx = prev.left - rect.left;
      const dy = prev.top - rect.top;
      if (!dx && !dy) return;
      const el = cardRefs.current.get(id);
      if (!el) return;
      el.style.transition = 'none';
      el.style.transform = `translate(${dx}px, ${dy}px)`;
      requestAnimationFrame(() => {
        el.style.transition = 'transform 260ms ease-out';
        el.style.transform = '';
      });
    });

    prevRects.current = nextRects;

    const currentIds = new Set(palettes.map((p) => p.id));
    const fresh = new Set<string>();
    currentIds.forEach((id) => {
      if (!knownIds.current.has(id)) fresh.add(id);
    });
    knownIds.current = currentIds;
    if (fresh.size > 0) {
      setEnteringIds(fresh);
      setTimeout(() => setEnteringIds(new Set()), 300);
    }
  }, [palettes]);

  // Plays the shrink-and-fade exit locally first, then commits the dislike (which
  // changes the `palettes` list) once the card has visually left.
  const handleDislike = (id: string) => {
    setRemovingId(id);
    setTimeout(() => {
      onDislike(id);
      setRemovingId(null);
    }, EXIT_MS);
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      {palettes.map((p) => (
        <div
          key={p.id}
          ref={(el) => {
            if (el) cardRefs.current.set(p.id, el);
            else cardRefs.current.delete(p.id);
          }}
          className={`group relative transition-[transform,opacity] duration-200 ease-out ${
            removingId === p.id ? 'scale-75 opacity-0' : enteringIds.has(p.id) ? 'palette-enter' : ''
          }`}
        >
          <button
            type="button"
            onClick={() => onChange(p.id)}
            aria-pressed={p.id === value}
            className={`w-full rounded-xl border-2 p-1.5 text-right transition ${
              p.id === value ? 'border-[#E1306C] bg-white shadow-sm' : 'border-transparent bg-white/60 hover:bg-white'
            }`}
          >
            <span className="flex h-6 w-full overflow-hidden rounded-md" aria-hidden>
              {p.colors.map((c) => (
                <span key={c} className="h-full flex-1" style={{ background: c }} />
              ))}
            </span>
            <span className="mt-1 block text-xs font-medium text-neutral-700">{p.name}</span>
          </button>
          <button
            type="button"
            title="לא אוהב את הפלטה הזו"
            aria-label={`הסרת פלטת ${p.name} מהרשימה`}
            onClick={(e) => {
              e.stopPropagation();
              handleDislike(p.id);
            }}
            className="absolute -end-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border border-neutral-200 bg-white text-[10px] text-neutral-400 opacity-0 shadow-sm transition hover:border-red-300 hover:text-red-500 group-hover:opacity-100"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
