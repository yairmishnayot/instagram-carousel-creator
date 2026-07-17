import { useEffect, useState } from 'react';
import type { Carousel, Slide } from '../types';
import { SLIDE_W, slideHeight } from '../types';
import SlideView from './SlideView';

interface Props {
  slide: Slide;
  carousel: Carousel;
  index: number;
  total: number;
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

/** Full-screen overlay showing one Slide as large as the viewport allows. */
export default function SlidePreviewModal({ slide, carousel, index, total, onClose }: Props) {
  const [scale, setScale] = useState(() => fitScale(carousel.ratio));

  useEffect(() => {
    const onResize = () => setScale(fitScale(carousel.ratio));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', onKey);
    };
  }, [carousel.ratio, onClose]);

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
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative overflow-hidden rounded-xl shadow-2xl"
        style={{ width: SLIDE_W * scale, height: slideHeight(carousel.ratio) * scale }}
      >
        <div style={{ position: 'absolute', top: 0, left: 0, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
          <SlideView
            slide={slide}
            carousel={carousel}
            index={index}
            total={total}
            captureRef={() => {}}
            onOverflowChange={() => {}}
          />
        </div>
      </div>
    </div>
  );
}
