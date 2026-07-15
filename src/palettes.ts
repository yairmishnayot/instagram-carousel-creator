import type { Roles } from './types';

export interface Palette {
  id: string;
  name: string;
  colors: [string, string, string, string, string];
  defaultRoles: Roles;
}

// Static snapshot of trending palettes from coolors.co (see spec).
export const PALETTES: Palette[] = [
  {
    id: 'ocean',
    name: 'אוקיינוס',
    colors: ['#264653', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51'],
    defaultRoles: { bg: 0, text: 2, accent: 1 },
  },
  {
    id: 'forest',
    name: 'יער',
    colors: ['#606c38', '#283618', '#fefae0', '#dda15e', '#bc6c25'],
    defaultRoles: { bg: 1, text: 2, accent: 3 },
  },
  {
    id: 'sunset',
    name: 'שקיעה',
    colors: ['#003049', '#d62828', '#f77f00', '#fcbf49', '#eae2b7'],
    defaultRoles: { bg: 0, text: 4, accent: 2 },
  },
  {
    id: 'deep-sea',
    name: 'ים עמוק',
    colors: ['#001219', '#005f73', '#0a9396', '#94d2bd', '#e9d8a6'],
    defaultRoles: { bg: 0, text: 4, accent: 2 },
  },
  {
    id: 'tropic',
    name: 'טרופי',
    colors: ['#ef476f', '#ffd166', '#06d6a0', '#118ab2', '#073b4c'],
    defaultRoles: { bg: 4, text: 1, accent: 0 },
  },
  {
    id: 'neon',
    name: 'ניאון',
    colors: ['#ffbe0b', '#fb5607', '#ff006e', '#8338ec', '#3a86ff'],
    defaultRoles: { bg: 3, text: 0, accent: 2 },
  },
  {
    id: 'sky',
    name: 'שמיים',
    colors: ['#8ecae6', '#219ebc', '#023047', '#ffb703', '#fb8500'],
    defaultRoles: { bg: 2, text: 0, accent: 3 },
  },
  {
    id: 'pastel',
    name: 'פסטל',
    colors: ['#f6bd60', '#f7ede2', '#f5cac3', '#84a59d', '#f28482'],
    defaultRoles: { bg: 3, text: 1, accent: 0 },
  },
  {
    id: 'night',
    name: 'לילה',
    colors: ['#0d1b2a', '#1b263b', '#415a77', '#778da9', '#e0e1dd'],
    defaultRoles: { bg: 0, text: 4, accent: 3 },
  },
  {
    id: 'roses',
    name: 'ורדים',
    colors: ['#355070', '#6d597a', '#b56576', '#e56b6f', '#eaac8b'],
    defaultRoles: { bg: 0, text: 4, accent: 3 },
  },
];

export function getPalette(id: string): Palette {
  return PALETTES.find((p) => p.id === id) ?? PALETTES[0];
}
