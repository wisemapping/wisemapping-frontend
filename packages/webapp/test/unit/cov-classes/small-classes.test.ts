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

import MapInfoImpl from '../../../src/classes/editor-map-info';
import JwtTokenConfig from '../../../src/classes/jwt-token-config';
import LocalStorageThemeVariantStorage from '../../../src/services/ThemeVariantStorage';
import { shouldRetryQuery, queryClient } from '../../../src/queryClient';
import Client from '../../../src/classes/client';
import { appLogger } from '../../../src/utils/logger';

describe('MapInfoImpl', () => {
  const build = (client: Partial<Client>, starred?: boolean, id = 4) =>
    new MapInfoImpl(id, client as Client, 'Title', 'Ana Li', true, 'Locked by Bo', 1.5, starred);

  it('exposes the map details it was built with', () => {
    const info = build({});

    expect(info.getId()).toBe('4');
    expect(info.getTitle()).toBe('Title');
    expect(info.getCreatorFullName()).toBe('Ana Li');
    expect(info.isLocked()).toBe(true);
    expect(info.getLockedMessage()).toBe('Locked by Bo');
    expect(info.getZoom()).toBe(1.5);
  });

  it('reports no locked message when there is none', () => {
    const info = new MapInfoImpl(1, {} as Client, 't', 'c', false, undefined, 1);

    expect(info.getLockedMessage()).toBe('');
  });

  it('isStarred answers the known value, or false when unknown', async () => {
    await expect(build({}, true).isStarred()).resolves.toBe(true);
    await expect(build({}).isStarred()).resolves.toBe(false);
  });

  it('updateStarred puts the star back when saving it fails', async () => {
    const updateStarred = jest.fn().mockRejectedValue({ msg: 'down' });
    const info = build({ updateStarred }, false);

    await expect(info.updateStarred(true)).rejects.toEqual({ msg: 'down' });

    await expect(info.isStarred()).resolves.toBe(false);
  });

  it('updateStarred saves through the client and is reflected right away', async () => {
    const updateStarred = jest.fn().mockResolvedValue(undefined);
    const info = build({ updateStarred }, false);

    await info.updateStarred(true);

    expect(updateStarred).toHaveBeenCalledWith(4, true);
    await expect(info.isStarred()).resolves.toBe(true);
  });

  it('updateTitle trims and saves the new title', async () => {
    const renameMap = jest.fn().mockResolvedValue(undefined);
    const info = build({ renameMap });

    await info.updateTitle('  New title  ');

    expect(renameMap).toHaveBeenCalledWith(4, { title: 'New title' });
    expect(info.getTitle()).toBe('New title');
  });

  it('updateTitle restores the old title when saving fails', async () => {
    const error = { msg: 'Taken' };
    const info = build({ renameMap: jest.fn().mockRejectedValue(error) });

    await expect(info.updateTitle('Other')).rejects.toBe(error);

    expect(info.getTitle()).toBe('Title');
  });

  it('updateTitle refuses an invalid map id', async () => {
    const renameMap = jest.fn();
    const info = build({ renameMap }, undefined, Number.NaN);

    await expect(info.updateTitle('x')).rejects.toThrow('Invalid map ID: NaN');
    expect(renameMap).not.toHaveBeenCalled();
  });

  it('updateMetadata changes only the provided fields', async () => {
    const info = build({}, false);

    info.updateMetadata({});
    expect(info.isLocked()).toBe(true);
    expect(info.getZoom()).toBe(1.5);

    info.updateMetadata({
      locked: false,
      lockedMsg: '',
      zoom: 0.5,
      starred: true,
      creatorFullName: 'Bo',
    });

    expect(info.isLocked()).toBe(false);
    expect(info.getLockedMessage()).toBe('');
    expect(info.getZoom()).toBe(0.5);
    expect(info.getCreatorFullName()).toBe('Bo');
    await expect(info.isStarred()).resolves.toBe(true);
  });
});

describe('JwtTokenConfig', () => {
  afterEach(() => {
    JwtTokenConfig.removeToken();
  });

  it('stores, reads and removes the session token cookie', () => {
    expect(JwtTokenConfig.retreiveToken()).toBeUndefined();

    JwtTokenConfig.storeToken('abc.def');
    expect(JwtTokenConfig.retreiveToken()).toBe('abc.def');
    expect(document.cookie).toContain('jwt-auth-token=abc.def');

    JwtTokenConfig.removeToken();
    expect(JwtTokenConfig.retreiveToken()).toBeUndefined();
  });

  it('removing the token also drops the server session cookie', () => {
    document.cookie = 'JSESSIONID=xyz; path=/';
    JwtTokenConfig.storeToken('t');

    JwtTokenConfig.removeToken();

    expect(document.cookie).not.toContain('JSESSIONID');
  });
});

