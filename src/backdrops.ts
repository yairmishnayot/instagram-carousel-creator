import type { CSSProperties } from 'react';
import type { Roles } from './types';
import type { Palette } from './palettes';

/**
 * A Backdrop turns the palette into an abstract full-slide background for the
 * 'blurred' background style. Implementations use only CSS gradients (no
 * filter/blur) so html-to-image exports them exactly as rendered on screen.
 * `seed` (the slide index) rotates the colors so slides don't look identical.
 */
export interface Backdrop {
  id: string;
  name: string;
  style: (palette: Palette, roles: Roles, seed: number) => CSSProperties;
}

/** The palette's colors minus the bg role (the card color), rotated by seed. */
function others(palette: Palette, roles: Roles, seed: number): (n: number) => string {
  const rest = palette.colors.filter((_, i) => i !== roles.bg);
  return (n) => rest[(seed + n) % rest.length];
}

export const BACKDROPS: Backdrop[] = [
  {
    id: 'blobs',
    name: 'כתמים רכים',
    style: (palette, roles, seed) => {
      const c = others(palette, roles, seed);
      return {
        backgroundImage: [
          `radial-gradient(circle at 30% 10%, #ffffff4d 0%, #ffffff33 4%, #ffffff00 7%)`,
          `radial-gradient(circle at 70% 26%, #ffffff40 0%, #ffffff26 3%, #ffffff00 5%)`,
          `radial-gradient(circle at 10% 52%, #ffffff40 0%, #ffffff26 4%, #ffffff00 7%)`,
          `radial-gradient(circle at 92% 58%, #ffffff4d 0%, #ffffff33 3%, #ffffff00 6%)`,
          `radial-gradient(circle at 42% 94%, #ffffff40 0%, #ffffff26 4%, #ffffff00 6%)`,
          `radial-gradient(circle at 18% 20%, ${c(0)}f2 0%, ${c(0)}00 55%)`,
          `radial-gradient(circle at 84% 12%, ${c(1)}e6 0%, ${c(1)}00 50%)`,
          `radial-gradient(circle at 86% 84%, ${c(2)}f2 0%, ${c(2)}00 55%)`,
          `radial-gradient(circle at 14% 86%, ${c(3)}e6 0%, ${c(3)}00 50%)`,
          `radial-gradient(circle at 50% 50%, ${c(0)}80 0%, ${c(0)}00 75%)`,
        ].join(', '),
        backgroundColor: c(1),
      };
    },
  },
  {
    id: 'mesh',
    name: 'ערפל צבע',
    style: (palette, roles, seed) => {
      const c = others(palette, roles, seed);
      return {
        backgroundImage: [
          `radial-gradient(circle at 0% 0%, ${c(0)} 0%, ${c(0)}00 65%)`,
          `radial-gradient(circle at 100% 0%, ${c(1)} 0%, ${c(1)}00 65%)`,
          `radial-gradient(circle at 100% 100%, ${c(2)} 0%, ${c(2)}00 65%)`,
          `radial-gradient(circle at 0% 100%, ${c(3)} 0%, ${c(3)}00 65%)`,
        ].join(', '),
        backgroundColor: c(1),
      };
    },
  },
  {
    id: 'diagonal',
    name: 'אלכסון',
    style: (palette, roles, seed) => {
      const c = others(palette, roles, seed);
      return { backgroundImage: `linear-gradient(135deg, ${c(0)} 0%, ${c(1)} 50%, ${c(2)} 100%)` };
    },
  },
  {
    id: 'swirl',
    name: 'מערבולת',
    style: (palette, roles, seed) => {
      const c = others(palette, roles, seed);
      return {
        backgroundImage: `conic-gradient(from 220deg at 50% 42%, ${c(0)}, ${c(1)}, ${c(2)}, ${c(3)}, ${c(0)})`,
      };
    },
  },
  {
    id: 'aurora',
    name: 'זוהר צפוני',
    style: (palette, roles, seed) => {
      const c = others(palette, roles, seed);
      return {
        backgroundImage: [
          `linear-gradient(160deg, ${c(0)}e6 0%, ${c(0)}00 60%)`,
          `linear-gradient(20deg, ${c(1)}cc 10%, ${c(1)}00 70%)`,
          `linear-gradient(300deg, ${c(2)}b3 0%, ${c(2)}00 55%)`,
        ].join(', '),
        backgroundColor: c(3),
      };
    },
  },
  {
    id: 'bubbles',
    name: 'בועות',
    style: (palette, roles, seed) => {
      const c = others(palette, roles, seed);
      return {
        backgroundImage: [
          `radial-gradient(circle at 22% 16%, ${c(2)}59 0% 9%, ${c(2)}00 9.5%)`,
          `radial-gradient(circle at 80% 10%, #ffffff40 0% 5%, #ffffff00 5.5%)`,
          `radial-gradient(circle at 90% 42%, ${c(3)}4d 0% 12%, ${c(3)}00 12.5%)`,
          `radial-gradient(circle at 8% 70%, #ffffff33 0% 7%, #ffffff00 7.5%)`,
          `radial-gradient(circle at 30% 92%, ${c(2)}4d 0% 10%, ${c(2)}00 10.5%)`,
          `radial-gradient(circle at 78% 86%, #ffffff40 0% 6%, #ffffff00 6.5%)`,
          `linear-gradient(160deg, ${c(0)} 0%, ${c(1)} 100%)`,
        ].join(', '),
      };
    },
  },
  {
    id: 'stripes',
    name: 'פסים',
    style: (palette, roles, seed) => {
      const c = others(palette, roles, seed);
      return {
        backgroundImage: [
          `repeating-linear-gradient(45deg, #ffffff21 0px 70px, #ffffff00 70px 140px)`,
          `linear-gradient(135deg, ${c(0)} 0%, ${c(1)} 100%)`,
        ].join(', '),
      };
    },
  },
  {
    id: 'dots',
    name: 'נקודות',
    style: (palette, roles, seed) => {
      const c = others(palette, roles, seed);
      return {
        backgroundImage: [
          `radial-gradient(circle, ${c(2)}66 0% 22%, ${c(2)}00 24%)`,
          `linear-gradient(150deg, ${c(0)} 0%, ${c(1)} 100%)`,
        ].join(', '),
        backgroundSize: '150px 150px, 100% 100%',
      };
    },
  },
  {
    id: 'hills',
    name: 'גבעות',
    style: (palette, roles, seed) => {
      const c = others(palette, roles, seed);
      return {
        backgroundImage: [
          `radial-gradient(120% 55% at 18% 108%, ${c(2)} 0% 58%, ${c(2)}00 59%)`,
          `radial-gradient(140% 65% at 85% 112%, ${c(3)}d9 0% 62%, ${c(3)}00 63%)`,
          `linear-gradient(180deg, ${c(0)} 0%, ${c(1)} 100%)`,
        ].join(', '),
      };
    },
  },
  {
    id: 'rings',
    name: 'טבעות',
    style: (palette, roles, seed) => {
      const c = others(palette, roles, seed);
      return {
        backgroundImage: [
          `repeating-radial-gradient(circle at 78% 22%, #ffffff1f 0px 55px, #ffffff00 55px 110px)`,
          `linear-gradient(140deg, ${c(0)} 0%, ${c(1)} 60%, ${c(2)} 100%)`,
        ].join(', '),
      };
    },
  },
  {
    id: 'rays',
    name: 'קרניים',
    style: (palette, roles, seed) => {
      const c = others(palette, roles, seed);
      return {
        backgroundImage: [
          `radial-gradient(circle at 50% 30%, #ffffff40 0%, #ffffff00 45%)`,
          `repeating-conic-gradient(from 8deg at 50% 30%, ${c(0)} 0deg 15deg, ${c(1)} 15deg 30deg)`,
        ].join(', '),
      };
    },
  },
  {
    id: 'waves',
    name: 'גלים',
    style: (palette, roles, seed) => {
      const c = others(palette, roles, seed);
      return {
        backgroundImage: `repeating-radial-gradient(140% 140% at 50% 130%, ${c(0)} 0 110px, ${c(1)} 110px 220px, ${c(2)} 220px 330px, ${c(3)} 330px 440px)`,
      };
    },
  },
  {
    id: 'horizon',
    name: 'אופק',
    style: (palette, roles, seed) => {
      const c = others(palette, roles, seed);
      return {
        backgroundImage: [
          `linear-gradient(120deg, #ffffff1a 0%, #ffffff00 60%)`,
          `linear-gradient(180deg, ${c(0)} 0 25%, ${c(1)} 25% 50%, ${c(2)} 50% 75%, ${c(3)} 75% 100%)`,
        ].join(', '),
      };
    },
  },
  {
    id: 'columns',
    name: 'עמודות',
    style: (palette, roles, seed) => {
      const c = others(palette, roles, seed);
      return {
        backgroundImage: [
          `linear-gradient(200deg, #ffffff1a 0%, #ffffff00 55%)`,
          `linear-gradient(90deg, ${c(0)} 0 25%, ${c(1)} 25% 50%, ${c(2)} 50% 75%, ${c(3)} 75% 100%)`,
        ].join(', '),
      };
    },
  },
  {
    id: 'checker',
    name: 'שחמט',
    style: (palette, roles, seed) => {
      const c = others(palette, roles, seed);
      return {
        backgroundImage: `conic-gradient(${c(0)} 90deg, ${c(1)} 90deg 180deg, ${c(0)} 180deg 270deg, ${c(1)} 270deg)`,
        backgroundSize: '270px 270px',
      };
    },
  },
  {
    id: 'confetti',
    name: 'קונפטי',
    style: (palette, roles, seed) => {
      const c = others(palette, roles, seed);
      return {
        backgroundImage: [
          `radial-gradient(circle at 15% 12%, ${c(2)} 0 26px, ${c(2)}00 27px)`,
          `radial-gradient(circle at 78% 8%, #ffffff59 0 18px, #ffffff00 19px)`,
          `radial-gradient(circle at 92% 34%, ${c(3)} 0 22px, ${c(3)}00 23px)`,
          `radial-gradient(circle at 6% 48%, ${c(3)}bf 0 16px, ${c(3)}00 17px)`,
          `radial-gradient(circle at 88% 66%, #ffffff4d 0 14px, #ffffff00 15px)`,
          `radial-gradient(circle at 20% 82%, ${c(2)}d9 0 24px, ${c(2)}00 25px)`,
          `radial-gradient(circle at 64% 92%, ${c(3)} 0 18px, ${c(3)}00 19px)`,
          `radial-gradient(circle at 44% 24%, ${c(2)}8c 0 12px, ${c(2)}00 13px)`,
          `linear-gradient(160deg, ${c(0)} 0%, ${c(1)} 100%)`,
        ].join(', '),
      };
    },
  },
  {
    id: 'sunrise',
    name: 'זריחה',
    style: (palette, roles, seed) => {
      const c = others(palette, roles, seed);
      return {
        backgroundImage: [
          `radial-gradient(circle at 50% 108%, ${c(2)} 0%, ${c(2)}cc 22%, ${c(2)}00 55%)`,
          `linear-gradient(180deg, ${c(0)} 0%, ${c(1)} 100%)`,
        ].join(', '),
      };
    },
  },
  {
    id: 'moon',
    name: 'ירח',
    style: (palette, roles, seed) => {
      const c = others(palette, roles, seed);
      return {
        backgroundImage: [
          `radial-gradient(circle at 76% 18%, #ffffff33 0 170px, #ffffff00 171px)`,
          `radial-gradient(circle at 76% 18%, ${c(2)} 0 135px, ${c(2)}00 136px)`,
          `linear-gradient(180deg, ${c(0)} 0%, ${c(1)} 100%)`,
        ].join(', '),
      };
    },
  },
  {
    id: 'zigzag',
    name: 'זיגזג',
    style: (palette, roles, seed) => {
      const c = others(palette, roles, seed);
      return {
        backgroundImage: [
          `linear-gradient(135deg, ${c(2)}59 25%, #ffffff00 25%)`,
          `linear-gradient(225deg, ${c(2)}59 25%, #ffffff00 25%)`,
          `linear-gradient(45deg, ${c(2)}59 25%, #ffffff00 25%)`,
          `linear-gradient(315deg, ${c(2)}59 25%, #ffffff00 25%)`,
          `linear-gradient(160deg, ${c(0)} 0%, ${c(1)} 100%)`,
        ].join(', '),
        backgroundPosition: '90px 0, 90px 0, 0 0, 0 0, 0 0',
        backgroundSize: '180px 180px, 180px 180px, 180px 180px, 180px 180px, 100% 100%',
      };
    },
  },
  {
    id: 'grid',
    name: 'רשת',
    style: (palette, roles, seed) => {
      const c = others(palette, roles, seed);
      return {
        backgroundImage: [
          `repeating-linear-gradient(0deg, #ffffff26 0 3px, #ffffff00 3px 90px)`,
          `repeating-linear-gradient(90deg, #ffffff26 0 3px, #ffffff00 3px 90px)`,
          `linear-gradient(135deg, ${c(0)} 0%, ${c(1)} 100%)`,
        ].join(', '),
      };
    },
  },
];

export function getBackdrop(id: string | undefined): Backdrop {
  return BACKDROPS.find((b) => b.id === id) ?? BACKDROPS[0];
}
