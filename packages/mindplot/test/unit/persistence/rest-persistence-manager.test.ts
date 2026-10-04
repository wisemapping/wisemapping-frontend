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
import RESTPersistenceManager from '../../../src/components/RestPersistenceManager';
import { PersistenceError } from '../../../src/components/PersistenceManager';

type FakeResponse = {
  ok: boolean;
  status: number;
  statusText: string;
  headers: Headers;
  text: () => Promise<string>;
};

const buildResponse = (status: number, body = '', contentType?: string): FakeResponse => ({
  ok: status >= 200 && status < 300,
  status,
  statusText: '',
  headers: new Headers(contentType ? { 'Content-Type': contentType } : {}),
  text: () => Promise.resolve(body),
});

type Deferred = {
  resolve: (response: FakeResponse) => void;
  reject: (error: Error) => void;
};

const flushPromises = async (): Promise<void> => {
  for (let i = 0; i < 20; i++) {
    // eslint-disable-next-line no-await-in-loop
    await Promise.resolve();
  }
};

const buildDoc = (text: string): Document =>
  new DOMParser().parseFromString(`<map><topic central="true" text="${text}"/></map>`, 'text/xml');

const buildEvents = () => ({ onSuccess: jest.fn(), onError: jest.fn() });

const sentXml = (call: unknown[]): string => {
  const body = (call[1] as RequestInit).body as Blob;
  return (body as unknown as { __json: string }).__json;
};

