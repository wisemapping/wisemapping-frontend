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

interface Config {
  apiBaseUrl: string;
  analyticsAccount?: string;
  recaptcha2Enabled: boolean;
  recaptcha2SiteKey?: string;
  clientType: 'mock' | 'rest';
  googleOauth2Url: string;
}

class _AppConfig {
  private defaultInstance: Config = {
    apiBaseUrl: `${window.location.protocol}//${window.location.hostname}:${window.location.port}`,
    clientType: 'mock',
    recaptcha2Enabled: true,
    recaptcha2SiteKey: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
    googleOauth2Url: '/c/registration-google?code=aFakeCode',
  };

  isMockEnv(): boolean {
    const config = this.getInstance();
    return config.clientType === 'mock';
  }

  private getInstance(): Config {
    // Config can be inserted in the html page to define the global properties ...
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result = (window as any).serverconfig;
    if (!result) {
      result = this.defaultInstance;
    }

    return result;
  }

  isRestClient(): boolean {
    const config = this.getInstance();
    return config.clientType === 'rest';
  }

  isRecaptcha2Enabled(): boolean {
    const config = this.getInstance();
    return config.recaptcha2Enabled;
  }

  getRecaptcha2SiteKey(): string | undefined {
    const config = this.getInstance();
    return config.recaptcha2SiteKey;
  }

  getGoogleAnalyticsAccount(): string | undefined {
    const config = this.getInstance();
    return config.analyticsAccount;
  }

  getGoogleOauth2Url(): string | undefined {
    const config = this.getInstance();
    return config.googleOauth2Url;
  }

  buildClient(): Client {
    const config = this.getInstance();
    let result: Client;
    if (config.clientType == 'rest') {
      result = new RestClient(this.getBaseUrl());
      console.log('Service using rest client. ' + JSON.stringify(config));
    } else {
      console.log('Warning:Service using mockservice client');
      result = new MockClient();
    }

    return result;
  }

  getBaseUrl(): string {
    const config = this.getInstance();
    return config.apiBaseUrl;
  }
}
const AppConfig = new _AppConfig();

export default AppConfig;
