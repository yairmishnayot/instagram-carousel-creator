import { PALETTES } from '../palettes';

interface Props {
  value: string;
  onChange: (id: string) => void;
}

export default function PalettePicker({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {PALETTES.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => onChange(p.id)}
          aria-pressed={p.id === value}
          className={`rounded-xl border-2 p-1.5 text-right transition ${
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
      ))}
    </div>
  );
}