describe('LocalStorageThemeVariantStorage', () => {
  const storages: LocalStorageThemeVariantStorage[] = [];
  const create = () => {
    const storage = new LocalStorageThemeVariantStorage();
    storages.push(storage);
    return storage;
  };
  const storageEvent = (key: string, newValue: string | null) =>
    window.dispatchEvent(new StorageEvent('storage', { key, newValue }));

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    storages.splice(0).forEach((s) => s.destroy());
  });

  it('defaults to light and ignores unknown stored values', () => {
    const storage = create();
    expect(storage.getThemeVariant()).toBe('light');

    localStorage.setItem('themeMode', 'purple');
    expect(storage.getThemeVariant()).toBe('light');

    localStorage.setItem('themeMode', 'dark');
    expect(storage.getThemeVariant()).toBe('dark');
  });

  it('saves the variant and notifies subscribers until they unsubscribe', () => {
    const storage = create();
    const listener = jest.fn();
    const unsubscribe = storage.subscribe(listener);

    storage.setThemeVariant('dark');
    expect(localStorage.getItem('themeMode')).toBe('dark');
    expect(listener).toHaveBeenCalledWith('dark');

    unsubscribe();
    storage.setThemeVariant('light');
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('follows changes made in other tabs', () => {
    const storage = create();
    const listener = jest.fn();
    storage.subscribe(listener);

    storageEvent('themeMode', 'dark');
    storageEvent('themeMode', 'sepia');
    storageEvent('themeMode', null);
    storageEvent('other', 'light');

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith('dark');
  });

  it('falls back to light, and keeps going, when localStorage is unavailable', () => {
    const warn = jest.spyOn(appLogger, 'warn').mockImplementation(() => undefined);
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied');
    });
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('denied');
    });
    const storage = create();
    const listener = jest.fn();
    storage.subscribe(listener);

    expect(storage.getThemeVariant()).toBe('light');
    expect(() => storage.setThemeVariant('dark')).not.toThrow();
    expect(listener).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledTimes(2);
  });

  it('destroy drops every subscriber', () => {
    const storage = create();
    const listener = jest.fn();
    storage.subscribe(listener);

    storage.destroy();
    storage.setThemeVariant('dark');

    expect(listener).not.toHaveBeenCalled();
  });

  // destroy() used to remove a freshly bound function, so the constructor's listener stayed on
  // window forever.
  it('destroy stops listening to storage events', () => {
    const add = jest.spyOn(window, 'addEventListener');
    const remove = jest.spyOn(window, 'removeEventListener');
    const storage = new LocalStorageThemeVariantStorage();
    const added = add.mock.calls.find(([type]) => type === 'storage')?.[1];

    storage.destroy();

    expect(remove).toHaveBeenCalledWith('storage', added);
  });
});

describe('queryClient retry policy', () => {
  it.each([400, 401, 403, 404, 409, 410, 422])('never retries a %s', (status) => {
    // A request the server refused will be refused again: retrying a deleted (410) or spam
    // (422) map only delayed its error page by 1 + 2 + 4 seconds.
    expect(shouldRetryQuery(0, { status })).toBe(false);
  });

  it.each([429, 500, 502, 503])('retries a %s, which may pass next time', (status) => {
    expect(shouldRetryQuery(0, { status })).toBe(true);
  });

  it('never retries an auth error', () => {
    expect(shouldRetryQuery(0, { isAuth: true, status: 500 })).toBe(false);
  });

  it('retries other failures up to three times', () => {
    expect(shouldRetryQuery(0, { status: 500 })).toBe(true);
    expect(shouldRetryQuery(2, { msg: 'offline' })).toBe(true);
    expect(shouldRetryQuery(3, { status: 500 })).toBe(false);
    expect(shouldRetryQuery(1, undefined)).toBe(true);
    expect(shouldRetryQuery(1, new Error('boom'))).toBe(true);
  });

  it('is the default policy of the shared client, with a five minute stale time', () => {
    const defaults = queryClient.getDefaultOptions().queries;

    expect(defaults?.retry).toBe(shouldRetryQuery);
    expect(defaults?.staleTime).toBe(5 * 60 * 1000);
    expect(defaults?.refetchIntervalInBackground).toBe(false);
  });
});
