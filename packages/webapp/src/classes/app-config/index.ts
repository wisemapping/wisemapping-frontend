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
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ExtConfig = require('AppConfig');

interface ConfigContainer {
  type: 'remote' | 'static';
  url?: string;
  config: Config;
}

interface Config {
  apiBaseUrl: string;
  analyticsAccount?: string;
  recaptcha2Enabled: boolean;
  registrationEnabled: boolean;
  recaptcha2SiteKey?: string;
  clientType: 'mock' | 'rest';
  googleOauth2Url: string;
}

class _AppConfig {
  private static _config: Config;

  isMockEnv(): boolean {
    const config = _AppConfig.getInstance();
    return config.clientType === 'mock';
  }

  private static getInstance(): Config {
    if (!_AppConfig._config) {
      let result: Config;
      const extConfig: ConfigContainer = ExtConfig as ConfigContainer;
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

      console.log(`App Config: ${JSON.stringify(result)}}`);
      _AppConfig._config = result;
    }

    return _AppConfig._config;
  }

  isRestClient(): boolean {
    const config = _AppConfig.getInstance();
    return config.clientType === 'rest' || !config.clientType;
  }

  isRecaptcha2Enabled(): boolean {
    const config = _AppConfig.getInstance();
    return config.recaptcha2Enabled;
  }

  getRecaptcha2SiteKey(): string | undefined {
    const config = _AppConfig.getInstance();
    return config.recaptcha2SiteKey;
  }

  getGoogleAnalyticsAccount(): string | undefined {
    const config = _AppConfig.getInstance();
    return config.analyticsAccount;
  }

  isRegistrationEnabled(): boolean {
    const config = _AppConfig.getInstance();
    return config.registrationEnabled;
  }

  getGoogleOauth2Url(): string | undefined {
    const config = _AppConfig.getInstance();
    return config.googleOauth2Url;
  }

  buildClient(): Client {
    let result: Client;
    if (this.isRestClient()) {
      const config = _AppConfig.getInstance();
      result = new RestClient(this.getApiBaseUrl());
      console.log('Service using rest client. ' + JSON.stringify(config));
    } else {
      console.log('Warning:Service using mockservice client');
      result = new MockClient();
    }

    return result;
  }

  getApiBaseUrl(): string {
    const config = _AppConfig.getInstance();
    return config.apiBaseUrl;
  }
}
const AppConfig = new _AppConfig();

export default AppConfig;
