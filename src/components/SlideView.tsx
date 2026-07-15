import { useLayoutEffect, useRef } from 'react';
import type { Carousel, Slide, SizeStep } from '../types';
import { SLIDE_W, SLIDE_H } from '../types';
import { getPalette, type Palette } from '../palettes';
import { getBackdrop } from '../backdrops';
import type { Roles } from '../types';

const SIZE_MULT: Record<SizeStep, number> = { S: 0.85, M: 1, L: 1.18 };
const MIN_SHRINK = 0.55;

export function effectiveDesign(slide: Slide, carousel: Carousel): { palette: Palette; roles: Roles } {
  const palette = getPalette(slide.style.paletteId ?? carousel.paletteId);
  // The carousel-level variation only applies to slides on the carousel's
  // palette; a slide with its own palette falls back to that palette's defaults.
  const inherited = slide.style.paletteId ? palette.defaultRoles : (carousel.roles ?? palette.defaultRoles);
  return { palette, roles: slide.style.roles ?? inherited };
}

interface Props {
  slide: Slide;
  carousel: Carousel;
  index: number;
  total: number;
  captureRef: (el: HTMLDivElement | null) => void;
  onOverflowChange: (overflow: boolean) => void;
}

/** Renders one Slide at full export size (1080x1350). Scale it down with a transform for preview. */
export default function SlideView({ slide, carousel, index, total, captureRef, onOverflowChange }: Props) {
  const contentRef = useRef<HTMLDivElement>(null);
  const { palette, roles } = effectiveDesign(slide, carousel);
  const [bg, text, accent] = [palette.colors[roles.bg], palette.colors[roles.text], palette.colors[roles.accent]];
  const mult = SIZE_MULT[slide.style.size];
  const blurred = carousel.background === 'blurred';

  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    let shrink = 1;
    el.style.setProperty('--shrink', '1');
    while (el.scrollHeight > el.clientHeight + 1 && shrink > MIN_SHRINK) {
      shrink = Math.max(MIN_SHRINK, shrink - 0.05);
      el.style.setProperty('--shrink', String(shrink));
    }
    onOverflowChange(el.scrollHeight > el.clientHeight + 1);
  });

  return (
    <div
      ref={captureRef}
      dir="rtl"
      style={{
        width: SLIDE_W,
        height: SLIDE_H,
        background: bg,
        ...(blurred ? getBackdrop(carousel.backdropId).style(palette, roles, index) : undefined),
        fontFamily: "'Heebo', sans-serif",
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {blurred && (
        <div
          style={{
            position: 'absolute',
            inset: '84px',
            background: bg,
            borderRadius: 56,
            boxShadow: '0 24px 64px rgba(0, 0, 0, 0.28)',
          }}
        />
      )}
      <div
        ref={contentRef}
        style={{
          position: 'absolute',
          inset: blurred ? '164px' : '96px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 44,
          textAlign: slide.style.align,
          overflow: 'hidden',
        }}
      >
        {slide.heading && (
          <h2
            style={{
              color: accent,
              fontWeight: 800,
              fontSize: `calc(${84 * mult}px * var(--shrink, 1))`,
              lineHeight: 1.25,
              margin: 0,
              whiteSpace: 'pre-wrap',
              overflowWrap: 'break-word',
            }}
          >
            {slide.heading}
          </h2>
        )}
        {slide.body && (
          <p
            style={{
              color: text,
              fontWeight: 400,
              fontSize: `calc(${54 * mult}px * var(--shrink, 1))`,
              lineHeight: 1.5,
              margin: 0,
              whiteSpace: 'pre-wrap',
              overflowWrap: 'break-word',
            }}
          >
            {slide.body}
          </p>
        )}
      </div>
      {carousel.showBadge && (
        <div
          dir="ltr"
          style={{
            position: 'absolute',
            bottom: 44,
            left: 48,
            background: accent,
            color: bg,
            borderRadius: 999,
            padding: '10px 30px',
            fontSize: 34,
            fontWeight: 700,
          }}
        >
          {index + 1}/{total}
        </div>
      )}
    </div>
  );
}
