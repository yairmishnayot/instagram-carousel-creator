import { useEffect, useRef, useState } from 'react';
import type { Carousel, Slide, SlideStyle } from './types';
import { MAX_SLIDES } from './types';
import { loadDraft, saveDraft, emptyCarousel, newSlideId } from './storage';
import { getPalette } from './palettes';
import { getVariations, variationIndex } from './variations';
import { downloadAll, downloadSlide } from './export';
import PalettePicker from './components/PalettePicker';
import SlideCard from './components/SlideCard';

export default function App() {
  const [carousel, setCarousel] = useState<Carousel>(loadDraft);
  const [exporting, setExporting] = useState(false);
  const nodes = useRef(new Map<string, HTMLDivElement>());

  useEffect(() => {
    const t = setTimeout(() => saveDraft(carousel), 300);
    return () => clearTimeout(t);
  }, [carousel]);

  const registerNode = (id: string, el: HTMLDivElement | null) => {
    if (el) nodes.current.set(id, el);
    else nodes.current.delete(id);
  };

  const updateSlide = (id: string, patch: Partial<Slide>) =>
    setCarousel((c) => ({
      ...c,
      slides: c.slides.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));

  const updateStyle = (id: string, patch: Partial<SlideStyle>) =>
    setCarousel((c) => ({
      ...c,
      slides: c.slides.map((s) => (s.id === id ? { ...s, style: { ...s.style, ...patch } } : s)),
    }));

  // Picking a new carousel palette restarts the design: the variation and all
  // per-slide palette and color-role overrides are cleared so every slide
  // follows the new palette.
  const changePalette = (paletteId: string) =>
    setCarousel((c) => ({
      ...c,
      paletteId,
      roles: undefined,
      slides: c.slides.map((s) => ({
        ...s,
        style: { ...s.style, paletteId: undefined, roles: undefined },
      })),
    }));

  // Cycling a variation is a carousel-wide design change too: per-slide
  // color-role overrides reset so the new combination shows everywhere.
  const cycleVariation = () =>
    setCarousel((c) => {
      const palette = getPalette(c.paletteId);
      const variations = getVariations(palette);
      const i = variationIndex(variations, c.roles ?? palette.defaultRoles);
      return {
        ...c,
        roles: variations[(i + 1) % variations.length],
        slides: c.slides.map((s) => ({ ...s, style: { ...s.style, roles: undefined } })),
      };
    });

  const addSlide = () =>
    setCarousel((c) =>
      c.slides.length >= MAX_SLIDES
        ? c
        : {
            ...c,
            slides: [...c.slides, { id: newSlideId(), heading: '', body: '', style: { size: 'M', align: 'right' } }],
          },
    );

  const deleteSlide = (id: string) =>
    setCarousel((c) => (c.slides.length === 1 ? c : { ...c, slides: c.slides.filter((s) => s.id !== id) }));

  const moveSlide = (id: string, dir: -1 | 1) =>
    setCarousel((c) => {
      const i = c.slides.findIndex((s) => s.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= c.slides.length) return c;
      const slides = [...c.slides];
      [slides[i], slides[j]] = [slides[j], slides[i]];
      return { ...c, slides };
    });

  const handleDownloadAll = async () => {
    setExporting(true);
    try {
      const els = carousel.slides
        .map((s) => nodes.current.get(s.id))
        .filter((el): el is HTMLDivElement => !!el);
      await downloadAll(els, carousel.title);
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadOne = async (slide: Slide, index: number) => {
    const el = nodes.current.get(slide.id);
    if (!el) return;
    setExporting(true);
    try {
      await downloadSlide(el, carousel.title, index);
    } finally {
      setExporting(false);
    }
  };

  const resetAll = () => {
    if (window.confirm('למחוק את כל הקרוסלה ולהתחיל מחדש?')) setCarousel(emptyCarousel());
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold">
            יוצר קרוסלות <span className="text-[#E1306C]">לאינסטגרם</span>
          </h1>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={resetAll}
              className="rounded-lg px-3 py-2 text-xs font-medium text-neutral-500 hover:bg-neutral-100"
            >
              נקה הכל
            </button>
            <button
              type="button"
              disabled={exporting}
              onClick={handleDownloadAll}
              className="rounded-lg bg-[#E1306C] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#c62a5f] disabled:opacity-50"
            >
              {exporting ? 'מכין קבצים…' : 'הורדת הכל (ZIP)'}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-4xl flex-col gap-5 px-4 py-6">
        <section className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm">
          <input
            value={carousel.title}
            onChange={(e) => setCarousel((c) => ({ ...c, title: e.target.value }))}
            placeholder="כותרת הקרוסלה (שם הקבצים בהורדה)"
            className="border-b-2 border-neutral-200 pb-2 text-xl font-bold outline-none placeholder:font-normal placeholder:text-neutral-400 focus:border-[#E1306C]"
          />
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-medium text-neutral-500">פלטת צבעים</p>
              {(() => {
                const palette = getPalette(carousel.paletteId);
                const variations = getVariations(palette);
                const roles = carousel.roles ?? palette.defaultRoles;
                const i = variationIndex(variations, roles);
                return (
                  <button
                    type="button"
                    onClick={cycleVariation}
                    title="החלפת שילוב הצבעים בין רקע, טקסט והדגשה"
                    className="flex items-center gap-2 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:border-[#E1306C] hover:text-[#E1306C]"
                  >
                    <span className="flex" aria-hidden>
                      {(['bg', 'text', 'accent'] as const).map((role) => (
                        <span
                          key={role}
                          className="-me-1.5 h-4 w-4 rounded-full border border-white last:me-0"
                          style={{ background: palette.colors[roles[role]] }}
                        />
                      ))}
                    </span>
                    וריאציה {i + 1}/{variations.length}
                    <span aria-hidden>⟳</span>
                  </button>
                );
              })()}
            </div>
            <PalettePicker value={carousel.paletteId} onChange={changePalette} />
          </div>
          <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={carousel.showBadge}
              onChange={(e) => setCarousel((c) => ({ ...c, showBadge: e.target.checked }))}
              className="h-4 w-4 accent-[#E1306C]"
            />
            הצגת מספור שקופיות על התמונות
          </label>
        </section>

        {carousel.slides.map((slide, i) => (
          <SlideCard
            key={slide.id}
            slide={slide}
            carousel={carousel}
            index={i}
            total={carousel.slides.length}
            exporting={exporting}
            registerNode={registerNode}
            onChange={(patch) => updateSlide(slide.id, patch)}
            onStyle={(patch) => updateStyle(slide.id, patch)}
            onMove={(dir) => moveSlide(slide.id, dir)}
            onDelete={() => deleteSlide(slide.id)}
            onDownload={() => handleDownloadOne(slide, i)}
          />
        ))}

        <button
          type="button"
          onClick={addSlide}
          disabled={carousel.slides.length >= MAX_SLIDES}
          className="rounded-2xl border-2 border-dashed border-neutral-300 py-4 text-sm font-medium text-neutral-500 transition hover:border-[#E1306C] hover:text-[#E1306C] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {carousel.slides.length >= MAX_SLIDES
            ? `הגעתם למקסימום — אינסטגרם מאפשרת עד ${MAX_SLIDES} תמונות בקרוסלה`
            : '+ הוספת שקופית'}
        </button>
      </main>
    </div>
  );
}
