import { useState } from 'react';
import type { Carousel, Slide, SlideStyle, Align, SizeStep } from '../types';
import { SLIDE_W, SLIDE_H } from '../types';
import { PALETTES } from '../palettes';
import SlideView, { effectiveDesign } from './SlideView';

const SCALE = 0.26;

interface Props {
  slide: Slide;
  carousel: Carousel;
  index: number;
  total: number;
  exporting: boolean;
  registerNode: (id: string, el: HTMLDivElement | null) => void;
  onChange: (patch: Partial<Slide>) => void;
  onStyle: (patch: Partial<SlideStyle>) => void;
  onMove: (dir: -1 | 1) => void;
  onDelete: () => void;
  onDownload: () => void;
}

const SIZES: { value: SizeStep; label: string }[] = [
  { value: 'S', label: 'קטן' },
  { value: 'M', label: 'בינוני' },
  { value: 'L', label: 'גדול' },
];

const ALIGNS: { value: Align; label: string }[] = [
  { value: 'right', label: 'ימין' },
  { value: 'center', label: 'מרכז' },
];

const ROLE_LABELS = { bg: 'רקע', text: 'טקסט', accent: 'הדגשה' } as const;

function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`px-3 py-1.5 text-xs font-medium transition ${
            o.value === value ? 'bg-neutral-800 text-white' : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function SlideCard(props: Props) {
  const { slide, carousel, index, total, exporting } = props;
  const [overflow, setOverflow] = useState(false);
  const { palette, roles } = effectiveDesign(slide, carousel);

  return (
    <section className="flex flex-col gap-5 rounded-2xl bg-white p-5 shadow-sm sm:flex-row">
      {/* Editor */}
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-neutral-500">שקופית {index + 1}</h3>
          <div className="flex items-center gap-1">
            <button
              type="button"
              title="הזז למעלה"
              disabled={index === 0}
              onClick={() => props.onMove(-1)}
              className="rounded-md px-2 py-1 text-neutral-500 hover:bg-neutral-100 disabled:opacity-30"
            >
              ↑
            </button>
            <button
              type="button"
              title="הזז למטה"
              disabled={index === total - 1}
              onClick={() => props.onMove(1)}
              className="rounded-md px-2 py-1 text-neutral-500 hover:bg-neutral-100 disabled:opacity-30"
            >
              ↓
            </button>
            <button
              type="button"
              disabled={total === 1}
              onClick={props.onDelete}
              className="rounded-md px-2 py-1 text-xs font-medium text-red-500 hover:bg-red-50 disabled:opacity-30"
            >
              מחק
            </button>
          </div>
        </div>

        <input
          value={slide.heading}
          onChange={(e) => props.onChange({ heading: e.target.value })}
          placeholder="כותרת (אופציונלי)"
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm font-semibold outline-none focus:border-[#E1306C]"
        />
        <textarea
          value={slide.body}
          onChange={(e) => props.onChange({ body: e.target.value })}
          placeholder="תוכן השקופית…"
          rows={5}
          className="resize-y rounded-lg border border-neutral-200 px-3 py-2 text-sm leading-relaxed outline-none focus:border-[#E1306C]"
        />

        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <label className="flex items-center gap-2 text-xs text-neutral-500">
            גודל טקסט
            <Segmented options={SIZES} value={slide.style.size} onChange={(size) => props.onStyle({ size })} />
          </label>
          <label className="flex items-center gap-2 text-xs text-neutral-500">
            יישור
            <Segmented options={ALIGNS} value={slide.style.align} onChange={(align) => props.onStyle({ align })} />
          </label>
          <label className="flex items-center gap-2 text-xs text-neutral-500">
            פלטה
            <select
              value={slide.style.paletteId ?? ''}
              onChange={(e) => props.onStyle({ paletteId: e.target.value || undefined })}
              className="rounded-lg border border-neutral-200 bg-neutral-50 px-2 py-1.5 text-xs font-medium text-neutral-700"
            >
              <option value="">פלטת הקרוסלה</option>
              {PALETTES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {(Object.keys(ROLE_LABELS) as (keyof typeof ROLE_LABELS)[]).map((role) => (
            <div key={role} className="flex items-center gap-2">
              <span className="w-11 text-xs text-neutral-500">{ROLE_LABELS[role]}</span>
              <div className="flex gap-1.5">
                {palette.colors.map((c, i) => (
                  <button
                    key={c}
                    type="button"
                    title={c}
                    onClick={() => props.onStyle({ roles: { ...roles, [role]: i } })}
                    className={`h-5 w-5 rounded-full border transition ${
                      roles[role] === i
                        ? 'scale-110 border-neutral-800 ring-2 ring-neutral-300'
                        : 'border-black/10 hover:scale-110'
                    }`}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {overflow && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
            הטקסט ארוך מדי לשקופית — הוא הוקטן לגודל המינימלי ועדיין נחתך. קצרו את התוכן או פצלו לשקופית נוספת.
          </p>
        )}

        <div className="mt-auto flex justify-end">
          <button
            type="button"
            disabled={exporting}
            onClick={props.onDownload}
            className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-40"
          >
            הורדת תמונה
          </button>
        </div>
      </div>

      {/* Preview */}
      <div
        className="relative shrink-0 self-center overflow-hidden rounded-xl shadow-md sm:self-start"
        style={{ width: SLIDE_W * SCALE, height: SLIDE_H * SCALE }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, transform: `scale(${SCALE})`, transformOrigin: 'top left' }}>
          <SlideView
            slide={slide}
            carousel={carousel}
            index={index}
            total={total}
            captureRef={(el) => props.registerNode(slide.id, el)}
            onOverflowChange={setOverflow}
          />
        </div>
      </div>
    </section>
  );
}
