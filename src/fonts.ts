import '@fontsource/heebo/400.css';
import '@fontsource/heebo/800.css';
import '@fontsource/rubik/400.css';
import '@fontsource/rubik/700.css';
import '@fontsource/assistant/400.css';
import '@fontsource/assistant/800.css';
import '@fontsource/varela-round/400.css';
import '@fontsource/alef/400.css';
import '@fontsource/alef/700.css';
import '@fontsource/secular-one/400.css';
import '@fontsource/suez-one/400.css';
import '@fontsource/frank-ruhl-libre/400.css';
import '@fontsource/frank-ruhl-libre/800.css';
import '@fontsource/miriam-libre/400.css';
import '@fontsource/miriam-libre/700.css';
import '@fontsource/david-libre/400.css';
import '@fontsource/david-libre/700.css';
import '@fontsource/playpen-sans-hebrew/400.css';
import '@fontsource/playpen-sans-hebrew/800.css';

export interface Font {
  id: string;
  name: string;
  family: string;
  /** Heaviest weight the font ships with; used for headings. */
  headingWeight: number;
}

export const FONTS: Font[] = [
  { id: 'heebo', name: 'Heebo', family: "'Heebo', sans-serif", headingWeight: 800 },
  { id: 'rubik', name: 'Rubik', family: "'Rubik', sans-serif", headingWeight: 700 },
  { id: 'assistant', name: 'Assistant', family: "'Assistant', sans-serif", headingWeight: 800 },
  { id: 'varela-round', name: 'Varela Round', family: "'Varela Round', sans-serif", headingWeight: 400 },
  { id: 'alef', name: 'Alef', family: "'Alef', sans-serif", headingWeight: 700 },
  { id: 'secular-one', name: 'Secular One', family: "'Secular One', sans-serif", headingWeight: 400 },
  { id: 'suez-one', name: 'Suez One', family: "'Suez One', serif", headingWeight: 400 },
  { id: 'frank-ruhl-libre', name: 'Frank Ruhl Libre', family: "'Frank Ruhl Libre', serif", headingWeight: 800 },
  { id: 'miriam-libre', name: 'Miriam Libre', family: "'Miriam Libre', sans-serif", headingWeight: 700 },
  { id: 'david-libre', name: 'David Libre', family: "'David Libre', serif", headingWeight: 700 },
  { id: 'playpen-sans-hebrew', name: 'Playpen Sans Hebrew', family: "'Playpen Sans Hebrew', cursive", headingWeight: 800 },
];

export function getFont(id: string | undefined): Font {
  return FONTS.find((f) => f.id === id) ?? FONTS[0];
}
