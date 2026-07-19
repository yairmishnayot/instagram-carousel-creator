import { useEffect, useRef, useState } from 'react';
import type { BackgroundStyle, Carousel, LogoStyle, Ratio, Slide, SlideStyle } from './types';
import { MAX_SLIDES, SLIDE_W, SLIDE_H } from './types';
import { loadDraft, saveDraft, emptyCarousel, newSlideId } from './storage';
import { getPalette, roleColor } from './palettes';
import { BACKDROPS, getBackdrop } from './backdrops';
import { FONTS } from './fonts';
import { getVariations, variationIndex } from './variations';
import { downloadAll, downloadAllImages, downloadSlide } from './export';
import PalettePicker from './components/PalettePicker';
import SlideCard from './components/SlideCard';
import SlidePreviewModal from './components/SlidePreviewModal';
import Segmented from './components/Segmented';

const BACKGROUNDS: { value: BackgroundStyle; label: string }[] = [
  { value: 'solid', label: 'צבע אחיד' },
  { value: 'blurred', label: 'רקע מטושטש' },
];

const LOGO_STYLES: { value: LogoStyle; label: string }[] = [
  { value: 'circle', label: 'עיגול' },
  { value: 'cutout', label: 'אייקון ללא רקע' },
];

const RATIOS: { value: Ratio; label: string }[] = [
  { value: '4:5', label: '4:5 לאורך' },
  { value: '1:1', label: '1:1 ריבוע' },
];

// Downscale the uploaded logo so the data URL stays small enough for the
// localStorage draft; PNG keeps transparency.
const LOGO_MAX_PX = 800;

/** Miniature of a Backdrop rendered at slide proportions. */
function BackdropThumb({ backdrop, carousel }: { backdrop: (typeof BACKDROPS)[number]; carousel: Carousel }) {
  const palette = getPalette(carousel.paletteId);
  const roles = carousel.roles ?? palette.defaultRoles;
  return (
    <span className="relative block h-20 w-16 overflow-hidden rounded-md border border-black/10">
      <span
        className="absolute"
        style={{
          top: 0,
          left: 0,
          width: SLIDE_W,
          height: SLIDE_H,
          transform: `scale(${64 / SLIDE_W})`,
          transformOrigin: 'top left',
          ...backdrop.style(palette, roles, 0),
        }}
      />
    </span>
  );
}

function fileToLogo(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, LOGO_MAX_PX / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('unreadable image'));
    };
    img.src = url;
  });
}

