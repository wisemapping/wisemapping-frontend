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
import { AjaxUtils } from '../../../src/components/util/AjaxUtils';

type FetchCall = [string, RequestInit];

const response = (body: string, status = 200): Response =>
  ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => JSON.parse(body),
    text: async () => body,
  }) as Response;

let fetchMock: jest.Mock<Promise<Response>, FetchCall>;
const originalFetch = global.fetch;

beforeEach(() => {
  fetchMock = jest.fn<Promise<Response>, FetchCall>(async () => response('{"ok":true}'));
  global.fetch = fetchMock as unknown as typeof fetch;
});

afterEach(() => {
  global.fetch = originalFetch;
  jest.useRealTimers();
});

const lastCall = (): FetchCall => fetchMock.mock.calls[fetchMock.mock.calls.length - 1];
const headersOf = (init: RequestInit) => init.headers as Record<string, string>;

describe('AjaxUtils.ajax', () => {
  it('sends a GET with no body and parses JSON by default', async () => {
    await expect(AjaxUtils.ajax({ url: '/api', data: { a: 1 } })).resolves.toEqual({ ok: true });
    const [url, init] = lastCall();
    expect(url).toBe('/api');
    expect(init.method).toBe('GET');
    expect(init.body).toBeUndefined();
  });

  it.each(['POST', 'PUT', 'PATCH'] as const)('sends an object as JSON on %s', async (method) => {
    await AjaxUtils.ajax({ url: '/api', method, data: { a: 1 } });
    const [, init] = lastCall();
    expect(init.body).toBe('{"a":1}');
    expect(headersOf(init)['Content-Type']).toBe('application/json');
  });

  it('form-encodes an object when asked to', async () => {
    await AjaxUtils.ajax({
      url: '/api',
      method: 'POST',
      data: { a: '1', b: 'x y' },
      contentType: 'application/x-www-form-urlencoded',
    });
    const [, init] = lastCall();
    expect(init.body).toBe('a=1&b=x+y');
    expect(headersOf(init)['Content-Type']).toBe('application/x-www-form-urlencoded');
  });

  it('sends other bodies as they are', async () => {
    const blob = new Blob(['<map/>']);
    await AjaxUtils.ajax({ url: '/api', method: 'PUT', data: blob, contentType: 'text/xml' });
    expect(lastCall()[1].body).toBe(blob);

    await AjaxUtils.ajax({ url: '/api', method: 'POST', data: 'raw text' });
    expect(lastCall()[1].body).toBe('raw text');
  });

  it('keeps the caller headers', async () => {
    await AjaxUtils.ajax({ url: '/api', headers: { 'X-Token': 't' } });
    expect(headersOf(lastCall()[1])).toEqual({ 'X-Token': 't' });
  });

  it.each([
    ['text', 'hello'],
    ['html', '<b>hi</b>'],
  ] as const)('returns the %s body as a string', async (dataType, body) => {
    fetchMock.mockResolvedValueOnce(response(body));
    await expect(AjaxUtils.ajax({ url: '/api', dataType })).resolves.toBe(body);
  });

  it('parses an XML body', async () => {
    fetchMock.mockResolvedValueOnce(response('<map name="m"/>'));
    const result = (await AjaxUtils.ajax({ url: '/api', dataType: 'xml' })) as Document;
    expect(result.documentElement.getAttribute('name')).toBe('m');
  });

  it('rejects on an HTTP error status', async () => {
    fetchMock.mockResolvedValueOnce(response('nope', 502));
    await expect(AjaxUtils.ajax({ url: '/api' })).rejects.toThrow('HTTP error! status: 502');
  });

  it('rejects with the fetch error', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    await expect(AjaxUtils.ajax({ url: '/api' })).rejects.toThrow('Failed to fetch');
  });

  it('aborts the request after the timeout', async () => {
    jest.useFakeTimers();
    fetchMock.mockImplementationOnce(
      (_url, init) =>
        new Promise((_resolve, reject) => {
          init.signal!.addEventListener('abort', () => {
            const error = new Error('aborted');
            error.name = 'AbortError';
            reject(error);
          });
        }),
    );

    const result = AjaxUtils.ajax({ url: '/api', timeout: 1000 });
    const assertion = expect(result).rejects.toThrow('Request timeout');
    jest.advanceTimersByTime(1000);
    await assertion;
  });
});

describe('AjaxUtils helpers', () => {
  it('get appends the data as query parameters', async () => {
    await AjaxUtils.get('/api', { q: 'a b' });
    expect(lastCall()[0]).toBe('/api?q=a+b');

    await AjaxUtils.get('/api?x=1', { q: '2' }, 'text');
    expect(lastCall()[0]).toBe('/api?x=1&q=2');

    await AjaxUtils.getJSON('/api');
    expect(lastCall()[0]).toBe('/api');
  });

  it('post sends the data as JSON', async () => {
    await AjaxUtils.post('/api', { a: 1 });
    expect(lastCall()[1]).toEqual(expect.objectContaining({ method: 'POST', body: '{"a":1}' }));
  });

  it('parseXML returns the document, or throws on malformed XML', () => {
    expect(AjaxUtils.parseXML('<a><b/></a>').getElementsByTagName('b')).toHaveLength(1);
    expect(() => AjaxUtils.parseXML('<a><b></a>')).toThrow('XML parsing error');
  });

  it('loadScript resolves when the script loads, and rejects when it fails', async () => {
    const loaded = AjaxUtils.loadScript('https://example.com/a.js');
    const first = document.head.querySelector<HTMLScriptElement>('script[src$="a.js"]')!;
    first.onload!(new Event('load'));
    await expect(loaded).resolves.toBeUndefined();

    const failed = AjaxUtils.loadScript('https://example.com/b.js');
    const second = document.head.querySelector<HTMLScriptElement>('script[src$="b.js"]')!;
    second.onerror!(new Event('error'));
    await expect(failed).rejects.toThrow('Failed to load script: https://example.com/b.js');
  });

  const form = (fields: [string, string][]): HTMLFormElement => {
    const result = document.createElement('form');
    fields.forEach(([name, value]) => {
      const input = document.createElement('input');
      input.name = name;
      input.value = value;
      result.appendChild(input);
    });
    return result;
  };

  it('serializes a form as a query string', () => {
    expect(
      AjaxUtils.serialize(
        form([
          ['a', '1'],
          ['b', 'x y'],
        ]),
      ),
    ).toBe('a=1&b=x+y');
  });

  it('serializes a form to an object, collecting repeated names in an array', () => {
    expect(
      AjaxUtils.serializeObject(
        form([
          ['a', '1'],
          ['b', '2'],
          ['b', '3'],
          ['b', '4'],
        ]),
      ),
    ).toEqual({ a: '1', b: ['2', '3', '4'] });
  });

  // Bug: serializeObject tests `if (result[key])`, so an empty first value is overwritten by the
  // next one instead of being collected (AjaxUtils.ts:202).
  it.failing('keeps an empty value of a repeated name', () => {
    expect(
      AjaxUtils.serializeObject(
        form([
          ['b', ''],
          ['b', '3'],
        ]),
      ),
    ).toEqual({ b: ['', '3'] });
  });
});
