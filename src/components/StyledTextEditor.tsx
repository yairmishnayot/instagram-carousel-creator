import { useRef, useState } from 'react';
import type { StyledRange, TextSpanStyle } from '../types';
import { findOccurrenceStart, occurrenceIndexAt } from '../richText';
import { EXTRA_COLORS, type Palette } from '../palettes';
import { FONTS } from '../fonts';

const SIZES = [50, 75, 100, 125, 150, 200, 250];

interface Props {
  body: string;
  styles: StyledRange[] | undefined;
  palette: Palette;
  onChangeBody: (body: string) => void;
  onChangeStyles: (styles: StyledRange[]) => void;
}

interface Draft {
  /** id of the range being edited, or undefined when creating a new one. */
  id?: string;
  start: number;
  end: number;
  text: string;
  style: TextSpanStyle;
}

export default function StyledTextEditor({ body, styles, palette, onChangeBody, onChangeStyles }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // `draft` holds the panel's content and stays mounted through the closing
  // animation; `panelOpen` drives that animation and only clears `draft` once
  // the collapse transition finishes (see onTransitionEnd below).
  const [draft, setDraft] = useState<Draft | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const ranges = styles ?? [];

  const openDraft = (d: Draft) => {
    setDraft(d);
    setPanelOpen(true);
  };

  const closePanel = () => setPanelOpen(false);

  const startDraftFromSelection = () => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    if (start === end) return;
    const text = body.slice(start, end);
    const occurrence = occurrenceIndexAt(body, start, text);
    const existing = ranges.find((r) => r.text === text && r.occurrence === occurrence);
    openDraft({ id: existing?.id, start, end, text, style: existing?.style ?? {} });
  };

  const editExisting = (r: StyledRange) => {
    const idx = findOccurrenceStart(body, r.text, r.occurrence);
    if (idx === -1) return;
    openDraft({ id: r.id, start: idx, end: idx + r.text.length, text: r.text, style: r.style });
  };

  const applyDraft = () => {
    if (!draft) return;
    const occurrence = occurrenceIndexAt(body, draft.start, draft.text);
    const range: StyledRange = {
      id: draft.id ?? crypto.randomUUID(),
      text: draft.text,
      occurrence,
      style: draft.style,
    };
    const rest = ranges.filter((r) => r.id !== range.id);
    onChangeStyles([...rest, range]);
    closePanel();
  };

  const removeDraft = () => {
    if (draft?.id) onChangeStyles(ranges.filter((r) => r.id !== draft.id));
    closePanel();
  };

  return (
    <div className="flex flex-col gap-2">
      <textarea
        ref={textareaRef}
        value={body}
        onChange={(e) => onChangeBody(e.target.value)}
        onSelect={startDraftFromSelection}
        placeholder="תוכן השקופית…"
        rows={5}
        className="resize-y rounded-lg border border-neutral-200 px-3 py-2 text-sm leading-relaxed outline-none focus:border-[#E1306C]"
      />
      <p className="text-[11px] text-neutral-400">סמנו טקסט כדי לעצב אותו (גודל, פונט, צבע).</p>

      {/* Grid-rows 0fr/1fr trick animates height smoothly without a fixed max-height;
          `draft` (the content) stays mounted until the collapse transition ends. */}
      <div
        className={`grid transition-[grid-template-rows] duration-200 ease-out ${
          panelOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
        onTransitionEnd={(e) => {
          if (e.propertyName === 'grid-template-rows' && !panelOpen) setDraft(null);
        }}
      >
        <div
          className={`overflow-hidden transition-opacity duration-200 ease-out ${
            panelOpen ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {draft && (
            <div className="flex flex-col gap-2 rounded-lg border border-[#E1306C]/40 bg-[#E1306C]/5 p-3">
              <p className="truncate text-xs font-semibold text-neutral-700">״{draft.text}״</p>

              <div className="flex flex-wrap items-center gap-2">
                <span className="w-14 text-xs text-neutral-500">צבע</span>
                <button
                  type="button"
                  onClick={() => setDraft({ ...draft, style: { ...draft.style, color: undefined } })}
                  className={`rounded-md border px-2 py-0.5 text-[11px] ${
                    draft.style.color === undefined ? 'border-neutral-800 font-semibold' : 'border-neutral-200 text-neutral-500'
                  }`}
                >
                  ברירת מחדל
                </button>
                {[...palette.colors, ...EXTRA_COLORS].map((c, i) => (
                  <button
                    key={i}
                    type="button"
                    title={c}
                    onClick={() => setDraft({ ...draft, style: { ...draft.style, color: c } })}
                    className={`h-5 w-5 rounded-full border transition ${
                      draft.style.color === c
                        ? 'scale-110 border-neutral-800 ring-2 ring-neutral-300'
                        : `${c === '#ffffff' ? 'border-black/30' : 'border-black/10'} hover:scale-110`
                    }`}
                    style={{ background: c }}
                  />
                ))}
              </div>

              <label className="flex items-center gap-2 text-xs text-neutral-500">
                <span className="w-14">פונט</span>
                <select
                  value={draft.style.fontId ?? ''}
                  onChange={(e) => setDraft({ ...draft, style: { ...draft.style, fontId: e.target.value || undefined } })}
                  className="rounded-lg border border-neutral-200 bg-neutral-50 px-2 py-1 text-xs font-medium text-neutral-700"
                >
                  <option value="">ברירת מחדל</option>
                  {FONTS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-2 text-xs text-neutral-500">
                <span className="w-14">גודל</span>
                <select
                  value={draft.style.sizePct ?? 100}
                  onChange={(e) => setDraft({ ...draft, style: { ...draft.style, sizePct: Number(e.target.value) } })}
                  className="rounded-lg border border-neutral-200 bg-neutral-50 px-2 py-1 text-xs font-medium text-neutral-700"
                >
                  {SIZES.map((s) => (
                    <option key={s} value={s}>
                      {s}%
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-2 text-xs text-neutral-500">
                <input
                  type="checkbox"
                  checked={draft.style.bold ?? false}
                  onChange={(e) => setDraft({ ...draft, style: { ...draft.style, bold: e.target.checked || undefined } })}
                />
                מודגש
              </label>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closePanel}
                  className="rounded-lg px-3 py-1 text-xs font-medium text-neutral-500 hover:bg-neutral-100"
                >
                  ביטול
                </button>
                {draft.id && (
                  <button
                    type="button"
                    onClick={removeDraft}
                    className="rounded-lg px-3 py-1 text-xs font-medium text-red-500 hover:bg-red-50"
                  >
                    הסרת עיצוב
                  </button>
                )}
                <button
                  type="button"
                  onClick={applyDraft}
                  className="rounded-lg bg-[#E1306C] px-3 py-1 text-xs font-medium text-white hover:opacity-90"
                >
                  החלה
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {ranges.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {ranges.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => editExisting(r)}
              title="לחיצה לעריכת העיצוב"
              className="max-w-[10rem] truncate rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-[11px] font-medium text-neutral-600 hover:border-[#E1306C] hover:text-[#E1306C]"
              style={{
                color: r.style.color,
                fontWeight: r.style.bold ? 700 : undefined,
              }}
            >
              {r.text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
