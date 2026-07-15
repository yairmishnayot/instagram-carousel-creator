export type Align = 'right' | 'center';
export type SizeStep = 'S' | 'M' | 'L';

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
  showBadge: boolean;
  slides: Slide[];
}

export const MAX_SLIDES = 20;
export const SLIDE_W = 1080;
export const SLIDE_H = 1350;