export default function App() {
  const [carousel, setCarousel] = useState<Carousel>(loadDraft);
  const [exporting, setExporting] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [palettesOpen, setPalettesOpen] = useState(true);
  const [backdropsOpen, setBackdropsOpen] = useState(true);
  const nodes = useRef(new Map<string, HTMLDivElement>());
  const logoInput = useRef<HTMLInputElement>(null);

  const onLogoFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const logo = await fileToLogo(file);
      setCarousel((c) => ({ ...c, logo }));
    } catch {
      window.alert('לא ניתן לקרוא את קובץ התמונה');
    }
  };

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

  // Copies one slide's design (palette, colors, size, align) onto every other slide.
  const applyStyleToAll = (id: string) =>
    setCarousel((c) => {
      const src = c.slides.find((s) => s.id === id);
      if (!src) return c;
      return {
        ...c,
        slides: c.slides.map((s) =>
          s.id === id
            ? s
            : { ...s, style: { ...src.style, roles: src.style.roles ? { ...src.style.roles } : undefined } },
        ),
      };
    });

  const duplicateSlide = (id: string) =>
    setCarousel((c) => {
      if (c.slides.length >= MAX_SLIDES) return c;
      const i = c.slides.findIndex((s) => s.id === id);
      if (i < 0) return c;
      const src = c.slides[i];
      const copy: Slide = {
        ...src,
        id: newSlideId(),
        style: { ...src.style, roles: src.style.roles ? { ...src.style.roles } : undefined },
      };
      const slides = [...c.slides];
      slides.splice(i + 1, 0, copy);
      return { ...c, slides };
    });

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

  const slideEls = () =>
    carousel.slides
      .map((s) => nodes.current.get(s.id))
      .filter((el): el is HTMLDivElement => !!el);

  const handleDownloadAll = async () => {
    setExporting(true);
    try {
      await downloadAll(slideEls(), carousel.title);
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadImages = async () => {
    setExporting(true);
    try {
      await downloadAllImages(slideEls(), carousel.title);
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
              onClick={handleDownloadImages}
              className="rounded-lg border border-[#E1306C] px-4 py-2 text-sm font-semibold text-[#E1306C] transition hover:bg-[#E1306C]/5 disabled:opacity-50"
            >
              {exporting ? 'מכין קבצים…' : 'הורדת תמונות'}
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

      <main className="mx-auto flex max-w-7xl flex-col items-start gap-5 px-4 py-6 lg:flex-row">
        <aside className="flex w-full flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:w-80 lg:shrink-0 lg:overflow-y-auto">
          <input
            value={carousel.title}
            onChange={(e) => setCarousel((c) => ({ ...c, title: e.target.value }))}
            placeholder="כותרת הקרוסלה (שם הקבצים בהורדה)"
            className="border-b-2 border-neutral-200 pb-2 text-xl font-bold outline-none placeholder:font-normal placeholder:text-neutral-400 focus:border-[#E1306C]"
          />
          <div>
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-xs font-medium text-neutral-500">פלטת צבעים</p>
                <button
                  type="button"
                  onClick={() => setPalettesOpen((o) => !o)}
                  aria-expanded={palettesOpen}
                  className="rounded-md px-2 py-1 text-[11px] font-medium text-neutral-500 transition hover:bg-neutral-100 hover:text-[#E1306C]"
                >
                  {palettesOpen ? 'מזעור ▲' : 'הרחבה ▼'}
                </button>
              </div>
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
                          style={{ background: roleColor(palette, roles[role]) }}
                        />
                      ))}
                    </span>
                    וריאציה {i + 1}/{variations.length}
                    <span aria-hidden>⟳</span>
                  </button>
                );
              })()}
            </div>
            {palettesOpen ? (
              <PalettePicker value={carousel.paletteId} onChange={changePalette} />
            ) : (
              // Collapsed: compact view of the selected palette; click expands the full list.
              <button
                type="button"
                onClick={() => setPalettesOpen(true)}
                title="הרחבת רשימת הפלטות"
                className="flex w-full items-center gap-2 rounded-xl border border-neutral-200 p-1.5 text-right transition hover:border-[#E1306C]"
              >
                <span className="flex h-6 w-24 shrink-0 overflow-hidden rounded-md" aria-hidden>
                  {getPalette(carousel.paletteId).colors.map((c) => (
                    <span key={c} className="h-full flex-1" style={{ background: c }} />
                  ))}
                </span>
                <span className="text-xs font-medium text-neutral-700">{getPalette(carousel.paletteId).name}</span>
              </button>
            )}
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-neutral-500">פונט</p>
            <div className="flex flex-wrap gap-2">
              {FONTS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setCarousel((c) => ({ ...c, fontId: f.id }))}
                  className={`flex flex-col items-center rounded-lg border px-3 py-1.5 transition ${
                    f.id === (carousel.fontId ?? FONTS[0].id)
                      ? 'border-[#E1306C] bg-[#E1306C]/5 ring-1 ring-[#E1306C]'
                      : 'border-neutral-200 hover:border-neutral-400'
                  }`}
                >
                  <span style={{ fontFamily: f.family, fontWeight: f.headingWeight }} className="text-lg leading-6">
                    אבגד
                  </span>
                  <span className="text-[10px] text-neutral-500">{f.name}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="flex w-fit items-center gap-2 text-xs text-neutral-500">
              יחס תמונה
              <Segmented
                options={RATIOS}
                value={carousel.ratio ?? '4:5'}
                onChange={(ratio) => setCarousel((c) => ({ ...c, ratio }))}
              />
            </label>
            <p className="text-[11px] text-neutral-400">
              4:5 גדול יותר בפיד — אבל באינסטגרם חובה לבחור יחס 4:5 בשלב החיתוך, אחרת התמונה תיחתך לריבוע.
            </p>
          </div>
          <label className="flex items-center gap-2 text-xs text-neutral-500">
            סגנון רקע
            <Segmented
              options={BACKGROUNDS}
              value={carousel.background}
              onChange={(background) => setCarousel((c) => ({ ...c, background }))}
            />
          </label>
          {carousel.background === 'blurred' && (
            <label className="flex w-fit items-center gap-3 text-xs text-neutral-500">
              גודל הכרטיס הפנימי
              {/* The stored value is the margin around the card, so the slider is inverted: right = bigger card. */}
              <input
                type="range"
                min={40}
                max={212}
                step={4}
                value={260 - (carousel.cardInset ?? 84)}
                onChange={(e) => setCarousel((c) => ({ ...c, cardInset: 260 - Number(e.target.value) }))}
                className="w-56 accent-[#E1306C]"
              />
            </label>
          )}
          {carousel.background === 'blurred' && (
            <div>
              <div className="mb-2 flex items-center gap-2">
                <p className="text-xs font-medium text-neutral-500">סוג הרקע</p>
                <button
                  type="button"
                  onClick={() => setBackdropsOpen((o) => !o)}
                  aria-expanded={backdropsOpen}
                  className="rounded-md px-2 py-1 text-[11px] font-medium text-neutral-500 transition hover:bg-neutral-100 hover:text-[#E1306C]"
                >
                  {backdropsOpen ? 'מזעור ▲' : 'הרחבה ▼'}
                </button>
              </div>
              {backdropsOpen ? (
                <div className="flex flex-wrap gap-2">
                  {(() => {
                    const selectedId = carousel.backdropId ?? BACKDROPS[0].id;
                    return BACKDROPS.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setCarousel((c) => ({ ...c, backdropId: b.id }))}
                        className={`flex flex-col items-center gap-1 rounded-lg p-1.5 transition ${
                          b.id === selectedId ? 'bg-neutral-100 ring-2 ring-[#E1306C]' : 'hover:bg-neutral-50'
                        }`}
                      >
                        <BackdropThumb backdrop={b} carousel={carousel} />
                        <span className="text-[11px] font-medium text-neutral-600">{b.name}</span>
                      </button>
                    ));
                  })()}
                </div>
              ) : (
                // Collapsed: compact view of the selected backdrop; click expands the full list.
                <button
                  type="button"
                  onClick={() => setBackdropsOpen(true)}
                  title="הרחבת רשימת סוגי הרקע"
                  className="flex w-full items-center gap-2 rounded-xl border border-neutral-200 p-1.5 text-right transition hover:border-[#E1306C]"
                >
                  <BackdropThumb backdrop={getBackdrop(carousel.backdropId)} carousel={carousel} />
                  <span className="text-xs font-medium text-neutral-700">{getBackdrop(carousel.backdropId).name}</span>
                </button>
              )}
            </div>
          )}
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-neutral-500">לוגו (אופציונלי)</span>
            <input
              ref={logoInput}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                onLogoFile(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
            {carousel.logo ? (
              <>
                <img
                  src={carousel.logo}
                  alt="לוגו"
                  className="h-10 max-w-32 rounded-md border border-neutral-200 bg-white object-contain p-1"
                />
                <button
                  type="button"
                  onClick={() => logoInput.current?.click()}
                  className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  החלפה
                </button>
                <button
                  type="button"
                  onClick={() => setCarousel((c) => ({ ...c, logo: undefined }))}
                  className="rounded-lg px-2 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50"
                >
                  הסרה
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => logoInput.current?.click()}
                className="rounded-lg border border-dashed border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-500 transition hover:border-[#E1306C] hover:text-[#E1306C]"
              >
                + העלאת לוגו
              </button>
            )}
          </div>
          {carousel.logo && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-neutral-500">מיקום הלוגו</span>
              <Segmented
                options={LOGO_STYLES}
                value={carousel.logoStyle ?? 'circle'}
                onChange={(logoStyle) => setCarousel((c) => ({ ...c, logoStyle }))}
              />
            </div>
          )}
          <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={carousel.showBadge}
              onChange={(e) => setCarousel((c) => ({ ...c, showBadge: e.target.checked }))}
              className="h-4 w-4 accent-[#E1306C]"
            />
            הצגת מספור שקופיות על התמונות
          </label>
        </aside>

        <div className="flex w-full min-w-0 flex-1 flex-col gap-5">
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
            onDuplicate={() => duplicateSlide(slide.id)}
            onApplyStyleToAll={() => applyStyleToAll(slide.id)}
            onDelete={() => deleteSlide(slide.id)}
            onDownload={() => handleDownloadOne(slide, i)}
            onPreview={() => setPreviewId(slide.id)}
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
        </div>
      </main>

      {(() => {
        const i = carousel.slides.findIndex((s) => s.id === previewId);
        if (i < 0) return null;
        return (
          <SlidePreviewModal
            slide={carousel.slides[i]}
            carousel={carousel}
            index={i}
            total={carousel.slides.length}
            onClose={() => setPreviewId(null)}
          />
        );
      })()}
    </div>
  );
}
