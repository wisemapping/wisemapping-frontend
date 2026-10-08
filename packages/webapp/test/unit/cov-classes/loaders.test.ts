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

import type { LoaderFunctionArgs } from 'react-router';
import ReactGA from 'react-ga4';
import AppConfig from '../../../src/classes/app-config';
import Client, { MapMetadata } from '../../../src/classes/client';
import JwtTokenConfig from '../../../src/classes/jwt-token-config';
import queryClient from '../../../src/queryClient';
import { loader as rootLoader } from '../../../src/loader';
import { loader as editorLoader, PageModeType } from '../../../src/components/editor-page/loader';
import { analyticsLogger, appLogger } from '../../../src/utils/logger';
import { initAppConfig, resetAppConfig } from './helpers/app-config';
import { flushPromises, installWebCrypto } from './helpers/axios-stub';

const metadata = (overrides: Partial<MapMetadata> = {}): MapMetadata => ({
  id: 5,
  title: 'My map',
  creatorFullName: 'Ana',
  isLocked: false,
  jsonProps: '{ "zoom": 1.2 }',
  role: 'editor',
  ...overrides,
});

const fakeClient = (fetchMapMetadata: jest.Mock, fetchAccountInfo = jest.fn()): Client =>
  ({ fetchMapMetadata, fetchAccountInfo }) as unknown as Client;

const runLoader = (
  pageMode: PageModeType,
  id: string | undefined,
  bootstrap = false,
  hid?: string,
) =>
  editorLoader(
    pageMode,
    bootstrap,
  )({
    params: id === undefined ? {} : hid === undefined ? { id } : { id, hid },
  } as unknown as LoaderFunctionArgs);

let removeWebCrypto: () => void;
beforeAll(() => {
  removeWebCrypto = installWebCrypto();
  // Real retries back off for seconds; the retry policy itself is tested on its own.
  const defaults = queryClient.getDefaultOptions();
  queryClient.setDefaultOptions({ ...defaults, queries: { ...defaults.queries, retry: false } });
});

afterAll(() => {
  removeWebCrypto();
  resetAppConfig();
  JwtTokenConfig.removeToken();
});

beforeEach(async () => {
  queryClient.clear();
  JwtTokenConfig.removeToken();
  jest.spyOn(appLogger, 'warn').mockImplementation(() => undefined);
  jest.spyOn(analyticsLogger, 'warn').mockImplementation(() => undefined);
  jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  await initAppConfig();
});

describe('root loader', () => {
  it('initializes the config and does not start analytics without an account', async () => {
    const initialize = jest.spyOn(ReactGA, 'initialize');

    const response = await rootLoader();

    await expect(response.json()).resolves.toBe('Load success');
    expect(initialize).not.toHaveBeenCalled();
  });

  it('starts analytics with the configured account', async () => {
    await initAppConfig({ analyticsAccount: 'G-XYZ' });
    const initialize = jest.spyOn(ReactGA, 'initialize');
    const getClient = jest.spyOn(AppConfig, 'getClient');

    await rootLoader();

    expect(initialize).toHaveBeenCalledWith([{ trackingId: 'G-XYZ' }]);
    // Nobody is signed in, so the account is not looked up.
    expect(getClient).not.toHaveBeenCalled();
  });

  it('identifies a signed-in user to analytics', async () => {
    await initAppConfig({ analyticsAccount: 'G-XYZ' });
    JwtTokenConfig.storeToken('tok');
    const fetchAccountInfo = jest.fn().mockResolvedValue({ email: 'me@x.y' });
    jest.spyOn(AppConfig, 'getClient').mockReturnValue(fakeClient(jest.fn(), fetchAccountInfo));
    const set = jest.spyOn(ReactGA, 'set');

    await rootLoader();
    await flushPromises();
    await flushPromises();

    expect(fetchAccountInfo).toHaveBeenCalled();
    expect(set).toHaveBeenCalledWith({ userId: expect.stringMatching(/^[0-9a-f]{64}$/) });
  });

  it('still loads when the account can not be fetched', async () => {
    await initAppConfig({ analyticsAccount: 'G-XYZ' });
    JwtTokenConfig.storeToken('tok');
    const fetchAccountInfo = jest.fn().mockRejectedValue({ msg: 'down' });
    jest.spyOn(AppConfig, 'getClient').mockReturnValue(fakeClient(jest.fn(), fetchAccountInfo));

    const response = await rootLoader();
    await flushPromises();

    expect(response.status).toBe(200);
    expect(appLogger.warn).toHaveBeenCalledWith('Failed to set analytics user ID on app load:', {
      msg: 'down',
    });
  });
});

