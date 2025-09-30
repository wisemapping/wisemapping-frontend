import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PaletteMode } from '@mui/material';
import { ThemeVariantStorage } from '../types/ThemeVariantStorage';

interface ThemeContextType {
  mode: PaletteMode;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  themeVariantStorage: ThemeVariantStorage; // Theme variant storage for persistence (mandatory)
}

export const EditorThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  themeVariantStorage,
}) => {
  const [mode, setMode] = useState<PaletteMode>(() => {
    return themeVariantStorage.getThemeVariant();
  });

  const [isUserControlled, setIsUserControlled] = useState(false);

  const toggleMode = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);

    // Always use ThemeVariantStorage (now mandatory)
    themeVariantStorage.setThemeVariant(newMode);

    setIsUserControlled(true); // Mark that user has taken control
  };

  // External theme mode sync is no longer needed - ThemeVariantStorage is the only source

  // Listen for theme variant changes from ThemeVariantStorage
  useEffect(() => {
    const unsubscribe = themeVariantStorage.subscribe((variant) => {
      // Always update when ThemeVariantStorage changes (it's the authoritative source)
      // This handles cross-tab synchronization and external changes
      setMode(variant);
    });

    return unsubscribe;
  }, [themeVariantStorage]);

  // System theme changes are handled by ThemeVariantStorage
  // No need for additional localStorage or system preference handling

  return <ThemeContext.Provider value={{ mode, toggleMode }}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within an EditorThemeProvider');
  }
  return context;
};
