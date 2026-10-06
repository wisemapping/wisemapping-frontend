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

import React from 'react';
import { RenderResult } from '@testing-library/react';
import Client from '../../../src/classes/client';
import AppConfig from '../../../src/classes/app-config';
import { AppThemeProvider } from '../../../src/contexts/ThemeContext';
import { renderWithProviders } from '../helpers/render';

type MediaListener = (event: { matches: boolean }) => void;

/**
 * jsdom has no matchMedia. Installs one that answers `prefersDark` to the
 * dark-scheme query and lets a test flip the system preference afterwards.
 */
export const installMatchMedia = (
  prefersDark = false,
): { setSystemDark: (dark: boolean) => void; listeners: MediaListener[] } => {
  const listeners: MediaListener[] = [];
  let dark = prefersDark;
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (query: string) => ({
      get matches() {
        return query.includes('dark') ? dark : false;
      },
      media: query,
      addEventListener: (_: string, listener: MediaListener) => listeners.push(listener),
      removeEventListener: (_: string, listener: MediaListener) => {
        const index = listeners.indexOf(listener);
        if (index >= 0) {
          listeners.splice(index, 1);
        }
      },
      addListener: () => undefined,
      removeListener: () => undefined,
    }),
  });
  return {
    listeners,
    setSystemDark: (value: boolean) => {
      dark = value;
      [...listeners].forEach((listener) => listener({ matches: value }));
    },
  };
};

export type TestConfig = {
  registrationEnabled?: boolean;
  recaptcha2Enabled?: boolean;
  recaptcha2SiteKey?: string;
  googleOauth2Enabled?: boolean;
  googleOauth2Url?: string;
  facebookOauth2Enabled?: boolean;
  facebookOauth2Url?: string;
};

/** Loads a static application configuration, as the bootstrap script does. */
export const initAppConfig = async (config: TestConfig = {}): Promise<void> => {
  (window as unknown as { BoostrapConfig: unknown }).BoostrapConfig = {
    type: 'static',
    config: {
      uiBaseUrl: 'http://localhost',
      apiBaseUrl: 'http://localhost',
      clientType: 'rest',
      jwtExpirationMin: 10080,
      registrationEnabled: true,
      recaptcha2Enabled: false,
      googleOauth2Enabled: false,
      googleOauth2Url: '',
      facebookOauth2Enabled: false,
      facebookOauth2Url: '',
      ...config,
    },
  };
  await AppConfig.initialize();
};

/** Overrides single configuration values for one test (spies are restored after each test). */
export const useConfig = (config: TestConfig): void => {
  const spy = <K extends keyof typeof AppConfig>(key: K, value: unknown): void => {
    jest.spyOn(AppConfig, key as never).mockImplementation((() => value) as never);
  };
  if (config.registrationEnabled !== undefined) {
    spy('isRegistrationEnabled', config.registrationEnabled);
  }
  if (config.recaptcha2Enabled !== undefined) {
    spy('isRecaptcha2Enabled', config.recaptcha2Enabled);
  }
  if ('recaptcha2SiteKey' in config) {
    spy('getRecaptcha2SiteKey', config.recaptcha2SiteKey);
  }
  if (config.googleOauth2Enabled !== undefined) {
    spy('isGoogleOauth2Enabled', config.googleOauth2Enabled);
  }
  if ('googleOauth2Url' in config) {
    spy('getGoogleOauth2Url', config.googleOauth2Url);
  }
  if (config.facebookOauth2Enabled !== undefined) {
    spy('isFacebookOauth2Enabled', config.facebookOauth2Enabled);
  }
  if ('facebookOauth2Url' in config) {
    spy('getFacebookOauth2Url', config.facebookOauth2Url);
  }
};

/** renderWithProviders plus the application's light/dark ThemeContext. */
export const renderPage = (ui: React.ReactElement, client?: Partial<Client>): RenderResult =>
  renderWithProviders(<AppThemeProvider>{ui}</AppThemeProvider>, {
    client: client as Client,
  });
