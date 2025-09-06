/*
 *    Copyright [2021] [wisemapping]
 *
 *   Licensed under WiseMapping Public License, Version 1.0 (the "License").
 *   It is basically the Apache License, Version 2.0 (the "License") plus the
 *   "powered by wisemapping" text requirement on every single page;
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the license at
 *
 *       http://www.wisemapping.org/license
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
  jwtExpirationMin: number;
};

class AppConfig {
  private static _config: Config;

  static fetchOrGetConfig(): Config {
    try {
      if (!this._config) {
        let result: Config;

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
          result = extConfig.config;
        } else {
          // Configuration must be fetch externally ...
          console.log(`Fetching remote config from '${extConfig.url}'`);
          if (!extConfig.url) {
            throw new Error(`Fetching remote config from ${extConfig.url} can not be empty`);
          }

          const xhr = new XMLHttpRequest();
          xhr.open('GET', extConfig.url, false);
          xhr.send(null);
          if (xhr.status === 200) {
            result = JSON.parse(xhr.responseText);
          } else {
            throw new Error('Request failed: ' + xhr.statusText);
          }
        }

        this._config = result;
        console.log(`App Config: ${JSON.stringify(this._config)}`);
      }
    } catch (e) {
      throw { msg: `Unexpected error application. Please, try latter. Detail: ${e.message}` };
    }

    return this._config;
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
      console.log('Warning: Service using mock service client');
      result = new MockClient();
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
