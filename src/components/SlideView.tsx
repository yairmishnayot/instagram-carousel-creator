import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { Carousel, LogoStyle, Slide, SizeStep } from '../types';
import { SLIDE_W, slideHeight } from '../types';
import { makeCutout } from '../cutout';
import { getPalette, roleColor, type Palette } from '../palettes';
import { getBackdrop } from '../backdrops';
import { getFont } from '../fonts';
import type { Roles } from '../types';
import { segmentText } from '../richText';

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
  const [bg, text, accent] = [roleColor(palette, roles.bg), roleColor(palette, roles.text), roleColor(palette, roles.accent)];
  const mult = SIZE_MULT[slide.style.size];
  const blurred = carousel.background === 'blurred';
  const cardInset = carousel.cardInset ?? 84;
  const font = getFont(carousel.fontId);
  // Drafts saved before a style was removed may hold an unknown value; treat it as 'circle'.
  const logoStyle: LogoStyle = carousel.logoStyle === 'cutout' ? 'cutout' : 'circle';

  const [cutout, setCutout] = useState<string>();
  useEffect(() => {
    if (!carousel.logo || logoStyle !== 'cutout') return;
    let alive = true;
    makeCutout(carousel.logo).then((c) => {
      if (alive) setCutout(c);
    });
    return () => {
      alive = false;
    };
  }, [carousel.logo, logoStyle]);

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
        height: slideHeight(carousel.ratio),
        background: bg,
        ...(blurred ? getBackdrop(carousel.backdropId).style(palette, roles, index) : undefined),
        fontFamily: font.family,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {blurred && (
        <div
          style={{
            position: 'absolute',
            inset: cardInset,
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
          inset: blurred ? cardInset + 80 : 96,
          // Reserve room at the bottom so text never overlaps the logo.
          bottom: carousel.logo
            ? logoStyle === 'cutout'
              ? (blurred ? cardInset : 0) + 260
              : blurred
                ? cardInset + 150
                : 240
            : undefined,
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
              fontWeight: font.headingWeight,
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
            {segmentText(slide.body, slide.bodyStyles).map((seg, i) =>
              seg.style ? (
                <span
                  key={i}
                  style={{
                    color: seg.style.color ?? text,
                    fontFamily: seg.style.fontId ? getFont(seg.style.fontId).family : undefined,
                    fontWeight: seg.style.bold ? 700 : undefined,
                    fontSize: seg.style.sizePct
                      ? `calc(${(54 * mult * seg.style.sizePct) / 100}px * var(--shrink, 1))`
                      : undefined,
                  }}
                >
                  {seg.text}
                </span>
              ) : (
                <span key={i}>{seg.text}</span>
              ),
            )}
          </p>
        )}
      </div>
      {carousel.logo && logoStyle === 'cutout' && cutout && (
        <img
          src={cutout}
          alt=""
          style={{
            position: 'absolute',
            // Inside the content rectangle, centered at its bottom.
            bottom: blurred ? cardInset + 36 : 48,
            left: '50%',
            transform: 'translateX(-50%)',
            maxWidth: 420,
            maxHeight: 180,
            objectFit: 'contain',
            filter: 'drop-shadow(0 10px 28px rgba(0, 0, 0, 0.25))',
          }}
        />
      )}
      {carousel.logo && logoStyle === 'circle' && (
        <img
          src={carousel.logo}
          alt=""
          style={{
            position: 'absolute',
            // In blurred mode the circle straddles the card's bottom edge.
            bottom: blurred ? cardInset - 40 : 48,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 160,
            height: 160,
            borderRadius: '50%',
            background: '#ffffff',
            padding: 18,
            boxSizing: 'border-box',
            objectFit: 'contain',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.22)',
          }}
        />
      )}
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
