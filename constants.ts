
import { AppConfig, NameEntry } from './types';

export const FONT_OPTIONS = [
  { label: 'Inter / Sans', value: 'Inter, system-ui, sans-serif' },
  { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
  { label: 'Times New Roman', value: '"Times New Roman", Times, serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Courier New', value: '"Courier New", Courier, monospace' },
  { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
  { label: 'Cambria', value: 'Cambria, Georgia, serif' },
];

export const COLOR_OPTIONS = [
  '#000000', // Black
  '#374151', // Gray 700
  '#1d4ed8', // Blue 700
  '#b91c1c', // Red 700
  '#047857', // Emerald 700
  '#a21caf', // Fuchsia 700
  '#c2410c', // Orange 700
  '#4c1d95', // Violet 900
];

export const DEFAULT_NAMES: NameEntry[] = [
  { id: '1', line1: 'Elon Musk', line2: 'Founder, xAI', scale: 1 },
  { id: '2', line1: 'Jane Smith', line2: 'CTO, Google', scale: 1 },
  { id: '3', line1: 'Dr. Alice Brown', line2: 'Research Director, OpenAI', scale: 1 },
];

export const DEFAULT_CONFIG: AppConfig = {
  paperSize: 'a4',
  orientation: 'landscape',
  plateWidthCm: 20,
  plateHeightCm: 6,
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: 24,
  textColor: '#000000',
  isBold: true,
  isItalic: false,
  borderStyle: 'thin',
  secondaryScale: 0.5,
  showCutMarks: true,
  showFoldLine: true,
  secondaryColor: '#6b7280',
  secondaryIsItalic: true,
  autoFit: true,
};

export const PAPER_DIMENSIONS = {
  a4: { width: 21.0, height: 29.7 },
  letter: { width: 21.59, height: 27.94 },
};