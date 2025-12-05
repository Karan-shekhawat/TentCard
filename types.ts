
export interface NameEntry {
  id: string;
  line1: string; // The main name
  line2: string; // Designation / Company
  scale?: number; // Individual font size scale (default 1.0)
}

export type PaperSize = 'a4' | 'letter';
export type Orientation = 'portrait' | 'landscape';
export type BorderStyle = 'none' | 'thin' | 'medium' | 'thick';

export interface AppConfig {
  paperSize: PaperSize;
  orientation: Orientation;
  plateWidthCm: number;
  plateHeightCm: number;
  fontFamily: string;
  fontSize: number;
  textColor: string;
  isBold: boolean;
  isItalic: boolean;
  borderStyle: BorderStyle;
  secondaryScale: number; // 0.6 to 0.9
  showCutMarks: boolean;
  showFoldLine: boolean;
  // New options
  secondaryColor: string;
  secondaryIsItalic: boolean;
  autoFit: boolean;
}