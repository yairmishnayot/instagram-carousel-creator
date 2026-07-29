import { useState } from 'react';
import type { Palette } from '../palettes';

interface Props {
  palettes: Palette[];
  onRestore: (id: string) => void;
}

/** Collapsible list of palettes the user marked as disliked, each restorable back to the picker. */
export default function DislikedPalettesPanel({ palettes, onRestore }: Props) {
  const [open, setOpen] = useState(false);
  if (palettes.length === 0) return null;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="text-[11px] font-medium text-neutral-400 underline-offset-2 hover:text-neutral-600 hover:underline"
      >
        פלטות שלא אהבת ({palettes.length}) {open ? '▲' : '▼'}
      </button>
      {open && (
        <div className="mt-2 flex flex-col gap-1.5">
          {palettes.map((p) => (
            <div key={p.id} className="flex items-center gap-2 rounded-lg border border-neutral-200 p-1.5">
              <span className="flex h-5 w-16 shrink-0 overflow-hidden rounded-md" aria-hidden>
                {p.colors.map((c) => (
                  <span key={c} className="h-full flex-1" style={{ background: c }} />
                ))}
              </span>
              <span className="flex-1 text-xs font-medium text-neutral-600">{p.name}</span>
              <button
                type="button"
                onClick={() => onRestore(p.id)}
                className="rounded-md px-2 py-1 text-[11px] font-medium text-[#E1306C] hover:bg-[#E1306C]/5"
              >
                שחזור
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
