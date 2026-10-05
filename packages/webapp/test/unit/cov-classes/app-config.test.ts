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

import AppConfig from '../../../src/classes/app-config';
import RestClient from '../../../src/classes/client/rest-client';
import MockClient from '../../../src/classes/client/mock-client';
import AdminClient from '../../../src/classes/client/admin-client';
import MockAdminClient from '../../../src/classes/client/mock-admin-client';
import getMapNodeDeepLink from '../../../src/utils/map-urls';
import { appLogger } from '../../../src/utils/logger';
import { baseConfig, initAppConfig, resetAppConfig, setBootstrap } from './helpers/app-config';

beforeEach(() => {
  resetAppConfig();
  jest.spyOn(appLogger, 'error').mockImplementation(() => undefined);
  jest.spyOn(appLogger, 'warn').mockImplementation(() => undefined);
  jest.spyOn(appLogger, 'info').mockImplementation(() => undefined);
});

afterAll(() => {
  resetAppConfig();
});

const jsonResponse = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });

describe('AppConfig.initialize', () => {
  it('uses a static config defined by the page', async () => {
    setBootstrap({ type: 'static', config: baseConfig });

    await expect(AppConfig.initialize()).resolves.toEqual(baseConfig);
    expect(AppConfig.getApiBaseUrl()).toBe('http://api.test');
  });

  it('returns the cached config on later calls', async () => {
    setBootstrap({ type: 'static', config: baseConfig });
    const first = await AppConfig.initialize();

    setBootstrap({ type: 'static', config: { ...baseConfig, apiBaseUrl: 'http://other' } });

    await expect(AppConfig.initialize()).resolves.toBe(first);
  });

  it('fetches a remote config once, even with concurrent callers', async () => {
    const fetchSpy = jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(jsonResponse({ ...baseConfig, uiBaseUrl: 'http://remote.ui' }));
    setBootstrap({ type: 'remote', url: 'http://cfg.test/config.json' });

    const [a, b] = await Promise.all([AppConfig.initialize(), AppConfig.initialize()]);

    expect(a).toBe(b);
    expect(AppConfig.getUiBaseUrl()).toBe('http://remote.ui');
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy).toHaveBeenCalledWith('http://cfg.test/config.json', {
      credentials: 'omit',
      cache: 'no-store',
    });
  });

  it('fails with a readable message when the remote config request fails', async () => {
    jest
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('nope', { status: 500, statusText: 'Server Error' }));
    setBootstrap({ type: 'remote', url: 'http://cfg.test/config.json' });

    await expect(AppConfig.initialize()).rejects.toEqual({
      msg: 'Unexpected error application. Please, try latter. Detail: Request failed: Server Error',
    });
  });

  it('can be retried after a failure', async () => {
    jest
      .spyOn(globalThis, 'fetch')
      .mockRejectedValueOnce('offline')
      .mockResolvedValueOnce(jsonResponse(baseConfig));
    setBootstrap({ type: 'remote', url: 'http://cfg.test/config.json' });

    await expect(AppConfig.initialize()).rejects.toEqual({
      msg: 'Unexpected error application. Please, try latter. Detail: Unexpected error while loading configuration.',
    });
    await expect(AppConfig.initialize()).resolves.toEqual(baseConfig);
  });

  it('fails when a remote config has no url', async () => {
    setBootstrap({ type: 'remote' });

    await expect(AppConfig.initialize()).rejects.toEqual({
      msg: 'Unexpected error application. Please, try latter. Detail: Fetching remote config from undefined can not be empty',
    });
  });

  it('fails when the page defines no bootstrap config', async () => {
    await expect(AppConfig.initialize()).rejects.toEqual({
      msg: expect.stringContaining('BoostrapConfig is not available on window object'),
    });
  });

  it('refuses to answer before it is initialized', () => {
    expect(() => AppConfig.getApiBaseUrl()).toThrow('App configuration has not been initialized');
  });
});

