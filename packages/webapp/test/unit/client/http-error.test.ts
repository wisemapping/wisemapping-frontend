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

import { describeHttpError } from '../../../src/classes/client/http-error';

describe('describeHttpError', () => {
  const axiosError = (url: string) => ({
    message: 'Request failed',
    config: { method: 'post', url, data: '{"password":"S3cret"}', headers: { Authorization: 'x' } },
    response: { status: 400, data: { globalErrors: ['Bad'] } },
  });

  test('keeps the method, path, status and response body, nothing of the request', () => {
    expect(describeHttpError(axiosError('http://api/api/restful/authenticate'))).toEqual({
      message: 'Request failed',
      method: 'post',
      url: 'http://api/api/restful/authenticate',
      status: 400,
      data: { globalErrors: ['Bad'] },
    });
  });

  test('drops the query string, where one-time codes travel', () => {
    // activation?code=, oauth2/googlecallback?code=...: single-use secrets in the URL.
    const logged = describeHttpError(
      axiosError('http://api/api/restful/users/activation?code=abc'),
    );
    expect(logged.url).toBe('http://api/api/restful/users/activation');
  });

  test('describes a value that is not an object', () => {
    expect(describeHttpError('boom')).toEqual({ message: 'boom' });
  });
});
