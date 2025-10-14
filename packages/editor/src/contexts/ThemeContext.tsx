/*
 *    Copyright [2007-2025] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       https://github.com/wisemapping/wisemapping-open-source/blob/main/LICENSE.md
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { PaletteMode } from '@mui/material';
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

  const toggleMode = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);

    // Always use ThemeVariantStorage (now mandatory)
    themeVariantStorage.setThemeVariant(newMode);
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
