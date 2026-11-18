import { createContext } from 'react';

import type { ThemeMode } from '../../config/brand';

export const ThemeContext = createContext<{
  themeName: ThemeMode;
  setThemeName: (t: ThemeMode) => void;
}>({
  themeName: 'light',
  setThemeName: () => {},
});
