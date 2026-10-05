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
import LocalStorageManager from '../../../src/components/LocalStorageManager';
import PersistenceManager, { PersistenceError } from '../../../src/components/PersistenceManager';

const MAP_XML = '<map version="tango"><topic central="true" text="Central" id="1"/></map>';
const STORED_XML = '<map version="tango"><topic central="true" text="Stored" id="1"/></map>';

const ok = (body: string) => ({ ok: true, status: 200, text: async () => body }) as Response;

let fetchMock: jest.Mock;
const originalFetch = global.fetch;

beforeEach(() => {
  localStorage.clear();
  fetchMock = jest.fn(async () => ok(MAP_XML));
  global.fetch = fetchMock as unknown as typeof fetch;
});

afterEach(() => {
  global.fetch = originalFetch;
  jest.useRealTimers();
  jest.restoreAllMocks();
});

const centralText = async (manager: PersistenceManager, id = 'm1') =>
  (await manager.load(id)).getCentralTopic().getText();

describe('LocalStorageManager loading', () => {
  it('fetches the map from the document url, with the map id in it', async () => {
    const manager = new LocalStorageManager('/maps/{id}.xml', false, undefined);
    expect(await centralText(manager)).toBe('Central');
    expect(fetchMock.mock.calls[0][0]).toBe('/maps/m1.xml');
    const headers = (fetchMock.mock.calls[0][1] as RequestInit).headers as Record<string, string>;
    expect(headers.Accept).toBe('application/xml');
    expect(headers.Authorization).toBeUndefined();
  });

  it('sends the token as a bearer authorization', async () => {
    const manager = new LocalStorageManager('/maps/{id}.xml', false, 'tok');
    await manager.load('m1');
    const headers = (fetchMock.mock.calls[0][1] as RequestInit).headers as Record<string, string>;
    // Browsers trim the trailing space the manager leaves after the token.
    expect(headers.Authorization.trim()).toBe('Bearer tok');
  });

  it('prefers the map stored by a writable manager, unless forced to load', async () => {
    localStorage.setItem('m1-xml', STORED_XML);
    expect(await centralText(new LocalStorageManager('/{id}', false, undefined, false))).toBe(
      'Stored',
    );
    expect(fetchMock).not.toHaveBeenCalled();

    expect(await centralText(new LocalStorageManager('/{id}', true, undefined, false))).toBe(
      'Central',
    );
  });

  it('ignores the local storage when read-only', async () => {
    localStorage.setItem('m1-xml', STORED_XML);
    expect(await centralText(new LocalStorageManager('/{id}', false, undefined))).toBe('Central');
  });

  it('rejects on an HTTP error', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    fetchMock.mockResolvedValueOnce({ ok: false, status: 404, statusText: 'Not Found' });
    await expect(new LocalStorageManager('/{id}', false, undefined).load('m1')).rejects.toThrow(
      'load error: 404, Not Found',
    );
  });

  it('retries a failed fetch three times, half a second apart', async () => {
    jest.useFakeTimers();
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    fetchMock
      .mockRejectedValueOnce(new TypeError('offline'))
      .mockRejectedValueOnce(new TypeError('offline'))
      .mockResolvedValueOnce(ok(MAP_XML));

    const loaded = new LocalStorageManager('/{id}', false, undefined).load('m1');
    await jest.advanceTimersByTimeAsync(1000);
    expect((await loaded).getCentralTopic().getText()).toBe('Central');
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('gives up after the third retry', async () => {
    jest.useFakeTimers();
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    fetchMock.mockRejectedValue(new TypeError('offline'));

    const loaded = new LocalStorageManager('/{id}', false, undefined).load('m1');
    const assertion = expect(loaded).rejects.toThrow('offline');
    await jest.advanceTimersByTimeAsync(1500);
    await assertion;
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });
});

describe('LocalStorageManager discarding changes', () => {
  it('drops the stored map of a writable manager', () => {
    localStorage.setItem('m1-xml', STORED_XML);
    new LocalStorageManager('/{id}', false, undefined, false).discardChanges('m1');
    expect(localStorage.getItem('m1-xml')).toBeNull();
  });

  it('leaves the local storage alone when read-only', () => {
    localStorage.setItem('m1-xml', STORED_XML);
    const manager = new LocalStorageManager('/{id}', false, undefined);
    manager.discardChanges('m1');
    manager.unlockMap();
    expect(localStorage.getItem('m1-xml')).toBe(STORED_XML);
  });
});

describe('PersistenceManager error handlers', () => {
  const error: PersistenceError = { errorType: 'auth', severity: 'SEVERE', message: 'expired' };

  it('notifies every handler, until it is removed', () => {
    const manager = new LocalStorageManager('/{id}', false, undefined);
    const first = jest.fn();
    const second = jest.fn();
    manager.addErrorHandler(first);
    manager.addErrorHandler(second);

    manager.triggerError(error);
    expect(first).toHaveBeenCalledWith(error);
    expect(second).toHaveBeenCalledWith(error);

    manager.removeErrorHandler(first);
    manager.removeErrorHandler(jest.fn());
    manager.triggerError(error);
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(2);
  });

  it('removes every handler when none is given', () => {
    const manager = new LocalStorageManager('/{id}', false, undefined);
    const handler = jest.fn();
    manager.addErrorHandler(handler);
    manager.removeErrorHandler();
    manager.triggerError(error);
    expect(handler).not.toHaveBeenCalled();
  });
});
