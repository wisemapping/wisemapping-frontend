import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PaletteMode } from '@mui/material';

interface ThemeContextType {
  mode: PaletteMode;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  externalThemeMode?: PaletteMode; // Allow external theme mode to override internal
}

export const EditorThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  externalThemeMode,
}) => {
  const [mode, setMode] = useState<PaletteMode>(() => {
    // External theme mode should always be provided, otherwise assume light
    return externalThemeMode || 'light';
  });

  const [isUserControlled, setIsUserControlled] = useState(false);

  const toggleMode = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    localStorage.setItem('themeMode', newMode);
    setIsUserControlled(true); // Mark that user has taken control

    console.log(
      '🎨 EditorThemeProvider: toggleMode called, newMode:',
      newMode,
      'user controlled:',
      true,
    );
  };

  // Sync with external theme mode changes, but only if user hasn't taken control
  useEffect(() => {
    if (externalThemeMode && !isUserControlled) {
      console.log(
        '🎨 EditorThemeProvider: External theme mode provided:',
        externalThemeMode,
        'current mode:',
        mode,
        'user controlled:',
        isUserControlled,
      );
      if (externalThemeMode !== mode) {
        console.log('🎨 EditorThemeProvider: Syncing with external theme mode:', externalThemeMode);
        setMode(externalThemeMode);
      }
    }
  }, [externalThemeMode, isUserControlled]); // Only sync if user hasn't taken control

  // Listen for system theme changes and localStorage changes from other windows
  useEffect(() => {
    // Skip system preference handling if external theme mode is provided or user has taken control
    if (externalThemeMode && !isUserControlled) {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // Only auto-switch if user hasn't set a preference
      if (!localStorage.getItem('themeMode')) {
        setMode(e.matches ? 'dark' : 'light');
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'themeMode' && e.newValue) {
        setMode(e.newValue as PaletteMode);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [externalThemeMode, isUserControlled]);

  return <ThemeContext.Provider value={{ mode, toggleMode }}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within an EditorThemeProvider');
  }
  return context;
};
