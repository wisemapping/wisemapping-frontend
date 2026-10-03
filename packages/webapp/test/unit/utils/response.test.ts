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

import { createJsonResponse } from '../../../src/utils/response';

describe('createJsonResponse', () => {
  test('serialises the payload as JSON with a JSON content type', async () => {
    const response = createJsonResponse({ id: 7, title: 'Q3 product plan' });

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/json');
    await expect(response.json()).resolves.toEqual({ id: 7, title: 'Q3 product plan' });
  });

  test('honours the status and statusText passed in the init', async () => {
    const response = createJsonResponse({ msg: 'gone' }, { status: 410, statusText: 'Gone' });

    expect(response.status).toBe(410);
    expect(response.statusText).toBe('Gone');
    await expect(response.json()).resolves.toEqual({ msg: 'gone' });
  });

  describe('fallback path (runtime without Response.json)', () => {
    let originalJson: typeof Response.json;

    beforeEach(() => {
      originalJson = Response.json;
      // Older Safari/WebView runtimes ship Response without the static json helper.
      (Response as unknown as { json?: unknown }).json = undefined;
    });

    afterEach(() => {
      Response.json = originalJson;
    });

    test('still produces a JSON response', async () => {
      const response = createJsonResponse({ ok: true });

      expect(response.headers.get('content-type')).toBe('application/json');
      await expect(response.json()).resolves.toEqual({ ok: true });
    });

    test('keeps caller headers supplied as a plain object', () => {
      const response = createJsonResponse({ ok: true }, { headers: { 'X-Trace-Id': 'abc-123' } });

      expect(response.headers.get('x-trace-id')).toBe('abc-123');
      expect(response.headers.get('content-type')).toBe('application/json');
    });

    // Regression guard: merging the init headers with an object spread instead of
    // `new Headers(init?.headers)` silently discards every header when the caller
    // passes a Headers instance.
    test('keeps caller headers supplied as a Headers instance', () => {
      const headers = new Headers({ 'X-Trace-Id': 'abc-123' });

      const response = createJsonResponse({ ok: true }, { headers });

      expect(response.headers.get('x-trace-id')).toBe('abc-123');
      expect(response.headers.get('content-type')).toBe('application/json');
    });

    test('does not override a content type the caller already set', () => {
      const response = createJsonResponse(
        { ok: true },
        { headers: { 'Content-Type': 'application/problem+json' } },
      );

      expect(response.headers.get('content-type')).toBe('application/problem+json');
    });
  });
});
