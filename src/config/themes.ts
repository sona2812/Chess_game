import { Theme } from '../types/chess';

export const themes: Record<string, Theme> = {
  default: {
    lightSquare: '#f0d9b5',
    darkSquare: '#b58863',
    selected: 'rgba(20, 85, 30, 0.5)',
  },
  blue: {
    lightSquare: '#dee3e6',
    darkSquare: '#8ca2ad',
    selected: 'rgba(0, 92, 175, 0.5)',
  },
  green: {
    lightSquare: '#eeeed2',
    darkSquare: '#769656',
    selected: 'rgba(155, 199, 0, 0.5)',
  },
}; 