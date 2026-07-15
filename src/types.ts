export type Align = 'right' | 'center';
export type SizeStep = 'S' | 'M' | 'L';
export type BackgroundStyle = 'solid' | 'blurred';

/** Indices into a Palette's 5 colors, per Color Role. */
export interface Roles {
  bg: number;
  text: number;
  accent: number;
}

export interface SlideStyle {
  /** Palette override; undefined = inherit from Carousel. */
  paletteId?: string;
  /** Color Role override; undefined = palette defaults. */
  roles?: Roles;
  size: SizeStep;
  align: Align;
}

export interface Slide {
  id: string;
  heading: string;
  body: string;
  style: SlideStyle;
}

export interface Carousel {
  title: string;
  paletteId: string;
  /** Carousel-wide variation of the Palette's Color Roles; undefined = palette defaults. */
  roles?: Roles;
  /** 'solid' = flat bg color; 'blurred' = abstract blurred backdrop with the content in a card. */
  background: BackgroundStyle;
  /** Which Backdrop design to use in 'blurred' mode; undefined = the first one. */
  backdropId?: string;
  /** Optional logo (data URL) shown at the bottom of every slide. */
  logo?: string;
  showBadge: boolean;
  slides: Slide[];
}

export const MAX_SLIDES = 20;
export const SLIDE_W = 1080;
export const SLIDE_H = 1350;
