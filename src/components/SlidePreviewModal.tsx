import { useEffect, useState } from 'react';
import type { Carousel, Slide } from '../types';
import { SLIDE_W, slideHeight } from '../types';
import SlideView from './SlideView';

interface Props {
  slides: Slide[];
  carousel: Carousel;
  startIndex: number;
  onClose: () => void;
}

const MARGIN = 48;

function fitScale(ratio: Carousel['ratio']): number {
  return Math.min(
    (window.innerWidth - MARGIN * 2) / SLIDE_W,
    (window.innerHeight - MARGIN * 2) / slideHeight(ratio),
    1,
  );
}

/** Full-screen overlay for paging through every Slide one at a time, like the real Instagram carousel. */
export default function SlidePreviewModal({ slides, carousel, startIndex, onClose }: Props) {
  const [index, setIndex] = useState(startIndex);
  const [scale, setScale] = useState(() => fitScale(carousel.ratio));
  const total = slides.length;

  useEffect(() => {
    const onResize = () => setScale(fitScale(carousel.ratio));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(0, i - 1));
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(total - 1, i + 1));
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', onKey);
    };
  }, [carousel.ratio, onClose, total]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="סגירת התצוגה המקדימה"
        className="absolute end-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-xl text-white transition hover:bg-white/25"
      >
        ✕
      </button>

      {total > 1 && (
        <div
          dir="ltr"
          className="absolute top-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white"
        >
          {index + 1} / {total}
        </div>
      )}

      {index > 0 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIndex((i) => i - 1);
          }}
          aria-label="השקופית הקודמת"
          dir="ltr"
          className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition hover:bg-white/25"
        >
          ‹
        </button>
      )}
      {index < total - 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIndex((i) => i + 1);
          }}
          aria-label="השקופית הבאה"
          dir="ltr"
          className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition hover:bg-white/25"
        >
          ›
        </button>
      )}

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative overflow-hidden rounded-xl shadow-2xl"
        style={{ width: SLIDE_W * scale, height: slideHeight(carousel.ratio) * scale }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
          <SlideView
            slide={slides[index]}
            carousel={carousel}
            index={index}
            total={total}
            captureRef={() => {}}
            onOverflowChange={() => {}}
          />
        </div>
      </div>

      {total > 1 && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5" onClick={(e) => e.stopPropagation()}>
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`מעבר לשקופית ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? 'w-5 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
