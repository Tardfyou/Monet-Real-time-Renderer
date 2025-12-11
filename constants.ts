import { Palette } from './types';

// Helper to convert Hex to RGB array
const h2r = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : [0, 0, 0];
};

export const MONET_PALETTES: Palette[] = [
  {
    id: 'sunrise',
    name: 'Impression, Sunrise',
    colors: ['#6e7f80', '#536872', '#ff8c69', '#fd7c46', '#2c3e50'],
    toneMapping: {
      shadows: h2r('#2c3e50'), // Dark Blue-Grey
      midtones: h2r('#6e7f80'), // Muted Blue
      highlights: h2r('#ff8c69'), // Orange Sun
    }
  },
  {
    id: 'water_lilies',
    name: 'Water Lilies',
    colors: ['#2e493c', '#4a6d58', '#8a9aac', '#9b597b', '#c4a6bd'],
    toneMapping: {
      shadows: h2r('#1a2e22'), // Deep Green
      midtones: h2r('#4a6d58'), // Pond Green
      highlights: h2r('#c4a6bd'), // Lilac/Pink
    }
  },
  {
    id: 'parasol',
    name: 'Woman with a Parasol',
    colors: ['#87ceeb', '#e0f6ff', '#556b2f', '#f5f5dc', '#dcdcdc'],
    toneMapping: {
      shadows: h2r('#556b2f'), // Grass Green
      midtones: h2r('#87ceeb'), // Sky Blue
      highlights: h2r('#fdfdea'), // Creamy White
    }
  },
  {
    id: 'giverny',
    name: 'The Artist’s Garden at Giverny',
    colors: ['#8b008b', '#4b0082', '#228b22', '#d2691e', '#ffdab9'],
    toneMapping: {
      shadows: h2r('#4b0082'), // Indigo
      midtones: h2r('#228b22'), // Forest Green
      highlights: h2r('#ffdab9'), // Peach
    }
  }
];

export const QUOTES = [
  "Claude Monet — The Poetry of Light",
  "Claude Monet — Impressionism is Sensation",
  "Claude Monet — Color is my day-long obsession",
  "Claude Monet — The richness I achieve comes from nature"
];