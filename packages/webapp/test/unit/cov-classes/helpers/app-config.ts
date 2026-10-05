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

import AppConfig from '../../../../src/classes/app-config';

export type TestConfig = {
  uiBaseUrl: string;
  apiBaseUrl: string;
  analyticsAccount?: string;
  recaptcha2Enabled: boolean;
  registrationEnabled: boolean;
  recaptcha2SiteKey?: string;
  clientType: 'mock' | 'rest';
  googleOauth2Url: string;
  googleOauth2Enabled: boolean;
  facebookOauth2Url: string;
  facebookOauth2Enabled: boolean;
  jwtExpirationMin: number;
};

export const baseConfig: TestConfig = {
  uiBaseUrl: 'http://ui.test',
  apiBaseUrl: 'http://api.test',
  recaptcha2Enabled: false,
  registrationEnabled: true,
  clientType: 'rest',
  googleOauth2Url: 'http://google.test/auth',
  googleOauth2Enabled: true,
  facebookOauth2Url: 'http://facebook.test/auth',
  facebookOauth2Enabled: false,
  jwtExpirationMin: 10080,
};

type Container = { type: 'remote' | 'static'; url?: string; config?: Partial<TestConfig> };

/** Sets (or, with `undefined`, removes) the bootstrap config the page script would define. */
export const setBootstrap = (container: Container | undefined): void => {
  const win = window as unknown as { BoostrapConfig?: Container };
  if (container) {
    win.BoostrapConfig = container;
  } else {
    delete win.BoostrapConfig;
  }
};

/**
 * AppConfig caches its config and clients in static fields for the page lifetime;
 * clear them so each test starts like a fresh page load.
 */
export const resetAppConfig = (): void => {
  Object.assign(AppConfig as unknown as Record<string, unknown>, {
    _config: null,
    _client: null,
    _adminClient: null,
    _initializationPromise: null,
  });
  setBootstrap(undefined);
};

/** Resets AppConfig and initializes it with a static config. */
export const initAppConfig = async (overrides: Partial<TestConfig> = {}): Promise<void> => {
  resetAppConfig();
  setBootstrap({ type: 'static', config: { ...baseConfig, ...overrides } });
  await AppConfig.initialize();
};