describe('editor page loader', () => {
  const useClient = (fetchMapMetadata: jest.Mock) =>
    jest.spyOn(AppConfig, 'getClient').mockReturnValue(fakeClient(fetchMapMetadata));

  it.each([undefined, 'undefined'])('rejects a missing map id (%s) with a 400', async (id) => {
    useClient(jest.fn());

    const response = await runLoader('edit', id);

    expect(response.status).toBe(400);
    await expect(response.text()).resolves.toBe('Map ID is required');
  });

  it('rejects a non-numeric map id with a 400', async () => {
    useClient(jest.fn());

    const response = await runLoader('edit', 'abc');

    expect(response.status).toBe(400);
    await expect(response.text()).resolves.toBe('Invalid map ID');
  });

  it('serves the showcase map for the try page without calling the backend', async () => {
    const fetchMapMetadata = jest.fn();
    useClient(fetchMapMetadata);

    const response = await runLoader('try', '3');

    await expect(response.json()).resolves.toMatchObject({
      editorMode: 'showcase',
      zoom: 0.8,
      mapMetadata: { id: 3, title: 'What is WiseMapping ?' },
    });
    expect(fetchMapMetadata).not.toHaveBeenCalled();
  });

  it('opens an editable map with the role-based mode and the saved zoom', async () => {
    const fetchMapMetadata = jest.fn().mockResolvedValue(metadata());
    useClient(fetchMapMetadata);

    const response = await runLoader('edit', '5');

    await expect(response.json()).resolves.toEqual({
      editorMode: 'edition-editor',
      mapMetadata: metadata(),
      zoom: 1.2,
    });
    expect(fetchMapMetadata).toHaveBeenCalledWith(5, false);
  });

  it('reuses the cached metadata for the same map', async () => {
    const fetchMapMetadata = jest.fn().mockResolvedValue(metadata());
    useClient(fetchMapMetadata);

    await runLoader('edit', '5');
    await runLoader('edit', '5');

    expect(fetchMapMetadata).toHaveBeenCalledTimes(1);
  });

  it('opens a locked map read-only', async () => {
    useClient(jest.fn().mockResolvedValue(metadata({ isLocked: true })));

    const response = await runLoader('edit', '5');

    await expect(response.json()).resolves.toMatchObject({ editorMode: 'viewonly-private' });
  });

  it('opens a map read-only for a user who is no collaborator', async () => {
    // A public map opened at /edit by someone it is not shared with: the backend says role
    // "none". An editable canvas would save to a read-only store and silently drop every edit.
    useClient(jest.fn().mockResolvedValue(metadata({ role: 'none' })));

    const response = await runLoader('edit', '5');

    await expect(response.json()).resolves.toMatchObject({ editorMode: 'viewonly-public' });
  });

  it('opens a locked map of somebody else read-only through the public view', async () => {
    useClient(jest.fn().mockResolvedValue(metadata({ role: 'none', isLocked: true })));

    const response = await runLoader('edit', '5');

    await expect(response.json()).resolves.toMatchObject({ editorMode: 'viewonly-public' });
  });

  it('does not bootstrap a history revision with the current map', async () => {
    const fetchMapMetadata = jest.fn().mockResolvedValue(metadata({ xml: '<current/>' }));
    useClient(fetchMapMetadata);

    const data = await (await runLoader('view-private', '5', true, '55')).json();

    // The editor then loads revision 55 from its own URL.
    expect(data.bootstrapXML).toBeUndefined();
    expect(fetchMapMetadata).toHaveBeenCalledWith(5, false);
  });

  it('opens the private view read-only', async () => {
    useClient(jest.fn().mockResolvedValue(metadata({ role: 'owner' })));

    const response = await runLoader('view-private', '5');

    await expect(response.json()).resolves.toMatchObject({ editorMode: 'viewonly-private' });
  });

  it.each([
    ['empty props', ''],
    ['blank props', '   '],
    ['props without zoom', '{"x": 1}'],
    ['a non-numeric zoom', '{"zoom": "big"}'],
    ['invalid JSON', '{zoom'],
    ['a null value', 'null'],
  ])('falls back to the default zoom for %s', async (_name, jsonProps) => {
    useClient(jest.fn().mockResolvedValue(metadata({ jsonProps })));

    const response = await runLoader('edit', '5');

    await expect(response.json()).resolves.toMatchObject({ zoom: 0.8 });
  });

  it('passes the map XML along when bootstrapping', async () => {
    const fetchMapMetadata = jest.fn().mockResolvedValue(metadata({ xml: '<map/>' }));
    useClient(fetchMapMetadata);

    const response = await runLoader('edit', '5', true);

    await expect(response.json()).resolves.toMatchObject({ bootstrapXML: '<map/>' });
    expect(fetchMapMetadata).toHaveBeenCalledWith(5, true);
  });

  it('bootstraps without XML when the server sends none', async () => {
    useClient(jest.fn().mockResolvedValue(metadata()));

    const data = await (await runLoader('edit', '5', true)).json();

    expect(data.bootstrapXML).toBeUndefined();
  });

  it('redirects to the login, keeping the current url, on an auth error', async () => {
    window.history.pushState({}, '', '/c/maps/5/edit?zoom=2');
    useClient(jest.fn().mockRejectedValue({ isAuth: true, status: 403 }));

    const response = await runLoader('edit', '5');

    expect(response.status).toBe(302);
    expect(response.headers.get('Location')).toBe(
      `/c/login?redirect=${encodeURIComponent('/c/maps/5/edit?zoom=2')}`,
    );
    window.history.pushState({}, '', '/');
  });

  it('rethrows other errors of the private pages', async () => {
    const error = { msg: 'Not found', status: 404 };
    useClient(jest.fn().mockRejectedValue(error));

    await expect(runLoader('view-private', '5')).rejects.toEqual(error);
  });

  it('opens a public map read-only with the default zoom', async () => {
    useClient(jest.fn().mockResolvedValue(metadata({ xml: '<map/>' })));

    const plain = await (await runLoader('view-public', '5')).json();
    expect(plain).toMatchObject({ editorMode: 'viewonly-public', zoom: 0.8 });
    expect(plain.bootstrapXML).toBeUndefined();

    queryClient.clear();
    const boot = await (await runLoader('view-public', '5', true)).json();
    expect(boot.bootstrapXML).toBe('<map/>');
  });

  it('answers a removed public map with a 410 response', async () => {
    useClient(jest.fn().mockRejectedValue({ status: 410, msg: 'Flagged as spam' }));

    const thrown = await runLoader('view-public', '5').catch((e: unknown) => e);

    expect(thrown).toBeInstanceOf(Response);
    expect((thrown as Response).status).toBe(410);
    await expect((thrown as Response).text()).resolves.toBe('Flagged as spam');
  });

  it('uses a default message for a removed public map without one', async () => {
    useClient(jest.fn().mockRejectedValue({ status: 410 }));

    const thrown = (await runLoader('view-public', '5').catch((e: unknown) => e)) as Response;

    await expect(thrown.text()).resolves.toBe(
      'The map you are looking for is no longer available.',
    );
  });

  it('rethrows other errors of the public page', async () => {
    const plainError = new Error('boom');
    useClient(jest.fn().mockRejectedValueOnce({ status: 500 }).mockRejectedValueOnce(plainError));

    await expect(runLoader('view-public', '5')).rejects.toEqual({ status: 500 });
    queryClient.clear();
    await expect(runLoader('view-public', '5')).rejects.toBe(plainError);
  });

  it('fails on an unknown page mode', async () => {
    useClient(jest.fn());

    await expect(runLoader('other' as PageModeType, '5')).rejects.toThrow('other');
  });
});
