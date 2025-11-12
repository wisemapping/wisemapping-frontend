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

import Client from '../client';
import MockClient from '../client/mock-client';
import RestClient from '../client/rest-client';
import MockAdminClient from '../client/mock-admin-client';
import AdminClient, { AdminClientInterface } from '../client/admin-client';

type ConfigContainer = {
  type: 'remote' | 'static';
  url?: string;
  config: Config;
};

type Config = {
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

class AppConfig {
  private static _config: Config | null = null;

  private static _initializationPromise: Promise<Config> | null = null;

  static async initialize(): Promise<Config> {
    if (this._config) {
      return this._config;
    }

    if (!this._initializationPromise) {
      this._initializationPromise = this.loadConfig()
        .then((config) => {
          this._config = config;
          console.log(`App Config: ${JSON.stringify(this._config)}`);
          console.log(`App Config clientType: ${this._config.clientType}`);
          return config;
        })
        .catch((error: unknown) => {
          const message =
            error instanceof Error
              ? error.message
              : 'Unexpected error while loading configuration.';
          throw { msg: `Unexpected error application. Please, try latter. Detail: ${message}` };
        })
        .finally(() => {
          this._initializationPromise = null;
        });
    }

    return this._initializationPromise;
  }

  static fetchOrGetConfig(): Config {
    if (!this._config) {
      throw new Error(
        'App configuration has not been initialized. Call AppConfig.initialize() before accessing configuration.',
      );
    }
    return this._config;
  }

  private static async loadConfig(): Promise<Config> {
    // Dynamic import for BootstrapConfig
    const windowWithConfig = window as unknown as { BoostrapConfig?: ConfigContainer };
    if (!windowWithConfig.BoostrapConfig) {
      throw new Error(
        'BoostrapConfig is not available on window object. Make sure the configuration is properly loaded.',
      );
    }
    const extConfig: ConfigContainer = windowWithConfig.BoostrapConfig;
    if (extConfig.type === 'static') {
      // Configuration has been defined as part of webpack ...
      return extConfig.config;
    }

    // Configuration must be fetched externally ...
    console.log(`Fetching remote config from '${extConfig.url}'`);
    if (!extConfig.url) {
      throw new Error(`Fetching remote config from ${extConfig.url} can not be empty`);
    }

    const response = await fetch(extConfig.url, {
      credentials: 'include',
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.statusText}`);
    }

    return (await response.json()) as Config;
  }

  static isMockEnv(): boolean {
    const config = this.fetchOrGetConfig();
    return config.clientType === 'mock';
  }

  static getJwtExpirationMin(): number {
    const config = this.fetchOrGetConfig();
    if (!config.jwtExpirationMin) {
      throw new Error('jwtExpirationMin can not be null. Review wise-api configuration.');
    }
    return config.jwtExpirationMin;
  }

  static isRestClient(): boolean {
    const config = this.fetchOrGetConfig();
    return config.clientType === 'rest' || !config.clientType;
  }

  static isRecaptcha2Enabled(): boolean {
    const config = this.fetchOrGetConfig();
    return config.recaptcha2Enabled;
  }

  static getRecaptcha2SiteKey(): string | undefined {
    const config = this.fetchOrGetConfig();
    return config.recaptcha2SiteKey;
  }

  static getGoogleAnalyticsAccount(): string | undefined {
    const config = this.fetchOrGetConfig();
    return config.analyticsAccount;
  }

  static isRegistrationEnabled(): boolean {
    const config = this.fetchOrGetConfig();
    return config.registrationEnabled;
  }

  static getGoogleOauth2Url(): string | undefined {
    const config = this.fetchOrGetConfig();
    return config.googleOauth2Url;
  }

  static getFacebookOauth2Url(): string | undefined {
    const config = this.fetchOrGetConfig();
    return config.facebookOauth2Url;
  }

  static isGoogleOauth2Enabled(): boolean {
    const config = this.fetchOrGetConfig();
    return config.googleOauth2Enabled || false;
  }

  static isFacebookOauth2Enabled(): boolean {
    const config = this.fetchOrGetConfig();
    return config.facebookOauth2Enabled || false;
  }

  static getClient(): Client {
    let result: Client | undefined;
    try {
      if (this.isRestClient()) {
        const apiBaseUrl = this.getApiBaseUrl();
        if (!apiBaseUrl) {
          throw new Error('API base URL is not configured');
        }
        result = new RestClient(apiBaseUrl);
      }
    } catch (e) {
      console.error('Client could not be initialized.');
      console.error(e);
    }

    if (!result) {
      console.log('Warning: Service using mock client');
      result = new MockClient();
    }

    return result;
  }

  static getAdminClient(): AdminClientInterface {
    // If we're in mock mode, always use MockAdminClient for admin functionality
    if (this.isMockEnv()) {
      console.log('Mock environment detected, using MockAdminClient');
      return new MockAdminClient();
    }

    let result: AdminClientInterface | undefined;
    try {
      if (this.isRestClient()) {
        const apiBaseUrl = this.getApiBaseUrl();
        if (!apiBaseUrl) {
          throw new Error('API base URL is not configured');
        }
        result = new AdminClient(apiBaseUrl);
      }
    } catch (e) {
      console.error('Admin client could not be initialized.');
      console.error(e);
    }

    if (!result) {
      console.log('Warning: Service using mock admin client');
      result = new MockAdminClient();
    }

    return result;
  }

  static getApiBaseUrl(): string {
    const config = this.fetchOrGetConfig();
    if (!config.apiBaseUrl) {
      throw new Error('API base URL is not configured in the application configuration');
    }
    return config.apiBaseUrl;
  }

  static getUiBaseUrl(): string {
    const config = this.fetchOrGetConfig();
    return config.uiBaseUrl;
  }
}

export default AppConfig;
