import { ConfigProvider } from 'antd';
import { useEffect, useState } from 'react';
import type { ThemeMode } from '../../config/brand';
import { useAntdLocale } from '../../i18n/antdLocale';
import AppRouter from '../../routes/routes';
import BootstrapComponent from '../BootstrapComponent/BootstrapComponent';
import ErrorBoundary from '../ErrorBoundary/ErrorBoundary';
import { ThemeContext } from './ThemeContext';
import ThemeVariables from './ThemeVariables';
import { getTheme } from './theme';

const THEME_KEY = 'app_theme';

function readSavedTheme(): string | null {
  try {
    return localStorage.getItem(THEME_KEY);
  } catch {
    return null;
  }
}

function saveTheme(theme: ThemeMode) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Storage may be unavailable (private mode): the choice lasts until the page closes.
  }
}

function initialTheme(): ThemeMode {
  const saved = readSavedTheme();
  if (saved === 'dark' || saved === 'light') return saved;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

const AppComponent = () => {
  const [themeName, setThemeName] = useState<ThemeMode>(initialTheme);

  const antdLocale = useAntdLocale();

  useEffect(() => {
    saveTheme(themeName);
  }, [themeName]);

  return (
    <ThemeContext.Provider value={{ themeName, setThemeName }}>
      <ConfigProvider theme={getTheme(themeName)} locale={antdLocale}>
        <ThemeVariables mode={themeName} />
        <ErrorBoundary>
          <BootstrapComponent>
            <AppRouter />
          </BootstrapComponent>
        </ErrorBoundary>
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};

export default AppComponent;
