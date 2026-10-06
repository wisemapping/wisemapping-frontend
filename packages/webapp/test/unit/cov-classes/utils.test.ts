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

import { getCsrfToken, getCsrfTokenParameter, logCriticalError } from '../../../src/utils';
import { appLogger } from '../../../src/utils/logger';

const addMeta = (name: string, content?: string): HTMLMetaElement => {
  const meta = document.createElement('meta');
  meta.setAttribute('name', name);
  if (content !== undefined) {
    meta.setAttribute('content', content);
  }
  document.head.appendChild(meta);
  return meta;
};

describe('CSRF helpers', () => {
  afterEach(() => {
    document.head.innerHTML = '';
  });

  it('return an empty string when the page has no CSRF meta tags', () => {
    expect(getCsrfToken()).toBe('');
    expect(getCsrfTokenParameter()).toBe('');
  });

  it('read the token and parameter name from the meta tags', () => {
    addMeta('_csrf', 'tok-1');
    addMeta('_csrf_parameter', '_csrf');

    expect(getCsrfToken()).toBe('tok-1');
    expect(getCsrfTokenParameter()).toBe('_csrf');
  });

  it('return null for a meta tag without content', () => {
    addMeta('_csrf');
    addMeta('_csrf_parameter');

    expect(getCsrfToken()).toBeNull();
    expect(getCsrfTokenParameter()).toBeNull();
  });
});

describe('logCriticalError', () => {
  let logged: jest.SpyInstance;
  const noticeError = jest.fn();

  beforeEach(() => {
    logged = jest.spyOn(appLogger, 'error').mockImplementation(() => undefined);
    noticeError.mockReset();
    window.newrelic = { noticeError };
  });

  afterAll(() => {
    delete (window as unknown as { newrelic?: unknown }).newrelic;
  });

  /** The single message reported to New Relic. */
  const reported = (): string => noticeError.mock.calls[0][0] as string;
  /** The JSON part of the reported message. */
  const reportedJson = (): Record<string, unknown> =>
    JSON.parse(reported().split('. Exception: ')[1]);

  it('serializes an Error with its name, message and stack', () => {
    const error = new TypeError('broken');

    logCriticalError('Saving failed', error);

    expect(reported().startsWith('Saving failed. Exception: ')).toBe(true);
    expect(reportedJson()).toEqual({
      name: 'TypeError',
      message: 'broken',
      stack: error.stack,
    });
    expect(logged).toHaveBeenCalledWith(reported());
    expect(logged).toHaveBeenCalledWith('Exception details:', error);
  });

  it('serializes an ErrorInfo without its field values', () => {
    logCriticalError('Request failed', {
      msg: 'Bad',
      status: 400,
      isAuth: false,
      fields: { email: 'me@x.y' },
    });

    expect(reportedJson()).toEqual({ isAuth: false, msg: 'Bad', status: 400 });
  });

  it('serializes a debug object and redacts personal context keys', () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;

    logCriticalError('Map failed', {
      errorInfo: { msg: 'Gone', status: 410, fields: { name: 'x' } },
      context: {
        mapId: 5,
        isPublic: true,
        email: 'me@x.y',
        userName: 'Ana',
        empty: null,
        missing: undefined,
        nested: { a: 1 },
        circular,
      },
    });

    expect(reportedJson()).toEqual({
      errorInfo: { msg: 'Gone', status: 410 },
      context: {
        mapId: 5,
        isPublic: true,
        email: '[redacted]',
        userName: '[redacted]',
        empty: null,
        nested: { a: 1 },
        circular: '[object Object]',
      },
    });
  });

  it('serializes a plain object as JSON', () => {
    logCriticalError('Odd', { code: 'E1', count: 2 });

    expect(reportedJson()).toEqual({ code: 'E1', count: 2 });
  });

  it('keeps what it can of an object that can not be serialized', () => {
    const circular: Record<string, unknown> = { label: 'loop', n: 1, nothing: null };
    circular.self = circular;
    circular.inner = { ok: true };
    circular.big = BigInt(1);

    logCriticalError('Odd', circular);

    expect(reportedJson()).toEqual({
      label: 'loop',
      n: 1,
      nothing: null,
      self: '[object]',
      inner: { ok: true },
      big: '[bigint]',
    });
  });

  it('falls back to the key list when even the ErrorInfo can not be serialized', () => {
    logCriticalError('Odd', { msg: 'x', status: BigInt(500) });

    expect(reported()).toBe('Odd. Exception: [Object with keys: msg, status]');
  });

  it('falls back to name and message when an Error can not be serialized', () => {
    const error = new Error('loop');
    Object.defineProperty(error, 'stack', { value: BigInt(1) });

    logCriticalError('Odd', error);

    expect(reported()).toBe('Odd. Exception: Error: Error - loop');
  });

  it('stringifies primitives', () => {
    logCriticalError('Odd', 'just text');
    logCriticalError('Odd', null);

    expect(noticeError.mock.calls.map((c) => c[0])).toEqual([
      'Odd. Exception: just text',
      'Odd. Exception: null',
    ]);
  });

  it('still logs when New Relic is not loaded', () => {
    delete (window as unknown as { newrelic?: unknown }).newrelic;

    logCriticalError('Offline', 'x');

    expect(logged).toHaveBeenCalledWith('Offline. Exception: x');
  });
});