describe('AppConfig settings', () => {
  it('exposes the configured flags and urls', async () => {
    await initAppConfig({
      recaptcha2Enabled: true,
      recaptcha2SiteKey: 'site-key',
      analyticsAccount: 'G-1',
      registrationEnabled: false,
    });

    expect(AppConfig.isRecaptcha2Enabled()).toBe(true);
    expect(AppConfig.getRecaptcha2SiteKey()).toBe('site-key');
    expect(AppConfig.getGoogleAnalyticsAccount()).toBe('G-1');
    expect(AppConfig.isRegistrationEnabled()).toBe(false);
    expect(AppConfig.getGoogleOauth2Url()).toBe('http://google.test/auth');
    expect(AppConfig.getFacebookOauth2Url()).toBe('http://facebook.test/auth');
    expect(AppConfig.isGoogleOauth2Enabled()).toBe(true);
    expect(AppConfig.isFacebookOauth2Enabled()).toBe(false);
    expect(AppConfig.getJwtExpirationMin()).toBe(10080);
    expect(AppConfig.getUiBaseUrl()).toBe('http://ui.test');
  });

  it('treats missing OAuth flags as disabled', async () => {
    await initAppConfig({
      googleOauth2Enabled: undefined,
      facebookOauth2Enabled: undefined,
    });

    expect(AppConfig.isGoogleOauth2Enabled()).toBe(false);
    expect(AppConfig.isFacebookOauth2Enabled()).toBe(false);
  });

  it('requires the JWT expiration and the API base url', async () => {
    await initAppConfig({ jwtExpirationMin: 0, apiBaseUrl: '' });

    expect(() => AppConfig.getJwtExpirationMin()).toThrow('jwtExpirationMin can not be null');
    expect(() => AppConfig.getApiBaseUrl()).toThrow('API base URL is not configured');
  });

  it('defaults to the REST client when no client type is set', async () => {
    await initAppConfig({ clientType: undefined });

    expect(AppConfig.isRestClient()).toBe(true);
    expect(AppConfig.isMockEnv()).toBe(false);
  });

  it('recognises the mock environment', async () => {
    await initAppConfig({ clientType: 'mock' });

    expect(AppConfig.isMockEnv()).toBe(true);
    expect(AppConfig.isRestClient()).toBe(false);
  });
});

describe('AppConfig clients', () => {
  it('builds one REST client for a rest config', async () => {
    await initAppConfig();

    const client = AppConfig.getClient();

    expect(client).toBeInstanceOf(RestClient);
    expect(AppConfig.getClient()).toBe(client);
  });

  it('falls back to the mock client for a mock config', async () => {
    await initAppConfig({ clientType: 'mock' });

    expect(AppConfig.getClient()).toBeInstanceOf(MockClient);
  });

  it('falls back to the mock client when the REST client has no API url', async () => {
    await initAppConfig({ apiBaseUrl: '' });

    expect(AppConfig.getClient()).toBeInstanceOf(MockClient);
    expect(appLogger.error).toHaveBeenCalledWith(
      'Client could not be initialized.',
      expect.any(Error),
    );
  });

  it('builds one admin REST client for a rest config', async () => {
    await initAppConfig();

    const admin = AppConfig.getAdminClient();

    expect(admin).toBeInstanceOf(AdminClient);
    expect(AppConfig.getAdminClient()).toBe(admin);
  });

  it('uses the mock admin client in the mock environment', async () => {
    await initAppConfig({ clientType: 'mock' });

    const admin = AppConfig.getAdminClient();

    expect(admin).toBeInstanceOf(MockAdminClient);
    expect(AppConfig.getAdminClient()).toBe(admin);
  });

  it('falls back to the mock admin client when the API url is missing', async () => {
    await initAppConfig({ apiBaseUrl: '' });

    expect(AppConfig.getAdminClient()).toBeInstanceOf(MockAdminClient);
    expect(appLogger.error).toHaveBeenCalledWith(
      'Admin client could not be initialized.',
      expect.any(Error),
    );
  });

  it('falls back to the mock admin client for an unknown client type', async () => {
    await initAppConfig({ clientType: 'other' as 'rest' });

    expect(AppConfig.getAdminClient()).toBeInstanceOf(MockAdminClient);
  });
});

describe('getMapNodeDeepLink', () => {
  it('links to the map editor focused on one node, on the configured UI host', async () => {
    await initAppConfig({ uiBaseUrl: 'https://app.example.com' });

    expect(getMapNodeDeepLink(12, 34)).toBe('https://app.example.com/c/maps/12/edit?node=34');
    expect(getMapNodeDeepLink('7', 1)).toBe('https://app.example.com/c/maps/7/edit?node=1');
  });
});
