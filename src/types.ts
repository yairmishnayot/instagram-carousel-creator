export type Align = 'right' | 'center';
export type SizeStep = 'S' | 'M' | 'L';
export type BackgroundStyle = 'solid' | 'blurred';
export type Ratio = '4:5' | '1:1';
/**
 * 'circle' = small circle at the bottom middle; 'cutout' = the image's
 * background removed, leaving only the icon at the bottom middle.
 */
export type LogoStyle = 'circle' | 'cutout';

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

/** Per-word/phrase visual override applied on top of the slide's normal body style. */
export interface TextSpanStyle {
  /** Color override; undefined = inherit the slide's text color. */
  color?: string;
  /** Font override (a Font id from fonts.ts); undefined = inherit the carousel font. */
  fontId?: string;
  /** Size as % of the normal body size; undefined = 100. */
  sizePct?: number;
  bold?: boolean;
}

/**
 * A styled run of text within a Slide's body. Matched by content rather than by
 * character offset — `occurrence` picks the Nth (0-based) time `text` appears in the
 * body — so the style survives edits elsewhere in the body without drifting.
 */
export interface StyledRange {
  id: string;
  text: string;
  occurrence: number;
  style: TextSpanStyle;
}

export interface Slide {
  id: string;
  heading: string;
  body: string;
  /** Styled words/phrases within `body`; undefined/empty = no overrides. */
  bodyStyles?: StyledRange[];
  style: SlideStyle;
}

/**
 * A fully-resolved design (no inherited/undefined fields), as saved to Favorites: the slide's
 * own style plus every carousel-wide visual setting (background, backdrop, font, logo, ratio, badge).
 * Carousel-wide fields aren't per-slide, so applying a favorite to one slide also applies them
 * to the whole carousel.
 */
export interface DesignSnapshot {
  paletteId: string;
  roles: Roles;
  size: SizeStep;
  align: Align;
  background: BackgroundStyle;
  backdropId: string;
  cardInset: number;
  fontId: string;
  logo?: string;
  logoStyle: LogoStyle;
  ratio: Ratio;
  showBadge: boolean;
}

export interface FavoriteDesign extends DesignSnapshot {
  id: string;
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
  /** How the logo is placed on the slide; undefined = 'circle'. */
  logoStyle?: LogoStyle;
  /** Margin (px) between the slide edge and the content card in 'blurred' mode; undefined = 84. */
  cardInset?: number;
  /** Export aspect ratio; undefined = '4:5' (1080x1350). '1:1' posts to Instagram without cropping. */
  ratio?: Ratio;
  /** Font used on the slides; undefined = the first Font (Heebo). */
  fontId?: string;
  showBadge: boolean;
  slides: Slide[];
}

export const MAX_SLIDES = 20;
export const SLIDE_W = 1080;
export const SLIDE_H = 1350;

export function slideHeight(ratio: Ratio | undefined): number {
  return ratio === '1:1' ? SLIDE_W : SLIDE_H;
}