describe('RESTPersistenceManager', () => {
  let manager: RESTPersistenceManager;
  let fetchMock: jest.Mock;
  let pending: Deferred[];
  let OriginalBlob: typeof Blob;

  beforeEach(() => {
    jest.useFakeTimers();
    pending = [];
    fetchMock = jest.fn(
      () =>
        new Promise<FakeResponse>((resolve, reject) => {
          pending.push({ resolve, reject });
        }),
    );
    global.fetch = fetchMock as unknown as typeof fetch;

    // Keep the JSON payload readable from the test.
    OriginalBlob = global.Blob;
    global.Blob = class {
      __json: string;

      constructor(parts: string[]) {
        this.__json = parts.join('');
      }
    } as unknown as typeof Blob;

    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);

    manager = new RESTPersistenceManager({
      documentUrl: '/maps/{id}/document',
      revertUrl: '/maps/{id}/revert',
      lockUrl: '/maps/{id}/lock',
    });
  });

  afterEach(() => {
    global.Blob = OriginalBlob;
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe('save rate limiting (D3)', () => {
    it('does not drop a save requested while another is in flight', async () => {
      const first = buildEvents();
      const second = buildEvents();

      manager.saveMapXml('1', buildDoc('first'), '{}', false, first);
      manager.saveMapXml('1', buildDoc('second'), '{}', false, second);
      expect(fetchMock).toHaveBeenCalledTimes(1);

      pending[0].resolve(buildResponse(200));
      await flushPromises();
      expect(first.onSuccess).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(10000);
      await flushPromises();
      expect(fetchMock).toHaveBeenCalledTimes(2);
      expect(JSON.parse(sentXml(fetchMock.mock.calls[1])).xml).toContain('second');

      pending[1].resolve(buildResponse(200));
      await flushPromises();
      expect(second.onSuccess).toHaveBeenCalledTimes(1);
      expect(second.onError).not.toHaveBeenCalled();
    });

    it('coalesces saves queued during an in-flight save into one request with the latest payload', async () => {
      const first = buildEvents();
      const second = buildEvents();
      const third = buildEvents();

      manager.saveMapXml('1', buildDoc('first'), '{}', false, first);
      manager.saveMapXml('1', buildDoc('second'), '{}', true, second);
      manager.saveMapXml('1', buildDoc('third'), '{}', false, third);

      pending[0].resolve(buildResponse(200));
      await flushPromises();
      jest.advanceTimersByTime(10000);
      await flushPromises();

      expect(fetchMock).toHaveBeenCalledTimes(2);
      const [url] = fetchMock.mock.calls[1];
      // One of the coalesced callers asked for a history entry.
      expect(url).toBe('/maps/1/document?minor=false');
      expect(JSON.parse(sentXml(fetchMock.mock.calls[1])).xml).toContain('third');

      pending[1].resolve(buildResponse(200));
      await flushPromises();
      expect(second.onSuccess).toHaveBeenCalledTimes(1);
      expect(third.onSuccess).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(60000);
      await flushPromises();
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('keeps at most one write every 10 seconds', async () => {
      manager.saveMapXml('1', buildDoc('first'), '{}', false, buildEvents());
      pending[0].resolve(buildResponse(200));
      await flushPromises();

      manager.saveMapXml('1', buildDoc('second'), '{}', false, buildEvents());
      jest.advanceTimersByTime(9999);
      await flushPromises();
      expect(fetchMock).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(1);
      await flushPromises();
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('settles every coalesced caller with the error of the failed save', async () => {
      const first = buildEvents();
      const second = buildEvents();
      const third = buildEvents();
      const errorHandler = jest.fn();
      manager.addErrorHandler(errorHandler);

      manager.saveMapXml('1', buildDoc('first'), '{}', false, first);
      manager.saveMapXml('1', buildDoc('second'), '{}', false, second);
      manager.saveMapXml('1', buildDoc('third'), '{}', false, third);
      pending[0].resolve(buildResponse(200));
      await flushPromises();
      jest.advanceTimersByTime(10000);
      await flushPromises();

      pending[1].reject(new Error('network down'));
      await flushPromises();
      expect(second.onError).toHaveBeenCalledTimes(1);
      expect(third.onError).toHaveBeenCalledTimes(1);
      expect(second.onError.mock.calls[0][0].errorType).toBe('unexpected');
      expect(errorHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('server error parsing (D8)', () => {
    const saveAndFail = async (response: FakeResponse): Promise<PersistenceError> => {
      const events = buildEvents();
      manager.saveMapXml('1', buildDoc('x'), '{}', false, events);
      pending[0].resolve(response);
      await flushPromises();
      expect(events.onError).toHaveBeenCalledTimes(1);
      return events.onError.mock.calls[0][0];
    };

    it('does not JSON-parse an HTML error page', async () => {
      const error = await saveAndFail(
        buildResponse(502, '<html><body>Bad Gateway</body></html>', 'text/html'),
      );
      expect(error.severity).toBe('FATAL');
      expect(error.errorType).toBe('expected');
    });

    it('reads the message of a JSON server error', async () => {
      const error = await saveAndFail(
        buildResponse(
          400,
          JSON.stringify({ globalSeverity: 'WARNING', globalErrors: ['Map is locked'] }),
          'application/json; charset=utf-8',
        ),
      );
      expect(error).toEqual({
        severity: 'WARNING',
        errorType: 'expected',
        message: 'Map is locked',
      });
    });

    it('tolerates a JSON server error without globalErrors', async () => {
      const error = await saveAndFail(
        buildResponse(400, JSON.stringify({ globalSeverity: 'SEVERE' }), 'application/json'),
      );
      expect(error.errorType).toBe('expected');
      expect(error.severity).toBe('SEVERE');
      expect(typeof error.message).toBe('string');
    });
  });

  describe('loadMapDom (D8)', () => {
    it('rejects when the server returns a document that is not well-formed XML', async () => {
      const result = manager.loadMapDom('1');
      pending[0].resolve(buildResponse(200, '<html><body>Bad <b>gateway</body></html>'));
      await expect(result).rejects.toThrow(/XML/);
    });

    it('loads a well-formed map', async () => {
      const result = manager.loadMapDom('1');
      pending[0].resolve(buildResponse(200, '<map><topic central="true"/></map>'));
      const doc = await result;
      expect(doc.documentElement.nodeName).toBe('map');
    });
  });
});
