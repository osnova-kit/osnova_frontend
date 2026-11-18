export type ThemeMode = 'light' | 'dark';

export interface BrandPalette {
  primary: string;
  background: string;
  /** Header, footer, cards, inputs, popups */
  surface: string;
  text: string;
}

export interface Brand {
  fontFamily: string;
  borderRadius: number;
  light: BrandPalette;
  dark: BrandPalette;
}

export const brand: Brand = {
  fontFamily: "Roboto, system-ui, -apple-system, 'Segoe UI', sans-serif",
  borderRadius: 8,
  light: {
    primary: '#6d28d9',
    background: '#f5f3ff',
    surface: '#ffffff',
    text: '#1e1b4b',
  },
  dark: {
    primary: '#8b5cf6',
    background: '#13112e',
    surface: '#1e1b4b',
    text: '#f5f3ff',
  },
};
