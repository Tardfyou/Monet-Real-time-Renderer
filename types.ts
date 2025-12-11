export interface Palette {
  id: string;
  name: string;
  colors: string[]; // Hex codes
  toneMapping: {
    shadows: number[]; // [r, g, b]
    midtones: number[];
    highlights: number[];
  };
}

export interface RenderSettings {
  // Brush & Stroke
  brushSize: number;
  strokeLength: number;
  particleCount: number;
  opacity: number;
  
  // Color & Flow
  colorVibrance: number; // 0 to 2 (1 is normal)
  flowIntensity: number; // Speed of movement
  swirl: number; // Used for "Wiggle" amplitude (Fish tail motion)
  
  // System
  paletteId: string;
}

export const DEFAULT_SETTINGS: RenderSettings = {
  brushSize: 4, // Narrower width for fish body/brush bristles
  strokeLength: 14, // Longer length to emphasize directionality
  particleCount: 10000, // High density for "School of fish" effect
  opacity: 0.65, // Solid enough to see the shape, transparent enough to blend
  colorVibrance: 1.2,
  flowIntensity: 1.2, // Active swimming speed
  swirl: 0.5, // Visible wiggling/undulation
  paletteId: 'sunrise',
};